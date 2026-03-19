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
    ExportRequest,
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    InterviewPrepCreate,
    InterviewPrepResponse,
    InterviewPrepUpdate,
    JobApplicationCreate,
    JobApplicationResponse,
    JobApplicationUpdate,
    LearningTaskCreate,
    LearningTaskResponse,
    LearningTaskUpdate,
    PaymentCompleteRequest,
    PaymentCreateRequest,
    PaymentOrderResponse,
    ProviderCard,
    ProviderCatalogResponse,
    PurchaseRequest,
    PurchaseResponse,
    RegisterRequest,
    ResumeUploadResponse,
    SessionDetail,
    SessionSummary,
    UpdateUserRequest,
    UserProfile,
)
from app.services.analysis import build_analysis
from app.services.auth import add_credits, consume_credit, get_user_by_token, register_user
from app.services.export import export_service
from app.services.llm import get_llm_service
from app.services.payment import (
    complete_mock_payment,
    create_mock_payment_order,
    get_order_by_id,
    get_user_orders,
)
from app.services.pricing import get_package_by_code, get_pricing_catalog
from app.services.resume_parser import extract_resume_text
from app.services.tracking import (
    ApplicationStatus,
    LearningTaskStatus,
    create_interview_prep,
    create_job_application,
    create_learning_task,
    delete_application,
    delete_learning_task,
    get_user_applications,
    get_user_interview_prep,
    get_user_learning_tasks,
    update_application_status,
    update_interview_prep,
    update_learning_task_status,
)


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


@app.get('/api/dashboard')
def get_dashboard(access_token: str) -> dict:
    user = get_user_by_token(access_token)
    conn = get_connection()
    
    sessions_count = conn.execute(
        'SELECT COUNT(*) as count FROM analysis_sessions WHERE user_id = ?', (user.id,)
    ).fetchone()['count']
    
    applications = conn.execute(
        'SELECT status, COUNT(*) as count FROM job_applications WHERE user_id = ? GROUP BY status',
        (user.id,)
    ).fetchall()
    application_stats = {row['status']: row['count'] for row in applications}
    
    tasks = conn.execute(
        'SELECT status, COUNT(*) as count FROM learning_tasks WHERE user_id = ? GROUP BY status',
        (user.id,)
    ).fetchall()
    task_stats = {row['status']: row['count'] for row in tasks}
    
    total_spent = conn.execute(
        'SELECT SUM(price_cny) as total FROM purchases WHERE user_id = ?',
        (user.id,)
    ).fetchone()['total'] or 0
    
    avg_match_score = conn.execute(
        '''SELECT AVG(CAST(json_extract(report_json, '$.match_score') AS INTEGER)) as avg_score 
           FROM analysis_sessions WHERE user_id = ?''',
        (user.id,)
    ).fetchone()['avg_score'] or 0
    
    conn.close()
    
    return {
        'user': UserProfile.model_validate(user),
        'stats': {
            'total_analyses': sessions_count,
            'total_applications': sum(application_stats.values()),
            'application_by_status': application_stats,
            'total_tasks': sum(task_stats.values()),
            'task_by_status': task_stats,
            'total_spent_cny': total_spent,
            'average_match_score': round(avg_match_score, 1),
        }
    }


@app.post('/api/auth/register', response_model=UserProfile)
def auth_register(request: RegisterRequest) -> UserProfile:
    return register_user(request)


@app.get('/api/auth/me', response_model=UserProfile)
def auth_me(access_token: str) -> UserProfile:
    return get_user_by_token(access_token)


@app.patch('/api/auth/profile', response_model=UserProfile)
def update_profile(request: UpdateUserRequest) -> UserProfile:
    user = get_user_by_token(request.access_token)
    conn = get_connection()
    conn.execute('UPDATE users SET name = ? WHERE id = ?', (request.name, user.id))
    conn.commit()
    conn.close()
    return UserProfile(
        id=user.id,
        email=user.email,
        name=request.name,
        access_token=user.access_token,
        credits=user.credits,
    )


