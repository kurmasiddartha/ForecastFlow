from typing import Literal, Optional
import pandas as pd


class DemandAggregator:
    """Aggregates granular sales line items into regular periodic time-series (daily or weekly)."""

    @staticmethod
    def aggregate_by_period(
        df: pd.DataFrame,
        freq: Literal["D", "W"] = "D",
        by_product: bool = True,
    ) -> pd.DataFrame:
        """Aggregates transactions by date and optionally by product_id."""
        if df.empty:
            return pd.DataFrame(columns=[
                "date", "product_id", "product_sku", "product_name", "demand", "revenue", "order_count"
            ])

        # Ensure date column is datetime
        df = df.copy()
        if "date" not in df.columns:
            df["date"] = pd.to_datetime(df["sale_date"]).dt.normalize()

        group_cols = ["product_id"] if by_product else []

        # If grouping by week, align date to beginning of week (Monday)
        if freq == "W":
            df["period_date"] = df["date"].dt.to_period("W-SUN").dt.start_time
        else:
            df["period_date"] = df["date"]

        agg_dict = {
            "quantity": "sum",
            "total_price": "sum",
            "sale_date": "count",  # represents order / transaction count
        }

        if by_product:
            if "product_sku" in df.columns:
                agg_dict["product_sku"] = "first"
            if "product_name" in df.columns:
                agg_dict["product_name"] = "first"

        grouped = df.groupby(group_cols + ["period_date"], as_index=False).agg(agg_dict)

        # Rename to standardized time-series schema
        rename_map = {
            "period_date": "date",
            "quantity": "demand",
            "total_price": "revenue",
            "sale_date": "order_count",
        }
        grouped = grouped.rename(columns=rename_map)

        # Round monetary figures
        grouped["revenue"] = grouped["revenue"].round(2)
        grouped["demand"] = grouped["demand"].astype(float)

        sort_cols = group_cols + ["date"]
        return grouped.sort_values(by=sort_cols).reset_index(drop=True)


demand_aggregator = DemandAggregator()
