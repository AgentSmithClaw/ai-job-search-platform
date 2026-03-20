from fastapi import APIRouter, Depends, Query

from app.dependencies import get_current_user
from app.schemas import (
    RegisterRequest,
    UpdateUserRequest,
    UserProfile,
)

router = APIRouter(prefix="/api/auth", tags=["认证"])


@router.post("/register", response_model=UserProfile)
def auth_register(request: RegisterRequest) -> UserProfile:
    from app.services.auth import register_user
    return register_user(request)


@router.get("/me", response_model=UserProfile)
def auth_me(user: UserProfile = Depends(get_current_user)) -> UserProfile:
    return user


@router.patch("/profile", response_model=UserProfile)
def update_profile(
    request: UpdateUserRequest,
    user: UserProfile = Depends(get_current_user),
) -> UserProfile:
    from app.db import get_connection
    conn = get_connection()
    conn.execute('UPDATE users SET name = ? WHERE id = ?', (request.name, user.id))
    conn.commit()
    conn.close()
    return UserProfile(
        id=user.id,
        email=user.email,
        name=request.name,
        access_token=user.access_token,
        credits=user.credits,
    )
