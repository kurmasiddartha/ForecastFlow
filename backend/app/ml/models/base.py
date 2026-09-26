from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd


class BaseForecaster(ABC):
    """Abstract interface for all demand forecasting models."""

    def __init__(self, name: str):
        self.name = name
        self.is_fitted = False

    @abstractmethod
    def fit(self, y: pd.Series, X: Optional[pd.DataFrame] = None) -> "BaseForecaster":
        """Fit the forecasting model on historical demand values y and optional features X."""
        pass

    @abstractmethod
    def predict(self, horizon: int, X_future: Optional[pd.DataFrame] = None) -> np.ndarray:
        """Generate forecasts for the specified forward horizon (clipped to non-negative demand)."""
        pass

    def get_params(self) -> Dict[str, Any]:
        """Return model hyperparameters."""
        return {"name": self.name}
