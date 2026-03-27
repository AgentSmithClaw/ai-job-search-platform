import pytest

from app.schemas import RegisterRequest
from app.services.auth import register_user
from app.services.payment import (
    PaymentMethod,
    PaymentStatus,
    complete_payment,
    create_payment_order,
    get_order_by_id,
    get_user_orders,
    refund_order,
)


class TestPaymentOrder:
    def test_create_payment_order(self, test_user):
        order_id = create_payment_order(
            user_id=test_user.id,
            package_code="full-pack",
            package_name="求职冲刺包",
            credits=4,
            price_cny=79,
            payment_method=PaymentMethod.MOCK,
        )
        assert order_id.startswith("ORD_")
        order = get_order_by_id(order_id)
        assert order is not None
        assert order["status"] == PaymentStatus.PENDING.value
        assert order["user_id"] == test_user.id
        assert order["credits"] == 4

    def test_complete_payment_adds_credits(self, test_user):
        order_id = create_payment_order(
            user_id=test_user.id,
            package_code="gap-report",
            package_name="差距分析",
            credits=1,
            price_cny=29,
        )
        initial_credits = test_user.credits
        result = complete_payment(order_id)
        assert result.credits_added == 1
        assert result.credits_total == initial_credits + 1

    def test_complete_payment_idempotent(self, test_user):
        order_id = create_payment_order(
            user_id=test_user.id,
            package_code="gap-report",
            package_name="差距分析",
            credits=1,
            price_cny=29,
        )
        complete_payment(order_id)
        with pytest.raises(ValueError) as exc:
            complete_payment(order_id)
        assert "already completed" in str(exc.value)

    def test_complete_payment_not_found(self):
        with pytest.raises(ValueError) as exc:
            complete_payment("ORD_nonexistent")
        assert "not found" in str(exc.value)

    def test_complete_payment_wrong_status(self, test_user):
        order_id = create_payment_order(
            user_id=test_user.id,
            package_code="gap-report",
            package_name="差距分析",
            credits=1,
            price_cny=29,
        )
        from app.db import get_connection

        conn = get_connection()
        conn.execute(
            "UPDATE payment_orders SET status = ? WHERE order_id = ?",
            (PaymentStatus.FAILED.value, order_id),
        )
        conn.commit()
        conn.close()
        with pytest.raises(ValueError) as exc:
            complete_payment(order_id)
        assert "payment failed" in str(exc.value)


class TestRefund:
    def test_refund_completed_order(self, test_user):
        order_id = create_payment_order(
            user_id=test_user.id,
            package_code="full-pack",
            package_name="求职冲刺包",
            credits=4,
            price_cny=79,
        )
        complete_payment(order_id)
        result = refund_order(order_id, test_user.id)
        assert result is True
        order = get_order_by_id(order_id)
        assert order["status"] == PaymentStatus.REFUNDED.value

    def test_refund_pending_order_fails(self, test_user):
        order_id = create_payment_order(
            user_id=test_user.id,
            package_code="gap-report",
            package_name="差距分析",
            credits=1,
            price_cny=29,
        )
        result = refund_order(order_id, test_user.id)
        assert result is False

    def test_refund_wrong_user_fails(self, test_user):
        other = register_user(RegisterRequest(email="other@test.com", name="Other"))
        order_id = create_payment_order(
            user_id=test_user.id,
            package_code="gap-report",
            package_name="差距分析",
            credits=1,
            price_cny=29,
        )
        complete_payment(order_id)
        result = refund_order(order_id, other.id)
        assert result is False


class TestGetUserOrders:
    def test_get_user_orders(self, test_user):
        oid1 = create_payment_order(test_user.id, "gap-report", "差距分析", 1, 29)
        oid2 = create_payment_order(test_user.id, "full-pack", "求职冲刺包", 4, 79)
        complete_payment(oid1)
        orders = get_user_orders(test_user.id)
        assert len(orders) == 2
        order_ids = [o["order_id"] for o in orders]
        assert oid1 in order_ids
        assert oid2 in order_ids
