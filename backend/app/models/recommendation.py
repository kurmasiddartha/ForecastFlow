from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import Field
from app.models.common import MongoBaseModel, PyObjectId

RecommendationUrgency = Literal["low", "medium", "high", "critical"]
RecommendationStatus = Literal["pending", "approved", "dismissed", "ordered"]


class Recommendation(MongoBaseModel):
    """Restocking recommendation document in 'recommendations' collection."""

    product_id: PyObjectId = Field(..., description="Referenced Product ID")
    product_name: Optional[str] = Field(default=None, description="Cached product name")
    product_sku: Optional[str] = Field(default=None, description="Cached product SKU")
    category_name: Optional[str] = Field(default=None, description="Cached category name")
    supplier_id: Optional[PyObjectId] = Field(default=None, description="Referenced Supplier ID")
    supplier_name: Optional[str] = Field(default=None, description="Cached supplier name")
    forecast_id: Optional[PyObjectId] = Field(default=None, description="Optional referenced Forecast ID that triggered this recommendation")

    suggested_order_quantity: int = Field(..., ge=0, description="Calculated reorder quantity to reach target inventory")
    urgency: RecommendationUrgency = Field(default="medium", description="Stockout risk urgency level")
    reason: str = Field(..., max_length=1500, description="Human-readable explanation of restocking logic")
    status: RecommendationStatus = Field(default="pending", description="Actionable status of recommendation")

    # Inventory & Demand Inputs
    forecast_demand: float = Field(default=0.0, ge=0.0, description="Projected demand across lead time and review window")
    current_stock: int = Field(default=0, ge=0, description="Physical units on hand at recommendation time")
    incoming_stock: int = Field(default=0, ge=0, description="Units in open/pending purchase orders")
    safety_stock: int = Field(default=0, ge=0, description="Buffer stock threshold")
    reorder_level: int = Field(default=0, ge=0, description="Reorder point threshold")
    lead_time_days: int = Field(default=7, ge=0, description="Supplier lead time used for planning")

    unit_cost: float = Field(default=0.0, ge=0.0, description="Unit acquisition cost")
    estimated_cost: float = Field(default=0.0, ge=0.0, description="Total procurement cost (qty * unit_cost)")

    formula_breakdown: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Detailed mathematical components: (Forecast + Safety Stock) - (Current Stock + Incoming)",
    )
    risk_factors: Optional[List[str]] = Field(default_factory=list, description="Specific risk condition flags")
    purchase_id: Optional[PyObjectId] = Field(default=None, description="Linked Purchase Order ID if converted to PO")

