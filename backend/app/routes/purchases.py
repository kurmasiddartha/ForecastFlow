from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_current_active_user
from app.database import get_database
from app.schemas.auth import UserResponse
from app.schemas.purchase import PurchaseCreate, PurchaseResponse, PaginatedPurchasesResponse
from app.services.purchase_service import purchase_service

router = APIRouter(prefix="/purchases", tags=["Purchases"])


@router.post(
    "",
    response_model=PurchaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create purchase order",
    description="Records a purchase from a supplier. If received, increases product inventory and writes stock movement records.",
)
async def create_purchase(
    request: PurchaseCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> PurchaseResponse:
    return await purchase_service.create_purchase(db, request)


@router.get(
    "",
    response_model=PaginatedPurchasesResponse,
    summary="List purchase orders with pagination",
)
async def list_purchases(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    supplier_id: Optional[str] = Query(default=None, description="Filter by supplier ID"),
    status: Optional[str] = Query(default=None, description="Filter by purchase status"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> PaginatedPurchasesResponse:
    return await purchase_service.list_purchases(
        db,
        page=page,
        page_size=page_size,
        supplier_id=supplier_id,
        status=status,
    )


@router.get(
    "/{purchase_id}",
    response_model=PurchaseResponse,
    summary="Get purchase order details by ID",
)
async def get_purchase(
    purchase_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> PurchaseResponse:
    return await purchase_service.get_purchase(db, purchase_id)
