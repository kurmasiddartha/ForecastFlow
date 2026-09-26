from typing import Any, Dict, List, Union
import numpy as np
import pandas as pd


class TimeSeriesDataCleaner:
    """Validates, sanitizes, and cleans raw historical transaction data."""

    REQUIRED_COLUMNS = ["sale_date", "product_id", "quantity"]

    @classmethod
    def clean(cls, data: Union[List[Dict[str, Any]], pd.DataFrame]) -> pd.DataFrame:
        """Converts raw transaction dictionaries or DataFrame into a sanitized time-series DataFrame."""
        if isinstance(data, list):
            if not data:
                return pd.DataFrame(columns=[
                    "sale_date", "product_id", "product_sku", "product_name",
                    "quantity", "unit_price", "total_price"
                ])
            df = pd.DataFrame(data)
        else:
            df = data.copy()

        # Check required columns
        for col in cls.REQUIRED_COLUMNS:
            if col not in df.columns:
                raise ValueError(f"Missing required time-series column: '{col}'")

        # 1. Parse dates and strip timezone for consistent calendar alignment
        df["sale_date"] = pd.to_datetime(df["sale_date"], errors="coerce")
        if df["sale_date"].dt.tz is not None:
            df["sale_date"] = df["sale_date"].dt.tz_convert(None)

        # 2. Drop rows with null dates, null product IDs, or null quantities
        df = df.dropna(subset=["sale_date", "product_id", "quantity"]).copy()

        # 3. Filter valid commercial records (positive quantity and non-negative amounts)
        df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")
        df = df[df["quantity"] > 0]

        if "total_price" in df.columns:
            df["total_price"] = pd.to_numeric(df["total_price"], errors="coerce").fillna(0.0)
            df = df[df["total_price"] >= 0]
        else:
            df["total_price"] = 0.0

        if "unit_price" in df.columns:
            df["unit_price"] = pd.to_numeric(df["unit_price"], errors="coerce").fillna(0.0)
        else:
            df["unit_price"] = 0.0

        # 4. Standardize types
        df["product_id"] = df["product_id"].astype(str)
        if "product_sku" in df.columns:
            df["product_sku"] = df["product_sku"].fillna("UNKNOWN").astype(str)
        if "product_name" in df.columns:
            df["product_name"] = df["product_name"].fillna("Unknown Product").astype(str)

        # 5. Extract normalized date column (without time)
        df["date"] = df["sale_date"].dt.normalize()

        return df.sort_values(by=["product_id", "date"]).reset_index(drop=True)


data_cleaner = TimeSeriesDataCleaner()
