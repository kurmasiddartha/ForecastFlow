import uuid
from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def auth_headers(client):
    suffix = uuid.uuid4().hex[:6]
    email = f"intel_{suffix}@test.com"
    pwd = "StrongPassword123!"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": pwd, "full_name": "Intelligence Analyst"},
    )
    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}



def test_inventory_intelligence_classifications_and_rules(client, auth_headers):
    """Verifies fast-moving, slow-moving, dead-stock, stockout-risk, and overstock classifications."""
    unique = uuid.uuid4().hex[:6]
    cat_res = client.post("/api/v1/categories", headers=auth_headers, json={"name": f"IntelCat_{unique}"})
    cat_id = cat_res.json()["id"]

    supp_res = client.post("/api/v1/suppliers", headers=auth_headers, json={"name": f"IntelSupp_{unique}"})
    supp_id = supp_res.json()["id"]

    # 1. Fast-Moving Product: Stock=150, High Velocity
    fast_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"FAST-{unique}",
            "name": f"Fast Product {unique}",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "cost_price": 20.0,
            "selling_price": 40.0,
            "current_stock": 150,
            "reorder_point": 15,
            "target_stock_level": 60,
        },
    )
    fast_id = fast_res.json()["id"]

    # 2. Slow-Moving Product: Stock=100, Very low sales
    slow_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"SLOW-{unique}",
            "name": f"Slow Product {unique}",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "cost_price": 50.0,
            "selling_price": 90.0,
            "current_stock": 100,
            "reorder_point": 10,
            "target_stock_level": 40,
        },
    )
    slow_id = slow_res.json()["id"]

    # 3. Dead-Stock Product: Stock=80, Never sold / No sales in 60+ days
    dead_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"DEAD-{unique}",
            "name": f"Dead Stock Item {unique}",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "cost_price": 30.0,
            "selling_price": 60.0,
            "current_stock": 80,
            "reorder_point": 10,
            "target_stock_level": 30,
        },
    )
    dead_id = dead_res.json()["id"]

    # 4. Critical Stockout Risk Product: Stock=22 (will reduce to 2), Active Sales
    stockout_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"SOUT-{unique}",
            "name": f"Stockout Risk Item {unique}",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "cost_price": 10.0,
            "selling_price": 25.0,
            "current_stock": 22,
            "reorder_point": 20,
            "target_stock_level": 50,
        },
    )
    stockout_id = stockout_res.json()["id"]

    # 5. Overstocked Product: Stock=500 (target=30), Low sales
    over_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"OVER-{unique}",
            "name": f"Overstocked Item {unique}",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "cost_price": 15.0,
            "selling_price": 30.0,
            "current_stock": 500,
            "reorder_point": 10,
            "target_stock_level": 30,
        },
    )
    over_id = over_res.json()["id"]

    # Seed Sales:
    now = datetime.now(timezone.utc)

    # Fast: 90 units over last 15 days (~3.0 units/day in 30-day window)
    for i in range(15):
        s_date = (now - timedelta(days=i)).isoformat()
        client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={"sale_date": s_date, "items": [{"product_id": fast_id, "quantity": 6, "unit_price": 40.0}]},
        )

    # Slow: 3 units 5 days ago (0.1 units/day in 30-day window)
    client.post(
        "/api/v1/sales",
        headers=auth_headers,
        json={
            "sale_date": (now - timedelta(days=5)).isoformat(),
            "items": [{"product_id": slow_id, "quantity": 3, "unit_price": 90.0}],
        },
    )

    # Stockout risk item: 20 units over last 4 days (high demand vs stock=2)
    for i in range(4):
        s_date = (now - timedelta(days=i)).isoformat()
        client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={"sale_date": s_date, "items": [{"product_id": stockout_id, "quantity": 5, "unit_price": 25.0}]},
        )

    # Overstocked: 2 units 10 days ago (0.06 units/day -> runway = 500 / 0.06 ~ 8000 days!)
    client.post(
        "/api/v1/sales",
        headers=auth_headers,
        json={
            "sale_date": (now - timedelta(days=10)).isoformat(),
            "items": [{"product_id": over_id, "quantity": 2, "unit_price": 30.0}],
        },
    )

    # Verify Summary Endpoint: GET /api/v1/intelligence/summary
    sum_res = client.get("/api/v1/intelligence/summary", headers=auth_headers)
    assert sum_res.status_code == 200
    summary = sum_res.json()

    assert summary["total_products_analyzed"] >= 5
    assert summary["dead_stock_count"] >= 1
    assert summary["dead_stock_capital_tied_up"] >= 2400.0  # 80 * 30.0
    assert summary["stockout_risk_count"] >= 1
    assert summary["overstock_risk_count"] >= 1
    assert summary["fast_moving_count"] >= 1

    # Verify Product Listing: GET /api/v1/intelligence/products
    list_res = client.get(f"/api/v1/intelligence/products?search={unique}", headers=auth_headers)
    assert list_res.status_code == 200
    p_data = list_res.json()
    assert p_data["total_count"] == 5

    items_by_id = {item["product_id"]: item for item in p_data["products"]}

    # Fast item check
    fast_item = items_by_id[fast_id]
    assert fast_item["velocity_category"] == "FAST_MOVING"
    assert fast_item["daily_sales_velocity"] >= 2.0

    # Slow item check
    slow_item = items_by_id[slow_id]
    assert slow_item["velocity_category"] == "SLOW_MOVING"

    # Dead stock check
    dead_item = items_by_id[dead_id]
    assert dead_item["velocity_category"] == "DEAD_STOCK"
    assert dead_item["is_dead_stock"] is True
    assert dead_item["dead_stock_capital"] == 2400.0

    # Stockout risk check
    stockout_item = items_by_id[stockout_id]
    assert stockout_item["stockout_risk"] in ("CRITICAL", "HIGH")
    assert stockout_item["days_of_inventory_remaining"] is not None
    assert stockout_item["days_of_inventory_remaining"] <= 7.0

    # Overstock check
    over_item = items_by_id[over_id]
    assert over_item["overstock_risk"] in ("HIGH", "MEDIUM")
    assert over_item["excess_units"] >= 400


