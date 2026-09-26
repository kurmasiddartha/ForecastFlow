from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

VelocityCategory = Literal["FAST_MOVING", "NORMAL", "SLOW_MOVING", "DEAD_STOCK", "OUT_OF_STOCK"]
RiskLevel = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"]


class InventoryIntelligenceConfig(BaseModel):
    """Configurable business rule thresholds for inventory intelligence."""

    analysis_window_days: int = Field(
        default=30, ge=7, le=180, description="Window in days to compute recent sales velocity"
    )
    dead_stock_days: int = Field(
        default=60, ge=14, le=365, description="Days with zero sales to classify as dead stock"
    )
    fast_moving_daily_velocity: float = Field(
        default=2.0, ge=0.1, le=100.0, description="Minimum units/day to classify as fast-moving"
    )
    slow_moving_daily_velocity: float = Field(
        default=0.5, ge=0.01, le=50.0, description="Daily velocity threshold below which product is slow-moving"
    )
    stockout_risk_days: float = Field(
        default=7.0, ge=1.0, le=60.0, description="Runway days threshold below which stockout risk is triggered"
    )
    overstock_days: float = Field(
        default=90.0, ge=14.0, le=365.0, description="Runway days threshold above which overstock risk is triggered"
    )


class ProductIntelligenceItem(BaseModel):
    """Comprehensive analytical intelligence metrics for an individual product."""

    product_id: str
    name: str
    sku: str
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    supplier_id: Optional[str] = None
    supplier_name: Optional[str] = None
    current_stock: int
    reorder_level: int
    target_stock_level: int
    safety_stock: int
    cost_price: float
    selling_price: float
    total_inventory_value: float

    # Sales & Demand Velocity
    sales_in_window: int = 0
    orders_in_window: int = 0
    daily_sales_velocity: float = 0.0
    last_sale_date: Optional[datetime] = None
    days_since_last_sale: Optional[int] = None

    # Forecast Integration
    forecast_daily_demand: Optional[float] = None
    forecast_horizon: Optional[int] = None
    effective_daily_demand: float = 0.0

    # Runway & Duration
    days_of_inventory_remaining: Optional[float] = None  # None or 999 for zero demand
    runway_status: str = "NORMAL"  # "CRITICAL", "LOW", "HEALTHY", "EXCESS", "INFINITE"

    # Velocity Categorization
    velocity_category: VelocityCategory
    velocity_label: str

    # Risk Classifications
    stockout_risk: RiskLevel = "NONE"
    stockout_reason: Optional[str] = None
    projected_shortfall_units: int = 0
    revenue_at_risk: float = 0.0

    overstock_risk: RiskLevel = "NONE"
    overstock_reason: Optional[str] = None
    excess_units: int = 0
    excess_capital_tied_up: float = 0.0

    is_dead_stock: bool = False
    dead_stock_capital: float = 0.0


class IntelligenceSummary(BaseModel):
    """High-level executive inventory health & portfolio intelligence metrics."""

    total_products_analyzed: int
    total_inventory_units: int
    total_inventory_valuation: float

    # Velocity Distribution
    fast_moving_count: int
    fast_moving_percentage: float
    normal_moving_count: int
    normal_moving_percentage: float
    slow_moving_count: int
    slow_moving_percentage: float
    dead_stock_count: int
    dead_stock_percentage: float
    out_of_stock_count: int

    # Financial & Risk Highlights
    dead_stock_capital_tied_up: float
    stockout_risk_count: int
    critical_stockout_count: int
    potential_revenue_at_risk: float
    overstock_risk_count: int
    excess_capital_tied_up: float
    average_runway_days: float

    # Applied Configuration
    config: InventoryIntelligenceConfig
    evaluated_at: datetime


class IntelligenceListResponse(BaseModel):
    """Paginated list of product intelligence evaluations with summary."""

    summary: IntelligenceSummary
    products: List[ProductIntelligenceItem]
    total_count: int
    page: int
    limit: int
    total_pages: int
