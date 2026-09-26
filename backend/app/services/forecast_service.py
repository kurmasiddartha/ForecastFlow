import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
import numpy as np
import pandas as pd

from app.ml.pipeline import demand_pipeline
from app.ml.evaluator import model_evaluator
from app.ml.models.base import BaseForecaster
from app.ml.models.naive import NaiveForecaster
from app.ml.models.moving_average import MovingAverageForecaster
from app.ml.models.exponential_smoothing import ExponentialSmoothingForecaster
from app.ml.models.ridge_regression import RidgeDemandForecaster
from app.schemas.forecast import (
    BatchForecastItem,
    BatchForecastResponse,
    ForecastGenerateRequest,
    ForecastResponse,
    ForecastPredictionPoint,
    HistoricalDemandPoint,
    ModelComparisonItem,
)

logger = logging.getLogger("forecastflow.forecasting")


def _ensure_utc(dt: Optional[datetime]) -> datetime:
    if dt is None:
        return datetime.now(timezone.utc)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class ForecastService:
    """Service layer managing time-series training, backtesting evaluation, demand forecasting, and batch scheduling."""

    CACHE_TTL_HOURS: float = 24.0

    @staticmethod
    def _create_future_date_series(last_date_str: str, horizon: int) -> List[str]:
        """Constructs forward-looking calendar date strings [t+1, ..., t+H]."""
        start = pd.to_datetime(last_date_str) + timedelta(days=1)
        future_dates = pd.date_range(start=start, periods=horizon, freq="D")
        return [d.strftime("%Y-%m-%d") for d in future_dates]

    async def generate_forecast(
        self,
        db: AsyncIOMotorDatabase,
        request: ForecastGenerateRequest,
    ) -> ForecastResponse:
        """Runs the time-series pipeline, evaluates models on time-split, and produces predictions.
        
        Leverages MongoDB cache if fresh forecast exists and force_retrain is False.
        """
        if not ObjectId.is_valid(request.product_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid product ID: '{request.product_id}'",
            )

        now = datetime.now(timezone.utc)

        # 0. Check cache to avoid unnecessary retraining
        if not request.force_retrain:
            cached = await self.get_latest_forecast(db, request.product_id)
            if cached and cached.generated_timestamp:
                gen_time_utc = _ensure_utc(cached.generated_timestamp)
                age_seconds = (now - gen_time_utc).total_seconds()
                if age_seconds < (self.CACHE_TTL_HOURS * 3600) and cached.forecast_horizon >= request.horizon:
                    logger.info(
                        "Returning fresh cached forecast for product %s (age: %.1f hrs)",
                        request.product_id,
                        age_seconds / 3600.0,
                    )
                    cached.is_cached = True
                    if cached.forecast_horizon > request.horizon:
                        cached.predictions = cached.predictions[:request.horizon]
                        cached.forecast_horizon = request.horizon
                    return cached


        # 1. Fetch Product metadata
        product = await db.products.find_one({"_id": ObjectId(request.product_id)})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product not found: '{request.product_id}'",
            )

        p_name = product.get("name", "Product")
        p_sku = product.get("sku", "SKU")

        # 2. Extract and preprocess historical sales dataset
        features_df, validation = await demand_pipeline.run(
            db=db,
            product_id=request.product_id,
            freq="D",
        )

        # Build recent historical demand points (last 45 days) for visual context in UI
        historical_points: List[HistoricalDemandPoint] = []
        if not features_df.empty:
            tail_df = features_df.tail(45)
            for _, row in tail_df.iterrows():
                d_str = row["date"].strftime("%Y-%m-%d") if isinstance(row["date"], pd.Timestamp) else str(row["date"])
                historical_points.append(
                    HistoricalDemandPoint(
                        date=d_str,
                        demand=round(float(row.get("demand", 0.0)), 2),
                    )
                )

        # 3. Handle cold-start / sparse data edge cases (< 4 observations) gracefully
        if features_df.empty or len(features_df) < 4:
            logger.info("Product %s has sparse historical observations (%d rows). Using baseline fallback.", request.product_id, len(features_df))
            last_date_str = (
                features_df["date"].iloc[-1].strftime("%Y-%m-%d")
                if not features_df.empty
                else now.strftime("%Y-%m-%d")
            )
            future_dates = self._create_future_date_series(last_date_str, request.horizon)

            fallback_val = float(product.get("reorder_point", 5.0)) / max(1, request.horizon)
            if not features_df.empty and features_df["demand"].sum() > 0:
                fallback_val = float(features_df["demand"].mean())

            fallback_val = max(0.5, round(fallback_val, 2))

            predictions = [
                ForecastPredictionPoint(
                    date=d,
                    predicted_demand=fallback_val,
                    lower_bound=round(max(0.0, fallback_val * 0.7), 2),
                    upper_bound=round(fallback_val * 1.3, 2),
                )
                for d in future_dates
            ]

            sparse_msg = (
                f"Insufficient historical sales data ({len(features_df)} recorded period(s), minimum 4 required "
                "for backtesting and regression). Conservative baseline fallback applied."
            )

            response = ForecastResponse(
                product_id=request.product_id,
                product_name=p_name,
                product_sku=p_sku,
                model_used="Baseline (Sparse Data Fallback)",
                forecast_horizon=request.horizon,
                forecast_date=now,
                generated_timestamp=now,
                predictions=predictions,
                historical_data=historical_points,
                evaluation_metrics={"mae": 0.0, "rmse": 0.0, "mape": 0.0, "smape": 0.0},
                model_comparison=[],
                created_at=now,
                is_cached=False,
                insufficient_data=True,
                message=sparse_msg,
            )

            if request.save:
                doc = {
                    "product_id": ObjectId(request.product_id),
                    "product_name": p_name,
                    "product_sku": p_sku,
                    "model_used": response.model_used,
                    "forecast_period": "daily",
                    "forecast_date": now,
                    "horizon_days": request.horizon,
                    "predictions": [p.model_dump() for p in predictions],
                    "historical_data": [h.model_dump() for h in historical_points],
                    "evaluation_metrics": response.evaluation_metrics,
                    "model_comparison": [],
                    "generated_timestamp": now,
                    "created_at": now,
                    "insufficient_data": True,
                    "message": sparse_msg,
                }
                res = await db.forecasts.insert_one(doc)
                response.id = str(res.inserted_id)

            return response

        # 4. Multi-Model Time-Aware Evaluation and Selection
        eval_result = model_evaluator.evaluate_and_compare(
            df=features_df,
            horizon=request.horizon,
        )

        comparison_items = [
            ModelComparisonItem(
                model_name=c["model_name"],
                mae=c["mae"],
                rmse=c["rmse"],
                mape=c["mape"],
                smape=c["smape"],
                is_selected=c.get("is_selected", False),
            )
            for c in eval_result["comparison_table"]
        ]

        # Determine model to use
        preference = (request.model_preference or "auto").lower()
        active_model = eval_result["champion_model"]
        chosen_model_name = eval_result["champion_model_name"]
        chosen_metrics = eval_result["best_metrics"]

        if preference != "auto":
            # Match user preference
            for c in eval_result["comparison_table"]:
                if preference in c["model_name"].lower():
                    chosen_model_name = c["model_name"]
                    chosen_metrics = {
                        "mae": c["mae"],
                        "rmse": c["rmse"],
                        "mape": c["mape"],
                        "smape": c["smape"],
                    }
                    for item in comparison_items:
                        item.is_selected = (item.model_name == chosen_model_name)
                    break

        # 5. Generate Forward-Looking Predictions
        last_date_str = features_df["date"].iloc[-1].strftime("%Y-%m-%d")
        future_dates = self._create_future_date_series(last_date_str, request.horizon)

        raw_preds = active_model.predict(horizon=request.horizon)
        std_error = chosen_metrics.get("rmse", 1.0) or 1.0

        predictions = []
        for i, d in enumerate(future_dates):
            pred_val = round(float(raw_preds[i]), 2)
            predictions.append(
                ForecastPredictionPoint(
                    date=d,
                    predicted_demand=pred_val,
                    lower_bound=round(max(0.0, pred_val - 1.28 * std_error), 2),
                    upper_bound=round(pred_val + 1.28 * std_error, 2),
                )
            )

        # 6. Optionally persist forecast to MongoDB
        forecast_id_str = None
        if request.save:
            forecast_doc = {
                "product_id": ObjectId(request.product_id),
                "product_name": p_name,
                "product_sku": p_sku,
                "model_used": chosen_model_name,
                "forecast_period": "daily",
                "forecast_date": now,
                "horizon_days": request.horizon,
                "predictions": [p.model_dump() for p in predictions],
                "historical_data": [h.model_dump() for h in historical_points],
                "evaluation_metrics": chosen_metrics,
                "model_comparison": [c.model_dump() for c in comparison_items],
                "generated_timestamp": now,
                "created_at": now,
                "insufficient_data": False,
                "message": None,
            }
            res = await db.forecasts.insert_one(forecast_doc)
            forecast_id_str = str(res.inserted_id)

        return ForecastResponse(
            id=forecast_id_str,
            product_id=request.product_id,
            product_name=p_name,
            product_sku=p_sku,
            model_used=chosen_model_name,
            forecast_horizon=request.horizon,
            forecast_date=now,
            generated_timestamp=now,
            predictions=predictions,
            historical_data=historical_points,
            evaluation_metrics=chosen_metrics,
            model_comparison=comparison_items,
            created_at=now,
            is_cached=False,
            insufficient_data=False,
            message=None,
        )

    async def get_latest_forecast(
        self,
        db: AsyncIOMotorDatabase,
        product_id: str,
    ) -> Optional[ForecastResponse]:
        """Retrieves the most recent persisted forecast without re-running model training."""
        if not ObjectId.is_valid(product_id):
            return None

        doc = await db.forecasts.find_one(
            {"product_id": ObjectId(product_id)},
            sort=[("generated_timestamp", -1), ("created_at", -1)],
        )
        if not doc:
            return None

        product = await db.products.find_one({"_id": doc["product_id"]})
        p_name = doc.get("product_name") or (product.get("name") if product else "Product")
        p_sku = doc.get("product_sku") or (product.get("sku") if product else "SKU")

        historical_points = [HistoricalDemandPoint(**h) for h in doc.get("historical_data", [])] if doc.get("historical_data") else []

        gen_time = doc.get("generated_timestamp") or doc.get("created_at") or datetime.now(timezone.utc)

        return ForecastResponse(
            id=str(doc["_id"]),
            product_id=str(doc["product_id"]),
            product_name=p_name,
            product_sku=p_sku,
            model_used=doc.get("model_used", "Unknown"),
            forecast_horizon=doc.get("horizon_days", len(doc.get("predictions", []))),
            forecast_date=doc.get("forecast_date", gen_time),
            generated_timestamp=gen_time,
            predictions=[ForecastPredictionPoint(**p) for p in doc.get("predictions", [])],
            historical_data=historical_points,
            evaluation_metrics=doc.get("evaluation_metrics", {}),
            model_comparison=[ModelComparisonItem(**c) for c in doc.get("model_comparison", [])],
            created_at=doc.get("created_at", gen_time),
            is_cached=True,
            insufficient_data=doc.get("insufficient_data", False),
            message=doc.get("message"),
        )

    async def run_scheduled_forecasts(
        self,
        db: AsyncIOMotorDatabase,
        horizon: int = 7,
        force_retrain: bool = False,
        max_products: int = 50,
    ) -> BatchForecastResponse:
        """Executes scheduled / batch forecasting across active products.
        
        Skips retraining when a fresh forecast within CACHE_TTL_HOURS exists unless force_retrain is True.
        """
        now = datetime.now(timezone.utc)
        cursor = db.products.find({"is_active": True}).limit(max_products)
        products = await cursor.to_list(length=max_products)

        total = len(products)
        successful = 0
        failed = 0
        cached_used = 0
        items: List[BatchForecastItem] = []

        logger.info("Starting scheduled forecast run for %d active products (horizon=%d)", total, horizon)

        for prod in products:
            p_id = str(prod["_id"])
            p_name = prod.get("name", "Unknown")
            p_sku = prod.get("sku", "")

            try:
                result = await self.generate_forecast(
                    db=db,
                    request=ForecastGenerateRequest(
                        product_id=p_id,
                        horizon=horizon,
                        force_retrain=force_retrain,
                        save=True,
                    ),
                )
                if result.is_cached:
                    cached_used += 1
                successful += 1
                items.append(
                    BatchForecastItem(
                        product_id=p_id,
                        product_name=p_name,
                        product_sku=p_sku,
                        model_used=result.model_used,
                        forecast_horizon=result.forecast_horizon,
                        is_cached=result.is_cached,
                        status="success",
                        error=None,
                    )
                )
            except Exception as exc:
                failed += 1
                logger.error("Failed scheduled forecast for product %s (%s): %s", p_id, p_name, exc)
                items.append(
                    BatchForecastItem(
                        product_id=p_id,
                        product_name=p_name,
                        product_sku=p_sku,
                        model_used="None",
                        forecast_horizon=horizon,
                        is_cached=False,
                        status="error",
                        error=str(exc),
                    )
                )

        logger.info(
            "Scheduled forecast completed: %d total, %d success (%d from cache), %d failed",
            total,
            successful,
            cached_used,
            failed,
        )

        return BatchForecastResponse(
            total_processed=total,
            successful=successful,
            failed=failed,
            cached_used=cached_used,
            executed_at=now,
            results=items,
        )


forecast_service = ForecastService()
