import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def auth_headers(client):
    suffix = uuid.uuid4().hex[:6]
    email = f"analytics_{suffix}@test.com"
    pwd = "StrongPassword123!"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": pwd, "full_name": "Analytics Analyst"},
    )
    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_dashboard_analytics_structure_and_metrics(client, auth_headers):
    """Test dashboard analytics returns valid aggregations and data types."""
    unique = uuid.uuid4().hex[:6]

    # 1. Seed category & supplier
    cat_res = client.post(
        "/api/v1/categories",
        headers=auth_headers,
        json={"name": f"AnalyticsCat_{unique}"},
    )
    assert cat_res.status_code == 201
    cat_id = cat_res.json()["id"]

    supp_res = client.post(
        "/api/v1/suppliers",
        headers=auth_headers,
        json={"name": f"AnalyticsSupp_{unique}", "email": "supp@example.com"},
    )
    assert supp_res.status_code == 201
    supp_id = supp_res.json()["id"]

    # 2. Seed fast and slow moving products
    prod_fast_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"FAST-{unique}",
            "name": f"Fast Widget {unique}",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "cost_price": 20.0,
            "selling_price": 40.0,
            "current_stock": 20000,
            "reorder_point": 15,
        },
    )
    assert prod_fast_res.status_code == 201
    fast_id = prod_fast_res.json()["id"]

    prod_slow_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"SLOW-{unique}",
            "name": f"Slow Item {unique}",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "cost_price": 50.0,
            "selling_price": 80.0,
            "current_stock": 25,
            "reorder_point": 30,  # low stock condition: current_stock (25) <= reorder_point (30)
        },
    )
    assert prod_slow_res.status_code == 201
    slow_id = prod_slow_res.json()["id"]

    # 3. Create a sale for the fast item with high volume
    sale_payload = {
        "items": [{"product_id": fast_id, "quantity": 15000, "unit_price": 40.0}],
        "notes": "Analytics Test Sale",
    }
    sale_res = client.post("/api/v1/sales", headers=auth_headers, json=sale_payload)
    assert sale_res.status_code == 201

    # 4. Create a purchase
    purch_payload = {
        "supplier_id": supp_id,
        "status": "received",
        "items": [{"product_id": fast_id, "quantity": 20, "unit_cost": 20.0}],
    }
    purch_res = client.post("/api/v1/purchases", headers=auth_headers, json=purch_payload)
    assert purch_res.status_code == 201

    # 5. Query dashboard analytics endpoint
    res = client.get("/api/v1/analytics/dashboard?timeframe=30d", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()

    # Check top-level keys
    assert "summary" in data
    assert "fast_moving_products" in data
    assert "slow_moving_products" in data
    assert "sales_over_time" in data
    assert "top_selling_products" in data
    assert "category_sales" in data
    assert "inventory_distribution" in data
    assert "stock_movement_trends" in data

    # Check summary values
    summary = data["summary"]
    assert summary["total_products"] >= 2
    assert summary["inventory_value"] > 0
    assert summary["low_stock_count"] >= 1
    assert summary["total_sales_amount"] >= 400.0
    assert summary["total_sales_count"] >= 1
    assert summary["total_purchases_amount"] >= 400.0

    # Check fast moving list contains fast item
    fast_ids = [p["product_id"] for p in data["fast_moving_products"]]
    assert fast_id in fast_ids

    # Check slow moving list contains items with stock
    assert len(data["slow_moving_products"]) > 0

    # Check trends and distribution
    assert len(data["inventory_distribution"]) > 0
    assert len(data["sales_over_time"]) > 0
    assert len(data["stock_movement_trends"]) > 0


def test_dashboard_analytics_timeframe_filtering(client, auth_headers):
    """Test timeframe filtering parameters work as expected."""
    for tf in ["7d", "30d", "90d", "1y", "all"]:
        res = client.get(f"/api/v1/analytics/dashboard?timeframe={tf}", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["timeframe"] == tf


def test_ai_dashboard_unified_endpoint(client, auth_headers):
    """Test the Phase 13 unified AI inventory executive dashboard endpoint."""
    res = client.get("/api/v1/analytics/ai-dashboard?timeframe=30d", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()

    # 1. Inventory overview & Low-Stock Alerts ("What is happening?")
    assert "inventory_overview" in data
    inv = data["inventory_overview"]
    assert "total_products" in inv
    assert "total_stock_units" in inv
    assert "total_inventory_value" in inv
    assert "low_stock_count" in inv
    assert "low_stock_alerts" in data

    # 2. Sales overview & trends ("What is happening?")
    assert "sales_overview" in data
    sales = data["sales_overview"]
    assert "total_revenue" in sales
    assert "total_units_sold" in sales
    assert "sales_trends" in data
    assert "top_fast_moving" in data
    assert "slow_dead_stock_summary" in data

    # 3. Demand Forecast & Stockout Risk ("What will likely happen?")
    assert "forecast_summary" in data
    fc_sum = data["forecast_summary"]
    assert "total_forecasted_units_14d" in fc_sum
    assert "primary_model" in fc_sum
    assert "stockout_risk_products" in data

    # 4. Restock Recommendations ("What should I do?")
    assert "restock_summary" in data
    rec_sum = data["restock_summary"]
    assert "pending_count" in rec_sum
    assert "total_units_needed" in rec_sum
    assert "total_budget_needed" in rec_sum
    assert "top_recommendations" in rec_sum

