"""
Payment Service - AI Job Search Platform

MOCK BOUNDARIES:
- create_mock_payment_order(): Creates order with PENDING status (MOCK)
- complete_mock_payment(): Immediately marks as COMPLETED (MOCK)
- create_stripe_payment_session(): Stripe scaffold (NOT IMPLEMENTED)

REAL PAYMENT FLOW (TODO):
1. POST /api/payment/create -> creates PENDING order
2. Redirect to Stripe/Alipay checkout
3. Webhook receives payment confirmation
4. Credit update happens on webhook, not on create
"""
from __future__ import annotations

import logging
import secrets
from datetime import datetime, UTC
from enum import Enum
from typing import Optional
import httpx
from app.db import get_connection
from app.schemas import PurchaseResponse
from app.config import settings

logger = logging.getLogger(__name__)


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


def create_payment_order(
    user_id: int,
    package_code: str,
    package_name: str,
    credits: int,
    price_cny: int,
    payment_method: PaymentMethod = PaymentMethod.MOCK,
) -> str:
    """
    Create a payment order.
    MOCK: Creates order with PENDING status immediately.
    REAL: Should create order with PENDING and return order_id for payment redirect.
    """
    order_id = f"ORD_{secrets.token_urlsafe(12)}"
    created_at = datetime.now(UTC).isoformat(timespec='seconds') + 'Z'

    conn = get_connection()
    conn.execute(
        '''INSERT INTO payment_orders
           (order_id, created_at, user_id, package_code, package_name, credits, price_cny, status, payment_method)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (order_id, created_at, user_id, package_code, package_name, credits, price_cny, PaymentStatus.PENDING.value, payment_method.value)
    )
    conn.commit()
    conn.close()

    logger.info(f"Payment order created: order_id={order_id}, user_id={user_id}, package={package_code}, amount={price_cny}")
    return order_id


def get_order_by_id(order_id: str) -> Optional[dict]:
    conn = get_connection()
    order = conn.execute(
        'SELECT * FROM payment_orders WHERE order_id = ?', (order_id,)
    ).fetchone()
    conn.close()
    return dict(order) if order else None


def complete_payment(order_id: str, payment_method: PaymentMethod = PaymentMethod.MOCK) -> PurchaseResponse:
    """
    Complete a payment order and add credits to user.
    MOCK: Immediately marks order as COMPLETED.
    REAL: Should only be called from webhook after payment confirmation.
    """
    conn = get_connection()
    order = conn.execute(
        'SELECT * FROM payment_orders WHERE order_id = ?', (order_id,)
    ).fetchone()

    if not order:
        conn.close()
        logger.error(f"Payment completion failed: order not found, order_id={order_id}")
        raise ValueError("订单不存在")

    if order['status'] == PaymentStatus.COMPLETED.value:
        conn.close()
        logger.warning(f"Payment completion failed: order already completed, order_id={order_id}")
        raise ValueError("订单已完成支付")

    if order['status'] == PaymentStatus.FAILED.value:
        conn.close()
        logger.error(f"Payment completion failed: order failed, order_id={order_id}")
        raise ValueError("订单支付失败")

    user = conn.execute('SELECT id, credits FROM users WHERE id = ?', (order['user_id'],)).fetchone()
    if not user:
        conn.close()
        logger.error(f"Payment completion failed: user not found, user_id={order['user_id']}")
        raise ValueError("用户不存在")

    new_credits = user['credits'] + order['credits']
    completed_at = datetime.now(UTC).isoformat(timespec='seconds') + 'Z'

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

    logger.info(f"Payment completed: order_id={order_id}, user_id={user['id']}, credits_added={order['credits']}, new_balance={new_credits}")

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
    """
    Refund a payment order and deduct credits from user.
    """
    conn = get_connection()
    order = conn.execute(
        'SELECT * FROM payment_orders WHERE order_id = ? AND user_id = ?',
        (order_id, user_id)
    ).fetchone()

    if not order or order['status'] != PaymentStatus.COMPLETED.value:
        conn.close()
        logger.warning(f"Refund failed: order not found or not completed, order_id={order_id}")
        return False

    user = conn.execute('SELECT credits FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        conn.close()
        logger.error(f"Refund failed: user not found, user_id={user_id}")
        return False

    new_credits = max(0, user['credits'] - order['credits'])
    refunded_at = datetime.now(UTC).isoformat(timespec='seconds') + 'Z'

    conn.execute('UPDATE users SET credits = ? WHERE id = ?', (new_credits, user_id))
    conn.execute(
        'UPDATE payment_orders SET status = ?, refunded_at = ? WHERE order_id = ?',
        (PaymentStatus.REFUNDED.value, refunded_at, order_id)
    )
    conn.commit()
    conn.close()

    logger.info(f"Refund processed: order_id={order_id}, user_id={user_id}, credits_deducted={order['credits']}")
    return True


async def create_stripe_checkout_session(
    user_id: int,
    package_code: str,
    package_name: str,
    credits: int,
    price_cny: int,
    order_id: str,
) -> str:
    """
    Create Stripe checkout session and return URL.
    Creates a pending order first, embeds order_id in Stripe metadata.
    """
    if not settings.STRIPE_SECRET_KEY:
        logger.warning("Stripe not configured, returning mock checkout URL")
        return f"https://checkout.stripe.com/mock/{secrets.token_urlsafe(16)}"

    import stripe

    stripe.api_key = settings.STRIPE_SECRET_KEY

    try:
        existing = get_order_by_id(order_id)
        if existing and existing['status'] == PaymentStatus.PENDING.value and existing['payment_method'] == PaymentMethod.STRIPE.value:
            conn = get_connection()
            pending = conn.execute(
                "SELECT checkout_url FROM payment_orders WHERE order_id = ? AND status = 'pending' AND payment_method = 'stripe'",
                (order_id,)
            ).fetchone()
            conn.close()
            if pending and pending['checkout_url']:
                logger.info(f"Reusing existing Stripe checkout: order_id={order_id}")
                return pending['checkout_url']
    except Exception:
        pass

    price_id = _get_or_create_stripe_price(stripe, package_code, package_name, price_cny)

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price': price_id,
            'quantity': 1,
        }],
        mode='payment',
        success_url=f"{settings.APP_URL or 'http://127.0.0.1:8080'}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&order_id={order_id}",
        cancel_url=f"{settings.APP_URL or 'http://127.0.0.1:8080'}/payment/cancel?order_id={order_id}",
        metadata={
            'order_id': order_id,
            'user_id': str(user_id),
            'package_code': package_code,
        },
        customer_email=_get_user_email(user_id) or '',
    )

    checkout_url = session.url
    if not checkout_url:
        raise RuntimeError("Stripe did not return a checkout URL")

    conn = get_connection()
    conn.execute(
        "UPDATE payment_orders SET checkout_url = ? WHERE order_id = ?",
        (checkout_url, order_id)
    )
    conn.commit()
    conn.close()

    logger.info(f"Stripe checkout created: order_id={order_id}, session_id={session.id}, url={checkout_url}")
    return checkout_url


def _get_or_create_stripe_price(stripe, package_code: str, package_name: str, price_cny: int) -> str:
    price_attr_map = {
        'gap-report': 'STRIPE_PRICE_GAP_REPORT',
        'resume-polish': 'STRIPE_PRICE_RESUME_POLISH',
        'full-pack': 'STRIPE_PRICE_FULL_PACK',
    }
    attr_name = price_attr_map.get(package_code)
    if attr_name and hasattr(settings, attr_name):
        price_id = getattr(settings, attr_name)
        if price_id:
            return price_id

    product = stripe.Product.create(
        name=f"AI Job Search - {package_name}",
        metadata={'package_code': package_code}
    )
    price = stripe.Price.create(
        product=product.id,
        unit_amount=price_cny * 100,
        currency='cny',
        metadata={'package_code': package_code}
    )
    logger.info(f"Created Stripe price: package={package_code}, price_id={price.id}")
    return price.id


def _get_user_email(user_id: int) -> Optional[str]:
    conn = get_connection()
    row = conn.execute('SELECT email FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    return row['email'] if row else None



