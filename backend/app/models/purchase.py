from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from app.models.common import MongoBaseModel, PyObjectId, utc_now

PurchaseStatus = Literal["ordered", "received", "cancelled"]


class PurchaseItem(BaseModel):
    """Line item within a purchase order."""

    product_id: PyObjectId = Field(..., description="Referenced Product ID")
    quantity: int = Field(..., gt=0, description="Quantity ordered")
    unit_cost: float = Field(..., ge=0.0, description="Negotiated unit cost")
    total_cost: float = Field(..., ge=0.0, description="Line item total (quantity * unit_cost)")


class Purchase(MongoBaseModel):
    """Purchase order document in 'purchases' collection."""

    supplier_id: PyObjectId = Field(..., description="Referenced Supplier ID")
    order_date: datetime = Field(default_factory=utc_now, description="Date purchase order was issued")
    expected_delivery_date: Optional[datetime] = Field(default=None, description="Expected shipment arrival date")
    status: PurchaseStatus = Field(default="ordered", description="Order fulfillment status")
    items: List[PurchaseItem] = Field(..., min_length=1, description="List of ordered products")
    total_amount: float = Field(..., ge=0.0, description="Total purchase order value")
