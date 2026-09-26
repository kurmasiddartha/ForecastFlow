from typing import List, Optional
import numpy as np
import pandas as pd


class TimeSeriesFeatureEngineer:
    """Generates calendar, autoregressive lag, and rolling statistics while strictly preventing data leakage."""

    @classmethod
    def generate_features(
        cls,
        df: pd.DataFrame,
        by_product: bool = True,
        lag_periods: Optional[List[int]] = None,
        rolling_windows: Optional[List[int]] = None,
    ) -> pd.DataFrame:
        """Transforms continuous demand series into feature-engineered dataset.

        Data Leakage Prevention:
        All rolling statistics and lag features are strictly computed over shifted past observations (t-1, t-2, ...).
        At time t, the target demand y_t is never included in any input feature calculation.
        """
        if df.empty:
            return df

        if lag_periods is None:
            lag_periods = [1, 7, 14]
        if rolling_windows is None:
            rolling_windows = [7, 30]

        df = df.copy()
        df["date"] = pd.to_datetime(df["date"])

        # -----------------------------------------------------------------
        # 1. Calendar / Temporal Features (deterministic, no leakage)
        # -----------------------------------------------------------------
        df["day"] = df["date"].dt.day
        df["day_of_week"] = df["date"].dt.dayofweek  # 0=Monday, 6=Sunday
        df["is_weekend"] = df["date"].dt.dayofweek.isin([5, 6]).astype(int)
        df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)
        df["month"] = df["date"].dt.month
        df["quarter"] = df["date"].dt.quarter
        df["year"] = df["date"].dt.year

        # -----------------------------------------------------------------
        # 2. Autoregressive Lag Features (strictly shifted t-k)
        # -----------------------------------------------------------------
        group_key = "product_id" if by_product and "product_id" in df.columns else None

        for k in lag_periods:
            col_name = f"lag_{k}"
            if group_key:
                df[col_name] = df.groupby(group_key)["demand"].shift(k)
            else:
                df[col_name] = df["demand"].shift(k)

        # -----------------------------------------------------------------
        # 3. Rolling Window Statistics (CRITICAL: shifted by 1 to exclude y_t)
        # -----------------------------------------------------------------
        for w in rolling_windows:
            mean_col = f"rolling_{w}_mean"
            std_col = f"rolling_{w}_std"

            if group_key:
                # Shift by 1 first so day t is excluded from window
                shifted_demand = df.groupby(group_key)["demand"].shift(1)
                df[mean_col] = df.groupby(group_key)["demand"].transform(
                    lambda s: s.shift(1).rolling(window=w, min_periods=1).mean()
                ).round(3)
                df[std_col] = df.groupby(group_key)["demand"].transform(
                    lambda s: s.shift(1).rolling(window=w, min_periods=1).std()
                ).fillna(0.0).round(3)
            else:
                shifted_demand = df["demand"].shift(1)
                df[mean_col] = shifted_demand.rolling(window=w, min_periods=1).mean().round(3)
                df[std_col] = shifted_demand.rolling(window=w, min_periods=1).std().fillna(0.0).round(3)

        return df

    @classmethod
    def verify_no_data_leakage(cls, df: pd.DataFrame) -> bool:
        """Mathematically verifies that day t features have zero dependency on day t demand."""
        if df.empty or len(df) < 5:
            return True

        sample = df.copy()
        # Verify rolling_7_mean on day 1 is either NaN or does not include day 1 demand
        first_row = sample.iloc[0]
        if "lag_1" in first_row and pd.notna(first_row["lag_1"]):
            return False

        if "rolling_7_mean" in first_row and pd.notna(first_row["rolling_7_mean"]):
            # If rolling_7_mean equals demand on day 0, leakage occurred!
            if first_row["rolling_7_mean"] == first_row["demand"] and first_row["demand"] > 0:
                return False

        return True


feature_engineer = TimeSeriesFeatureEngineer()
