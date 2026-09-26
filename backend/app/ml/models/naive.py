from typing import Any, Dict, Literal, Optional
import numpy as np
import pandas as pd
from app.ml.models.base import BaseForecaster


class NaiveForecaster(BaseForecaster):
    """Simple baseline forecasting model predicting the last observed value or historical mean."""

    def __init__(self, strategy: Literal["last", "mean"] = "last"):
        super().__init__(name=f"Baseline ({strategy.capitalize()})")
        self.strategy = strategy
        self.baseline_value: float = 0.0

    def fit(self, y: pd.Series, X: Optional[pd.DataFrame] = None) -> "NaiveForecaster":
        y_clean = y.dropna()
        if len(y_clean) == 0:
            self.baseline_value = 0.0
        elif self.strategy == "mean":
            self.baseline_value = float(y_clean.mean())
        else:
            self.baseline_value = float(y_clean.iloc[-1])

        self.is_fitted = True
        return self

    def predict(self, horizon: int, X_future: Optional[pd.DataFrame] = None) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Model must be fitted before predict.")
        val = max(0.0, self.baseline_value)
        return np.full(shape=(horizon,), fill_value=val, dtype=float)

    def get_params(self) -> Dict[str, Any]:
        return {"name": self.name, "strategy": self.strategy, "value": self.baseline_value}
