import logging
from datetime import datetime
import json

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile

logger = logging.getLogger(__name__)

from app.dependencies import get_current_user
from app.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    ResumeUploadResponse,
    SessionDetail,
    SessionSummary,
    UserProfile,
)
from app.services.analysis import build_analysis
from app.services.auth import consume_credit
from app.services.llm import get_llm_service

router = APIRouter(tags=["分析"])


@router.post("/api/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)) -> ResumeUploadResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail='缺少文件名。')

    from app.services.resume_parser import extract_resume_text

    file_bytes = await file.read()
    try:
        extracted_text, parser = extract_resume_text(file.filename, file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if len(extracted_text) < 20:
        raise HTTPException(status_code=400, detail='解析后的文本过短，请检查文件内容。')

    return ResumeUploadResponse(
        file_name=file.filename,
        extracted_text=extracted_text,
        char_count=len(extracted_text),
        parser=parser,
    )


@router.get("/api/sessions", response_model=dict)
def list_sessions(
    user: UserProfile = Depends(get_current_user),
    offset: int = 0,
    limit: int = 20,
) -> dict:
    from app.db import get_connection

    conn = get_connection()
    total = conn.execute(
        'SELECT COUNT(*) as count FROM analysis_sessions WHERE user_id = ?',
        (user.id,)
    ).fetchone()['count']
    rows = conn.execute(
        'SELECT id, created_at, target_role, report_json, credits_used FROM analysis_sessions WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
        (user.id, limit, offset),
    ).fetchall()
    conn.close()

    items = [
        SessionSummary(
            id=row['id'],
            created_at=row['created_at'],
            target_role=row['target_role'],
            match_score=json.loads(row['report_json'])['match_score'],
            summary=json.loads(row['report_json'])['summary'],
            credits_used=row['credits_used'],
        )
        for row in rows
    ]
    return {'items': items, 'total': total, 'offset': offset, 'limit': limit}


@router.get("/api/sessions/{session_id}", response_model=SessionDetail)
def get_session(
    session_id: int,
    user: UserProfile = Depends(get_current_user),
) -> SessionDetail:
    from app.db import get_connection

    conn = get_connection()
    row = conn.execute(
        'SELECT * FROM analysis_sessions WHERE id = ? AND user_id = ?',
        (session_id, user.id)
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail='Session not found')

    return SessionDetail(
        id=row['id'],
        created_at=row['created_at'],
        target_role=row['target_role'],
        resume_text=row['resume_text'],
        job_description=row['job_description'],
        report_json=row['report_json'],
        resume_draft=row['resume_draft'],
        credits_used=row['credits_used'],
    )


@router.post("/api/analyze", response_model=AnalysisResponse)
def analyze(request: AnalysisRequest) -> AnalysisResponse:
    user = consume_credit(request.access_token, amount=1)

    try:
        llm = get_llm_service()
        report, resume_draft, routing_mode = llm.generate_analysis(
            target_role=request.target_role,
            resume_text=request.resume_text,
            job_description=request.job_description,
        )
    except RuntimeError:
        report, resume_draft, routing_mode = build_analysis(
            target_role=request.target_role,
            resume_text=request.resume_text,
            job_description=request.job_description,
        )

    created_at = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    from app.db import get_connection
    conn = get_connection()
    cursor = conn.execute(
        '''
        INSERT INTO analysis_sessions (
            created_at, user_id, target_role, resume_text, job_description,
            report_json, resume_draft, credits_used
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        (
            created_at,
            user.id,
            request.target_role,
            request.resume_text,
            request.job_description,
            report.model_dump_json(),
            resume_draft,
            1,
        ),
    )
    conn.commit()
    session_id = cursor.lastrowid or 0
    conn.close()

    logger.info(f"Analysis complete: session_id={session_id}, user_id={user.id}, role={request.target_role}, score={report.match_score}, mode={routing_mode}")

    return AnalysisResponse(
        session_id=session_id,
        created_at=created_at,
        target_role=request.target_role,
        report=report,
        resume_draft=resume_draft,
        routing_mode=routing_mode,
        credits_remaining=user.credits,
    )


@router.post("/api/generate-questions", response_model=GenerateQuestionsResponse)
def generate_questions(request: GenerateQuestionsRequest) -> GenerateQuestionsResponse:
    from app.services.auth import get_user_by_token
    get_user_by_token(request.access_token)

    try:
        llm = get_llm_service()
        questions = llm.generate_interview_questions(
            target_role=request.target_role,
            resume_text=request.resume_text,
            job_description=request.job_description,
            gaps=request.gaps,
        )
    except RuntimeError:
        questions = [
            f"请描述你在 {request.target_role} 相关项目中的具体贡献",
            "你如何在压力下保证工作质量？",
            "描述一次你解决复杂技术问题的经历",
            "你对团队协作的理解是什么？",
            "你为什么想加入我们公司？",
            "你的职业规划是什么？",
            "描述一个你失败的经历及从中学到什么",
        ]

    return GenerateQuestionsResponse(questions=questions)


@router.get("/api/export/{session_id}")
async def export_session(
    session_id: int,
    user: UserProfile = Depends(get_current_user),
    format: str = 'docx',
):
    from fastapi.responses import FileResponse, StreamingResponse
    from io import BytesIO
    from app.db import get_connection
    from app.services.export import export_service

    conn = get_connection()
    row = conn.execute(
        'SELECT * FROM analysis_sessions WHERE id = ? AND user_id = ?',
        (session_id, user.id)
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail='Session not found')

    report = json.loads(row['report_json'])

    if format == 'docx':
        try:
            content = export_service.generate_resume_docx(
                resume_draft=row['resume_draft'],
                target_role=row['target_role'],
                match_score=report['match_score'],
            )
        except Exception as exc:
            logger.error(f"Export DOCX failed: session_id={session_id}, user_id={user.id}, error={exc}")
            raise HTTPException(status_code=500, detail='导出 DOCX 失败，请稍后重试')
        return StreamingResponse(
            BytesIO(content),
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            headers={
                'Content-Disposition': f'attachment; filename=resume_draft_{session_id}.docx'
            },
        )
    elif format == 'pdf':
        try:
            content = export_service.generate_analysis_report_pdf(
                target_role=row['target_role'],
                match_score=report['match_score'],
                summary=report['summary'],
                strengths=report['strengths'],
                risks=report['risks'],
                gaps=report['gaps'],
                learning_plan=report['learning_plan'],
                interview_focus=report['interview_focus'],
                resume_suggestions=report['resume_suggestions'],
                resume_draft=row['resume_draft'],
            )
        except Exception as exc:
            logger.error(f"Export PDF failed: session_id={session_id}, user_id={user.id}, error={exc}")
            raise HTTPException(status_code=500, detail='导出 PDF 失败，请稍后重试')
        return StreamingResponse(
            BytesIO(content),
            media_type='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename=analysis_report_{session_id}.pdf'
            },
        )
    else:
        raise HTTPException(status_code=400, detail='Unsupported format')
