from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_current_active_user
from app.database import get_database
from app.schemas.auth import UserResponse
from app.schemas.inventory import (
    StockAdjustmentRequest,
    StockMovementResponse,
    PaginatedStockMovementsResponse,
    InventorySummaryResponse,
)
from app.schemas.product import ProductResponse
from app.services.inventory_service import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.post(
    "/adjust",
    response_model=StockMovementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record auditable stock movement",
    description="Adjusts product stock on hand and writes an immutable audit record to stock_movements.",
)
async def adjust_stock(
    request: StockAdjustmentRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> StockMovementResponse:
    return await inventory_service.record_stock_movement(db, request)


@router.get(
    "/movements",
    response_model=PaginatedStockMovementsResponse,
    summary="List stock movement audit history",
    description="Returns chronological audit logs of all inventory increases, deductions, and adjustments.",
)
async def list_stock_movements(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    product_id: Optional[str] = Query(default=None, description="Filter by product ID"),
    movement_type: Optional[str] = Query(default=None, description="Filter by movement type"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> PaginatedStockMovementsResponse:
    return await inventory_service.list_movements(
        db,
        page=page,
        page_size=page_size,
        product_id=product_id,
        movement_type=movement_type,
    )


@router.get(
    "/summary",
    response_model=InventorySummaryResponse,
    summary="Inventory metrics and valuation summary",
    description="Returns aggregate counts of low stock, out-of-stock items, total units, and total inventory valuations.",
)
async def get_inventory_summary(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> InventorySummaryResponse:
    return await inventory_service.get_inventory_summary(db)


@router.get(
    "/low-stock",
    response_model=List[ProductResponse],
    summary="List products with low or depleted stock",
    description="Returns all products where physical stock on hand is at or below the defined reorder point.",
)
async def get_low_stock_products(
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> List[ProductResponse]:
    return await inventory_service.get_low_stock_items(db, limit=limit)
