import pytest
import uuid
from datetime import datetime, timedelta, timezone
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.ml.metrics import calculate_mae, calculate_rmse, calculate_mape, evaluate_forecast
from app.ml.split import time_series_train_test_split
from app.ml.models.naive import NaiveForecaster
from app.ml.models.moving_average import MovingAverageForecaster
from app.ml.models.exponential_smoothing import ExponentialSmoothingForecaster
from app.ml.models.ridge_regression import RidgeDemandForecaster
from app.ml.evaluator import model_evaluator
from app.services.forecast_service import forecast_service
from app.schemas.forecast import ForecastGenerateRequest


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def auth_headers(client):
    suffix = uuid.uuid4().hex[:6]
    email = f"forecaster_{suffix}@test.com"
    pwd = "StrongPassword123!"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": pwd, "full_name": "Forecast Scientist"},
    )
    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# --------------------------------------------------------------------------
# 1. Unit Tests for Metrics
# --------------------------------------------------------------------------
def test_forecast_evaluation_metrics():
    """Verify MAE, RMSE, MAPE calculations and zero-safe handling."""
    y_true = np.array([10.0, 20.0, 30.0, 0.0])
    y_pred = np.array([12.0, 18.0, 33.0, 2.0])

    mae = calculate_mae(y_true, y_pred)
    assert round(mae, 2) == 2.25  # (|2| + |2| + |3| + |2|) / 4 = 9/4 = 2.25

    rmse = calculate_rmse(y_true, y_pred)
    assert rmse > 0

    metrics = evaluate_forecast(y_true, y_pred)
    assert "mae" in metrics
    assert "rmse" in metrics
    assert "mape" in metrics
    assert "smape" in metrics
    assert not np.isnan(metrics["mape"])


# --------------------------------------------------------------------------
# 2. Time-Aware Split Tests
# --------------------------------------------------------------------------
def test_time_aware_train_test_split():
    """Verify time-series split never shuffles and preserves chronological boundary."""
    dates = pd.date_range("2026-01-01", periods=20, freq="D")
    df = pd.DataFrame({"date": dates, "demand": range(20)})

    train_df, test_df = time_series_train_test_split(df, horizon=5)
    assert len(train_df) == 15
    assert len(test_df) == 5
    assert train_df["date"].max() < test_df["date"].min()


# --------------------------------------------------------------------------
# 3. Model Tests
# --------------------------------------------------------------------------
def test_naive_forecaster():
    """Verify Naive baseline predicts last value and non-negative bounds."""
    y = pd.Series([5.0, 8.0, 12.0])
    model = NaiveForecaster(strategy="last").fit(y)
    preds = model.predict(horizon=3)
    assert len(preds) == 3
    assert np.all(preds == 12.0)


def test_moving_average_forecaster():
    """Verify Moving Average calculates window mean."""
    y = pd.Series([10.0, 20.0, 30.0, 40.0])
    model = MovingAverageForecaster(window=3).fit(y)
    preds = model.predict(horizon=4)
    assert len(preds) == 4
    # mean of last 3: (20 + 30 + 40) / 3 = 30.0
    assert np.all(preds == 30.0)


def test_exponential_smoothing_forecaster():
    """Verify Exponential Smoothing fits and predicts forward."""
    y = pd.Series([10.0, 12.0, 15.0, 14.0, 18.0, 20.0])
    model = ExponentialSmoothingForecaster().fit(y)
    preds = model.predict(horizon=5)
    assert len(preds) == 5
    assert np.all(preds > 0)
    assert model.get_params()["alpha"] > 0


def test_ridge_demand_forecaster():
    """Verify Ridge model fits on features and predicts non-negative demand."""
    dates = pd.date_range("2026-01-01", periods=30, freq="D")
    df = pd.DataFrame({
        "date": dates,
        "day_of_week": dates.dayofweek,
        "is_weekend": dates.dayofweek.isin([5, 6]).astype(int),
        "month": dates.month,
        "lag_1": [0.0] + list(range(29)),
        "lag_7": [0.0] * 7 + list(range(23)),
        "rolling_7_mean": [5.0] * 30,
        "demand": [float(i % 10 + 5) for i in range(30)],
    })

    model = RidgeDemandForecaster(alpha=1.0)
    model.fit(y=df["demand"], X=df)
    preds = model.predict(horizon=7)
    assert len(preds) == 7
    assert np.all(preds >= 0.0)


