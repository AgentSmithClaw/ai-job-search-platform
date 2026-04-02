import pytest
from app.services.auth import (
    register_user,
    get_user_by_token,
    consume_credit,
    add_credits,
    login_user,
)
from app.schemas import RegisterRequest, LoginRequest
from fastapi import HTTPException


class TestRegister:
    def test_register_creates_user(self):
        user = register_user(RegisterRequest(email="new@test.com", name="New User", password="mypassword"))
        assert user.email == "new@test.com"
        assert user.name == "New User"
        assert user.credits == 1
        assert user.access_token is not None

    def test_register_duplicate_raises_error(self):
        req = RegisterRequest(email="dup@test.com", name="Dup User", password="mypassword")
        register_user(req)
        with pytest.raises(HTTPException) as exc:
            register_user(req)
        assert exc.value.status_code == 409
        assert "已被注册" in exc.value.detail


class TestLogin:
    def test_login_success(self):
        email = "login_success@test.com"
        password = "secretpassword"
        register_user(RegisterRequest(email=email, name="Login User", password=password))
        
        login_req = LoginRequest(email=email, password=password)
        user = login_user(login_req)
        assert user.email == email
        assert user.name == "Login User"
        assert user.access_token is not None

    def test_login_wrong_password(self):
        email = "login_wrong@test.com"
        register_user(RegisterRequest(email=email, name="Wrong User", password="correct_password"))
        
        login_req = LoginRequest(email=email, password="wrong_password")
        with pytest.raises(HTTPException) as exc:
            login_user(login_req)
        assert exc.value.status_code == 401
        assert "错误" in exc.value.detail

    def test_login_nonexistent_user(self):
        login_req = LoginRequest(email="nonexistent@test.com", password="anypassword")
        with pytest.raises(HTTPException) as exc:
            login_user(login_req)
        assert exc.value.status_code == 401


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
