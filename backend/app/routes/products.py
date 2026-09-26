from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_current_active_user
from app.database import get_database
from app.schemas.auth import UserResponse
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    PaginatedProductsResponse,
)
from app.services.product_service import product_service

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=PaginatedProductsResponse, summary="List products with filtering and pagination")
async def list_products(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(default=None, description="Search term for product name or SKU"),
    category_id: Optional[str] = Query(default=None, description="Filter by category ID"),
    is_active: Optional[bool] = Query(default=None, description="Filter by active status"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> PaginatedProductsResponse:
    return await product_service.list_products(
        db,
        page=page,
        page_size=page_size,
        search=search,
        category_id=category_id,
        is_active=is_active,
    )


@router.get("/{product_id}", response_model=ProductResponse, summary="Get product by ID")
async def get_product(
    product_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> ProductResponse:
    return await product_service.get_product(db, product_id)


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create product",
)
async def create_product(
    data: ProductCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> ProductResponse:
    return await product_service.create_product(db, data)


@router.put("/{product_id}", response_model=ProductResponse, summary="Update product")
async def update_product(
    product_id: str,
    data: ProductUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> ProductResponse:
    return await product_service.update_product(db, product_id, data)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete product",
)
async def delete_product(
    product_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> None:
    await product_service.delete_product(db, product_id)
