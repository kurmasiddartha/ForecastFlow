from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class SaleItemCreate(BaseModel):
    """Line item in a sale creation request."""

    product_id: str = Field(..., description="Referenced Product ID")
    quantity: int = Field(..., gt=0, description="Quantity of units to purchase/sell")
    unit_price: Optional[float] = Field(
        default=None,
        ge=0.0,
        description="Optional unit price override (defaults to current product selling price)",
    )


class SaleCreate(BaseModel):
    """Payload to record a new sales transaction."""

    items: List[SaleItemCreate] = Field(..., min_length=1, description="List of products sold")
    sale_date: Optional[datetime] = Field(default=None, description="Transaction timestamp (defaults to UTC now)")
    notes: Optional[str] = Field(default=None, max_length=500, description="Transaction notes / customer reference")


class SaleItemResponse(BaseModel):
    """Enriched line item in a sales record response."""

    product_id: str
    product_sku: Optional[str] = None
    product_name: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float


class SaleResponse(BaseModel):
    """Sales transaction record response."""

    id: str
    items: List[SaleItemResponse]
    total_amount: float
    sale_date: datetime
    notes: Optional[str] = None
    created_at: datetime


class PaginatedSalesResponse(BaseModel):
    items: List[SaleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
