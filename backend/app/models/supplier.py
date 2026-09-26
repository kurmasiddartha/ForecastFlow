from typing import Optional
from pydantic import Field
from app.models.common import MongoBaseModel


class Supplier(MongoBaseModel):
    """Supplier document in 'suppliers' collection."""

    name: str = Field(..., min_length=1, max_length=150, description="Supplier company name")
    contact_name: Optional[str] = Field(default=None, max_length=100, description="Primary contact person")
    email: Optional[str] = Field(default=None, max_length=255, description="Contact email")
    phone: Optional[str] = Field(default=None, max_length=50, description="Contact phone number")
    address: Optional[str] = Field(default=None, max_length=300, description="Physical / billing address")
    lead_time_days: int = Field(default=7, ge=0, description="Standard supplier fulfillment lead time in days")
