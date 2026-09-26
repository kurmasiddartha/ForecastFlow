"""Standalone CLI utility to clear all operational data from MongoDB while preserving user accounts.

Usage:
    cd backend
    python -m app.scripts.reset_data
"""
import asyncio
import logging
from app.database import mongo_manager, init_database_indexes

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("reset_data")

OPERATIONAL_COLLECTIONS = [
    "products",
    "categories",
    "suppliers",
    "sales",
    "purchases",
    "stock_movements",
    "forecasts",
    "recommendations",
]


async def reset_operational_data():
    logger.info("Connecting to MongoDB...")
    connected = await mongo_manager.connect()
    if not connected or mongo_manager.db is None:
        logger.error("Failed to connect to MongoDB. Check MONGODB_URL in backend/.env")
        return

    db = mongo_manager.db
    logger.info("Connected to database: %s", db.name)

    total_deleted = 0
    for coll_name in OPERATIONAL_COLLECTIONS:
        coll = db[coll_name]
        res = await coll.delete_many({})
        logger.info("Collection '%s': deleted %d documents.", coll_name, res.deleted_count)
        total_deleted += res.deleted_count

    # Check preserved users
    user_count = await db.users.count_documents({})
    logger.info("User accounts preserved: %d users remain active.", user_count)

    # Re-initialize indexes
    await init_database_indexes(db)
    await mongo_manager.disconnect()

    logger.info("SUCCESS: Wiped %d total operational documents. Database is clean!", total_deleted)


if __name__ == "__main__":
    asyncio.run(reset_operational_data())
