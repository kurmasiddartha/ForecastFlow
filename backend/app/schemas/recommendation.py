from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

RecommendationUrgency = Literal["critical", "high", "medium", "low"]
RecommendationStatus = Literal["pending", "approved", "dismissed", "ordered"]


class FormulaBreakdown(BaseModel):
    """Transparent mathematical explanation of the recommendation calculation."""

    forecast_demand: float = Field(default=0.0, description="Projected consumption across planning window")
    safety_stock: int = Field(default=0, description="Buffer units required")
    gross_target: float = Field(default=0.0, description="Gross requirement (Forecast + Safety Stock)")
    current_stock: int = Field(default=0, description="Physical units on hand")
    incoming_stock: int = Field(default=0, description="Units on open purchase orders")
    total_available: int = Field(default=0, description="Pipeline inventory (Current + Incoming)")
    net_shortfall: float = Field(default=0.0, description="Raw shortfall before integer ceiling")
    recommended_order: int = Field(default=0, description="Final recommended purchase order quantity")
    formula_text: str = Field(default="", description="Human-readable formula string")



class RecommendationResponse(BaseModel):
    """Full detail view of an actionable restock recommendation."""

    id: str
    product_id: str
    product_name: str = "Product"
    product_sku: str = "SKU"
    category_name: Optional[str] = None
    supplier_id: Optional[str] = None
    supplier_name: Optional[str] = None
    forecast_id: Optional[str] = None

    suggested_order_quantity: int = 0
    urgency: str = "medium"
    reason: str = ""
    status: str = "pending"

    forecast_demand: float = 0.0
    current_stock: int = 0
    incoming_stock: int = 0
    safety_stock: int = 0
    reorder_level: int = 0
    lead_time_days: int = 7

    unit_cost: float = 0.0
    estimated_cost: float = 0.0

    formula_breakdown: Optional[FormulaBreakdown] = None
    risk_factors: List[str] = Field(default_factory=list)
    purchase_id: Optional[str] = None
    created_at: Optional[datetime] = None


class RecommendationGenerateRequest(BaseModel):
    """Payload to trigger the recommendation engine."""

    product_id: Optional[str] = Field(default=None, description="Optional target product ID (null for all catalog)")
    planning_horizon_days: int = Field(default=14, ge=7, le=90, description="Review planning cycle horizon in days")
    save: bool = Field(default=True, description="Whether to persist generated recommendations to database")


class RecommendationStatusUpdateRequest(BaseModel):
    """Payload to update recommendation status."""

    status: RecommendationStatus = Field(..., description="New status: approved, dismissed, pending, ordered")


class RecommendationSummary(BaseModel):
    """High-level summary of restock recommendations and budget requirement."""

    total_recommendations: int
    pending_count: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    total_recommended_units: int
    total_estimated_budget: float
    approved_count: int
    ordered_count: int
    dismissed_count: int


class RecommendationListResponse(BaseModel):
    """Paginated list of recommendations with portfolio summary."""

    summary: RecommendationSummary
    items: List[RecommendationResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class ConvertToPurchaseResponse(BaseModel):
    """Result of converting a restock recommendation to a formal Purchase Order."""

    purchase_id: str
    recommendation_id: str
    product_name: str
    quantity: int
    total_amount: float
    status: str
    message: str
