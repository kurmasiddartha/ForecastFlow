from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_current_active_user
from app.database import get_database
from app.schemas.auth import UserResponse
from app.schemas.sale import SaleCreate, SaleResponse, PaginatedSalesResponse
from app.services.sale_service import sale_service

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.post(
    "",
    response_model=SaleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create sales transaction",
    description="Registers a sale, checks stock sufficiency, decreases product inventory, and records an auditable stock movement.",
)
async def create_sale(
    request: SaleCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> SaleResponse:
    return await sale_service.create_sale(db, request)


@router.get(
    "",
    response_model=PaginatedSalesResponse,
    summary="List sales history with pagination",
)
async def list_sales(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    product_id: Optional[str] = Query(default=None, description="Filter by product ID"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> PaginatedSalesResponse:
    return await sale_service.list_sales(db, page=page, page_size=page_size, product_id=product_id)


@router.get(
    "/{sale_id}",
    response_model=SaleResponse,
    summary="Get sale transaction details by ID",
)
async def get_sale(
    sale_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> SaleResponse:
    return await sale_service.get_sale(db, sale_id)
