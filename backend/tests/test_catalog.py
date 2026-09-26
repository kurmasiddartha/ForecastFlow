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
    email = f"catalog_test_{suffix}@test.com"
    pwd = "CatalogPassword123!"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": pwd, "full_name": "Catalog Tester", "role": "manager"},
    )
    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_category_crud_flow(client, auth_headers):
    unique = uuid.uuid4().hex[:6]
    cat_name = f"Stationery {unique}"

    # 1. Create Category
    res = client.post(
        "/api/v1/categories",
        headers=auth_headers,
        json={"name": cat_name, "description": "Office paper and pens"},
    )
    assert res.status_code == 201
    cat_data = res.json()
    assert cat_data["name"] == cat_name
    cat_id = cat_data["id"]

    # 2. Duplicate Category Name Rejection (409)
    dup_res = client.post(
        "/api/v1/categories",
        headers=auth_headers,
        json={"name": cat_name},
    )
    assert dup_res.status_code == 409

    # 3. List Categories
    list_res = client.get("/api/v1/categories", headers=auth_headers)
    assert list_res.status_code == 200
    assert any(c["id"] == cat_id for c in list_res.json())

    # 4. Update Category
    up_res = client.put(
        f"/api/v1/categories/{cat_id}",
        headers=auth_headers,
        json={"description": "Updated stationery supplies description"},
    )
    assert up_res.status_code == 200
    assert up_res.json()["description"] == "Updated stationery supplies description"


def test_supplier_crud_flow(client, auth_headers):
    unique = uuid.uuid4().hex[:6]
    supp_name = f"Vendor Apex {unique}"

    # 1. Create Supplier
    res = client.post(
        "/api/v1/suppliers",
        headers=auth_headers,
        json={
            "name": supp_name,
            "contact_name": "Jordan Lee",
            "email": f"jordan_{unique}@apex.com",
            "phone": "+1 555-0199",
            "lead_time_days": 10,
        },
    )
    assert res.status_code == 201
    supp_data = res.json()
    assert supp_data["name"] == supp_name
    assert supp_data["lead_time_days"] == 10
    supp_id = supp_data["id"]

    # 2. Get Supplier
    get_res = client.get(f"/api/v1/suppliers/{supp_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["contact_name"] == "Jordan Lee"

    # 3. Update Supplier
    up_res = client.put(
        f"/api/v1/suppliers/{supp_id}",
        headers=auth_headers,
        json={"lead_time_days": 14},
    )
    assert up_res.status_code == 200
    assert up_res.json()["lead_time_days"] == 14


def test_product_crud_and_guards(client, auth_headers):
    unique = uuid.uuid4().hex[:6]

    # Create category & supplier first
    cat_res = client.post(
        "/api/v1/categories",
        headers=auth_headers,
        json={"name": f"Beverages {unique}"},
    )
    cat_id = cat_res.json()["id"]

    supp_res = client.post(
        "/api/v1/suppliers",
        headers=auth_headers,
        json={"name": f"Coffee Roasters {unique}", "lead_time_days": 5},
    )
    supp_id = supp_res.json()["id"]

    # 1. Create Product
    sku = f"COF-{unique.upper()}"
    prod_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": sku,
            "name": "Artisan Dark Roast 1kg",
            "category_id": cat_id,
            "supplier_id": supp_id,
            "unit": "kg",
            "cost_price": 12.50,
            "selling_price": 24.99,
            "current_stock": 40,
            "reorder_point": 15,
            "target_stock_level": 60,
            "safety_stock": 10,
            "is_active": True,
        },
    )
    assert prod_res.status_code == 201
    prod_data = prod_res.json()
    assert prod_data["sku"] == sku
    assert prod_data["category_name"] == f"Beverages {unique}"
    assert prod_data["supplier_name"] == f"Coffee Roasters {unique}"
    prod_id = prod_data["id"]

    # 2. Duplicate SKU Rejection (409)
    dup_res = client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "sku": sku,
            "name": "Different Name Same SKU",
            "category_id": cat_id,
            "cost_price": 10.0,
            "selling_price": 20.0,
        },
    )
    assert dup_res.status_code == 409

    # 3. List Products with Pagination and Search
    list_res = client.get(f"/api/v1/products?search={sku}", headers=auth_headers)
    assert list_res.status_code == 200
    paginated = list_res.json()
    assert paginated["total"] >= 1
    assert any(p["id"] == prod_id for p in paginated["items"])

    # 4. Guarded Category Deletion (Cannot delete category when products assigned to it)
    cat_del_res = client.delete(f"/api/v1/categories/{cat_id}", headers=auth_headers)
    assert cat_del_res.status_code == 400

    # 5. Update Product
    update_res = client.put(
        f"/api/v1/products/{prod_id}",
        headers=auth_headers,
        json={"current_stock": 45, "selling_price": 26.50},
    )
    assert update_res.status_code == 200
    assert update_res.json()["current_stock"] == 45
    assert update_res.json()["selling_price"] == 26.50

    # 6. Delete Product and verify category can then be deleted
    del_res = client.delete(f"/api/v1/products/{prod_id}", headers=auth_headers)
    assert del_res.status_code == 204

    cat_del_after = client.delete(f"/api/v1/categories/{cat_id}", headers=auth_headers)
    assert cat_del_after.status_code == 204