# --------------------------------------------------------------------------
# 4. Model Evaluation & Comparison Pipeline
# --------------------------------------------------------------------------
def test_model_comparison_evaluator():
    """Verify evaluator ranks models across MAE/RMSE and selects best performer."""
    dates = pd.date_range("2026-01-01", periods=25, freq="D")
    df = pd.DataFrame({
        "date": dates,
        "day_of_week": dates.dayofweek,
        "is_weekend": dates.dayofweek.isin([5, 6]).astype(int),
        "month": dates.month,
        "lag_1": [0.0] + list(range(24)),
        "lag_7": [0.0] * 7 + list(range(18)),
        "rolling_7_mean": [5.0] * 25,
        "demand": [float(10 + (i % 7)) for i in range(25)],
    })

    result = model_evaluator.evaluate_and_compare(df, horizon=5)
    assert "champion_model_name" in result
    assert "best_metrics" in result
    assert "comparison_table" in result

    # Check comparison table contains all 4 models
    model_names = [c["model_name"] for c in result["comparison_table"]]
    assert len(model_names) == 4
    # Ensure exactly one model is tagged as selected
    selected_count = sum(1 for c in result["comparison_table"] if c["is_selected"])
    assert selected_count == 1


# --------------------------------------------------------------------------
# 5. End-to-End Service & API Endpoints
# --------------------------------------------------------------------------
def test_forecast_service_and_api(client, auth_headers):
    """Test full forecast generation, multi-model evaluation, and cache retrieval."""
    unique = uuid.uuid4().hex[:6]

    # Seed product
    cat_res = client.post("/api/v1/categories", headers=auth_headers, json={"name": f"Fc_Cat_{unique}"})
    cat_id = cat_res.json()["id"]

    supp_res = client.post("/api/v1/suppliers", headers=auth_headers, json={"name": f"Fc_Supp_{unique}"})
    supp_id = supp_res.json()["id"]

    prod_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"FC-{unique}",
            "name": f"Forecasted Item {unique}",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "cost_price": 25.0,
            "selling_price": 50.0,
            "current_stock": 1000,
        },
    )
    prod_id = prod_res.json()["id"]

    # Seed sales on 10 distinct days
    base_dt = datetime.now(timezone.utc) - timedelta(days=12)
    for day in range(10):
        sale_dt = (base_dt + timedelta(days=day)).isoformat()
        client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={
                "sale_date": sale_dt,
                "items": [{"product_id": prod_id, "quantity": 10 + (day % 4), "unit_price": 50.0}],
            },
        )

    # 1. Generate Forecast via POST /api/v1/forecasting/generate
    gen_payload = {
        "product_id": prod_id,
        "horizon": 7,
        "model_preference": "auto",
        "save": True,
    }
    gen_res = client.post("/api/v1/forecasting/generate", headers=auth_headers, json=gen_payload)
    assert gen_res.status_code == 200
    forecast_data = gen_res.json()

    assert forecast_data["product_id"] == prod_id
    assert forecast_data["forecast_horizon"] == 7
    assert len(forecast_data["predictions"]) == 7
    assert "model_used" in forecast_data
    assert "evaluation_metrics" in forecast_data
    assert forecast_data["evaluation_metrics"]["mae"] >= 0
    assert len(forecast_data["model_comparison"]) >= 3

    # Check future dates are consecutive
    pred_dates = [p["date"] for p in forecast_data["predictions"]]
    assert len(set(pred_dates)) == 7

    # 2. Retrieve Persisted Forecast without Retraining via GET /api/v1/forecasting/latest/{id}
    latest_res = client.get(f"/api/v1/forecasting/latest/{prod_id}", headers=auth_headers)
    assert latest_res.status_code == 200
    latest_data = latest_res.json()

    assert latest_data is not None
    assert latest_data["product_id"] == prod_id
    assert latest_data["model_used"] == forecast_data["model_used"]
    assert len(latest_data["predictions"]) == 7
    assert latest_data["is_cached"] is True
    assert "historical_data" in latest_data
    assert len(latest_data["historical_data"]) > 0


