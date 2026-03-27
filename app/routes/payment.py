import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from app.dependencies import get_current_user
from app.schemas import (
    PaymentCreateRequest,
    PaymentOrderResponse,
    PurchaseRequest,
    PurchaseResponse,
    StripeCheckoutResponse,
    UserProfile,
)
from app.services.payment import (
    PaymentMethod,
    PaymentStatus,
    complete_payment,
    create_payment_order,
    create_stripe_checkout_session,
    get_user_orders,
    refund_order,
)
from app.services.pricing import get_package_by_code

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payment", tags=["payment"])


@router.post("/purchase", response_model=PurchaseResponse)
def purchase(
    request: PurchaseRequest,
    user: UserProfile = Depends(get_current_user),
) -> PurchaseResponse:
    from app.services.auth import add_credits

    return add_credits(request.access_token or user.access_token, request.package_code)


@router.post("/create", response_model=dict)
async def create_payment(
    request: PaymentCreateRequest,
    user: UserProfile = Depends(get_current_user),
) -> dict:
    package = get_package_by_code(request.package_code)
    if not package:
        raise HTTPException(status_code=404, detail='Package not found')

    order_id = create_payment_order(
        user_id=user.id,
        package_code=package.code,
        package_name=package.name,
        credits=package.credits,
        price_cny=package.price_cny,
    )

    completed = complete_payment(order_id)

    return {
        "order_id": order_id,
        "status": "completed",
        "package_name": completed.package_name,
        "credits_added": completed.credits_added,
        "credits_total": completed.credits_total,
    }


@router.post("/create-stripe", response_model=StripeCheckoutResponse)
async def create_stripe_payment(
    request: PaymentCreateRequest,
    user: UserProfile = Depends(get_current_user),
) -> StripeCheckoutResponse:
    package = get_package_by_code(request.package_code)
    if not package:
        raise HTTPException(status_code=404, detail='Package not found')

    order_id = create_payment_order(
        user_id=user.id,
        package_code=package.code,
        package_name=package.name,
        credits=package.credits,
        price_cny=package.price_cny,
        payment_method=PaymentMethod.STRIPE,
    )

    checkout_url = await create_stripe_checkout_session(
        user_id=user.id,
        package_code=package.code,
        package_name=package.name,
        credits=package.credits,
        price_cny=package.price_cny,
        order_id=order_id,
    )

    return StripeCheckoutResponse(order_id=order_id, checkout_url=checkout_url, status="pending")


@router.get("/orders", response_model=list[PaymentOrderResponse])
def list_orders(user: UserProfile = Depends(get_current_user)) -> list[PaymentOrderResponse]:
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


@router.post("/webhook")
async def stripe_webhook(request: Request):
    from app.config import settings

    body = await request.body()
    sig_header = request.headers.get('stripe-signature', '')

    if not settings.STRIPE_WEBHOOK_SECRET:
        logger.warning("Stripe webhook secret not configured, skipping signature verification")
    else:
        try:
            import stripe

            stripe.api_key = settings.STRIPE_SECRET_KEY
            event = stripe.Webhook.construct_event(body, sig_header, settings.STRIPE_WEBHOOK_SECRET)
            logger.info(f"Stripe webhook verified: event_type={event['type']}, event_id={event['id']}")
        except Exception as exc:
            logger.error(f"Stripe webhook verification/processing error: {exc}")
            raise HTTPException(status_code=400, detail=str(exc))

    import json

    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail='Invalid JSON')

    event_type = event.get('type', '')
    data = event.get('data', {}).get('object', {})

    if event_type == 'checkout.session.completed':
        session_id = data.get('id')
        order_id = data.get('metadata', {}).get('order_id')

        if not order_id:
            logger.error(f"Webhook: no order_id in metadata for session {session_id}")
            return {"received": True}

        from app.db import get_connection

        conn = get_connection()
        order = conn.execute(
            'SELECT user_id, status FROM payment_orders WHERE order_id = ?',
            (order_id,),
        ).fetchone()
        if not order:
            conn.close()
            logger.error(f"Webhook: order not found: order_id={order_id}")
            return {"received": True}

        conn.execute(
            "UPDATE payment_orders SET session_id = ? WHERE order_id = ?",
            (session_id, order_id),
        )
        conn.commit()
        conn.close()

        if order['status'] == PaymentStatus.COMPLETED.value:
            logger.info(f"Webhook: order already completed, skipping: order_id={order_id}")
            return {"received": True}

        try:
            complete_payment(order_id, PaymentMethod.STRIPE)
            logger.info(f"Payment completed via webhook: order_id={order_id}, user_id={order['user_id']}")
        except ValueError as error:
            logger.error(f"Webhook payment completion failed: order_id={order_id}, error={error}")

    elif event_type == 'checkout.session.expired':
        order_id = data.get('metadata', {}).get('order_id')
        if order_id:
            from app.db import get_connection

            conn = get_connection()
            conn.execute(
                "UPDATE payment_orders SET status = ? WHERE order_id = ? AND status = ?",
                ("failed", order_id, "pending"),
            )
            conn.commit()
            conn.close()
            logger.info(f"Stripe checkout expired: order_id={order_id}")

    return {"received": True}


@router.post("/refund/{order_id}")
def refund(
    order_id: str,
    user: UserProfile = Depends(get_current_user),
) -> dict:
    success = refund_order(order_id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail='Refund failed: order not found or not eligible.')
    logger.info(f"Refund processed: order_id={order_id}, user_id={user.id}")
    return {"status": "refunded", "order_id": order_id}
