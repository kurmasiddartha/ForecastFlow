from typing import Literal, Optional
from pydantic import Field
from app.models.common import MongoBaseModel, PyObjectId

MovementType = Literal[
    "PURCHASE",
    "SALE",
    "ADJUSTMENT",
    "RETURN",
    "DAMAGE",
    "purchase_receipt",
    "sale",
    "adjustment",
    "return",
    "damage",
]


class StockMovement(MongoBaseModel):
    """Stock movement audit entry in 'stock_movements' collection."""

    product_id: PyObjectId = Field(..., description="Referenced Product ID")
    movement_type: MovementType = Field(..., description="Category of stock alteration")
    quantity: int = Field(..., description="Signed quantity change (+ for stock-in, - for stock-out)")
    previous_stock: int = Field(..., ge=0, description="Stock on hand immediately prior to movement")
    new_stock: int = Field(..., ge=0, description="Stock on hand after movement applied")
    reference_id: Optional[PyObjectId] = Field(default=None, description="Optional foreign reference (e.g. sale or purchase ID)")
    notes: Optional[str] = Field(default=None, max_length=500, description="Audit reason or notes")
