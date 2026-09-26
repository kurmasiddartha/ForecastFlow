import pytest
import uuid
from datetime import datetime, timedelta, timezone
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.ml.cleaner import data_cleaner
from app.ml.aggregator import demand_aggregator
from app.ml.imputer import missing_date_imputer
from app.ml.features import feature_engineer
from app.ml.pipeline import demand_pipeline


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def auth_headers(client):
    suffix = uuid.uuid4().hex[:6]
    email = f"ml_analyst_{suffix}@test.com"
    pwd = "StrongPassword123!"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": pwd, "full_name": "ML Engineer"},
    )
    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_data_cleaning():
    """Verify raw dirty records are sanitized, non-positives dropped, and types coerced."""
    raw = [
        {"sale_date": "2026-03-01T10:00:00Z", "product_id": "prod_1", "quantity": 5, "total_price": 50.0},
        {"sale_date": "2026-03-01T14:30:00Z", "product_id": "prod_1", "quantity": -2, "total_price": -20.0},  # invalid
        {"sale_date": None, "product_id": "prod_1", "quantity": 10, "total_price": 100.0},  # null date
        {"sale_date": "2026-03-02T11:00:00Z", "product_id": "prod_1", "quantity": 0, "total_price": 0.0},  # zero qty
        {"sale_date": "2026-03-03T09:15:00Z", "product_id": "prod_1", "quantity": 8, "total_price": 80.0},
    ]

    cleaned = data_cleaner.clean(raw)
    assert len(cleaned) == 2  # Only 2 valid records (5 and 8)
    assert list(cleaned["quantity"]) == [5, 8]
    assert "date" in cleaned.columns


def test_demand_aggregation():
    """Verify multiple sales transactions on same date are aggregated per product."""
    raw = [
        {"sale_date": "2026-03-01T10:00:00", "product_id": "p1", "quantity": 3, "total_price": 30.0},
        {"sale_date": "2026-03-01T15:00:00", "product_id": "p1", "quantity": 7, "total_price": 70.0},
        {"sale_date": "2026-03-02T10:00:00", "product_id": "p1", "quantity": 4, "total_price": 40.0},
    ]
    cleaned = data_cleaner.clean(raw)
    daily = demand_aggregator.aggregate_by_period(cleaned, freq="D", by_product=True)

    assert len(daily) == 2
    assert daily.iloc[0]["demand"] == 10.0
    assert daily.iloc[0]["revenue"] == 100.0
    assert daily.iloc[0]["order_count"] == 2
    assert daily.iloc[1]["demand"] == 4.0


def test_missing_date_imputation():
    """Verify non-consecutive dates are expanded to a continuous calendar with 0 demand."""
    daily_df = pd.DataFrame([
        {"date": "2026-03-01", "product_id": "p1", "demand": 10.0, "revenue": 100.0, "order_count": 2},
        {"date": "2026-03-05", "product_id": "p1", "demand": 5.0, "revenue": 50.0, "order_count": 1},
    ])

    imputed, missing_count = missing_date_imputer.reindex_and_impute(
        daily_df,
        freq="D",
        by_product=True,
    )

    # From 2026-03-01 to 2026-03-05 is 5 calendar days
    assert len(imputed) == 5
    assert missing_count == 3  # Mar 2, 3, 4 were missing
    # Missing days should have 0 demand
    mar_2 = imputed[imputed["date"] == "2026-03-02"].iloc[0]
    assert mar_2["demand"] == 0.0
    assert mar_2["revenue"] == 0.0


def test_feature_engineering_and_no_data_leakage():
    """Verify calendar, lag, and rolling features are created without future data leakage."""
    # Create 15 days of test demand
    dates = pd.date_range("2026-01-01", periods=15, freq="D")
    df = pd.DataFrame({
        "date": dates,
        "product_id": "test_p",
        "demand": [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0, 100.0, 110.0, 120.0, 130.0, 140.0, 150.0],
    })

    feats = feature_engineer.generate_features(df, by_product=True)

    # 1. Calendar features present
    for col in ["day", "day_of_week", "is_weekend", "week_of_year", "month", "quarter", "year"]:
        assert col in feats.columns

    # 2. Lag features strictly shifted
    assert pd.isna(feats.iloc[0]["lag_1"])
    assert feats.iloc[1]["lag_1"] == 10.0
    assert feats.iloc[2]["lag_1"] == 20.0
    assert feats.iloc[7]["lag_7"] == 10.0

    # 3. Rolling window strictly excludes current day demand (No Leakage)
    # On day 0 (index 0): rolling_7_mean must be NaN (no past history)
    assert pd.isna(feats.iloc[0]["rolling_7_mean"])
    # On day 1 (index 1): rolling_7_mean must equal demand of day 0 (10.0), NOT mean(10, 20)=15!
    assert feats.iloc[1]["rolling_7_mean"] == 10.0
    # On day 2 (index 2): rolling_7_mean must equal mean(10, 20) = 15.0, NOT mean(10, 20, 30)=20!
    assert feats.iloc[2]["rolling_7_mean"] == 15.0

    # 4. Leakage validator assertion
    assert feature_engineer.verify_no_data_leakage(feats) is True


def test_forecasting_pipeline_api_endpoint(client, auth_headers):
    """Test full pipeline execution via GET /api/v1/forecasting/dataset."""
    unique = uuid.uuid4().hex[:6]

    # Seed category & product
    cat_res = client.post("/api/v1/categories", headers=auth_headers, json={"name": f"ML_Cat_{unique}"})
    cat_id = cat_res.json()["id"]

    supp_res = client.post("/api/v1/suppliers", headers=auth_headers, json={"name": f"ML_Supp_{unique}"})
    supp_id = supp_res.json()["id"]

    prod_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"ML-{unique}",
            "name": f"ML Test Item {unique}",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "cost_price": 15.0,
            "selling_price": 30.0,
            "current_stock": 200,
        },
    )
    prod_id = prod_res.json()["id"]

    # Seed sales on 2 distinct dates
    base_dt = datetime.now(timezone.utc) - timedelta(days=5)
    for i in [0, 3]:
        dt_str = (base_dt + timedelta(days=i)).isoformat()
        client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={
                "sale_date": dt_str,
                "items": [{"product_id": prod_id, "quantity": 5 + i, "unit_price": 30.0}],
            },
        )

    # Call endpoint for this product
    res = client.get(f"/api/v1/forecasting/dataset?product_id={prod_id}&freq=D", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()

    assert "validation" in data
    assert "records" in data
    assert data["total_records"] >= 4  # Continuous date range spanning day 0 to day 3
    assert data["validation"]["leakage_check_passed"] is True
    assert data["validation"]["has_nulls_in_target"] is False
    assert data["validation"]["missing_dates_imputed"] >= 1

    # Verify record features
    first_record = data["records"][0]
    assert "demand" in first_record
    assert "day_of_week" in first_record
    assert "rolling_7_mean" in first_record
