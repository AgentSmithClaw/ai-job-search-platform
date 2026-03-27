from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_current_user
from app.schemas import (
    InterviewPrepCreate,
    InterviewPrepResponse,
    InterviewPrepUpdate,
    JobApplicationCreate,
    JobApplicationResponse,
    JobApplicationUpdate,
    LearningTaskCreate,
    LearningTaskResponse,
    LearningTaskUpdate,
    UserProfile,
)
from app.services.tracking import (
    ApplicationStatus,
    LearningTaskStatus,
    create_interview_prep,
    create_job_application,
    create_learning_task,
    delete_application,
    delete_interview_prep,
    delete_learning_task,
    get_user_applications,
    get_user_interview_prep,
    get_user_learning_tasks,
    update_application_status,
    update_interview_prep,
    update_learning_task_status,
)

router = APIRouter(tags=["追踪"])


@router.post("/api/applications", response_model=JobApplicationResponse)
def create_application(
    request: JobApplicationCreate,
    user: UserProfile = Depends(get_current_user),
) -> JobApplicationResponse:
    from app.db import get_connection

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


@router.get("/api/applications", response_model=list[JobApplicationResponse])
def list_applications(
    user: UserProfile = Depends(get_current_user),
    status: str | None = None,
) -> list[JobApplicationResponse]:
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


@router.patch("/api/applications/{application_id}", response_model=dict)
def update_application(
    application_id: int,
    request: JobApplicationUpdate,
    user: UserProfile = Depends(get_current_user),
) -> dict:
    success = update_application_status(application_id, user.id, ApplicationStatus(request.status))
    if not success:
        raise HTTPException(status_code=404, detail='Application not found')
    return {"status": "updated"}


@router.delete("/api/applications/{application_id}")
def delete_app(
    application_id: int,
    user: UserProfile = Depends(get_current_user),
) -> dict:
    success = delete_application(application_id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail='Application not found')
    return {"status": "deleted"}


@router.post("/api/learning-tasks", response_model=LearningTaskResponse)
def create_task(
    request: LearningTaskCreate,
    user: UserProfile = Depends(get_current_user),
) -> LearningTaskResponse:
    from app.db import get_connection

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


@router.get("/api/learning-tasks", response_model=list[LearningTaskResponse])
def list_tasks(
    user: UserProfile = Depends(get_current_user),
    status: str | None = None,
) -> list[LearningTaskResponse]:
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


@router.patch("/api/learning-tasks/{task_id}", response_model=dict)
def update_task(
    task_id: int,
    request: LearningTaskUpdate,
    user: UserProfile = Depends(get_current_user),
) -> dict:
    success = update_learning_task_status(task_id, user.id, LearningTaskStatus(request.status))
    if not success:
        raise HTTPException(status_code=404, detail='Task not found')
    return {"status": "updated"}


@router.delete("/api/learning-tasks/{task_id}")
def delete_task(
    task_id: int,
    user: UserProfile = Depends(get_current_user),
) -> dict:
    success = delete_learning_task(task_id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail='Task not found')
    return {"status": "deleted"}


@router.post("/api/interview-prep", response_model=InterviewPrepResponse)
def create_prep(
    request: InterviewPrepCreate,
    user: UserProfile = Depends(get_current_user),
) -> InterviewPrepResponse:
    from app.db import get_connection

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


@router.get("/api/interview-prep", response_model=list[InterviewPrepResponse])
def list_prep(user: UserProfile = Depends(get_current_user)) -> list[InterviewPrepResponse]:
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


@router.patch("/api/interview-prep/{prep_id}", response_model=dict)
def update_prep(
    prep_id: int,
    request: InterviewPrepUpdate,
    user: UserProfile = Depends(get_current_user),
) -> dict:
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


@router.delete("/api/interview-prep/{prep_id}")
def delete_prep(
    prep_id: int,
    user: UserProfile = Depends(get_current_user),
) -> dict:
    success = delete_interview_prep(prep_id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail='Interview prep not found')
    return {"status": "deleted"}
