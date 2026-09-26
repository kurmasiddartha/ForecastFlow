from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    """Payload for user account registration."""

    email: EmailStr = Field(..., description="Unique email address")
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password (minimum 8 characters)",
    )
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="User full legal or display name",
    )
    role: Optional[str] = Field(
        default="admin",
        description="System role assigned to user",
    )


class UserLoginRequest(BaseModel):
    """Payload for user authentication."""

    email: EmailStr = Field(..., description="User registered email")
    password: str = Field(..., min_length=1, description="Account password")


class UserResetPasswordRequest(BaseModel):
    """Payload to reset a user's password."""

    email: EmailStr = Field(..., description="User registered email")
    new_password: str = Field(..., min_length=6, max_length=128, description="New password (minimum 6 characters)")



class UserResponse(BaseModel):
    """Sanitized user response representation (excludes password hash)."""

    id: str = Field(..., description="User unique ID")
    email: str = Field(..., description="User email address")
    full_name: str = Field(..., description="User full name")
    role: str = Field(..., description="User assigned role")
    is_active: bool = Field(..., description="Active status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")


class TokenResponse(BaseModel):
    """JWT bearer token and authenticated user payload."""

    access_token: str = Field(..., description="Signed JWT Bearer access token")
    token_type: str = Field(default="bearer", description="Token schema type")
    expires_in: int = Field(..., description="Token lifespan in seconds")
    user: UserResponse = Field(..., description="Authenticated user profile")


class LogoutResponse(BaseModel):
    """Response returned upon logout."""

    message: str = Field(default="Successfully logged out")
