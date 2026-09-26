from typing import Optional
from pydantic import Field
from app.models.common import MongoBaseModel, PyObjectId


class Product(MongoBaseModel):
    """Product catalog item in 'products' collection."""

    sku: str = Field(..., min_length=1, max_length=50, description="Unique Stock Keeping Unit")
    name: str = Field(..., min_length=1, max_length=200, description="Product display name")
    description: Optional[str] = Field(default=None, max_length=1000, description="Detailed product description")
    category_id: PyObjectId = Field(..., description="Referenced Category ID")
    supplier_id: Optional[PyObjectId] = Field(default=None, description="Primary referenced Supplier ID")
    unit: str = Field(default="pcs", max_length=30, description="Measurement unit (pcs, kg, box, etc.)")
    cost_price: float = Field(..., ge=0.0, description="Per-unit acquisition cost")
    selling_price: float = Field(..., ge=0.0, description="Current retail selling price")
    current_stock: int = Field(default=0, ge=0, description="Physical units on hand")
    reorder_point: int = Field(default=10, ge=0, description="Inventory threshold triggering restock review")
    target_stock_level: int = Field(default=50, ge=0, description="Target optimal inventory level")
    safety_stock: int = Field(default=10, ge=0, description="Buffer stock held against demand spikes")
    is_active: bool = Field(default=True, description="Active status for sales and ordering")
