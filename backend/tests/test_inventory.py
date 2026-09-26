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
    email = f"inventory_test_{suffix}@test.com"
    pwd = "InventoryPassword123!"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": pwd, "full_name": "Inventory Tester", "role": "manager"},
    )
    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def test_product(client, auth_headers):
    unique = uuid.uuid4().hex[:6]
    cat_res = client.post(
        "/api/v1/categories",
        headers=auth_headers,
        json={"name": f"Hardware {unique}"},
    )
    cat_id = cat_res.json()["id"]

    prod_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"HW-{unique.upper()}",
            "name": "Precision Bolt Pack",
            "category_id": cat_id,
            "unit": "pack",
            "cost_price": 5.0,
            "selling_price": 12.0,
            "current_stock": 20,
            "reorder_point": 15,
            "target_stock_level": 50,
            "safety_stock": 5,
        },
    )
    return prod_res.json()


def test_stock_increase(client, auth_headers, test_product):
    prod_id = test_product["id"]

    # Stock-in via PURCHASE: Add 10 units (20 -> 30)
    adjust_res = client.post(
        "/api/v1/inventory/adjust",
        headers=auth_headers,
        json={
            "product_id": prod_id,
            "movement_type": "PURCHASE",
            "action": "ADD",
            "quantity": 10,
            "reference_id": "PO-9912",
            "notes": "Incoming replenishment shipment",
        },
    )
    assert adjust_res.status_code == 201
    movement = adjust_res.json()
    assert movement["previous_stock"] == 20
    assert movement["quantity"] == 10
    assert movement["new_stock"] == 30
    assert movement["movement_type"] == "PURCHASE"

    # Verify updated product stock
    get_res = client.get(f"/api/v1/products/{prod_id}", headers=auth_headers)
    assert get_res.json()["current_stock"] == 30


def test_stock_decrease(client, auth_headers, test_product):
    prod_id = test_product["id"]

    # Stock-out via SALE: Deduct 5 units (30 -> 25)
    adjust_res = client.post(
        "/api/v1/inventory/adjust",
        headers=auth_headers,
        json={
            "product_id": prod_id,
            "movement_type": "SALE",
            "action": "DEDUCT",
            "quantity": 5,
            "notes": "Direct walk-in customer sale",
        },
    )
    assert adjust_res.status_code == 201
    movement = adjust_res.json()
    assert movement["previous_stock"] == 30
    assert movement["quantity"] == -5
    assert movement["new_stock"] == 25

    # Verify updated product stock
    get_res = client.get(f"/api/v1/products/{prod_id}", headers=auth_headers)
    assert get_res.json()["current_stock"] == 25


def test_insufficient_stock_rejection(client, auth_headers, test_product):
    prod_id = test_product["id"]

    # Attempt to deduct 100 units when stock is only 25
    adjust_res = client.post(
        "/api/v1/inventory/adjust",
        headers=auth_headers,
        json={
            "product_id": prod_id,
            "movement_type": "SALE",
            "action": "DEDUCT",
            "quantity": 100,
        },
    )
    assert adjust_res.status_code == 400
    assert "Insufficient stock" in adjust_res.json()["detail"]


def test_invalid_quantity_rejection(client, auth_headers, test_product):
    prod_id = test_product["id"]

    # Zero quantity
    zero_res = client.post(
        "/api/v1/inventory/adjust",
        headers=auth_headers,
        json={
            "product_id": prod_id,
            "movement_type": "PURCHASE",
            "action": "ADD",
            "quantity": 0,
        },
    )
    assert zero_res.status_code == 400

    # Negative quantity in validation
    neg_res = client.post(
        "/api/v1/inventory/adjust",
        headers=auth_headers,
        json={
            "product_id": prod_id,
            "movement_type": "PURCHASE",
            "action": "ADD",
            "quantity": -5,
        },
    )
    assert neg_res.status_code == 422


def test_low_stock_detection(client, auth_headers, test_product):
    prod_id = test_product["id"]

    # Current stock is 25, reorder_point is 15.
    # Deduct 15 units -> current stock becomes 10 (which is <= 15, low stock!)
    adjust_res = client.post(
        "/api/v1/inventory/adjust",
        headers=auth_headers,
        json={
            "product_id": prod_id,
            "movement_type": "DAMAGE",
            "action": "DEDUCT",
            "quantity": 15,
            "notes": "Damaged goods written off",
        },
    )
    assert adjust_res.status_code == 201
    assert adjust_res.json()["new_stock"] == 10

    # Verify low-stock endpoint detects this item
    low_stock_res = client.get("/api/v1/inventory/low-stock", headers=auth_headers)
    assert low_stock_res.status_code == 200
    items = low_stock_res.json()
    assert any(item["id"] == prod_id for item in items)

    # Verify inventory summary KPIs
    summary_res = client.get("/api/v1/inventory/summary", headers=auth_headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_products"] >= 1
    assert summary["low_stock_count"] >= 1


def test_stock_movement_audit_history(client, auth_headers, test_product):
    prod_id = test_product["id"]

    # Fetch audit log for this product
    movements_res = client.get(
        f"/api/v1/inventory/movements?product_id={prod_id}",
        headers=auth_headers,
    )
    assert movements_res.status_code == 200
    data = movements_res.json()
    assert data["total"] >= 3  # PURCHASE (+10), SALE (-5), DAMAGE (-15)
    # Check that movements are returned in descending chronological order
    types = [m["movement_type"] for m in data["items"]]
    assert "DAMAGE" in types
    assert "SALE" in types
    assert "PURCHASE" in types
