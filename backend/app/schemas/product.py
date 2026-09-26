from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    sku: str = Field(..., min_length=1, max_length=50, description="Stock Keeping Unit")
    name: str = Field(..., min_length=1, max_length=200, description="Product name")
    description: Optional[str] = Field(default=None, max_length=1000, description="Product description")
    category_id: str = Field(..., description="Referenced Category ID")
    supplier_id: Optional[str] = Field(default=None, description="Referenced Supplier ID")
    unit: str = Field(default="pcs", max_length=30, description="Unit of measurement")
    cost_price: float = Field(..., ge=0.0, description="Acquisition cost per unit")
    selling_price: float = Field(..., ge=0.0, description="Selling price per unit")
    current_stock: int = Field(default=0, ge=0, description="Current stock on hand")
    reorder_point: int = Field(default=10, ge=0, description="Minimum stock threshold for reorder")
    target_stock_level: int = Field(default=50, ge=0, description="Optimal target inventory level")
    safety_stock: int = Field(default=10, ge=0, description="Buffer stock for demand variance")
    is_active: bool = Field(default=True, description="Active status in catalog")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    sku: Optional[str] = Field(default=None, min_length=1, max_length=50)
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    category_id: Optional[str] = None
    supplier_id: Optional[str] = None
    unit: Optional[str] = Field(default=None, max_length=30)
    cost_price: Optional[float] = Field(default=None, ge=0.0)
    selling_price: Optional[float] = Field(default=None, ge=0.0)
    current_stock: Optional[int] = Field(default=None, ge=0)
    reorder_point: Optional[int] = Field(default=None, ge=0)
    target_stock_level: Optional[int] = Field(default=None, ge=0)
    safety_stock: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: str = Field(..., description="Product unique ID")
    category_name: Optional[str] = Field(default=None, description="Enriched category name")
    supplier_name: Optional[str] = Field(default=None, description="Enriched supplier name")
    created_at: datetime
    updated_at: Optional[datetime] = None


class PaginatedProductsResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
