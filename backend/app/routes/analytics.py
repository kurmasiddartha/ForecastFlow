from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_current_active_user
from app.database import get_database
from app.schemas.analytics import AIDashboardResponse, DashboardAnalyticsResponse
from app.schemas.auth import UserResponse
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics & Dashboard"])


@router.get(
    "/ai-dashboard",
    response_model=AIDashboardResponse,
    summary="Get unified AI Executive Inventory & Demand Dashboard",
    description=(
        "Returns a consolidated, zero-duplication overview answering: "
        "'What is happening with my inventory?' (Inventory/sales KPIs, sales trends, velocity), "
        "'What will likely happen?' (Stockout-risk diagnostics, portfolio forecast summary, forecast chart), and "
        "'What should I do?' (Formula-driven restock recommendations with 1-click PO action)."
    ),
)
async def get_ai_dashboard(
    timeframe: Optional[str] = Query(default="30d", description="Preset range: 7d, 30d, 90d, 1y, or all"),
    target_product_id: Optional[str] = Query(default=None, description="Optional product ID to feature in forecast chart"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> AIDashboardResponse:
    return await analytics_service.get_ai_dashboard(
        db=db,
        timeframe=timeframe,
        target_product_id=target_product_id,
    )


@router.get(
    "/dashboard",
    response_model=DashboardAnalyticsResponse,
    summary="Get aggregated business dashboard analytics",
    description=(
        "Returns comprehensive commercial KPIs, inventory valuations, fast/slow-moving goods, "
        "and chart-ready aggregations for sales over time, category breakdowns, and stock movements."
    ),
)
async def get_dashboard_analytics(
    timeframe: Optional[str] = Query(
        default="30d",
        description="Preset range: 7d, 30d, 90d, 1y, or all",
    ),
    start_date: Optional[datetime] = Query(default=None, description="Custom start datetime (ISO-8601)"),
    end_date: Optional[datetime] = Query(default=None, description="Custom end datetime (ISO-8601)"),
    category_id: Optional[str] = Query(default=None, description="Optional category filter"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> DashboardAnalyticsResponse:
    return await analytics_service.get_dashboard_analytics(
        db=db,
        timeframe=timeframe,
        start_date=start_date,
        end_date=end_date,
        category_id=category_id,
    )

