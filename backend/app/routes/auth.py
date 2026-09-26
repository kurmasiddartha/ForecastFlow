from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_current_active_user
from app.database import get_database
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResetPasswordRequest,
    UserResponse,
    TokenResponse,
    LogoutResponse,
)
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Registers a new user account with hashed password and returns sanitized profile.",
)
async def register(
    data: UserRegisterRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> UserResponse:
    return await auth_service.register_user(db, data)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user and issue JWT",
    description="Validates user credentials and returns a signed JWT Bearer access token.",
)
async def login(
    data: UserLoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> TokenResponse:
    return await auth_service.authenticate_user(db, data)


@router.post(
    "/reset-password",
    summary="Reset user password",
    description="Updates or sets new password for user account by email.",
)
async def reset_password(
    data: UserResetPasswordRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    return await auth_service.reset_password(db, data.email, data.new_password)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile",
    description="Returns the current user profile based on validated JWT Bearer token.",
)
async def get_current_user_profile(
    current_user: UserResponse = Depends(get_current_active_user),
) -> UserResponse:
    return current_user


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="User logout",
    description="Acknowledges user session termination (client discards access token).",
)
async def logout(
    current_user: UserResponse = Depends(get_current_active_user),
) -> LogoutResponse:
    return LogoutResponse(message="Successfully logged out.")

