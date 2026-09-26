from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Category name")
    description: Optional[str] = Field(default=None, max_length=500, description="Optional category description")


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)


class CategoryResponse(CategoryBase):
    id: str = Field(..., description="Category unique identifier")
    created_at: datetime
    updated_at: Optional[datetime] = None
