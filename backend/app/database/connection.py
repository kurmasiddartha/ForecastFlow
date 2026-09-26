import logging
import time
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("forecastflow.database")


class MongoManager:
    """Manages the MongoDB Atlas connection lifecycle and client pooling."""

    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
        self.is_connected: bool = False
        self.last_error: Optional[str] = None

    async def connect(self) -> bool:
        """Establishes connection to MongoDB Atlas and verifies with a ping command."""
        try:
            logger.info("Connecting to MongoDB at: %s", settings.MONGODB_URL.split("@")[-1])
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
                maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
                serverSelectionTimeoutMS=settings.MONGODB_TIMEOUT_MS,
            )
            self.db = self.client[settings.MONGODB_DB_NAME]

            # Verify connection with an administrative ping
            await self.client.admin.command("ping")
            self.is_connected = True
            self.last_error = None
            logger.info("Successfully connected to MongoDB database: %s", settings.MONGODB_DB_NAME)
            return True
        except Exception as exc:
            self.is_connected = False
            self.last_error = str(exc)
            logger.warning("MongoDB connection could not be established: %s", exc)
            return False

    async def disconnect(self):
        """Closes the MongoDB client connection pool."""
        if self.client:
            logger.info("Closing MongoDB connection pool...")
            self.client.close()
            self.client = None
            self.db = None
            self.is_connected = False
            logger.info("MongoDB connection closed.")

    async def ping(self) -> Dict[str, Any]:
        """Pings the database to measure latency and verify current health."""
        if not self.client:
            return {"status": "disconnected", "database": settings.MONGODB_DB_NAME, "error": self.last_error or "Client not initialized"}

        try:
            start = time.perf_counter()
            await self.client.admin.command("ping")
            latency_ms = round((time.perf_counter() - start) * 1000, 2)
            self.is_connected = True
            self.last_error = None
            return {
                "status": "connected",
                "database": settings.MONGODB_DB_NAME,
                "latency_ms": latency_ms,
            }
        except Exception as exc:
            self.is_connected = False
            self.last_error = str(exc)
            return {
                "status": "unreachable",
                "database": settings.MONGODB_DB_NAME,
                "error": str(exc),
            }


mongo_manager = MongoManager()


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency provider for FastAPI route endpoints, ensuring connection in serverless lifecycles."""
    if mongo_manager.db is None or not mongo_manager.is_connected:
        await mongo_manager.connect()
    if mongo_manager.db is None:
        raise RuntimeError(f"Database connection could not be established. {mongo_manager.last_error or 'Check MONGODB_URL.'}")
    return mongo_manager.db
