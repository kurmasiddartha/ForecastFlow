from typing import Optional
from pydantic import Field
from app.models.common import MongoBaseModel


class Category(MongoBaseModel):
    """Product category document in 'categories' collection."""

    name: str = Field(..., min_length=1, max_length=100, description="Unique category name")
    description: Optional[str] = Field(default=None, max_length=500, description="Optional category description")
