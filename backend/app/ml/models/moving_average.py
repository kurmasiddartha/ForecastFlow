from typing import Any, Dict, Optional
import numpy as np
import pandas as pd
from app.ml.models.base import BaseForecaster


class MovingAverageForecaster(BaseForecaster):
    """Moving Average forecaster projecting the arithmetic mean of the last W periods."""

    def __init__(self, window: int = 7):
        super().__init__(name=f"Moving Average ({window}-period)")
        self.window = max(1, window)
        self.ma_value: float = 0.0

    def fit(self, y: pd.Series, X: Optional[pd.DataFrame] = None) -> "MovingAverageForecaster":
        y_clean = y.dropna()
        if len(y_clean) == 0:
            self.ma_value = 0.0
        else:
            recent_values = y_clean.iloc[-self.window:]
            self.ma_value = float(recent_values.mean())

        self.is_fitted = True
        return self

    def predict(self, horizon: int, X_future: Optional[pd.DataFrame] = None) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Model must be fitted before predict.")
        val = max(0.0, self.ma_value)
        return np.full(shape=(horizon,), fill_value=val, dtype=float)

    def get_params(self) -> Dict[str, Any]:
        return {"name": self.name, "window": self.window, "ma_value": round(self.ma_value, 3)}
