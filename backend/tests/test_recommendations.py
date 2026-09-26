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
    email = f"rec_{suffix}@test.com"
    pwd = "StrongPassword123!"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": pwd, "full_name": "Procurement Manager"},
    )
    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_recommendation_formula_and_priority_rules(client, auth_headers):
    """Verifies transparent formula: (Forecast + Safety Stock) - (Current + Incoming) >= 0 and priority rules."""
    unique = uuid.uuid4().hex[:6]
    cat_res = client.post("/api/v1/categories", headers=auth_headers, json={"name": f"RecCat_{unique}"})
    cat_id = cat_res.json()["id"]

    supp_res = client.post(
        "/api/v1/suppliers",
        headers=auth_headers,
        json={"name": f"RecSupp_{unique}", "lead_time_days": 7},
    )
    supp_id = supp_res.json()["id"]

    # Product 1: Critical Stockout (Stock=0, Incoming=0, Sales active)
    p1_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"REC-CRIT-{unique}",
            "name": f"Critical Item {unique}",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "cost_price": 25.0,
            "selling_price": 50.0,
            "current_stock": 20,  # will sell 20 to hit 0
            "reorder_point": 15,
            "safety_stock": 10,
        },
    )
    p1_id = p1_res.json()["id"]

    # Sell all 20 units so stock becomes 0
    client.post(
        "/api/v1/sales",
        headers=auth_headers,
        json={"sale_date": datetime.now(timezone.utc).isoformat(), "items": [{"product_id": p1_id, "quantity": 20, "unit_price": 50.0}]},
    )

    # Product 2: High Urgency (Stock=8 <= reorder_point 15, incoming=0)
    p2_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"REC-HIGH-{unique}",
            "name": f"High Priority Item {unique}",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "cost_price": 10.0,
            "selling_price": 25.0,
            "current_stock": 8,
            "reorder_point": 15,
            "safety_stock": 10,
        },
    )
    p2_id = p2_res.json()["id"]

    # Product 3: Overstocked / Sufficient (Stock=100, Incoming=50 -> shortfall <= 0)
    p3_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"REC-OVER-{unique}",
            "name": f"Sufficient Stock Item {unique}",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "cost_price": 15.0,
            "selling_price": 30.0,
            "current_stock": 100,
            "reorder_point": 10,
            "safety_stock": 10,
        },
    )
    p3_id = p3_res.json()["id"]

    # Generate recommendations via POST /api/v1/recommendations/generate
    gen_res = client.post(
        "/api/v1/recommendations/generate",
        headers=auth_headers,
        json={"planning_horizon_days": 14, "save": True},
    )
    assert gen_res.status_code == 200
    recs = gen_res.json()
    assert isinstance(recs, list)

    rec_map = {r["product_id"]: r for r in recs}

    # Verify Product 1 (Critical)
    assert p1_id in rec_map
    r1 = rec_map[p1_id]
    assert r1["current_stock"] == 0
    assert r1["incoming_stock"] == 0
    assert r1["suggested_order_quantity"] > 0
    assert r1["urgency"] == "critical"
    assert "formula_breakdown" in r1
    fb1 = r1["formula_breakdown"]
    assert fb1["current_stock"] == 0
    assert fb1["incoming_stock"] == 0
    assert fb1["recommended_order"] == r1["suggested_order_quantity"]
    assert r1["estimated_cost"] == round(r1["suggested_order_quantity"] * 25.0, 2)

    # Verify Product 2 (High Priority)
    assert p2_id in rec_map
    r2 = rec_map[p2_id]
    assert r2["current_stock"] == 8
    assert r2["urgency"] in ("critical", "high")
    assert r2["suggested_order_quantity"] > 0

    # Verify Product 3 non-negativity constraint
    # Even if generated for single product, order quantity must be >= 0
    single_res = client.post(
        "/api/v1/recommendations/generate",
        headers=auth_headers,
        json={"product_id": p3_id, "planning_horizon_days": 14, "save": False},
    )
    assert single_res.status_code == 200
    r3 = single_res.json()[0]
    assert r3["suggested_order_quantity"] >= 0  # Cannot become negative!


def test_recommendation_lifecycle_and_conversion_to_purchase(client, auth_headers):
    """Verifies recommendation retrieval, status update, and conversion to purchase order."""
    # 1. Fetch pending recommendations list
    list_res = client.get("/api/v1/recommendations?status_filter=pending&limit=10", headers=auth_headers)
    assert list_res.status_code == 200
    data = list_res.json()
    assert "summary" in data
    assert "items" in data
    summary = data["summary"]
    assert summary["total_recommendations"] >= 1
    assert summary["pending_count"] >= 1
    assert summary["total_recommended_units"] > 0

    target_rec = data["items"][0]
    rec_id = target_rec["id"]

    # 2. Update status to approved
    update_res = client.patch(
        f"/api/v1/recommendations/{rec_id}/status",
        headers=auth_headers,
        json={"status": "approved"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "approved"

    # 3. Convert approved recommendation to Purchase Order
    convert_res = client.post(
        f"/api/v1/recommendations/{rec_id}/convert-to-purchase",
        headers=auth_headers,
    )
    assert convert_res.status_code == 200
    conv_data = convert_res.json()
    assert "purchase_id" in conv_data
    assert conv_data["status"] == "ordered"
    assert conv_data["quantity"] == target_rec["suggested_order_quantity"]

    # Verify that the purchase order exists in /api/v1/purchases
    po_id = conv_data["purchase_id"]
    po_res = client.get(f"/api/v1/purchases/{po_id}", headers=auth_headers)
    assert po_res.status_code == 200
    po_data = po_res.json()
    assert po_data["status"] == "ordered"

    # 4. Attempting to convert again should be rejected
    repeat_res = client.post(
        f"/api/v1/recommendations/{rec_id}/convert-to-purchase",
        headers=auth_headers,
    )
    assert repeat_res.status_code == 400
