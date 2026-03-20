from fastapi import Depends, Query
from app.services.auth import get_user_by_token as _get_user_by_token
from app.schemas import UserProfile


def get_current_user(access_token: str = Query(..., min_length=8)) -> UserProfile:
    return _get_user_by_token(access_token)
