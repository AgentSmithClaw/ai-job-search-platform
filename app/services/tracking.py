from __future__ import annotations

from datetime import datetime, UTC
from enum import Enum
from typing import Optional
from app.db import get_connection


class ApplicationStatus(str, Enum):
    INTERESTED = "interested"
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class LearningTaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


def create_job_application(
    user_id: int,
    company_name: str,
    target_role: str,
    job_description: str,
    status: ApplicationStatus = ApplicationStatus.INTERESTED,
    application_url: str = "",
    salary_range: str = "",
    notes: str = "",
) -> int:
    created_at = datetime.now(UTC).isoformat(timespec='seconds') + 'Z'
    conn = get_connection()
    cursor = conn.execute(
        '''INSERT INTO job_applications 
           (created_at, user_id, company_name, target_role, job_description, status, application_url, salary_range, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (created_at, user_id, company_name, target_role, job_description, status.value, application_url, salary_range, notes)
    )
    conn.commit()
    application_id = cursor.lastrowid or 0
    conn.close()
    return application_id


def get_user_applications(user_id: int, status: Optional[ApplicationStatus] = None) -> list[dict]:
    conn = get_connection()
    if status:
        rows = conn.execute(
            '''SELECT * FROM job_applications WHERE user_id = ? AND status = ? ORDER BY created_at DESC''',
            (user_id, status.value)
        ).fetchall()
    else:
        rows = conn.execute(
            'SELECT * FROM job_applications WHERE user_id = ? ORDER BY created_at DESC',
            (user_id,)
        ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def update_application_status(application_id: int, user_id: int, status: ApplicationStatus) -> bool:
    conn = get_connection()
    application = conn.execute(
        'SELECT id FROM job_applications WHERE id = ? AND user_id = ?',
        (application_id, user_id)
    ).fetchone()
    
    if not application:
        conn.close()
        return False
    
    updated_at = datetime.now(UTC).isoformat(timespec='seconds') + 'Z'
    conn.execute(
        'UPDATE job_applications SET status = ?, updated_at = ? WHERE id = ?',
        (status.value, updated_at, application_id)
    )
    conn.commit()
    conn.close()
    return True


def delete_application(application_id: int, user_id: int) -> bool:
    conn = get_connection()
    application = conn.execute(
        'SELECT id FROM job_applications WHERE id = ? AND user_id = ?',
        (application_id, user_id)
    ).fetchone()
    
    if not application:
        conn.close()
        return False
    
    conn.execute('DELETE FROM job_applications WHERE id = ?', (application_id,))
    conn.commit()
    conn.close()
    return True


def create_learning_task(
    user_id: int,
    session_id: Optional[int],
    title: str,
    description: str,
    target_date: Optional[str] = None,
    priority: str = "medium",
) -> int:
    created_at = datetime.now(UTC).isoformat(timespec='seconds') + 'Z'
    conn = get_connection()
    cursor = conn.execute(
        '''INSERT INTO learning_tasks 
           (created_at, user_id, session_id, title, description, target_date, priority, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (created_at, user_id, session_id, title, description, target_date, priority, LearningTaskStatus.PENDING.value)
    )
    conn.commit()
    task_id = cursor.lastrowid or 0
    conn.close()
    return task_id


def get_user_learning_tasks(
    user_id: int,
    status: Optional[LearningTaskStatus] = None,
    limit: int = 50,
) -> list[dict]:
    conn = get_connection()
    if status:
        rows = conn.execute(
            '''SELECT * FROM learning_tasks WHERE user_id = ? AND status = ? 
               ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at DESC LIMIT ?''',
            (user_id, status.value, limit)
        ).fetchall()
    else:
        rows = conn.execute(
            '''SELECT * FROM learning_tasks WHERE user_id = ? 
               ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at DESC LIMIT ?''',
            (user_id, limit)
        ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def update_learning_task_status(task_id: int, user_id: int, status: LearningTaskStatus) -> bool:
    conn = get_connection()
    task = conn.execute(
        'SELECT id FROM learning_tasks WHERE id = ? AND user_id = ?',
        (task_id, user_id)
    ).fetchone()
    
    if not task:
        conn.close()
        return False
    
    updated_at = datetime.now(UTC).isoformat(timespec='seconds') + 'Z'
    conn.execute(
        'UPDATE learning_tasks SET status = ?, updated_at = ? WHERE id = ?',
        (status.value, updated_at, task_id)
    )
    conn.commit()
    conn.close()
    return True


def delete_learning_task(task_id: int, user_id: int) -> bool:
    conn = get_connection()
    task = conn.execute(
        'SELECT id FROM learning_tasks WHERE id = ? AND user_id = ?',
        (task_id, user_id)
    ).fetchone()
    
    if not task:
        conn.close()
        return False
    
    conn.execute('DELETE FROM learning_tasks WHERE id = ?', (task_id,))
    conn.commit()
    conn.close()
    return True


def create_interview_prep(
    user_id: int,
    session_id: Optional[int],
    application_id: Optional[int],
    question: str,
    ideal_answer: str = "",
    notes: str = "",
    status: str = "pending",
) -> int:
    created_at = datetime.now(UTC).isoformat(timespec='seconds') + 'Z'
    conn = get_connection()
    cursor = conn.execute(
        '''INSERT INTO interview_prep 
           (created_at, user_id, session_id, application_id, question, ideal_answer, notes, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (created_at, user_id, session_id, application_id, question, ideal_answer, notes, status)
    )
    conn.commit()
    prep_id = cursor.lastrowid or 0
    conn.close()
    return prep_id


def get_user_interview_prep(user_id: int, limit: int = 50) -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        'SELECT * FROM interview_prep WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        (user_id, limit)
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def update_interview_prep(prep_id: int, user_id: int, ideal_answer: str = "", notes: str = "", status: str = "prepared") -> bool:
    conn = get_connection()
    prep = conn.execute(
        'SELECT id FROM interview_prep WHERE id = ? AND user_id = ?',
        (prep_id, user_id)
    ).fetchone()
    
    if not prep:
        conn.close()
        return False
    
    updated_at = datetime.now(UTC).isoformat(timespec='seconds') + 'Z'
    conn.execute(
        'UPDATE interview_prep SET ideal_answer = ?, notes = ?, status = ?, updated_at = ? WHERE id = ?',
        (ideal_answer, notes, status, updated_at, prep_id)
    )
    conn.commit()
    conn.close()
    return True


def delete_interview_prep(prep_id: int, user_id: int) -> bool:
    conn = get_connection()
    prep = conn.execute(
        'SELECT id FROM interview_prep WHERE id = ? AND user_id = ?',
        (prep_id, user_id)
    ).fetchone()

    if not prep:
        conn.close()
        return False

    conn.execute('DELETE FROM interview_prep WHERE id = ?', (prep_id,))
    conn.commit()
    conn.close()
    return True
