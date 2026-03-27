from typing import Optional

from fastapi import Header, HTTPException, Query

from app.schemas import UserProfile
from app.services.auth import get_user_by_token as _get_user_by_token


def get_access_token(
    access_token: Optional[str] = Query(default=None, min_length=8),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
) -> str:
    if authorization:
        scheme, _, credentials = authorization.partition(" ")
        if scheme.lower() == "bearer" and len(credentials.strip()) >= 8:
            return credentials.strip()

    if access_token:
        return access_token

    raise HTTPException(status_code=401, detail="Authentication required.")


def get_current_user(token: str = Header(default=None, alias="Authorization"), access_token: str = Query(default=None, min_length=8)) -> UserProfile:
    resolved_token = get_access_token(access_token=access_token, authorization=token)
    return _get_user_by_token(resolved_token)
