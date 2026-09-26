from typing import Optional
from pydantic import Field
from app.models.common import MongoBaseModel

UserRole = str


class User(MongoBaseModel):
    """User account document in 'users' collection."""

    email: str = Field(..., min_length=5, max_length=255, description="Unique email address")
    full_name: str = Field(..., min_length=1, max_length=100, description="Full name of user")
    hashed_password: str = Field(..., min_length=8, description="Bcrypt hashed password")
    role: str = Field(default="admin", description="System access role")
    is_active: bool = Field(default=True, description="Account active status")
