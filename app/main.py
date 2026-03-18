from contextlib import asynccontextmanager
from datetime import datetime
import json

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.db import get_connection, init_db
from app.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    ProviderCard,
    ProviderCatalogResponse,
    PurchaseRequest,
    PurchaseResponse,
    RegisterRequest,
    ResumeUploadResponse,
    SessionSummary,
    UserProfile,
)
from app.services.analysis import build_analysis
from app.services.auth import add_credits, consume_credit, get_user_by_token, register_user
from app.services.pricing import get_pricing_catalog
from app.services.resume_parser import extract_resume_text


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title='AI Job Search Platform API', lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.mount('/static', StaticFiles(directory='frontend'), name='static')


@app.get('/')
def root() -> FileResponse:
    return FileResponse('frontend/index.html')


@app.get('/health')
def health() -> dict:
    return {'status': 'ok'}


@app.post('/api/auth/register', response_model=UserProfile)
def auth_register(request: RegisterRequest) -> UserProfile:
    return register_user(request)


@app.get('/api/auth/me', response_model=UserProfile)
def auth_me(access_token: str) -> UserProfile:
    return get_user_by_token(access_token)


@app.get('/api/providers', response_model=ProviderCatalogResponse)
def providers() -> ProviderCatalogResponse:
    return ProviderCatalogResponse(
        providers=[
            ProviderCard(name='gpt-5.4', role='总控与综合推理', best_for=['差距分析总结', '优先级判断', '最终审校']),
            ProviderCard(name='claude-opus-4.6', role='简历写作与表达润色', best_for=['简历终稿', 'STAR 改写', '高质量文案']),
            ProviderCard(name='kimi-2.5', role='中文长文本抽取', best_for=['中文简历解析', '中文 JD 抽取', '补充问答']),
            ProviderCard(name='minimax-m2.5', role='低成本初稿与批处理', best_for=['批量抽取', '题库草稿', '低价套餐']),
        ]
    )


@app.get('/api/pricing')
def pricing():
    return get_pricing_catalog()


@app.post('/api/purchase', response_model=PurchaseResponse)
def purchase(request: PurchaseRequest) -> PurchaseResponse:
    return add_credits(request.access_token, request.package_code)


@app.post('/api/resume/upload', response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)) -> ResumeUploadResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail='缺少文件名。')

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


@app.get('/api/sessions', response_model=list[SessionSummary])
def list_sessions(access_token: str) -> list[SessionSummary]:
    user = get_user_by_token(access_token)
    conn = get_connection()
    rows = conn.execute(
        'SELECT id, created_at, target_role, report_json, credits_used FROM analysis_sessions WHERE user_id = ? ORDER BY id DESC LIMIT 20',
        (user.id,),
    ).fetchall()
    conn.close()

    items = []
    for row in rows:
        report = json.loads(row['report_json'])
        items.append(
            SessionSummary(
                id=row['id'],
                created_at=row['created_at'],
                target_role=row['target_role'],
                match_score=report['match_score'],
                summary=report['summary'],
                credits_used=row['credits_used'],
            )
        )
    return items


@app.post('/api/analyze', response_model=AnalysisResponse)
def analyze(request: AnalysisRequest) -> AnalysisResponse:
    user = consume_credit(request.access_token, amount=1)
    report, resume_draft, routing_mode = build_analysis(
        target_role=request.target_role,
        resume_text=request.resume_text,
        job_description=request.job_description,
    )

    created_at = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    conn = get_connection()
    cursor = conn.execute(
        '''
        INSERT INTO analysis_sessions (
            created_at, user_id, target_role, resume_text, job_description, report_json, resume_draft, credits_used
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
    session_id = cursor.lastrowid
    conn.close()

    return AnalysisResponse(
        session_id=session_id,
        target_role=request.target_role,
        report=report,
        resume_draft=resume_draft,
        routing_mode=routing_mode,
        credits_remaining=user.credits,
    )
