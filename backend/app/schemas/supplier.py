from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class SupplierBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Supplier company name")
    contact_name: Optional[str] = Field(default=None, max_length=100, description="Contact representative")
    email: Optional[EmailStr] = Field(default=None, description="Contact email address")
    phone: Optional[str] = Field(default=None, max_length=50, description="Phone number")
    address: Optional[str] = Field(default=None, max_length=300, description="Business address")
    lead_time_days: int = Field(default=7, ge=0, description="Delivery lead time in days")


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    contact_name: Optional[str] = Field(default=None, max_length=100)
    email: Optional[EmailStr] = Field(default=None)
    phone: Optional[str] = Field(default=None, max_length=50)
    address: Optional[str] = Field(default=None, max_length=300)
    lead_time_days: Optional[int] = Field(default=None, ge=0)


class SupplierResponse(SupplierBase):
    id: str = Field(..., description="Supplier unique identifier")
    created_at: datetime
    updated_at: Optional[datetime] = None
