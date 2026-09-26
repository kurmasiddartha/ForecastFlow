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
    email = f"tx_tester_{suffix}@test.com"
    pwd = "TransactionPwd123!"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": pwd, "full_name": "Tx Tester", "role": "manager"},
    )
    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def setup_catalog(client, auth_headers):
    unique = uuid.uuid4().hex[:6]

    # Create category
    cat_res = client.post("/api/v1/categories", headers=auth_headers, json={"name": f"Drinks {unique}"})
    cat_id = cat_res.json()["id"]

    # Create supplier
    supp_res = client.post(
        "/api/v1/suppliers",
        headers=auth_headers,
        json={"name": f"Beverage Corp {unique}", "lead_time_days": 4},
    )
    supp_id = supp_res.json()["id"]

    # Create product with initial stock 50
    prod_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": f"TEA-{unique.upper()}",
            "name": "Matcha Green Tea Tin",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "unit": "tin",
            "cost_price": 8.0,
            "selling_price": 18.0,
            "current_stock": 50,
            "reorder_point": 15,
            "target_stock_level": 60,
            "safety_stock": 10,
        },
    )
    prod = prod_res.json()
    return {"product": prod, "supplier_id": supp_id, "category_id": cat_id}


def test_sale_decreases_inventory(client, auth_headers, setup_catalog):
    prod_id = setup_catalog["product"]["id"]

    # Current stock is 50. Sell 15 units.
    sale_res = client.post(
        "/api/v1/sales",
        headers=auth_headers,
        json={
            "items": [{"product_id": prod_id, "quantity": 15, "unit_price": 18.0}],
            "notes": "Retail customer transaction #1",
        },
    )
    assert sale_res.status_code == 201
    sale_data = sale_res.json()
    assert sale_data["total_amount"] == 270.0
    assert len(sale_data["items"]) == 1
    assert sale_data["items"][0]["quantity"] == 15

    # Verify inventory is decreased to 35
    get_prod = client.get(f"/api/v1/products/{prod_id}", headers=auth_headers)
    assert get_prod.json()["current_stock"] == 35

    # Verify stock movement recorded
    mov_res = client.get(
        f"/api/v1/inventory/movements?product_id={prod_id}&movement_type=SALE",
        headers=auth_headers,
    )
    assert mov_res.status_code == 200
    movements = mov_res.json()["items"]
    assert any(m["quantity"] == -15 and m["new_stock"] == 35 for m in movements)


def test_sale_insufficient_stock_preserves_consistency(client, auth_headers, setup_catalog):
    prod_id = setup_catalog["product"]["id"]

    # Stock is currently 35. Attempt to sell 100 units.
    sale_res = client.post(
        "/api/v1/sales",
        headers=auth_headers,
        json={
            "items": [{"product_id": prod_id, "quantity": 100}],
        },
    )
    assert sale_res.status_code == 400
    assert "Insufficient stock" in sale_res.json()["detail"]

    # Verify inventory remains untouched at 35
    get_prod = client.get(f"/api/v1/products/{prod_id}", headers=auth_headers)
    assert get_prod.json()["current_stock"] == 35


def test_purchase_increases_inventory(client, auth_headers, setup_catalog):
    prod_id = setup_catalog["product"]["id"]
    supp_id = setup_catalog["supplier_id"]

    # Stock is currently 35. Receive purchase order of 25 units.
    purchase_res = client.post(
        "/api/v1/purchases",
        headers=auth_headers,
        json={
            "supplier_id": supp_id,
            "status": "received",
            "items": [{"product_id": prod_id, "quantity": 25, "unit_cost": 8.0}],
        },
    )
    assert purchase_res.status_code == 201
    purchase_data = purchase_res.json()
    assert purchase_data["total_amount"] == 200.0
    assert purchase_data["status"] == "received"

    # Verify inventory is increased from 35 to 60
    get_prod = client.get(f"/api/v1/products/{prod_id}", headers=auth_headers)
    assert get_prod.json()["current_stock"] == 60

    # Verify stock movement recorded
    mov_res = client.get(
        f"/api/v1/inventory/movements?product_id={prod_id}&movement_type=PURCHASE",
        headers=auth_headers,
    )
    assert mov_res.status_code == 200
    movements = mov_res.json()["items"]
    assert any(m["quantity"] == 25 and m["new_stock"] == 60 for m in movements)


def test_list_sales_and_purchases(client, auth_headers):
    sales_res = client.get("/api/v1/sales", headers=auth_headers)
    assert sales_res.status_code == 200
    assert "items" in sales_res.json()
    assert sales_res.json()["total"] >= 1

    purchases_res = client.get("/api/v1/purchases", headers=auth_headers)
    assert purchases_res.status_code == 200
    assert "items" in purchases_res.json()
    assert purchases_res.json()["total"] >= 1
