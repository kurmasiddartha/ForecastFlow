from datetime import datetime, timezone
from typing import Annotated, Optional
from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, BeforeValidator

# PyObjectId transforms BSON ObjectId to string during validation
PyObjectId = Annotated[str, BeforeValidator(str)]


def utc_now() -> datetime:
    """Helper to return current UTC datetime."""
    return datetime.now(timezone.utc)


class MongoBaseModel(BaseModel):
    """Base model for all MongoDB domain documents."""

    id: Optional[PyObjectId] = Field(default=None, alias="_id", description="MongoDB Document ObjectID")
    created_at: datetime = Field(default_factory=utc_now, description="Document creation timestamp in UTC")
    updated_at: Optional[datetime] = Field(default=None, description="Document last update timestamp in UTC")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )
