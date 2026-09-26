import math
from datetime import datetime, timezone
from typing import Dict, List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    PaginatedProductsResponse,
)


def _serialize_product(
    doc: dict,
    category_map: Optional[Dict[str, str]] = None,
    supplier_map: Optional[Dict[str, str]] = None,
) -> ProductResponse:
    cat_id = str(doc.get("category_id", ""))
    supp_id = str(doc.get("supplier_id", "")) if doc.get("supplier_id") else None

    return ProductResponse(
        id=str(doc["_id"]),
        sku=doc["sku"],
        name=doc["name"],
        description=doc.get("description"),
        category_id=cat_id,
        supplier_id=supp_id,
        unit=doc.get("unit", "pcs"),
        cost_price=float(doc.get("cost_price", 0.0)),
        selling_price=float(doc.get("selling_price", 0.0)),
        current_stock=int(doc.get("current_stock", 0)),
        reorder_point=int(doc.get("reorder_point", 10)),
        target_stock_level=int(doc.get("target_stock_level", 50)),
        safety_stock=int(doc.get("safety_stock", 10)),
        is_active=bool(doc.get("is_active", True)),
        category_name=(category_map or {}).get(cat_id),
        supplier_name=(supplier_map or {}).get(supp_id) if supp_id else None,
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
        updated_at=doc.get("updated_at"),
    )


