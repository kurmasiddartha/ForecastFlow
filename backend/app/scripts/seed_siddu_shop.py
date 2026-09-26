"""Standalone CLI utility to seed realistic Kirana store catalog, suppliers, categories,
and historical student & neighborhood sales transactions for Siddu Kirana Store.

Usage:
    cd backend
    python -m app.scripts.seed_siddu_shop
"""
import asyncio
import logging
from app.database import mongo_manager
from app.services.seed_service import seed_siddu_shop_data

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("seed_siddu_shop")


async def main():
    logger.info("Connecting to MongoDB Atlas...")
    connected = await mongo_manager.connect()
    if not connected or mongo_manager.db is None:
        logger.error("Failed to connect to MongoDB. Check MONGODB_URL in backend/.env")
        return

    result = await seed_siddu_shop_data(mongo_manager.db)
    logger.info("Result: %s", result)

    await mongo_manager.disconnect()
    logger.info("Done!")


if __name__ == "__main__":
    asyncio.run(main())