@app.get('/api/providers', response_model=ProviderCatalogResponse)
def providers() -> ProviderCatalogResponse:
    return ProviderCatalogResponse(
        providers=[
            ProviderCard(name='gpt-4o-mini', role='总控与综合推理', best_for=['差距分析总结', '优先级判断', '最终审校']),
            ProviderCard(name='claude-3.5-sonnet', role='简历写作与表达润色', best_for=['简历终稿', 'STAR 改写', '高质量文案']),
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


@app.get('/api/sessions/{session_id}', response_model=SessionDetail)
def get_session(session_id: int, access_token: str) -> SessionDetail:
    user = get_user_by_token(access_token)
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


@app.post('/api/analyze', response_model=AnalysisResponse)
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


@app.post('/api/payment/create', response_model=dict)
async def create_payment(request: PaymentCreateRequest) -> dict:
    user = get_user_by_token(request.access_token)
    package = get_package_by_code(request.package_code)
    if not package:
        raise HTTPException(status_code=404, detail='Package not found')
    
    order_id = create_mock_payment_order(
        user_id=user.id,
        package_code=package.code,
        package_name=package.name,
        credits=package.credits,
        price_cny=package.price_cny,
    )
    
    completed = complete_mock_payment(order_id)
    
    return {
        "order_id": order_id,
        "status": "completed",
        "package_name": completed.package_name,
        "credits_added": completed.credits_added,
        "credits_total": completed.credits_total,
    }


@app.get('/api/payment/orders', response_model=list[PaymentOrderResponse])
def list_orders(access_token: str) -> list[PaymentOrderResponse]:
    user = get_user_by_token(access_token)
    orders = get_user_orders(user.id)
    return [
        PaymentOrderResponse(
            order_id=o['order_id'],
            created_at=o['created_at'],
            package_name=o['package_name'],
            credits=o['credits'],
            price_cny=o['price_cny'],
            status=o['status'],
            payment_method=o['payment_method'],
        )
        for o in orders
    ]


@app.post('/api/applications', response_model=JobApplicationResponse)
def create_application(request: JobApplicationCreate) -> JobApplicationResponse:
    user = get_user_by_token(request.access_token)
    application_id = create_job_application(
        user_id=user.id,
        company_name=request.company_name,
        target_role=request.target_role,
        job_description=request.job_description,
        status=ApplicationStatus(request.status),
        application_url=request.application_url,
        salary_range=request.salary_range,
        notes=request.notes,
    )
    
    conn = get_connection()
    row = conn.execute('SELECT * FROM job_applications WHERE id = ?', (application_id,)).fetchone()
    conn.close()
    
    return JobApplicationResponse(
        id=row['id'],
        created_at=row['created_at'],
        updated_at=row['updated_at'],
        company_name=row['company_name'],
        target_role=row['target_role'],
        job_description=row['job_description'],
        status=row['status'],
        application_url=row['application_url'],
        salary_range=row['salary_range'],
        notes=row['notes'],
    )


@app.get('/api/applications', response_model=list[JobApplicationResponse])
def list_applications(access_token: str, status: str | None = None) -> list[JobApplicationResponse]:
    user = get_user_by_token(access_token)
    app_status = ApplicationStatus(status) if status else None
    applications = get_user_applications(user.id, app_status)
    return [
        JobApplicationResponse(
            id=a['id'],
            created_at=a['created_at'],
            updated_at=a['updated_at'],
            company_name=a['company_name'],
            target_role=a['target_role'],
            job_description=a['job_description'],
            status=a['status'],
            application_url=a['application_url'],
            salary_range=a['salary_range'],
            notes=a['notes'],
        )
        for a in applications
    ]


@app.patch('/api/applications/{application_id}', response_model=dict)
def update_application(application_id: int, request: JobApplicationUpdate) -> dict:
    user = get_user_by_token(request.access_token)
    success = update_application_status(application_id, user.id, ApplicationStatus(request.status))
    if not success:
        raise HTTPException(status_code=404, detail='Application not found')
    return {"status": "updated"}


@app.delete('/api/applications/{application_id}')
def delete_app(application_id: int, access_token: str) -> dict:
    user = get_user_by_token(access_token)
    success = delete_application(application_id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail='Application not found')
    return {"status": "deleted"}


@app.post('/api/learning-tasks', response_model=LearningTaskResponse)
def create_task(request: LearningTaskCreate) -> LearningTaskResponse:
    user = get_user_by_token(request.access_token)
    task_id = create_learning_task(
        user_id=user.id,
        session_id=request.session_id,
        title=request.title,
        description=request.description,
        target_date=request.target_date,
        priority=request.priority,
    )
    
    conn = get_connection()
    row = conn.execute('SELECT * FROM learning_tasks WHERE id = ?', (task_id,)).fetchone()
    conn.close()
    
    return LearningTaskResponse(
        id=row['id'],
        created_at=row['created_at'],
        updated_at=row['updated_at'],
        title=row['title'],
        description=row['description'],
        target_date=row['target_date'],
        priority=row['priority'],
        status=row['status'],
    )


@app.get('/api/learning-tasks', response_model=list[LearningTaskResponse])
def list_tasks(access_token: str, status: str | None = None) -> list[LearningTaskResponse]:
    user = get_user_by_token(access_token)
    task_status = LearningTaskStatus(status) if status else None
    tasks = get_user_learning_tasks(user.id, task_status)
    return [
        LearningTaskResponse(
            id=t['id'],
            created_at=t['created_at'],
            updated_at=t['updated_at'],
            title=t['title'],
            description=t['description'],
            target_date=t['target_date'],
            priority=t['priority'],
            status=t['status'],
        )
        for t in tasks
    ]


@app.patch('/api/learning-tasks/{task_id}', response_model=dict)
def update_task(task_id: int, request: LearningTaskUpdate) -> dict:
    user = get_user_by_token(request.access_token)
    success = update_learning_task_status(task_id, user.id, LearningTaskStatus(request.status))
    if not success:
        raise HTTPException(status_code=404, detail='Task not found')
    return {"status": "updated"}


@app.delete('/api/learning-tasks/{task_id}')
def delete_task(task_id: int, access_token: str) -> dict:
    user = get_user_by_token(access_token)
    success = delete_learning_task(task_id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail='Task not found')
    return {"status": "deleted"}


@app.post('/api/interview-prep', response_model=InterviewPrepResponse)
def create_prep(request: InterviewPrepCreate) -> InterviewPrepResponse:
    user = get_user_by_token(request.access_token)
    prep_id = create_interview_prep(
        user_id=user.id,
        session_id=request.session_id,
        application_id=request.application_id,
        question=request.question,
        ideal_answer=request.ideal_answer,
        notes=request.notes,
    )
    
    conn = get_connection()
    row = conn.execute('SELECT * FROM interview_prep WHERE id = ?', (prep_id,)).fetchone()
    conn.close()
    
    return InterviewPrepResponse(
        id=row['id'],
        created_at=row['created_at'],
        updated_at=row['updated_at'],
        question=row['question'],
        ideal_answer=row['ideal_answer'],
        notes=row['notes'],
        status=row['status'],
    )


@app.get('/api/interview-prep', response_model=list[InterviewPrepResponse])
def list_prep(access_token: str) -> list[InterviewPrepResponse]:
    user = get_user_by_token(access_token)
    preps = get_user_interview_prep(user.id)
    return [
        InterviewPrepResponse(
            id=p['id'],
            created_at=p['created_at'],
            updated_at=p['updated_at'],
            question=p['question'],
            ideal_answer=p['ideal_answer'],
            notes=p['notes'],
            status=p['status'],
        )
        for p in preps
    ]


@app.patch('/api/interview-prep/{prep_id}', response_model=dict)
def update_prep(prep_id: int, request: InterviewPrepUpdate) -> dict:
    user = get_user_by_token(request.access_token)
    success = update_interview_prep(
        prep_id,
        user.id,
        ideal_answer=request.ideal_answer,
        notes=request.notes,
        status=request.status,
    )
    if not success:
        raise HTTPException(status_code=404, detail='Interview prep not found')
    return {"status": "updated"}


@app.get('/api/export/{session_id}')
async def export_session(session_id: int, access_token: str, format: str = 'docx'):
    user = get_user_by_token(access_token)
    
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
        content = export_service.generate_resume_docx(
            resume_draft=row['resume_draft'],
            target_role=row['target_role'],
            match_score=report['match_score'],
        )
        return FileResponse(
            content=content,
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            filename=f'resume_draft_{session_id}.docx',
        )
    elif format == 'pdf':
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
        return FileResponse(
            content=content,
            media_type='application/pdf',
            filename=f'analysis_report_{session_id}.pdf',
        )
    else:
        raise HTTPException(status_code=400, detail='Unsupported format')


@app.post('/api/generate-questions', response_model=GenerateQuestionsResponse)
def generate_questions(request: GenerateQuestionsRequest) -> GenerateQuestionsResponse:
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