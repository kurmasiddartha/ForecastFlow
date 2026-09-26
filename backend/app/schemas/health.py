from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class DatabaseHealth(BaseModel):
    status: str = Field(description="Database connectivity status: 'connected', 'disconnected', 'unreachable'")
    database: Optional[str] = Field(default=None, description="Connected database name")
    latency_ms: Optional[float] = Field(default=None, description="Ping round-trip latency in milliseconds")
    error: Optional[str] = Field(default=None, description="Error detail if connection is unavailable")


class HealthCheckResponse(BaseModel):
    status: str = Field(default="healthy", description="Application health status")
    app_name: str = Field(description="Name of the service")
    version: str = Field(description="Application version")
    environment: str = Field(description="Deployment environment")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Current server timestamp in UTC",
    )
    database: Optional[DatabaseHealth] = Field(
        default=None,
        description="MongoDB Atlas connectivity health state",
    )
