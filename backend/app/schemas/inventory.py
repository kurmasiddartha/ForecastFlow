from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field

MovementTypeEnum = Literal["PURCHASE", "SALE", "ADJUSTMENT", "RETURN", "DAMAGE"]
StockActionEnum = Literal["ADD", "DEDUCT", "SET"]


class StockAdjustmentRequest(BaseModel):
    """Payload to record an auditable stock movement (stock-in, stock-out, or count adjustment)."""

    product_id: str = Field(..., description="Target Product ID")
    movement_type: MovementTypeEnum = Field(..., description="Reason for inventory movement")
    action: StockActionEnum = Field(
        default="ADD",
        description="ADD to stock, DEDUCT from stock, or SET to an exact physical count",
    )
    quantity: int = Field(..., ge=0, description="Quantity to add/deduct or absolute count to set")
    reference_id: Optional[str] = Field(default=None, description="External reference (e.g. PO, invoice, audit ID)")
    notes: Optional[str] = Field(default=None, max_length=500, description="Audit reason or notes")


class StockMovementResponse(BaseModel):
    """Auditable stock movement record representation."""

    id: str = Field(..., description="Movement record ID")
    product_id: str = Field(..., description="Target Product ID")
    product_sku: Optional[str] = Field(default=None, description="Product SKU")
    product_name: Optional[str] = Field(default=None, description="Product Name")
    movement_type: str = Field(..., description="Movement category (PURCHASE, SALE, ADJUSTMENT, etc.)")
    quantity: int = Field(..., description="Signed quantity change (+ for stock-in, - for stock-out)")
    previous_stock: int = Field(..., ge=0, description="Stock immediately before movement")
    new_stock: int = Field(..., ge=0, description="Stock immediately after movement")
    reference_id: Optional[str] = Field(default=None, description="External reference ID")
    notes: Optional[str] = Field(default=None, description="Audit notes")
    created_at: datetime = Field(..., description="Timestamp of transaction")


class PaginatedStockMovementsResponse(BaseModel):
    items: List[StockMovementResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class InventorySummaryResponse(BaseModel):
    """Executive KPI summary of current stock health."""

    total_products: int
    total_units: int
    low_stock_count: int
    out_of_stock_count: int
    inventory_value_cost: float
    inventory_value_retail: float
