from __future__ import annotations

from datetime import datetime
import secrets

from fastapi import HTTPException

from app.db import get_connection
from app.schemas import PurchaseResponse, RegisterRequest, UserProfile
from app.services.pricing import get_package_by_code


def register_user(payload: RegisterRequest) -> UserProfile:
    conn = get_connection()
    existing = conn.execute('SELECT id, email, name, token, credits FROM users WHERE email = ?', (payload.email,)).fetchone()
    if existing:
        conn.close()
        return UserProfile(
            id=existing['id'],
            email=existing['email'],
            name=existing['name'],
            access_token=existing['token'],
            credits=existing['credits'],
        )

    token = secrets.token_urlsafe(18)
    created_at = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    cursor = conn.execute(
        'INSERT INTO users (created_at, email, name, token, credits) VALUES (?, ?, ?, ?, ?)',
        (created_at, payload.email, payload.name, token, 1),
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return UserProfile(id=user_id, email=payload.email, name=payload.name, access_token=token, credits=1)


def get_user_by_token(access_token: str) -> UserProfile:
    conn = get_connection()
    user = conn.execute('SELECT id, email, name, token, credits FROM users WHERE token = ?', (access_token,)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail='无效的 access token，请先登录。')
    return UserProfile(
        id=user['id'],
        email=user['email'],
        name=user['name'],
        access_token=user['token'],
        credits=user['credits'],
    )


def consume_credit(access_token: str, amount: int = 1) -> UserProfile:
    conn = get_connection()
    user = conn.execute('SELECT id, email, name, token, credits FROM users WHERE token = ?', (access_token,)).fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=401, detail='无效的 access token，请先登录。')
    if user['credits'] < amount:
        conn.close()
        raise HTTPException(status_code=402, detail='剩余次数不足，请先购买套餐。')

    remaining = user['credits'] - amount
    conn.execute('UPDATE users SET credits = ? WHERE id = ?', (remaining, user['id']))
    conn.commit()
    conn.close()
    return UserProfile(
        id=user['id'],
        email=user['email'],
        name=user['name'],
        access_token=user['token'],
        credits=remaining,
    )


def add_credits(access_token: str, package_code: str) -> PurchaseResponse:
    package = get_package_by_code(package_code)
    if not package:
        raise HTTPException(status_code=404, detail='未找到对应套餐。')

    conn = get_connection()
    user = conn.execute('SELECT id, credits FROM users WHERE token = ?', (access_token,)).fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=401, detail='无效的 access token，请先登录。')

    credits_total = user['credits'] + package.credits
    created_at = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    conn.execute('UPDATE users SET credits = ? WHERE id = ?', (credits_total, user['id']))
    conn.execute(
        'INSERT INTO purchases (created_at, user_id, package_code, package_name, credits_added, price_cny) VALUES (?, ?, ?, ?, ?, ?)',
        (created_at, user['id'], package.code, package.name, package.credits, package.price_cny),
    )
    conn.commit()
    conn.close()

    return PurchaseResponse(
        package_code=package.code,
        package_name=package.name,
        credits_added=package.credits,
        credits_total=credits_total,
        price_cny=package.price_cny,
    )
