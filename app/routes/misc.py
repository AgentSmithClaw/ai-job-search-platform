from fastapi import APIRouter, Depends, HTTPException, Query

from app.dependencies import get_current_user
from app.schemas import (
    ProviderCatalogResponse,
    ProviderCard,
    PricingCatalogResponse,
    SessionDetail,
    SessionSummary,
    UserProfile,
)

router = APIRouter(tags=["基础信息"])


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/api/providers", response_model=ProviderCatalogResponse)
def providers() -> ProviderCatalogResponse:
    return ProviderCatalogResponse(
        providers=[
            ProviderCard(name='gpt-4o-mini', role='总控与综合推理', best_for=['差距分析总结', '优先级判断', '最终审校']),
            ProviderCard(name='claude-3.5-sonnet', role='简历写作与表达润色', best_for=['简历终稿', 'STAR 改写', '高质量文案']),
            ProviderCard(name='kimi-2.5', role='中文长文本抽取', best_for=['中文简历解析', '中文 JD 抽取', '补充问答']),
            ProviderCard(name='minimax-m2.5', role='低成本初稿与批处理', best_for=['批量抽取', '题库草稿', '低价套餐']),
        ]
    )


@router.get("/api/pricing")
def pricing():
    from app.services.pricing import get_pricing_catalog
    return get_pricing_catalog()


@router.get("/api/dashboard")
def get_dashboard(user: UserProfile = Depends(get_current_user)) -> dict:
    from datetime import datetime, UTC, timedelta
    from app.db import get_connection

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

    week_ago = (datetime.now(UTC) - timedelta(days=7)).isoformat(timespec='seconds') + 'Z'
    sessions_this_week = conn.execute(
        'SELECT COUNT(*) as count FROM analysis_sessions WHERE user_id = ? AND created_at >= ?',
        (user.id, week_ago)
    ).fetchone()['count']

    conn.close()

    return {
        'user': UserProfile.model_validate(user),
        'stats': {
            'total_analyses': sessions_count,
            'analyses_this_week': sessions_this_week,
            'total_applications': sum(application_stats.values()),
            'application_by_status': application_stats,
            'total_tasks': sum(task_stats.values()),
            'task_by_status': task_stats,
            'total_spent_cny': total_spent,
            'average_match_score': round(avg_match_score, 1),
        }
    }
