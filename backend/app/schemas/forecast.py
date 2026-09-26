from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ForecastPredictionPoint(BaseModel):
    date: str = Field(..., description="Target date in YYYY-MM-DD")
    predicted_demand: float = Field(..., ge=0.0, description="Projected units demanded")
    lower_bound: Optional[float] = Field(default=None, ge=0.0, description="Estimated lower bound")
    upper_bound: Optional[float] = Field(default=None, ge=0.0, description="Estimated upper bound")


class HistoricalDemandPoint(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD")
    demand: float = Field(..., ge=0.0, description="Actual observed sales demand")


class ModelComparisonItem(BaseModel):
    model_name: str
    mae: float
    rmse: float
    mape: float
    smape: float
    is_selected: bool


class ForecastGenerateRequest(BaseModel):
    product_id: str = Field(..., description="Target product ID")
    horizon: int = Field(default=7, ge=1, le=90, description="Forecast horizon in days (1 to 90)")
    model_preference: str = Field(
        default="auto",
        description="Model to use: 'auto' (evaluates and picks best), 'baseline', 'moving_average', 'exponential_smoothing', or 'ridge'",
    )
    force_retrain: bool = Field(default=False, description="Force re-running ML training even if recent cache exists")
    save: bool = Field(default=True, description="Whether to persist forecast document to database")


class ForecastResponse(BaseModel):
    id: Optional[str] = None
    product_id: str
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    model_used: str
    forecast_horizon: int
    forecast_date: datetime
    generated_timestamp: Optional[datetime] = None
    predictions: List[ForecastPredictionPoint] = Field(default_factory=list)
    historical_data: List[HistoricalDemandPoint] = Field(default_factory=list)
    evaluation_metrics: Dict[str, float] = Field(default_factory=dict)
    model_comparison: List[ModelComparisonItem] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    is_cached: bool = False
    insufficient_data: bool = False
    message: Optional[str] = None


class BatchForecastRequest(BaseModel):
    horizon: int = Field(default=7, ge=1, le=90, description="Forecast horizon in days")
    force_retrain: bool = Field(default=False, description="Whether to re-evaluate models if fresh forecast already exists")
    max_products: int = Field(default=50, ge=1, le=200, description="Maximum number of active products to process")


class BatchForecastItem(BaseModel):
    product_id: str
    product_name: str
    product_sku: Optional[str] = None
    model_used: str
    forecast_horizon: int
    is_cached: bool
    status: str
    error: Optional[str] = None


class BatchForecastResponse(BaseModel):
    total_processed: int
    successful: int
    failed: int
    cached_used: int
    executed_at: datetime
    results: List[BatchForecastItem]

