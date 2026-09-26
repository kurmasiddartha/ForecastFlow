from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse


def _serialize_supplier(doc: dict) -> SupplierResponse:
    return SupplierResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        contact_name=doc.get("contact_name"),
        email=doc.get("email"),
        phone=doc.get("phone"),
        address=doc.get("address"),
        lead_time_days=doc.get("lead_time_days", 7),
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
        updated_at=doc.get("updated_at"),
    )


class SupplierService:
    """Service layer for supplier management."""

    @staticmethod
    async def list_suppliers(db: AsyncIOMotorDatabase) -> List[SupplierResponse]:
        cursor = db.suppliers.find().sort("name", 1)
        docs = await cursor.to_list(length=1000)
        return [_serialize_supplier(doc) for doc in docs]

    @staticmethod
    async def get_supplier(db: AsyncIOMotorDatabase, supplier_id: str) -> SupplierResponse:
        if not ObjectId.is_valid(supplier_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found.")
        doc = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found.")
        return _serialize_supplier(doc)

    @staticmethod
    async def create_supplier(db: AsyncIOMotorDatabase, data: SupplierCreate) -> SupplierResponse:
        name = data.name.strip()
        now = datetime.now(timezone.utc)
        doc = {
            "name": name,
            "contact_name": data.contact_name.strip() if data.contact_name else None,
            "email": str(data.email).strip().lower() if data.email else None,
            "phone": data.phone.strip() if data.phone else None,
            "address": data.address.strip() if data.address else None,
            "lead_time_days": data.lead_time_days,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.suppliers.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _serialize_supplier(doc)

    @staticmethod
    async def update_supplier(
        db: AsyncIOMotorDatabase, supplier_id: str, data: SupplierUpdate
    ) -> SupplierResponse:
        if not ObjectId.is_valid(supplier_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found.")

        current = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
        if not current:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found.")

        update_fields = {}
        if data.name is not None:
            update_fields["name"] = data.name.strip()
        if data.contact_name is not None:
            update_fields["contact_name"] = data.contact_name.strip() if data.contact_name else None
        if data.email is not None:
            update_fields["email"] = str(data.email).strip().lower() if data.email else None
        if data.phone is not None:
            update_fields["phone"] = data.phone.strip() if data.phone else None
        if data.address is not None:
            update_fields["address"] = data.address.strip() if data.address else None
        if data.lead_time_days is not None:
            update_fields["lead_time_days"] = data.lead_time_days

        if update_fields:
            update_fields["updated_at"] = datetime.now(timezone.utc)
            await db.suppliers.update_one({"_id": ObjectId(supplier_id)}, {"$set": update_fields})
            current.update(update_fields)

        return _serialize_supplier(current)

    @staticmethod
    async def delete_supplier(db: AsyncIOMotorDatabase, supplier_id: str) -> None:
        if not ObjectId.is_valid(supplier_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found.")

        # Check if products reference this supplier
        product_count = await db.products.count_documents({"supplier_id": supplier_id})
        if product_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete supplier: {product_count} product(s) are supplied by this vendor.",
            )

        result = await db.suppliers.delete_one({"_id": ObjectId(supplier_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found.")


supplier_service = SupplierService()
