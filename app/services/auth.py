from __future__ import annotations

from datetime import datetime, timedelta, UTC
import secrets
import hashlib

from fastapi import HTTPException

from app.db import get_connection
from app.schemas import PurchaseResponse, RegisterRequest, UserProfile, LoginRequest
from app.services.pricing import get_package_by_code

TOKEN_EXPIRY_DAYS = 90


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}:{hashed.hex()}"


def _verify_password(password: str, stored: str) -> bool:
    if not stored or ':' not in stored:
        return False
    salt, hashed = stored.split(':')
    check = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return check.hex() == hashed


def register_user(payload: RegisterRequest) -> UserProfile:
    conn = get_connection()
    existing = conn.execute('SELECT id FROM users WHERE email = ?', (payload.email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=409, detail='该邮箱已被注册。')

    token = secrets.token_urlsafe(18)
    password_hash = _hash_password(payload.password)
    created_at = datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%SZ')
    cursor = conn.execute(
        'INSERT INTO users (created_at, email, name, token, credits, last_used_at, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (created_at, payload.email, payload.name, token, 1, created_at, password_hash),
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return UserProfile(id=user_id or 0, email=payload.email, name=payload.name, access_token=token, credits=1)


def login_user(payload: LoginRequest) -> UserProfile:
    conn = get_connection()
    user = conn.execute(
        'SELECT id, email, name, token, credits, password_hash FROM users WHERE email = ?',
        (payload.email,)
    ).fetchone()
    
    if not user or not _verify_password(payload.password, user['password_hash']):
        conn.close()
        raise HTTPException(status_code=401, detail='邮箱或密码错误。')

    access_token = user['token']
    conn.close()
    return UserProfile(
        id=user['id'],
        email=user['email'],
        name=user['name'],
        access_token=access_token,
        credits=user['credits'],
    )


def get_user_by_token(access_token: str) -> UserProfile:
    conn = get_connection()
    user = conn.execute(
        'SELECT id, email, name, token, credits, last_used_at FROM users WHERE token = ?',
        (access_token,)
    ).fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=401, detail='无效的 access token，请先登录。')

    last_used = user['last_used_at']
    if last_used:
        try:
            cleaned = last_used.replace('+00:00Z', 'Z').replace('+00:00', 'Z')
            last_used_dt = datetime.fromisoformat(cleaned.replace('Z', '+00:00'))
            if datetime.now(UTC) - last_used_dt > timedelta(days=TOKEN_EXPIRY_DAYS):
                conn.close()
                raise HTTPException(status_code=401, detail='Token 已过期，请重新登录。')
        except HTTPException:
            raise
        except (ValueError, Exception):
            pass

    now = datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%SZ')
    conn.execute('UPDATE users SET last_used_at = ? WHERE id = ?', (now, user['id']))
    conn.commit()
    conn.close()
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
    created_at = datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%SZ')
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
