from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Tuple
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.ml.extractor import sales_extractor
from app.ml.cleaner import data_cleaner
from app.ml.aggregator import demand_aggregator
from app.ml.imputer import missing_date_imputer
from app.ml.features import feature_engineer
from app.ml.schemas import DatasetValidationSummary, FeatureEngineeredRecord


class DemandForecastingPipeline:
    """Reproducible end-to-end time-series preprocessing and feature engineering pipeline."""

    @classmethod
    async def run(
        cls,
        db: AsyncIOMotorDatabase,
        product_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        freq: Literal["D", "W"] = "D",
    ) -> Tuple[pd.DataFrame, DatasetValidationSummary]:
        """Executes extraction, sanitization, aggregation, imputation, and feature engineering."""
        # 1. Extraction from MongoDB
        raw_records = await sales_extractor.extract_sales_records(
            db=db,
            product_id=product_id,
            start_date=start_date,
            end_date=end_date,
        )

        # 2. Cleaning and sanitization
        clean_df = data_cleaner.clean(raw_records)

        # 3. Period aggregation (daily / weekly demand per product)
        agg_df = demand_aggregator.aggregate_by_period(
            df=clean_df,
            freq=freq,
            by_product=True,
        )

        # 4. Continuous calendar reindexing and missing date zero-imputation
        imputed_df, missing_filled_count = missing_date_imputer.reindex_and_impute(
            df=agg_df,
            freq=freq,
            start_date=start_date,
            end_date=end_date,
            by_product=True,
        )

        # 5. Non-leaking Feature Engineering
        features_df = feature_engineer.generate_features(
            df=imputed_df,
            by_product=True,
        )

        # 6. Data Validation and Quality Auditing
        validation = cls.validate_dataset(features_df, missing_filled_count)

        return features_df, validation

    @classmethod
    def validate_dataset(
        cls,
        df: pd.DataFrame,
        missing_imputed_count: int = 0,
    ) -> DatasetValidationSummary:
        """Audits data quality, absence of nulls in target, and lack of temporal data leakage."""
        if df.empty:
            return DatasetValidationSummary(
                total_records=0,
                product_count=0,
                date_range_start="",
                date_range_end="",
                days_span=0,
                missing_dates_imputed=missing_imputed_count,
                leakage_check_passed=True,
                has_nulls_in_target=False,
                target_summary={"mean": 0.0, "min": 0.0, "max": 0.0, "std": 0.0},
            )

        # Validation checks
        has_nulls_in_target = bool(df["demand"].isna().any())
        leakage_passed = feature_engineer.verify_no_data_leakage(df)

        min_date_str = pd.to_datetime(df["date"]).min().strftime("%Y-%m-%d")
        max_date_str = pd.to_datetime(df["date"]).max().strftime("%Y-%m-%d")
        days_span = (pd.to_datetime(max_date_str) - pd.to_datetime(min_date_str)).days + 1
        products_covered = df["product_id"].unique().tolist() if "product_id" in df.columns else []

        demand_series = df["demand"].astype(float)
        summary_stats = {
            "mean": round(float(demand_series.mean()), 3),
            "std": round(float(demand_series.std()), 3) if len(demand_series) > 1 else 0.0,
            "min": round(float(demand_series.min()), 3),
            "max": round(float(demand_series.max()), 3),
            "zero_demand_days": int((demand_series == 0).sum()),
        }

        return DatasetValidationSummary(
            total_records=len(df),
            product_count=len(products_covered),
            date_range_start=min_date_str,
            date_range_end=max_date_str,
            days_span=days_span,
            missing_dates_imputed=missing_imputed_count,
            leakage_check_passed=leakage_passed,
            has_nulls_in_target=has_nulls_in_target,
            target_summary=summary_stats,
        )


demand_pipeline = DemandForecastingPipeline()
