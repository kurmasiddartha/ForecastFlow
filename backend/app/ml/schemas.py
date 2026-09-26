from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DemandTimeSeriesRecord(BaseModel):
    """Clean aggregated demand data point for a product on a specific date."""

    date: str = Field(..., description="ISO Date string YYYY-MM-DD")
    product_id: str = Field(..., description="Unique product identifier")
    product_sku: Optional[str] = Field(default=None, description="Product SKU code")
    product_name: Optional[str] = Field(default=None, description="Product catalog name")
    demand: float = Field(..., ge=0.0, description="Quantity of units sold / demanded on this date")
    revenue: float = Field(default=0.0, ge=0.0, description="Gross sales revenue on this date")
    order_count: int = Field(default=0, ge=0, description="Number of customer orders containing this item")


class FeatureEngineeredRecord(BaseModel):
    """Enriched time-series record with calendar, lag, and non-leaking rolling window features."""

    date: str
    product_id: str
    demand: float = Field(..., description="Target variable (actual demand on this date)")

    # Calendar features
    day: int = Field(..., description="Day of month (1-31)")
    day_of_week: int = Field(..., description="Day of week (0=Monday, 6=Sunday)")
    is_weekend: int = Field(..., description="Weekend indicator (1 if Sat/Sun, else 0)")
    week_of_year: int = Field(..., description="ISO calendar week (1-53)")
    month: int = Field(..., description="Month of year (1-12)")
    quarter: int = Field(..., description="Calendar quarter (1-4)")
    year: int = Field(..., description="Calendar year")

    # Lag features (strict past history, no data leakage)
    lag_1: Optional[float] = Field(default=None, description="Demand on date t-1 (previous day)")
    lag_7: Optional[float] = Field(default=None, description="Demand on date t-7 (same day prior week)")
    lag_14: Optional[float] = Field(default=None, description="Demand on date t-14 (two weeks prior)")

    # Rolling window features (computed over shifted past history: t-1, t-2...)
    rolling_7_mean: Optional[float] = Field(default=None, description="7-day rolling mean of past demand (t-7 to t-1)")
    rolling_7_std: Optional[float] = Field(default=None, description="7-day rolling standard deviation")
    rolling_30_mean: Optional[float] = Field(default=None, description="30-day rolling mean of past demand (t-30 to t-1)")
    rolling_30_std: Optional[float] = Field(default=None, description="30-day rolling standard deviation")


class DatasetValidationSummary(BaseModel):
    """Audit report validating time-series continuity, completeness, and lack of leakage."""

    total_records: int
    product_count: int
    date_range_start: str
    date_range_end: str
    days_span: int
    missing_dates_imputed: int
    leakage_check_passed: bool
    has_nulls_in_target: bool
    target_summary: Dict[str, float]


class DatasetExtractionResponse(BaseModel):
    validation: DatasetValidationSummary
    records: List[Dict[str, Any]]
    total_records: int

