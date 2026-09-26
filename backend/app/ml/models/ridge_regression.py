from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from app.ml.models.base import BaseForecaster


class RidgeDemandForecaster(BaseForecaster):
    """Supervised L2-regularized linear model capturing seasonality and lag dynamics."""

    FEATURE_COLUMNS = [
        "day_of_week",
        "is_weekend",
        "month",
        "lag_1",
        "lag_7",
        "rolling_7_mean",
    ]

    def __init__(self, alpha: float = 1.0):
        super().__init__(name="Ridge Regression (Lag + Seasonal)")
        self.alpha = alpha
        self.model = Ridge(alpha=alpha)
        self.fitted_features: List[str] = []
        self.last_known_row: Optional[pd.Series] = None

    def fit(self, y: pd.Series, X: Optional[pd.DataFrame] = None) -> "RidgeDemandForecaster":
        if X is None or X.empty:
            raise ValueError("RidgeDemandForecaster requires feature matrix X.")

        # Identify available feature columns
        self.fitted_features = [col for col in self.FEATURE_COLUMNS if col in X.columns]
        if not self.fitted_features:
            raise ValueError("None of the required lag or seasonal feature columns were found in X.")

        # Align X and y, dropping initial rows where lags/rolling stats are NaN
        combined = X[self.fitted_features].copy()
        combined["target"] = y.values

        clean_combined = combined.dropna().reset_index(drop=True)
        if len(clean_combined) < 3:
            # Fallback if too few non-null lag rows
            clean_combined = combined.fillna(0.0).reset_index(drop=True)

        X_train = clean_combined[self.fitted_features].values
        y_train = clean_combined["target"].values

        self.model.fit(X_train, y_train)
        self.last_known_row = X.iloc[-1].copy() if not X.empty else None
        self.is_fitted = True
        return self

    def predict(self, horizon: int, X_future: Optional[pd.DataFrame] = None) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Model must be fitted before predict.")

        if X_future is not None and not X_future.empty and len(X_future) >= horizon:
            # Direct prediction using provided feature rows
            X_eval = X_future[self.fitted_features].head(horizon).fillna(0.0).values
            preds = self.model.predict(X_eval)
            return np.maximum(0.0, np.round(preds, 2))

        # Autoregressive recursive projection if future features not explicitly given
        predictions = []
        curr_lags = self.last_known_row.copy() if self.last_known_row is not None else pd.Series(0.0, index=self.fitted_features)

        # Baseline rolling buffer
        recent_demands = [float(curr_lags.get("lag_1", 0.0))]

        for step in range(horizon):
            row_vals = np.array([float(curr_lags.get(f, 0.0)) for f in self.fitted_features]).reshape(1, -1)
            y_hat = float(max(0.0, self.model.predict(row_vals)[0]))
            predictions.append(round(y_hat, 2))

            # Update lag vector for next recursive step
            recent_demands.append(y_hat)
            if "lag_1" in curr_lags:
                curr_lags["lag_1"] = y_hat
            if "rolling_7_mean" in curr_lags:
                curr_lags["rolling_7_mean"] = float(np.mean(recent_demands[-7:]))
            if "day_of_week" in curr_lags:
                curr_lags["day_of_week"] = (int(curr_lags["day_of_week"]) + 1) % 7
                if "is_weekend" in curr_lags:
                    curr_lags["is_weekend"] = 1 if curr_lags["day_of_week"] in [5, 6] else 0

        return np.array(predictions, dtype=float)

    def get_params(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "alpha": self.alpha,
            "features_used": self.fitted_features,
        }
