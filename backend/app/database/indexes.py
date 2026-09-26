import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, IndexModel

logger = logging.getLogger("forecastflow.database")

INDEX_DEFINITIONS = {
    "users": [
        IndexModel([("email", ASCENDING)], unique=True, name="idx_users_email_unique"),
    ],
    "categories": [
        IndexModel([("name", ASCENDING)], unique=True, name="idx_categories_name_unique"),
    ],
    "suppliers": [
        IndexModel([("name", ASCENDING)], name="idx_suppliers_name"),
    ],
    "products": [
        IndexModel([("sku", ASCENDING)], unique=True, name="idx_products_sku_unique"),
        IndexModel([("category_id", ASCENDING)], name="idx_products_category_id"),
        IndexModel([("supplier_id", ASCENDING)], name="idx_products_supplier_id"),
        IndexModel([("name", ASCENDING)], name="idx_products_name"),
        IndexModel([("is_active", ASCENDING)], name="idx_products_is_active"),
    ],
    "sales": [
        IndexModel([("product_id", ASCENDING), ("sale_date", DESCENDING)], name="idx_sales_product_date"),
        IndexModel([("items.product_id", ASCENDING)], name="idx_sales_items_product_id"),
        IndexModel([("sale_date", DESCENDING)], name="idx_sales_sale_date"),
    ],
    "purchases": [
        IndexModel([("supplier_id", ASCENDING)], name="idx_purchases_supplier_id"),
        IndexModel([("items.product_id", ASCENDING)], name="idx_purchases_items_product_id"),
        IndexModel([("order_date", DESCENDING)], name="idx_purchases_order_date"),
        IndexModel([("status", ASCENDING)], name="idx_purchases_status"),
    ],
    "stock_movements": [
        IndexModel([("product_id", ASCENDING), ("created_at", DESCENDING)], name="idx_movements_product_created"),
    ],
    "forecasts": [
        IndexModel([("product_id", ASCENDING), ("forecast_date", DESCENDING)], name="idx_forecasts_product_date"),
        IndexModel([("product_id", ASCENDING), ("generated_timestamp", DESCENDING)], name="idx_forecasts_product_gen"),
    ],
    "recommendations": [
        IndexModel([("product_id", ASCENDING), ("status", ASCENDING)], name="idx_recommendations_product_status"),
        IndexModel([("status", ASCENDING)], name="idx_recommendations_status"),
        IndexModel([("urgency", ASCENDING)], name="idx_recommendations_urgency"),
        IndexModel([("created_at", DESCENDING)], name="idx_recommendations_created_at"),
    ],
}


async def init_database_indexes(db: AsyncIOMotorDatabase) -> None:
    """Ensures necessary indexes are created for all core collections."""
    logger.info("Initializing database indexes...")
    for collection_name, indexes in INDEX_DEFINITIONS.items():
        try:
            collection = db[collection_name]
            await collection.create_indexes(indexes)
            logger.debug("Indexes initialized for collection: %s", collection_name)
        except Exception as exc:
            logger.warning("Could not create indexes for %s: %s", collection_name, exc)
    logger.info("Database index initialization routine completed.")