class ProductService:
    """Service layer managing products catalog, inventory levels, and relation validation."""

    @staticmethod
    async def list_products(
        db: AsyncIOMotorDatabase,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        category_id: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> PaginatedProductsResponse:
        filter_query: dict = {}

        if is_active is not None:
            filter_query["is_active"] = is_active

        if category_id:
            filter_query["category_id"] = category_id

        if search:
            escaped_search = search.strip()
            filter_query["$or"] = [
                {"name": {"$regex": escaped_search, "$options": "i"}},
                {"sku": {"$regex": escaped_search, "$options": "i"}},
            ]

        total = await db.products.count_documents(filter_query)
        total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1
        skip = (page - 1) * page_size

        cursor = db.products.find(filter_query).sort("name", 1).skip(skip).limit(page_size)
        product_docs = await cursor.to_list(length=page_size)

        # Batch load category & supplier names for display enrichment
        category_cursor = db.categories.find({}, {"_id": 1, "name": 1})
        categories = await category_cursor.to_list(length=1000)
        cat_map = {str(c["_id"]): c["name"] for c in categories}

        supplier_cursor = db.suppliers.find({}, {"_id": 1, "name": 1})
        suppliers = await supplier_cursor.to_list(length=1000)
        supp_map = {str(s["_id"]): s["name"] for s in suppliers}

        items = [_serialize_product(doc, cat_map, supp_map) for doc in product_docs]

        return PaginatedProductsResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    @staticmethod
    async def get_product(db: AsyncIOMotorDatabase, product_id: str) -> ProductResponse:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

        doc = await db.products.find_one({"_id": ObjectId(product_id)})
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

        cat_doc = await db.categories.find_one({"_id": ObjectId(doc["category_id"])}) if ObjectId.is_valid(doc.get("category_id", "")) else None
        supp_doc = await db.suppliers.find_one({"_id": ObjectId(doc["supplier_id"])}) if doc.get("supplier_id") and ObjectId.is_valid(doc.get("supplier_id")) else None

        cat_map = {str(cat_doc["_id"]): cat_doc["name"]} if cat_doc else {}
        supp_map = {str(supp_doc["_id"]): supp_doc["name"]} if supp_doc else {}

        return _serialize_product(doc, cat_map, supp_map)

    @staticmethod
    async def create_product(db: AsyncIOMotorDatabase, data: ProductCreate) -> ProductResponse:
        sku = data.sku.strip().upper()

        # Check unique SKU
        existing_sku = await db.products.find_one({"sku": sku})
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with SKU '{sku}' already exists.",
            )

        # Validate category reference
        if not ObjectId.is_valid(data.category_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category ID format.")
        category = await db.categories.find_one({"_id": ObjectId(data.category_id)})
        if not category:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Referenced category does not exist.")

        # Validate supplier reference if provided
        supplier_name = None
        if data.supplier_id:
            if not ObjectId.is_valid(data.supplier_id):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid supplier ID format.")
            supplier = await db.suppliers.find_one({"_id": ObjectId(data.supplier_id)})
            if not supplier:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Referenced supplier does not exist.")
            supplier_name = supplier["name"]

        now = datetime.now(timezone.utc)
        doc = {
            "sku": sku,
            "name": data.name.strip(),
            "description": data.description.strip() if data.description else None,
            "category_id": data.category_id,
            "supplier_id": data.supplier_id if data.supplier_id else None,
            "unit": data.unit.strip(),
            "cost_price": data.cost_price,
            "selling_price": data.selling_price,
            "current_stock": data.current_stock,
            "reorder_point": data.reorder_point,
            "target_stock_level": data.target_stock_level,
            "safety_stock": data.safety_stock,
            "is_active": data.is_active,
            "created_at": now,
            "updated_at": now,
        }

        result = await db.products.insert_one(doc)
        doc["_id"] = result.inserted_id

        cat_map = {data.category_id: category["name"]}
        supp_map = {data.supplier_id: supplier_name} if data.supplier_id and supplier_name else {}

        return _serialize_product(doc, cat_map, supp_map)

    @staticmethod
    async def update_product(
        db: AsyncIOMotorDatabase, product_id: str, data: ProductUpdate
    ) -> ProductResponse:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

        current = await db.products.find_one({"_id": ObjectId(product_id)})
        if not current:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

        update_fields: dict = {}

        if data.sku is not None:
            sku = data.sku.strip().upper()
            conflict = await db.products.find_one({
                "_id": {"$ne": ObjectId(product_id)},
                "sku": sku,
            })
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Another product with SKU '{sku}' already exists.",
                )
            update_fields["sku"] = sku

        if data.name is not None:
            update_fields["name"] = data.name.strip()
        if data.description is not None:
            update_fields["description"] = data.description.strip() if data.description else None

        if data.category_id is not None:
            if not ObjectId.is_valid(data.category_id):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category ID format.")
            cat = await db.categories.find_one({"_id": ObjectId(data.category_id)})
            if not cat:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Referenced category does not exist.")
            update_fields["category_id"] = data.category_id

        if data.supplier_id is not None:
            if data.supplier_id:
                if not ObjectId.is_valid(data.supplier_id):
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid supplier ID format.")
                supp = await db.suppliers.find_one({"_id": ObjectId(data.supplier_id)})
                if not supp:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Referenced supplier does not exist.")
                update_fields["supplier_id"] = data.supplier_id
            else:
                update_fields["supplier_id"] = None

        if data.unit is not None:
            update_fields["unit"] = data.unit.strip()
        if data.cost_price is not None:
            update_fields["cost_price"] = data.cost_price
        if data.selling_price is not None:
            update_fields["selling_price"] = data.selling_price
        if data.current_stock is not None:
            update_fields["current_stock"] = data.current_stock
        if data.reorder_point is not None:
            update_fields["reorder_point"] = data.reorder_point
        if data.target_stock_level is not None:
            update_fields["target_stock_level"] = data.target_stock_level
        if data.safety_stock is not None:
            update_fields["safety_stock"] = data.safety_stock
        if data.is_active is not None:
            update_fields["is_active"] = data.is_active

        if update_fields:
            update_fields["updated_at"] = datetime.now(timezone.utc)
            await db.products.update_one({"_id": ObjectId(product_id)}, {"$set": update_fields})
            current.update(update_fields)

        # Retrieve current enriched names
        cat_doc = await db.categories.find_one({"_id": ObjectId(current["category_id"])}) if ObjectId.is_valid(current.get("category_id", "")) else None
        supp_doc = await db.suppliers.find_one({"_id": ObjectId(current["supplier_id"])}) if current.get("supplier_id") and ObjectId.is_valid(current.get("supplier_id")) else None

        cat_map = {str(cat_doc["_id"]): cat_doc["name"]} if cat_doc else {}
        supp_map = {str(supp_doc["_id"]): supp_doc["name"]} if supp_doc else {}

        return _serialize_product(current, cat_map, supp_map)

    @staticmethod
    async def delete_product(db: AsyncIOMotorDatabase, product_id: str) -> None:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

        result = await db.products.delete_one({"_id": ObjectId(product_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")


product_service = ProductService()
