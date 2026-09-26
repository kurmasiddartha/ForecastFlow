import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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
    app.include_router(health_router, prefix="/api", tags=["System"])

    # Versioned API routes
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/api", tags=["System"], summary="API Root")
    @app.get("/api/v1", tags=["System"], summary="API Root (v1)")
    async def root():
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "health": "/health",
            "api_v1": settings.API_V1_STR,
        }

    # Locate the built frontend static directory
    module_dir = Path(__file__).resolve().parent
    dist_candidates = [
        module_dir.parent.parent / "dist",
        module_dir.parent / "dist",
        module_dir.parent.parent / "frontend" / "dist",
        Path("dist"),
        Path("backend/dist"),
        Path("frontend/dist"),
    ]
    resolved_dist = None
    for cand in dist_candidates:
        if cand.exists() and (cand / "index.html").exists():
            resolved_dist = cand.resolve()
            break

    if resolved_dist:
        logger.info("Serving frontend static bundle from: %s", resolved_dist)
        assets_dir = resolved_dist / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

        @app.get("/", include_in_schema=False)
        async def serve_index():
            return FileResponse(str(resolved_dist / "index.html"))

        @app.get("/{full_path:path}", include_in_schema=False)
        async def serve_spa(full_path: str):
            if full_path.startswith("api") or full_path in ["docs", "redoc", "openapi.json", "health"]:
                raise HTTPException(status_code=404, detail="Not Found")

            candidate_file = resolved_dist / full_path
            if candidate_file.is_file():
                return FileResponse(str(candidate_file))

            return FileResponse(str(resolved_dist / "index.html"))
    else:
        logger.warning("Frontend static build directory not found. Only API routes will be served.")

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
