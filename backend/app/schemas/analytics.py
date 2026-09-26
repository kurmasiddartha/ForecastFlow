from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class FastSlowMovingProduct(BaseModel):
    product_id: str
    product_name: str
    sku: str
    units_sold: int
    revenue: float
    current_stock: int
    cost_price: float
    reorder_point: int


class SalesOverTimePoint(BaseModel):
    date: str = Field(..., description="Date string YYYY-MM-DD")
    revenue: float
    units_sold: int
    order_count: int


class TopSellingProduct(BaseModel):
    product_id: str
    product_name: str
    sku: str
    units_sold: int
    revenue: float


class CategorySalesPoint(BaseModel):
    category: str
    revenue: float
    units_sold: int


class InventoryDistributionPoint(BaseModel):
    category: str
    product_count: int
    total_stock: int
    inventory_value: float


class StockMovementTrendPoint(BaseModel):
    date: str = Field(..., description="Date string YYYY-MM-DD")
    stock_in: int
    stock_out: int
    net_change: int


class DashboardSummaryMetrics(BaseModel):
    total_products: int
    inventory_value: float
    total_stock: int
    low_stock_count: int
    total_sales_amount: float
    total_sales_count: int
    total_purchases_amount: float
    total_purchases_count: int


class DashboardAnalyticsResponse(BaseModel):
    summary: DashboardSummaryMetrics
    fast_moving_products: List[FastSlowMovingProduct]
    slow_moving_products: List[FastSlowMovingProduct]
    sales_over_time: List[SalesOverTimePoint]
    top_selling_products: List[TopSellingProduct]
    category_sales: List[CategorySalesPoint]
    inventory_distribution: List[InventoryDistributionPoint]
    stock_movement_trends: List[StockMovementTrendPoint]
    timeframe: str
    start_date: datetime
    end_date: datetime


# -------------------------------------------------------------
# Phase 13: Unified AI Executive Dashboard Schemas
# -------------------------------------------------------------

class LowStockAlertItem(BaseModel):
    product_id: str
    product_name: str
    sku: str
    current_stock: int
    reorder_point: int
    category_name: Optional[str] = None
    urgency: str  # "out_of_stock", "critical", "warning"


class StockoutRiskItem(BaseModel):
    product_id: str
    product_name: str
    sku: str
    current_stock: int
    daily_velocity: float
    days_of_supply: float
    urgency: str  # "critical", "high", "medium"
    shortfall_units: float
    revenue_at_risk: float


class DeadStockItem(BaseModel):
    product_id: str
    product_name: str
    sku: str
    current_stock: int
    cost_price: float
    capital_tied_up: float
    days_without_sale: int


class SlowDeadStockSummary(BaseModel):
    dead_stock_count: int
    slow_moving_count: int
    total_capital_tied_up: float
    top_dead_stock_items: List[DeadStockItem] = Field(default_factory=list)


class ForecastSummaryData(BaseModel):
    total_forecasted_units_14d: float
    active_forecasts_count: int
    primary_model: str
    horizon_days: int


class ForecastChartDataPoint(BaseModel):
    date: str
    actual: Optional[float] = None
    predicted: Optional[float] = None


class FeaturedForecastData(BaseModel):
    product_id: str
    product_name: str
    sku: str
    model_used: str
    horizon_days: int
    data_points: List[ForecastChartDataPoint] = Field(default_factory=list)


class DashboardRestockItem(BaseModel):
    id: str
    product_id: str
    product_name: str
    sku: str
    suggested_order_quantity: int
    urgency: str
    estimated_cost: float
    reason: str
    current_stock: int
    incoming_stock: int
    forecast_demand: float
    safety_stock: int
    status: str


class DashboardRestockSummary(BaseModel):
    pending_count: int
    critical_count: int
    high_count: int
    total_units_needed: int
    total_budget_needed: float
    top_recommendations: List[DashboardRestockItem] = Field(default_factory=list)


class InventoryOverviewMetrics(BaseModel):
    total_products: int
    total_stock_units: int
    total_inventory_value: float
    low_stock_count: int
    out_of_stock_count: int


class SalesOverviewMetrics(BaseModel):
    total_revenue: float
    total_units_sold: int
    total_orders_count: int
    total_purchases_amount: float
    total_purchases_count: int


class AIDashboardResponse(BaseModel):
    inventory_overview: InventoryOverviewMetrics
    sales_overview: SalesOverviewMetrics
    low_stock_alerts: List[LowStockAlertItem] = Field(default_factory=list)
    stockout_risk_products: List[StockoutRiskItem] = Field(default_factory=list)
    forecast_summary: ForecastSummaryData
    top_fast_moving: List[FastSlowMovingProduct] = Field(default_factory=list)
    slow_dead_stock_summary: SlowDeadStockSummary
    restock_summary: DashboardRestockSummary
    sales_trends: List[SalesOverTimePoint] = Field(default_factory=list)
    featured_forecast: Optional[FeaturedForecastData] = None
    available_products_for_forecast: List[dict] = Field(default_factory=list)
    timeframe: str
    generated_at: datetime

