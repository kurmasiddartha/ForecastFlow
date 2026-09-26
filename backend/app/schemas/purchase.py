from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field

PurchaseStatusEnum = Literal["received", "ordered", "cancelled"]


class PurchaseItemCreate(BaseModel):
    """Line item in a purchase order request."""

    product_id: str = Field(..., description="Referenced Product ID")
    quantity: int = Field(..., gt=0, description="Quantity to purchase")
    unit_cost: Optional[float] = Field(
        default=None,
        ge=0.0,
        description="Negotiated cost per unit (defaults to current product cost price)",
    )


class PurchaseCreate(BaseModel):
    """Payload to record a new supplier purchase."""

    supplier_id: str = Field(..., description="Referenced Supplier ID")
    items: List[PurchaseItemCreate] = Field(..., min_length=1, description="List of items purchased")
    order_date: Optional[datetime] = Field(default=None, description="Date order was placed")
    expected_delivery_date: Optional[datetime] = Field(default=None, description="Expected shipment date")
    status: PurchaseStatusEnum = Field(
        default="received",
        description="Fulfillment status. Received purchases automatically add items into inventory.",
    )


class PurchaseItemResponse(BaseModel):
    """Enriched line item in a purchase record response."""

    product_id: str
    product_sku: Optional[str] = None
    product_name: Optional[str] = None
    quantity: int
    unit_cost: float
    total_cost: float


class PurchaseResponse(BaseModel):
    """Purchase order document response."""

    id: str
    supplier_id: str
    supplier_name: Optional[str] = None
    items: List[PurchaseItemResponse]
    total_amount: float
    order_date: datetime
    expected_delivery_date: Optional[datetime] = None
    status: str
    created_at: datetime


class PaginatedPurchasesResponse(BaseModel):
    items: List[PurchaseResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
