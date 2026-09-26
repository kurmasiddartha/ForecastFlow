from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_current_active_user
from app.database import get_database
from app.ml.pipeline import demand_pipeline
from app.ml.schemas import DatasetExtractionResponse
from app.schemas.auth import UserResponse
from app.schemas.forecast import (
    BatchForecastRequest,
    BatchForecastResponse,
    ForecastGenerateRequest,
    ForecastResponse,
)
from app.services.forecast_service import forecast_service

router = APIRouter(prefix="/forecasting", tags=["Forecasting & ML Data Pipeline"])


@router.get(
    "/dataset",
    response_model=DatasetExtractionResponse,
    summary="Extract preprocessed time-series dataset with engineered features",
    description=(
        "Converts historical MongoDB sales transactions into a continuous, regular time-series dataset. "
        "Performs data sanitization, zero-demand imputation on missing dates, and generates non-leaking "
        "calendar, lag, and rolling window features for forecasting."
    ),
)
async def get_forecasting_dataset(
    product_id: Optional[str] = Query(default=None, description="Filter for specific product ID"),
    start_date: Optional[datetime] = Query(default=None, description="Start date boundary (ISO)"),
    end_date: Optional[datetime] = Query(default=None, description="End date boundary (ISO)"),
    freq: Literal["D", "W"] = Query(default="D", description="Time aggregation frequency: 'D' (daily) or 'W' (weekly)"),
    limit: int = Query(default=1000, ge=1, le=5000, description="Max rows returned in payload"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> DatasetExtractionResponse:
    features_df, validation = await demand_pipeline.run(
        db=db,
        product_id=product_id,
        start_date=start_date,
        end_date=end_date,
        freq=freq,
    )

    if features_df.empty:
        return DatasetExtractionResponse(
            validation=validation,
            records=[],
            total_records=0,
        )

    # Format dates as strings for JSON serialization
    sample_df = features_df.head(limit).copy()
    sample_df["date"] = sample_df["date"].astype(str)

    # Replace NaNs with None for valid JSON serialization
    records = sample_df.where(sample_df.notna(), None).to_dict(orient="records")

    return DatasetExtractionResponse(
        validation=validation,
        records=records,
        total_records=len(features_df),
    )


@router.post(
    "/generate",
    response_model=ForecastResponse,
    summary="Generate demand forecast with multi-model evaluation",
    description=(
        "Executes time-aware train/test evaluation across Baseline, Moving Average, Exponential Smoothing, "
        "and Ridge Regression. Selects the champion model based on MAE/RMSE and projects demand forward. "
        "Reuses fresh 24h cache unless force_retrain is explicitly specified."
    ),
)
async def generate_demand_forecast(
    request: ForecastGenerateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> ForecastResponse:
    return await forecast_service.generate_forecast(db=db, request=request)


@router.get(
    "/latest/{product_id}",
    response_model=Optional[ForecastResponse],
    summary="Get latest persisted forecast without retraining",
    description="Retrieves the most recent persisted demand forecast for a product with sub-10ms latency.",
)
async def get_latest_forecast(
    product_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> Optional[ForecastResponse]:
    return await forecast_service.get_latest_forecast(db=db, product_id=product_id)


@router.post(
    "/batch",
    response_model=BatchForecastResponse,
    summary="Execute scheduled or batch forecasting across active catalog products",
    description=(
        "Iterates over active products and generates forward-looking forecasts. "
        "Intelligently utilizes cached forecasts if fresh within 24 hours, preventing redundant compute. "
        "Can be triggered manually or via cron/scheduled runner."
    ),
)
async def run_batch_forecasting(
    request: BatchForecastRequest = BatchForecastRequest(),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> BatchForecastResponse:
    return await forecast_service.run_scheduled_forecasts(
        db=db,
        horizon=request.horizon,
        force_retrain=request.force_retrain,
        max_products=request.max_products,
    )


@router.get(
    "/products",
    response_model=List[Dict[str, Any]],
    summary="List active products with their current forecast status",
    description="Returns product selector metadata including current stock, reorder level, and latest forecast summary.",
)
async def get_forecasting_products_overview(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> List[Dict[str, Any]]:
    products = await db.products.find({"is_active": True}).sort("name", 1).to_list(length=200)

    result = []
    for p in products:
        p_id = p["_id"]
        latest_fc = await db.forecasts.find_one(
            {"product_id": p_id},
            sort=[("generated_timestamp", -1), ("created_at", -1)],
            projection={
                "model_used": 1,
                "horizon_days": 1,
                "generated_timestamp": 1,
                "created_at": 1,
                "insufficient_data": 1,
                "evaluation_metrics": 1,
            },
        )
        gen_time = (
            latest_fc.get("generated_timestamp") or latest_fc.get("created_at")
            if latest_fc
            else None
        )
        result.append(
            {
                "id": str(p_id),
                "name": p.get("name", "Product"),
                "sku": p.get("sku", ""),
                "current_stock": p.get("current_stock", 0),
                "reorder_level": p.get("reorder_level", p.get("reorder_point", 10)),
                "has_forecast": latest_fc is not None,
                "latest_model": latest_fc.get("model_used") if latest_fc else None,
                "latest_horizon": latest_fc.get("horizon_days") if latest_fc else None,
                "last_forecast_at": gen_time.isoformat() if gen_time else None,
                "insufficient_data": latest_fc.get("insufficient_data", False) if latest_fc else False,
            }
        )
    return result
