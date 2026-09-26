from typing import Dict, Union
import numpy as np
import pandas as pd


def calculate_mae(y_true: Union[np.ndarray, pd.Series], y_pred: Union[np.ndarray, pd.Series]) -> float:
    """Calculates Mean Absolute Error."""
    y_true_arr = np.asarray(y_true, dtype=float)
    y_pred_arr = np.asarray(y_pred, dtype=float)
    if len(y_true_arr) == 0:
        return 0.0
    return float(np.mean(np.abs(y_true_arr - y_pred_arr)))


def calculate_rmse(y_true: Union[np.ndarray, pd.Series], y_pred: Union[np.ndarray, pd.Series]) -> float:
    """Calculates Root Mean Squared Error."""
    y_true_arr = np.asarray(y_true, dtype=float)
    y_pred_arr = np.asarray(y_pred, dtype=float)
    if len(y_true_arr) == 0:
        return 0.0
    return float(np.sqrt(np.mean((y_true_arr - y_pred_arr) ** 2)))


def calculate_mape(
    y_true: Union[np.ndarray, pd.Series],
    y_pred: Union[np.ndarray, pd.Series],
    epsilon: float = 1.0,
) -> float:
    """Calculates Mean Absolute Percentage Error.

    Zero-Handling: In retail demand forecasting, zero-demand days (y_true == 0) cause division by zero.
    We apply a smoothing epsilon denominator (max(y, epsilon)) or compute over non-zero demand points.
    """
    y_true_arr = np.asarray(y_true, dtype=float)
    y_pred_arr = np.asarray(y_pred, dtype=float)
    if len(y_true_arr) == 0:
        return 0.0

    # Non-zero mask for standard percentage error
    non_zero_mask = y_true_arr > 0
    if np.any(non_zero_mask):
        pe = np.abs((y_true_arr[non_zero_mask] - y_pred_arr[non_zero_mask]) / y_true_arr[non_zero_mask])
        return float(np.mean(pe) * 100.0)
    else:
        # If all true values are zero, percentage error relative to baseline epsilon
        pe = np.abs(y_true_arr - y_pred_arr) / np.maximum(y_true_arr, epsilon)
        return float(np.mean(pe) * 100.0)


def calculate_smape(y_true: Union[np.ndarray, pd.Series], y_pred: Union[np.ndarray, pd.Series]) -> float:
    """Calculates Symmetric Mean Absolute Percentage Error (bounded between 0% and 200%)."""
    y_true_arr = np.asarray(y_true, dtype=float)
    y_pred_arr = np.asarray(y_pred, dtype=float)
    if len(y_true_arr) == 0:
        return 0.0
    denom = (np.abs(y_true_arr) + np.abs(y_pred_arr)) / 2.0
    # Avoid zero division when both true and pred are 0
    valid = denom > 0
    if not np.any(valid):
        return 0.0
    smape_vals = np.abs(y_true_arr[valid] - y_pred_arr[valid]) / denom[valid]
    return float(np.mean(smape_vals) * 100.0)


def evaluate_forecast(
    y_true: Union[np.ndarray, pd.Series],
    y_pred: Union[np.ndarray, pd.Series],
) -> Dict[str, float]:
    """Calculates standard time-series evaluation metrics."""
    return {
        "mae": round(calculate_mae(y_true, y_pred), 3),
        "rmse": round(calculate_rmse(y_true, y_pred), 3),
        "mape": round(calculate_mape(y_true, y_pred), 2),
        "smape": round(calculate_smape(y_true, y_pred), 2),
    }
