import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import mongo_manager, init_database_indexes
from app.routes.api import api_router
from app.routes.health import router as health_router

logging.basicConfig(
    level=logging.INFO if not settings.APP_DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("forecastflow.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifecycle."""
    logger.info("Starting up %s (v%s)...", settings.APP_NAME, settings.APP_VERSION)
    # Initialize MongoDB Atlas connection
    connected = await mongo_manager.connect()
    if connected and mongo_manager.db is not None:
        await init_database_indexes(mongo_manager.db)
    else:
        logger.warning(
            "MongoDB not currently connected. System started in degraded state. "
            "Please check MONGODB_URL in environment configuration."
        )

    yield

    logger.info("Shutting down %s...", settings.APP_NAME)
    await mongo_manager.disconnect()


def create_application() -> FastAPI:
    """Application factory for ForecastFlow FastAPI backend."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.APP_DEBUG,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Configure CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Top-level direct health check route for infrastructure / load balancers
    app.include_router(health_router, prefix="", tags=["System"])

    # Versioned API routes
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/", tags=["System"], summary="API Root")
    async def root():
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "health": "/health",
            "api_v1": settings.API_V1_STR,
        }

    return app


app = create_application()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.APP_DEBUG,
    )
