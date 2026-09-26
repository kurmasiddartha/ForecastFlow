from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

from app.ml.metrics import evaluate_forecast
from app.ml.split import time_series_train_test_split
from app.ml.models.base import BaseForecaster
from app.ml.models.naive import NaiveForecaster
from app.ml.models.moving_average import MovingAverageForecaster
from app.ml.models.exponential_smoothing import ExponentialSmoothingForecaster
from app.ml.models.ridge_regression import RidgeDemandForecaster


class ModelComparisonEvaluator:
    """Performs time-aware backtesting evaluation, compares models across MAE/RMSE/MAPE, and selects champion."""

    @classmethod
    def evaluate_and_compare(
        cls,
        df: pd.DataFrame,
        horizon: int = 7,
        custom_models: Optional[List[BaseForecaster]] = None,
    ) -> Dict[str, Any]:
        """Evaluates multiple time-series candidate models on a chronological test split.

        Guarantees:
        1. Pure temporal split (train always strictly precedes test).
        2. Zero future data leakage.
        3. Fair comparison on identical ground-truth demand series.
        """
        if df.empty or len(df) < 4:
            raise ValueError(f"Insufficient historical data ({len(df)} records). At least 4 observations required for evaluation.")

        # Ensure horizon doesn't consume entire dataset
        effective_horizon = min(horizon, max(1, len(df) // 3))

        # 1. Time-aware chronological train/test split
        train_df, test_df = time_series_train_test_split(df, horizon=effective_horizon)
        y_train = train_df["demand"]
        y_test = test_df["demand"].values

        # 2. Instantiate candidate models
        models = custom_models or [
            NaiveForecaster(strategy="last"),
            MovingAverageForecaster(window=min(7, len(train_df))),
            ExponentialSmoothingForecaster(),
            RidgeDemandForecaster(alpha=1.0),
        ]

        comparison_results = []
        fitted_models: Dict[str, BaseForecaster] = {}

        for model in models:
            try:
                # Fit model on training split
                if isinstance(model, RidgeDemandForecaster):
                    model.fit(y=y_train, X=train_df)
                    preds = model.predict(horizon=len(test_df), X_future=test_df)
                else:
                    model.fit(y=y_train)
                    preds = model.predict(horizon=len(test_df))

                # Compute standard error metrics on held-out test data
                metrics = evaluate_forecast(y_true=y_test, y_pred=preds)

                comparison_results.append({
                    "model_name": model.name,
                    "mae": metrics["mae"],
                    "rmse": metrics["rmse"],
                    "mape": metrics["mape"],
                    "smape": metrics["smape"],
                    "predictions": [round(float(p), 2) for p in preds],
                    "params": model.get_params(),
                    "success": True,
                })
                fitted_models[model.name] = model

            except Exception as exc:
                comparison_results.append({
                    "model_name": model.name,
                    "mae": float("inf"),
                    "rmse": float("inf"),
                    "mape": float("inf"),
                    "smape": float("inf"),
                    "predictions": [],
                    "error": str(exc),
                    "success": False,
                })

        # 3. Sort comparison results by MAE ascending (primary) and RMSE (secondary)
        successful_results = [r for r in comparison_results if r["success"]]
        if not successful_results:
            raise RuntimeError("All candidate models failed during evaluation.")

        successful_results.sort(key=lambda r: (r["mae"], r["rmse"]))
        best_result = successful_results[0]
        best_model_name = best_result["model_name"]

        # Tag the champion in the comparison table
        for r in comparison_results:
            r["is_selected"] = (r["model_name"] == best_model_name)

        # 4. Refit champion model on ALL historical data (train + test) for forward-looking forecasting
        champion_instance = None
        for m in models:
            if m.name == best_model_name:
                champion_instance = m
                break

        if champion_instance:
            if isinstance(champion_instance, RidgeDemandForecaster):
                champion_instance.fit(y=df["demand"], X=df)
            else:
                champion_instance.fit(y=df["demand"])

        return {
            "champion_model_name": best_model_name,
            "champion_model": champion_instance,
            "best_metrics": {
                "mae": best_result["mae"],
                "rmse": best_result["rmse"],
                "mape": best_result["mape"],
                "smape": best_result["smape"],
            },
            "comparison_table": comparison_results,
            "test_dates": [str(d) for d in test_df["date"].values],
            "test_actuals": [round(float(a), 2) for a in y_test],
            "test_horizon": effective_horizon,
        }


model_evaluator = ModelComparisonEvaluator()
