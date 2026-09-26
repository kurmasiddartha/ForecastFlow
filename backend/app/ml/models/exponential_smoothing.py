from typing import Any, Dict, Optional
import numpy as np
import pandas as pd
from app.ml.models.base import BaseForecaster


class ExponentialSmoothingForecaster(BaseForecaster):
    """Simple Exponential Smoothing (SES) with optional data-driven alpha optimization."""

    def __init__(self, alpha: Optional[float] = None):
        super().__init__(name="Exponential Smoothing")
        self.alpha = alpha
        self.optimal_alpha: float = alpha or 0.3
        self.last_level: float = 0.0

    @staticmethod
    def _compute_ses(series: np.ndarray, alpha: float) -> tuple[np.ndarray, float]:
        """Computes SES sequence and returns smoothed array and sum of squared 1-step errors."""
        n = len(series)
        smoothed = np.zeros(n)
        smoothed[0] = series[0]
        sse = 0.0

        for t in range(1, n):
            # One step ahead prediction is smoothed[t-1]
            error = series[t] - smoothed[t - 1]
            sse += error ** 2
            smoothed[t] = alpha * series[t] + (1 - alpha) * smoothed[t - 1]

        return smoothed, sse

    def fit(self, y: pd.Series, X: Optional[pd.DataFrame] = None) -> "ExponentialSmoothingForecaster":
        y_clean = y.dropna().values.astype(float)
        if len(y_clean) == 0:
            self.last_level = 0.0
            self.is_fitted = True
            return self

        if len(y_clean) == 1:
            self.last_level = float(y_clean[0])
            self.is_fitted = True
            return self

        if self.alpha is not None:
            self.optimal_alpha = max(0.01, min(0.99, self.alpha))
            smoothed, _ = self._compute_ses(y_clean, self.optimal_alpha)
            self.last_level = float(smoothed[-1])
        else:
            # Grid search for optimal alpha minimizing 1-step in-sample SSE
            best_sse = float("inf")
            best_alpha = 0.3
            best_last = float(y_clean[-1])

            for candidate in np.linspace(0.05, 0.95, 19):
                smoothed, sse = self._compute_ses(y_clean, candidate)
                if sse < best_sse:
                    best_sse = sse
                    best_alpha = candidate
                    best_last = float(smoothed[-1])

            self.optimal_alpha = round(float(best_alpha), 2)
            self.last_level = best_last

        self.is_fitted = True
        return self

    def predict(self, horizon: int, X_future: Optional[pd.DataFrame] = None) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Model must be fitted before predict.")
        val = max(0.0, self.last_level)
        return np.full(shape=(horizon,), fill_value=val, dtype=float)

    def get_params(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "alpha": self.optimal_alpha,
            "last_level": round(self.last_level, 3),
        }
