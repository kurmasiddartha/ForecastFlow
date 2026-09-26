from fastapi import APIRouter
from app.core.config import settings
from app.database import mongo_manager
from app.schemas.health import HealthCheckResponse, DatabaseHealth

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Application & Database Health Check",
    description="Returns the operational status, version, environment, server timestamp, and MongoDB Atlas connectivity status.",
)
async def get_health_status() -> HealthCheckResponse:
    db_ping = await mongo_manager.ping()
    db_health = DatabaseHealth(
        status=db_ping.get("status", "disconnected"),
        database=db_ping.get("database"),
        latency_ms=db_ping.get("latency_ms"),
        error=db_ping.get("error"),
    )

    overall_status = "healthy" if db_health.status == "connected" else "degraded"

    return HealthCheckResponse(
        status=overall_status,
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
        database=db_health,
    )
