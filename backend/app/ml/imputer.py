from datetime import datetime
from typing import Optional, Tuple
import pandas as pd


class MissingDateImputer:
    """Reindexes historical series against a continuous calendar grid and imputes zero-demand on non-sales days."""

    @staticmethod
    def reindex_and_impute(
        df: pd.DataFrame,
        freq: str = "D",
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        by_product: bool = True,
    ) -> Tuple[pd.DataFrame, int]:
        """Constructs a continuous date grid for each product and fills missing dates with zero sales."""
        if df.empty:
            return df, 0

        df = df.copy()
        df["date"] = pd.to_datetime(df["date"]).dt.normalize()

        overall_min = start_date.replace(tzinfo=None) if start_date else df["date"].min()
        overall_max = end_date.replace(tzinfo=None) if end_date else df["date"].max()

        if overall_min > overall_max:
            raise ValueError(f"Start date {overall_min} must be <= end date {overall_max}")

        full_calendar = pd.date_range(start=overall_min, end=overall_max, freq=freq, name="date")

        total_imputed_count = 0
        imputed_frames = []

        if by_product and "product_id" in df.columns:
            product_groups = df.groupby("product_id")
            for pid, pgroup in product_groups:
                # Retain product metadata
                p_sku = pgroup["product_sku"].iloc[0] if "product_sku" in pgroup.columns else "UNKNOWN"
                p_name = pgroup["product_name"].iloc[0] if "product_name" in pgroup.columns else "Unknown"

                # Reindex with continuous grid
                grid_df = pd.DataFrame({"date": full_calendar})
                merged = pd.merge(grid_df, pgroup, on="date", how="left")

                imputed_for_product = int(merged["demand"].isna().sum())
                total_imputed_count += imputed_for_product

                # Impute missing sales as zero demand
                merged["product_id"] = pid
                merged["product_sku"] = p_sku
                merged["product_name"] = p_name
                merged["demand"] = merged["demand"].fillna(0.0)
                merged["revenue"] = merged["revenue"].fillna(0.0)
                merged["order_count"] = merged["order_count"].fillna(0).astype(int)

                imputed_frames.append(merged)

            result = pd.concat(imputed_frames, ignore_index=True)
            return result.sort_values(by=["product_id", "date"]).reset_index(drop=True), total_imputed_count
        else:
            grid_df = pd.DataFrame({"date": full_calendar})
            merged = pd.merge(grid_df, df, on="date", how="left")
            imputed_count = int(merged["demand"].isna().sum())

            merged["demand"] = merged["demand"].fillna(0.0)
            merged["revenue"] = merged["revenue"].fillna(0.0)
            merged["order_count"] = merged["order_count"].fillna(0).astype(int)
            return merged.sort_values(by=["date"]).reset_index(drop=True), imputed_count


missing_date_imputer = MissingDateImputer()
