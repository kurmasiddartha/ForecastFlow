from typing import List
from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_current_active_user
from app.database import get_database
from app.schemas.auth import UserResponse
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse
from app.services.supplier_service import supplier_service

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("", response_model=List[SupplierResponse], summary="List all suppliers")
async def list_suppliers(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> List[SupplierResponse]:
    return await supplier_service.list_suppliers(db)


@router.get("/{supplier_id}", response_model=SupplierResponse, summary="Get supplier by ID")
async def get_supplier(
    supplier_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> SupplierResponse:
    return await supplier_service.get_supplier(db, supplier_id)


@router.post(
    "",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create supplier",
)
async def create_supplier(
    data: SupplierCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> SupplierResponse:
    return await supplier_service.create_supplier(db, data)


@router.put("/{supplier_id}", response_model=SupplierResponse, summary="Update supplier")
async def update_supplier(
    supplier_id: str,
    data: SupplierUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> SupplierResponse:
    return await supplier_service.update_supplier(db, supplier_id, data)


@router.delete(
    "/{supplier_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete supplier",
)
async def delete_supplier(
    supplier_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_active_user),
) -> None:
    await supplier_service.delete_supplier(db, supplier_id)
