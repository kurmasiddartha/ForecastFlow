from typing import List
from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_current_active_user
from app.database import get_database
from app.schemas.auth import UserResponse
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.category_service import category_service

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse], summary="List all categories")
async def list_categories(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> List[CategoryResponse]:
    return await category_service.list_categories(db)


@router.get("/{category_id}", response_model=CategoryResponse, summary="Get category by ID")
async def get_category(
    category_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> CategoryResponse:
    return await category_service.get_category(db, category_id)


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create category",
)
async def create_category(
    data: CategoryCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> CategoryResponse:
    return await category_service.create_category(db, data)


@router.put("/{category_id}", response_model=CategoryResponse, summary="Update category")
async def update_category(
    category_id: str,
    data: CategoryUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> CategoryResponse:
    return await category_service.update_category(db, category_id, data)


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete category",
)
async def delete_category(
    category_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> None:
    await category_service.delete_category(db, category_id)
