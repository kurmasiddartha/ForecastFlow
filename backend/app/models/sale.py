from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator
from app.models.common import MongoBaseModel, PyObjectId, utc_now


class SaleItem(BaseModel):
    """Line item within a sales order."""

    product_id: PyObjectId = Field(..., description="Referenced Product ID")
    quantity: int = Field(..., gt=0, description="Quantity sold")
    unit_price: float = Field(..., ge=0.0, description="Unit selling price at transaction time")
    total_price: float = Field(..., ge=0.0, description="Line item total (quantity * unit_price)")


class Sale(MongoBaseModel):
    """Sales transaction document in 'sales' collection."""

    items: List[SaleItem] = Field(default_factory=list, description="List of sold items")
    total_amount: float = Field(default=0.0, ge=0.0, description="Total sales invoice value")
    sale_date: datetime = Field(default_factory=utc_now, description="Transaction timestamp")
    notes: Optional[str] = Field(default=None, max_length=500, description="Optional transaction notes")

    # Fields for single-item backwards compatibility
    product_id: Optional[PyObjectId] = Field(default=None, description="Primary product reference")
    quantity: Optional[int] = Field(default=None, description="Primary quantity sold")
    unit_price: Optional[float] = Field(default=None, description="Primary unit price")
    total_price: Optional[float] = Field(default=None, description="Primary total price")

    @model_validator(mode="after")
    def populate_items_if_single_product(self):
        # If single product_id is provided and items list is empty, synchronize items
        if self.product_id and not self.items:
            qty = self.quantity or 1
            price = self.unit_price or 0.0
            total = self.total_price if self.total_price is not None else round(qty * price, 2)
            self.items = [
                SaleItem(
                    product_id=self.product_id,
                    quantity=qty,
                    unit_price=price,
                    total_price=total,
                )
            ]
            if self.total_amount == 0.0:
                self.total_amount = total
        elif self.items and not self.product_id:
            # Set primary fields from first item for backward query compatibility
            self.product_id = self.items[0].product_id
            self.quantity = self.items[0].quantity
            self.unit_price = self.items[0].unit_price
            self.total_price = self.items[0].total_price
            if self.total_amount == 0.0:
                self.total_amount = sum(item.total_price for item in self.items)
        return self