def test_intelligence_specialized_endpoints(client, auth_headers):
    """Verifies specialized filter endpoints for fast, slow, dead stock, and risk categories."""
    # Fast Moving
    fast_res = client.get("/api/v1/intelligence/fast-moving?limit=5", headers=auth_headers)
    assert fast_res.status_code == 200
    assert isinstance(fast_res.json(), list)

    # Slow Moving
    slow_res = client.get("/api/v1/intelligence/slow-moving?limit=5", headers=auth_headers)
    assert slow_res.status_code == 200
    assert isinstance(slow_res.json(), list)

    # Dead Stock
    dead_res = client.get("/api/v1/intelligence/dead-stock?limit=5", headers=auth_headers)
    assert dead_res.status_code == 200
    assert isinstance(dead_res.json(), list)

    # Stockout Risk
    so_res = client.get("/api/v1/intelligence/stockout-risk?limit=5", headers=auth_headers)
    assert so_res.status_code == 200
    assert isinstance(so_res.json(), list)

    # Overstock Risk
    over_res = client.get("/api/v1/intelligence/overstock-risk?limit=5", headers=auth_headers)
    assert over_res.status_code == 200
    assert isinstance(over_res.json(), list)


def test_configurable_thresholds_and_simulation(client, auth_headers):
    """Verifies that thresholds are fully configurable via query params and simulation POST."""
    # Custom query params
    res = client.get(
        "/api/v1/intelligence/summary?fast_moving_daily_velocity=10.0&dead_stock_days=14",
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["config"]["fast_moving_daily_velocity"] == 10.0
    assert data["config"]["dead_stock_days"] == 14

    # Simulation POST
    sim_res = client.post(
        "/api/v1/intelligence/simulate",
        headers=auth_headers,
        json={
            "analysis_window_days": 14,
            "dead_stock_days": 30,
            "fast_moving_daily_velocity": 5.0,
            "slow_moving_daily_velocity": 1.0,
            "stockout_risk_days": 10.0,
            "overstock_days": 60.0,
        },
    )
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["config"]["analysis_window_days"] == 14
    assert sim_data["config"]["stockout_risk_days"] == 10.0
