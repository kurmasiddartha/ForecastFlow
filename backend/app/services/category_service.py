from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse


def _serialize_category(doc: dict) -> CategoryResponse:
    return CategoryResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        description=doc.get("description"),
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
        updated_at=doc.get("updated_at"),
    )


class CategoryService:
    """Service layer for category management."""

    @staticmethod
    async def list_categories(db: AsyncIOMotorDatabase) -> List[CategoryResponse]:
        cursor = db.categories.find().sort("name", 1)
        docs = await cursor.to_list(length=1000)
        return [_serialize_category(doc) for doc in docs]

    @staticmethod
    async def get_category(db: AsyncIOMotorDatabase, category_id: str) -> CategoryResponse:
        if not ObjectId.is_valid(category_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
        doc = await db.categories.find_one({"_id": ObjectId(category_id)})
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
        return _serialize_category(doc)

    @staticmethod
    async def create_category(db: AsyncIOMotorDatabase, data: CategoryCreate) -> CategoryResponse:
        name = data.name.strip()
        existing = await db.categories.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Category '{name}' already exists.",
            )

        now = datetime.now(timezone.utc)
        doc = {
            "name": name,
            "description": data.description.strip() if data.description else None,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.categories.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _serialize_category(doc)

    @staticmethod
    async def update_category(
        db: AsyncIOMotorDatabase, category_id: str, data: CategoryUpdate
    ) -> CategoryResponse:
        if not ObjectId.is_valid(category_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

        current = await db.categories.find_one({"_id": ObjectId(category_id)})
        if not current:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

        update_fields = {}
        if data.name is not None:
            name = data.name.strip()
            # Ensure name uniqueness among other categories
            conflict = await db.categories.find_one({
                "_id": {"$ne": ObjectId(category_id)},
                "name": {"$regex": f"^{name}$", "$options": "i"},
            })
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Another category with name '{name}' already exists.",
                )
            update_fields["name"] = name

        if data.description is not None:
            update_fields["description"] = data.description.strip() if data.description else None

        if update_fields:
            update_fields["updated_at"] = datetime.now(timezone.utc)
            await db.categories.update_one({"_id": ObjectId(category_id)}, {"$set": update_fields})
            current.update(update_fields)

        return _serialize_category(current)

    @staticmethod
    async def delete_category(db: AsyncIOMotorDatabase, category_id: str) -> None:
        if not ObjectId.is_valid(category_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

        # Check if products are assigned to this category
        product_count = await db.products.count_documents({"category_id": category_id})
        if product_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete category: {product_count} product(s) are currently assigned to it.",
            )

        result = await db.categories.delete_one({"_id": ObjectId(category_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")


category_service = CategoryService()
