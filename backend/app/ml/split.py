from typing import Optional, Tuple
import pandas as pd


def time_series_train_test_split(
    df: pd.DataFrame,
    test_size: float = 0.2,
    horizon: Optional[int] = None,
    date_col: str = "date",
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Strictly chronological train/test split for time-series forecasting.

    Never shuffles temporal ordering. Guarantees all training observations precede test observations.
    """
    if df.empty:
        return df, df

    df_sorted = df.sort_values(by=date_col).reset_index(drop=True)
    n = len(df_sorted)

    if horizon is not None and horizon > 0:
        split_idx = max(1, n - horizon)
    else:
        split_idx = max(1, int(n * (1.0 - test_size)))

    train_df = df_sorted.iloc[:split_idx].copy().reset_index(drop=True)
    test_df = df_sorted.iloc[split_idx:].copy().reset_index(drop=True)

    # Invariant assertion
    if not train_df.empty and not test_df.empty:
        max_train_date = pd.to_datetime(train_df[date_col]).max()
        min_test_date = pd.to_datetime(test_df[date_col]).min()
        assert max_train_date <= min_test_date, (
            f"Temporal leakage detected: max train date {max_train_date} is after min test date {min_test_date}"
        )

    return train_df, test_df
