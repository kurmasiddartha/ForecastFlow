import pytest
from app.database import mongo_manager, INDEX_DEFINITIONS


def test_index_definitions_structure():
    expected_collections = {
        "users",
        "categories",
        "suppliers",
        "products",
        "sales",
        "purchases",
        "stock_movements",
        "forecasts",
        "recommendations",
    }
    assert expected_collections.issubset(set(INDEX_DEFINITIONS.keys()))

    # Verify specific indexes
    user_indexes = INDEX_DEFINITIONS["users"]
    assert any("idx_users_email_unique" == idx.document.get("name") for idx in user_indexes)

    product_indexes = INDEX_DEFINITIONS["products"]
    assert any("idx_products_sku_unique" == idx.document.get("name") for idx in product_indexes)
    assert any("idx_products_category_id" == idx.document.get("name") for idx in product_indexes)

    sales_indexes = INDEX_DEFINITIONS["sales"]
    assert any("idx_sales_product_date" == idx.document.get("name") for idx in sales_indexes)


@pytest.mark.asyncio
async def test_database_manager_ping_disconnected_state():
    # If client is None or disconnected, ping should safely return a status dict without raising exceptions
    ping_result = await mongo_manager.ping()
    assert isinstance(ping_result, dict)
    assert "status" in ping_result
    assert ping_result["status"] in ["connected", "disconnected", "unreachable"]
    assert "database" in ping_result
