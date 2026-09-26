from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field
from app.models.common import MongoBaseModel, PyObjectId, utc_now

ForecastModelType = Literal[
    "moving_average",
    "exponential_smoothing",
    "linear_regression",
    "random_forest",
    "sarima",
]
ForecastPeriod = Literal["daily", "weekly", "monthly"]


class ForecastPoint(BaseModel):
    """Individual projected demand point for a time bucket."""

    date: str = Field(..., description="Target forecast date bucket (YYYY-MM-DD)")
    predicted_demand: float = Field(..., ge=0.0, description="Forecasted unit demand")
    lower_bound: Optional[float] = Field(default=None, ge=0.0, description="Lower prediction interval (e.g. 95% confidence)")
    upper_bound: Optional[float] = Field(default=None, ge=0.0, description="Upper prediction interval (e.g. 95% confidence)")


class Forecast(MongoBaseModel):
    """Demand forecast document in 'forecasts' collection."""

    product_id: PyObjectId = Field(..., description="Referenced Product ID")
    product_name: Optional[str] = Field(default=None, description="Cached product name")
    product_sku: Optional[str] = Field(default=None, description="Cached product SKU")
    model_used: str = Field(..., description="Statistical or ML model identifier")
    forecast_period: ForecastPeriod = Field(default="daily", description="Granularity of forecast")
    forecast_date: datetime = Field(default_factory=utc_now, description="Timestamp when the forecast was computed")
    horizon_days: int = Field(default=7, description="Number of days forecasted into the future")
    predictions: List[ForecastPoint] = Field(..., min_length=1, description="Sequential forecasted demand points")
    historical_data: Optional[List[Dict[str, Any]]] = Field(default=None, description="Recent historical demand records")
    evaluation_metrics: Optional[Dict[str, float]] = Field(
        default=None,
        description="Historical validation scores (e.g. MAE, RMSE, MAPE)",
    )
    model_comparison: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Backtested evaluation metrics across all evaluated candidate models",
    )
    generated_timestamp: datetime = Field(default_factory=utc_now, description="Exact timestamp of model execution")
    insufficient_data: bool = Field(default=False, description="Flag indicating fallback due to sparse history")

