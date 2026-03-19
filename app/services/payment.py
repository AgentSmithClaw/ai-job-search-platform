from __future__ import annotations

import secrets
from datetime import datetime
from enum import Enum
from typing import Optional
import httpx
from app.db import get_connection
from app.schemas import PurchaseResponse
from app.config import settings


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    MOCK = "mock"
    STRIPE = "stripe"
    ALIPAY = "alipay"
    WECHAT = "wechat"


def create_mock_payment_order(
    user_id: int,
    package_code: str,
    package_name: str,
    credits: int,
    price_cny: int,
) -> str:
    order_id = f"ORD_{secrets.token_urlsafe(12)}"
    created_at = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    
    conn = get_connection()
    conn.execute(
        '''INSERT INTO payment_orders 
           (order_id, created_at, user_id, package_code, package_name, credits, price_cny, status, payment_method) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (order_id, created_at, user_id, package_code, package_name, credits, price_cny, PaymentStatus.PENDING.value, PaymentMethod.MOCK.value)
    )
    conn.commit()
    conn.close()
    
    return order_id


def get_order_by_id(order_id: str) -> Optional[dict]:
    conn = get_connection()
    order = conn.execute(
        'SELECT * FROM payment_orders WHERE order_id = ?', (order_id,)
    ).fetchone()
    conn.close()
    return dict(order) if order else None


def complete_mock_payment(order_id: str) -> PurchaseResponse:
    conn = get_connection()
    order = conn.execute(
        'SELECT * FROM payment_orders WHERE order_id = ?', (order_id,)
    ).fetchone()
    
    if not order:
        conn.close()
        raise ValueError("订单不存在")
    
    if order['status'] == PaymentStatus.COMPLETED.value:
        conn.close()
        raise ValueError("订单已完成支付")
    
    user = conn.execute('SELECT id, credits FROM users WHERE id = ?', (order['user_id'],)).fetchone()
    if not user:
        conn.close()
        raise ValueError("用户不存在")
    
    new_credits = user['credits'] + order['credits']
    completed_at = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    
    conn.execute('UPDATE users SET credits = ? WHERE id = ?', (new_credits, user['id']))
    conn.execute(
        'UPDATE payment_orders SET status = ?, completed_at = ? WHERE order_id = ?',
        (PaymentStatus.COMPLETED.value, completed_at, order_id)
    )
    conn.execute(
        'INSERT INTO purchases (created_at, user_id, package_code, package_name, credits_added, price_cny) VALUES (?, ?, ?, ?, ?, ?)',
        (completed_at, user['id'], order['package_code'], order['package_name'], order['credits'], order['price_cny'])
    )
    conn.commit()
    conn.close()
    
    return PurchaseResponse(
        package_code=order['package_code'],
        package_name=order['package_name'],
        credits_added=order['credits'],
        credits_total=new_credits,
        price_cny=order['price_cny'],
    )


def get_user_orders(user_id: int, limit: int = 20) -> list[dict]:
    conn = get_connection()
    orders = conn.execute(
        '''SELECT order_id, created_at, package_name, credits, price_cny, status, payment_method 
           FROM payment_orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?''',
        (user_id, limit)
    ).fetchall()
    conn.close()
    return [dict(row) for row in orders]


def refund_order(order_id: str, user_id: int) -> bool:
    conn = get_connection()
    order = conn.execute(
        'SELECT * FROM payment_orders WHERE order_id = ? AND user_id = ?',
        (order_id, user_id)
    ).fetchone()
    
    if not order or order['status'] != PaymentStatus.COMPLETED.value:
        conn.close()
        return False
    
    user = conn.execute('SELECT credits FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        conn.close()
        return False
    
    new_credits = max(0, user['credits'] - order['credits'])
    refunded_at = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    
    conn.execute('UPDATE users SET credits = ? WHERE id = ?', (new_credits, user_id))
    conn.execute(
        'UPDATE payment_orders SET status = ?, refunded_at = ? WHERE order_id = ?',
        (PaymentStatus.REFUNDED.value, refunded_at, order_id)
    )
    conn.commit()
    conn.close()
    
    return True


async def create_stripe_payment_session(
    user_id: int,
    package_code: str,
    package_name: str,
    credits: int,
    price_cny: int,
) -> str:
    if not settings.STRIPE_SECRET_KEY:
        raise RuntimeError("Stripe 未配置")
    
    checkout_url = f"https://checkout.stripe.com/pay/{secrets.token_urlsafe(16)}"
    order_id = create_mock_payment_order(user_id, package_code, package_name, credits, price_cny)
    
    return checkout_url