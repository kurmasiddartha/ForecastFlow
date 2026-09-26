from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_current_active_user
from app.database import get_database
from app.schemas.auth import UserResponse
from app.schemas.intelligence import (
    IntelligenceListResponse,
    IntelligenceSummary,
    InventoryIntelligenceConfig,
    ProductIntelligenceItem,
)
from app.services.intelligence_service import intelligence_service

router = APIRouter(prefix="/intelligence", tags=["Inventory Intelligence & Risk Analytics"])


def get_intelligence_config(
    analysis_window_days: int = Query(default=30, ge=7, le=180, description="Window to compute sales velocity"),
    dead_stock_days: int = Query(default=60, ge=14, le=365, description="Days with 0 sales for dead stock"),
    fast_moving_daily_velocity: float = Query(default=2.0, ge=0.1, le=100.0, description="Min velocity for fast-moving"),
    slow_moving_daily_velocity: float = Query(default=0.5, ge=0.01, le=50.0, description="Max velocity for slow-moving"),
    stockout_risk_days: float = Query(default=7.0, ge=1.0, le=60.0, description="Runway days threshold for stockout risk"),
    overstock_days: float = Query(default=90.0, ge=14.0, le=365.0, description="Runway days threshold for overstock risk"),
) -> InventoryIntelligenceConfig:
    return InventoryIntelligenceConfig(
        analysis_window_days=analysis_window_days,
        dead_stock_days=dead_stock_days,
        fast_moving_daily_velocity=fast_moving_daily_velocity,
        slow_moving_daily_velocity=slow_moving_daily_velocity,
        stockout_risk_days=stockout_risk_days,
        overstock_days=overstock_days,
    )


@router.get(
    "/summary",
    response_model=IntelligenceSummary,
    summary="Get inventory health and intelligence summary",
    description=(
        "Returns executive inventory health indicators including dead stock valuation, stockout risk counts, "
        "overstock capital exposure, and velocity distributions using configurable business thresholds."
    ),
)
async def get_intelligence_summary(
    category_id: Optional[str] = Query(default=None, description="Optional category filter"),
    config: InventoryIntelligenceConfig = Depends(get_intelligence_config),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> IntelligenceSummary:
    _, summary = await intelligence_service.compute_intelligence_metrics(
        db=db,
        config=config,
        category_id=category_id,
    )
    return summary


@router.get(
    "/products",
    response_model=IntelligenceListResponse,
    summary="List products with intelligence metrics, risk alerts, and velocity classifications",
    description="Paginated, searchable, and filterable intelligence overview for all inventory catalog products.",
)
async def list_products_intelligence(
    category_id: Optional[str] = Query(default=None, description="Category filter"),
    search: Optional[str] = Query(default=None, description="Search by name, SKU, or category"),
    velocity_filter: Optional[str] = Query(
        default=None,
        description="Filter by velocity: 'ALL', 'FAST_MOVING', 'NORMAL', 'SLOW_MOVING', 'DEAD_STOCK', 'OUT_OF_STOCK'",
    ),
    risk_filter: Optional[str] = Query(
        default=None,
        description="Filter by risk category: 'ALL', 'STOCKOUT', 'OVERSTOCK', 'DEAD_STOCK'",
    ),
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=50, ge=1, le=200, description="Page size"),
    sort_by: str = Query(default="daily_sales_velocity", description="Sort attribute"),
    sort_desc: bool = Query(default=True, description="Sort descending"),
    config: InventoryIntelligenceConfig = Depends(get_intelligence_config),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> IntelligenceListResponse:
    return await intelligence_service.get_intelligence_overview(
        db=db,
        config=config,
        category_id=category_id,
        search=search,
        velocity_filter=velocity_filter,
        risk_filter=risk_filter,
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_desc=sort_desc,
    )


@router.get(
    "/fast-moving",
    response_model=List[ProductIntelligenceItem],
    summary="List top fast-moving products",
    description="Retrieves products with daily sales velocity exceeding the fast-moving threshold.",
)
async def get_fast_moving_products(
    limit: int = Query(default=20, ge=1, le=100),
    category_id: Optional[str] = Query(default=None),
    config: InventoryIntelligenceConfig = Depends(get_intelligence_config),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> List[ProductIntelligenceItem]:
    return await intelligence_service.get_fast_moving_products(
        db=db, config=config, category_id=category_id, limit=limit
    )


@router.get(
    "/slow-moving",
    response_model=List[ProductIntelligenceItem],
    summary="List slow-moving products",
    description="Retrieves products with active but low sales velocity risking holding costs.",
)
async def get_slow_moving_products(
    limit: int = Query(default=20, ge=1, le=100),
    category_id: Optional[str] = Query(default=None),
    config: InventoryIntelligenceConfig = Depends(get_intelligence_config),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> List[ProductIntelligenceItem]:
    return await intelligence_service.get_slow_moving_products(
        db=db, config=config, category_id=category_id, limit=limit
    )


@router.get(
    "/dead-stock",
    response_model=List[ProductIntelligenceItem],
    summary="List dead-stock inventory",
    description="Identifies stagnant products with zero sales in the configured dead-stock window and tied-up capital.",
)
async def get_dead_stock_products(
    limit: int = Query(default=20, ge=1, le=100),
    category_id: Optional[str] = Query(default=None),
    config: InventoryIntelligenceConfig = Depends(get_intelligence_config),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> List[ProductIntelligenceItem]:
    return await intelligence_service.get_dead_stock_products(
        db=db, config=config, category_id=category_id, limit=limit
    )


@router.get(
    "/stockout-risk",
    response_model=List[ProductIntelligenceItem],
    summary="List products with stockout risk",
    description="Highlights products where inventory runway is critical or projected demand exceeds available stock.",
)
async def get_stockout_risk_products(
    limit: int = Query(default=20, ge=1, le=100),
    category_id: Optional[str] = Query(default=None),
    config: InventoryIntelligenceConfig = Depends(get_intelligence_config),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> List[ProductIntelligenceItem]:
    return await intelligence_service.get_stockout_risks(
        db=db, config=config, category_id=category_id, limit=limit
    )


@router.get(
    "/overstock-risk",
    response_model=List[ProductIntelligenceItem],
    summary="List products with overstock risk",
    description="Highlights products holding inventory far exceeding consumption velocity.",
)
async def get_overstock_risk_products(
    limit: int = Query(default=20, ge=1, le=100),
    category_id: Optional[str] = Query(default=None),
    config: InventoryIntelligenceConfig = Depends(get_intelligence_config),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> List[ProductIntelligenceItem]:
    return await intelligence_service.get_overstock_risks(
        db=db, config=config, category_id=category_id, limit=limit
    )


@router.post(
    "/simulate",
    response_model=IntelligenceSummary,
    summary="Simulate inventory intelligence with custom threshold parameters",
    description="Evaluates portfolio health and scenario impact with an explicit threshold payload.",
)
async def simulate_intelligence_thresholds(
    config: InventoryIntelligenceConfig,
    category_id: Optional[str] = Query(default=None),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> IntelligenceSummary:
    _, summary = await intelligence_service.compute_intelligence_metrics(
        db=db, config=config, category_id=category_id
    )
    return summary
