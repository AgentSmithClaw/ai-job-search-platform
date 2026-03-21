import pytest
from app.services.auth import (
    register_user,
    get_user_by_token,
    consume_credit,
    add_credits,
)
from app.schemas import RegisterRequest
from fastapi import HTTPException


class TestRegister:
    def test_register_creates_user(self):
        user = register_user(RegisterRequest(email="new@test.com", name="New User"))
        assert user.email == "new@test.com"
        assert user.name == "New User"
        assert user.credits == 1
        assert user.access_token is not None

    def test_register_duplicate_returns_existing(self):
        req = RegisterRequest(email="dup@test.com", name="Dup User")
        u1 = register_user(req)
        u2 = register_user(req)
        assert u1.id == u2.id
        assert u1.access_token == u2.access_token


class TestGetUser:
    def test_get_user_by_token_valid(self, test_user):
        user = get_user_by_token(test_user.access_token)
        assert user.id == test_user.id
        assert user.email == test_user.email

    def test_get_user_by_token_invalid(self):
        with pytest.raises(HTTPException) as exc:
            get_user_by_token("invalid_token_12345")
        assert exc.value.status_code == 401

    def test_get_user_by_token_expired(self, test_user):
        from datetime import datetime, timedelta, UTC
        from app.db import get_connection
        expired = (datetime.now(UTC) - timedelta(days=91)).isoformat(timespec='seconds') + 'Z'
        conn = get_connection()
        conn.execute('UPDATE users SET last_used_at = ? WHERE id = ?', (expired, test_user.id))
        conn.commit()
        conn.close()
        with pytest.raises(HTTPException) as exc:
            get_user_by_token(test_user.access_token)
        assert exc.value.status_code == 401
        assert "过期" in exc.value.detail

    def test_get_user_by_token_updates_last_used(self, test_user):
        from app.db import get_connection
        get_user_by_token(test_user.access_token)
        conn = get_connection()
        row = conn.execute('SELECT last_used_at FROM users WHERE id = ?', (test_user.id,)).fetchone()
        conn.close()
        assert row['last_used_at'] is not None


class TestConsumeCredit:
    def test_consume_credit_success(self, test_user):
        user = consume_credit(test_user.access_token, amount=1)
        assert user.credits == test_user.credits - 1

    def test_consume_credit_insufficient(self, test_user):
        consume_credit(test_user.access_token, amount=test_user.credits)
        with pytest.raises(HTTPException) as exc:
            consume_credit(test_user.access_token, amount=1)
        assert exc.value.status_code == 402

    def test_consume_credit_invalid_token(self):
        with pytest.raises(HTTPException) as exc:
            consume_credit("bad_token_12345", amount=1)
        assert exc.value.status_code == 401


class TestAddCredits:
    def test_add_credits_success(self, test_user):
        result = add_credits(test_user.access_token, "full-pack")
        assert result.credits_added == 4
        assert result.credits_total == test_user.credits + 4

    def test_add_credits_invalid_package(self, test_user):
        with pytest.raises(HTTPException) as exc:
            add_credits(test_user.access_token, "nonexistent")
        assert exc.value.status_code == 404

    def test_add_credits_invalid_token(self):
        with pytest.raises(HTTPException) as exc:
            add_credits("bad_token_12345", "gap-report")
        assert exc.value.status_code == 401