def test_forecast_caching_and_force_retrain(client, auth_headers):
    """Verifies that repeat forecast requests reuse fresh cache unless force_retrain is True."""
    unique = uuid.uuid4().hex[:6]
    cat_res = client.post("/api/v1/categories", headers=auth_headers, json={"name": f"CacheCat_{unique}"})
    supp_res = client.post("/api/v1/suppliers", headers=auth_headers, json={"name": f"CacheSupp_{unique}"})
    prod_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"CACHE-{unique}",
            "name": f"Cached Product {unique}",
            "category_id": cat_res.json()["id"],
            "supplier_id": supp_res.json()["id"],
            "cost_price": 10.0,
            "selling_price": 20.0,
            "current_stock": 200,
        },
    )
    prod_id = prod_res.json()["id"]

    # Seed 6 days of sales
    base_dt = datetime.now(timezone.utc) - timedelta(days=8)
    for d in range(6):
        client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={
                "sale_date": (base_dt + timedelta(days=d)).isoformat(),
                "items": [{"product_id": prod_id, "quantity": 15, "unit_price": 20.0}],
            },
        )

    # Initial forecast generation (not cached)
    res1 = client.post(
        "/api/v1/forecasting/generate",
        headers=auth_headers,
        json={"product_id": prod_id, "horizon": 7, "force_retrain": False, "save": True},
    )
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["is_cached"] is False

    # Second forecast request should reuse cache
    res2 = client.post(
        "/api/v1/forecasting/generate",
        headers=auth_headers,
        json={"product_id": prod_id, "horizon": 7, "force_retrain": False, "save": True},
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["is_cached"] is True
    assert data2["model_used"] == data1["model_used"]

    # Third request with force_retrain=True must re-run model training
    res3 = client.post(
        "/api/v1/forecasting/generate",
        headers=auth_headers,
        json={"product_id": prod_id, "horizon": 7, "force_retrain": True, "save": True},
    )
    assert res3.status_code == 200
    data3 = res3.json()
    assert data3["is_cached"] is False


def test_insufficient_historical_data_graceful_fallback(client, auth_headers):
    """Verifies that products with sparse or zero sales trigger baseline fallback gracefully."""
    unique = uuid.uuid4().hex[:6]
    cat_res = client.post("/api/v1/categories", headers=auth_headers, json={"name": f"SparseCat_{unique}"})
    supp_res = client.post("/api/v1/suppliers", headers=auth_headers, json={"name": f"SparseSupp_{unique}"})
    prod_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"SPARSE-{unique}",
            "name": f"Sparse Product {unique}",
            "category_id": cat_res.json()["id"],
            "supplier_id": supp_res.json()["id"],
            "cost_price": 10.0,
            "selling_price": 20.0,
            "current_stock": 50,
            "reorder_level": 14,
        },
    )
    prod_id = prod_res.json()["id"]

    # Only 1 day of sales (insufficient for time-series backtest)
    client.post(
        "/api/v1/sales",
        headers=auth_headers,
        json={
            "sale_date": datetime.now(timezone.utc).isoformat(),
            "items": [{"product_id": prod_id, "quantity": 5, "unit_price": 20.0}],
        },
    )

    res = client.post(
        "/api/v1/forecasting/generate",
        headers=auth_headers,
        json={"product_id": prod_id, "horizon": 7, "force_retrain": True, "save": True},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["insufficient_data"] is True
    assert "Baseline" in data["model_used"]
    assert len(data["predictions"]) == 7
    assert data["message"] is not None
    assert "Insufficient" in data["message"]


def test_batch_scheduled_forecasting_pipeline(client, auth_headers):
    """Verifies batch / scheduled forecasting trigger across catalog items."""
    res = client.post(
        "/api/v1/forecasting/batch",
        headers=auth_headers,
        json={"horizon": 7, "force_retrain": False, "max_products": 10},
    )
    assert res.status_code == 200
    data = res.json()
    assert "total_processed" in data
    assert "successful" in data
    assert "failed" in data
    assert "cached_used" in data
    assert "executed_at" in data
    assert isinstance(data["results"], list)


def test_forecasting_products_overview_api(client, auth_headers):
    """Verifies product listing endpoint with forecast status metadata."""
    res = client.get("/api/v1/forecasting/products", headers=auth_headers)
    assert res.status_code == 200
    products = res.json()
    assert isinstance(products, list)
    if products:
        p0 = products[0]
        assert "id" in p0
        assert "name" in p0
        assert "has_forecast" in p0

