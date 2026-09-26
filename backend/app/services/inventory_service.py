import math
from datetime import datetime, timezone
from typing import Dict, List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.inventory import (
    StockAdjustmentRequest,
    StockMovementResponse,
    PaginatedStockMovementsResponse,
    InventorySummaryResponse,
)
from app.schemas.product import ProductResponse
from app.services.product_service import _serialize_product


class InventoryService:
    """Service layer managing inventory adjustments, stock movements, and stock level audits."""

    @staticmethod
    async def record_stock_movement(
        db: AsyncIOMotorDatabase, request: StockAdjustmentRequest
    ) -> StockMovementResponse:
        if not ObjectId.is_valid(request.product_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found: Invalid product identifier.",
            )

        product = await db.products.find_one({"_id": ObjectId(request.product_id)})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found in catalog.",
            )

        previous_stock = int(product.get("current_stock", 0))

        # Calculate signed delta and validated new stock level
        if request.action == "ADD":
            if request.quantity <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Quantity to add must be greater than zero.",
                )
            signed_delta = request.quantity
            new_stock = previous_stock + request.quantity

        elif request.action == "DEDUCT":
            if request.quantity <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Quantity to deduct must be greater than zero.",
                )
            if previous_stock < request.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Insufficient stock: Attempted to deduct {request.quantity} {product.get('unit', 'units')}, "
                        f"but only {previous_stock} currently in stock."
                    ),
                )
            signed_delta = -request.quantity
            new_stock = previous_stock - request.quantity

        elif request.action == "SET":
            if request.quantity < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Physical stock count cannot be negative.",
                )
            signed_delta = request.quantity - previous_stock
            new_stock = request.quantity
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported stock action: {request.action}",
            )

        now = datetime.now(timezone.utc)

        # 1. Update product stock on hand
        await db.products.update_one(
            {"_id": product["_id"]},
            {"$set": {"current_stock": new_stock, "updated_at": now}},
        )

        # 2. Insert audit trail in stock_movements
        movement_doc = {
            "product_id": str(product["_id"]),
            "movement_type": request.movement_type,
            "quantity": signed_delta,
            "previous_stock": previous_stock,
            "new_stock": new_stock,
            "reference_id": request.reference_id,
            "notes": request.notes.strip() if request.notes else None,
            "created_at": now,
        }
        result = await db.stock_movements.insert_one(movement_doc)
        movement_doc["_id"] = result.inserted_id

        return StockMovementResponse(
            id=str(movement_doc["_id"]),
            product_id=str(product["_id"]),
            product_sku=product.get("sku"),
            product_name=product.get("name"),
            movement_type=movement_doc["movement_type"],
            quantity=signed_delta,
            previous_stock=previous_stock,
            new_stock=new_stock,
            reference_id=movement_doc.get("reference_id"),
            notes=movement_doc.get("notes"),
            created_at=movement_doc["created_at"],
        )

    @staticmethod
    async def list_movements(
        db: AsyncIOMotorDatabase,
        page: int = 1,
        page_size: int = 20,
        product_id: Optional[str] = None,
        movement_type: Optional[str] = None,
    ) -> PaginatedStockMovementsResponse:
        filter_query: dict = {}

        if product_id:
            filter_query["product_id"] = product_id

        if movement_type:
            filter_query["movement_type"] = movement_type

        total = await db.stock_movements.count_documents(filter_query)
        total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1
        skip = (page - 1) * page_size

        cursor = (
            db.stock_movements.find(filter_query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(page_size)
        )
        movements = await cursor.to_list(length=page_size)

        # Fetch product metadata in bulk for enrichment
        prod_ids = [m["product_id"] for m in movements if m.get("product_id")]
        unique_obj_ids = [ObjectId(pid) for pid in prod_ids if ObjectId.is_valid(pid)]
        products_cursor = db.products.find(
            {"_id": {"$in": unique_obj_ids}}, {"_id": 1, "sku": 1, "name": 1}
        )
        products = await products_cursor.to_list(length=len(unique_obj_ids))
        prod_map = {str(p["_id"]): p for p in products}

        items = [
            StockMovementResponse(
                id=str(m["_id"]),
                product_id=m["product_id"],
                product_sku=prod_map.get(m["product_id"], {}).get("sku"),
                product_name=prod_map.get(m["product_id"], {}).get("name"),
                movement_type=m["movement_type"],
                quantity=m["quantity"],
                previous_stock=m["previous_stock"],
                new_stock=m["new_stock"],
                reference_id=m.get("reference_id"),
                notes=m.get("notes"),
                created_at=m.get("created_at", datetime.now(timezone.utc)),
            )
            for m in movements
        ]

        return PaginatedStockMovementsResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    @staticmethod
    async def get_inventory_summary(db: AsyncIOMotorDatabase) -> InventorySummaryResponse:
        total_products = await db.products.count_documents({})
        out_of_stock_count = await db.products.count_documents({"current_stock": 0})
        
        # Low stock: stock <= reorder_point AND stock > 0
        low_stock_count = await db.products.count_documents({
            "$expr": {
                "$and": [
                    {"$lte": ["$current_stock", "$reorder_point"]},
                    {"$gt": ["$current_stock", 0]},
                ]
            }
        })

        # Aggregate total units and values
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_units": {"$sum": "$current_stock"},
                    "cost_value": {
                        "$sum": {"$multiply": ["$current_stock", "$cost_price"]}
                    },
                    "retail_value": {
                        "$sum": {"$multiply": ["$current_stock", "$selling_price"]}
                    },
                }
            }
        ]
        agg_cursor = db.products.aggregate(pipeline)
        agg_results = await agg_cursor.to_list(length=1)

        if agg_results:
            agg_data = agg_results[0]
            total_units = int(agg_data.get("total_units", 0))
            cost_value = round(float(agg_data.get("cost_value", 0.0)), 2)
            retail_value = round(float(agg_data.get("retail_value", 0.0)), 2)
        else:
            total_units = 0
            cost_value = 0.0
            retail_value = 0.0

        return InventorySummaryResponse(
            total_products=total_products,
            total_units=total_units,
            low_stock_count=low_stock_count,
            out_of_stock_count=out_of_stock_count,
            inventory_value_cost=cost_value,
            inventory_value_retail=retail_value,
        )

    @staticmethod
    async def get_low_stock_items(
        db: AsyncIOMotorDatabase, limit: int = 50
    ) -> List[ProductResponse]:
        """Returns all products where current_stock is at or below reorder_point."""
        cursor = (
            db.products.find({
                "$expr": {"$lte": ["$current_stock", "$reorder_point"]}
            })
            .sort("current_stock", 1)
            .limit(limit)
        )
        docs = await cursor.to_list(length=limit)

        category_cursor = db.categories.find({}, {"_id": 1, "name": 1})
        categories = await category_cursor.to_list(length=1000)
        cat_map = {str(c["_id"]): c["name"] for c in categories}

        supplier_cursor = db.suppliers.find({}, {"_id": 1, "name": 1})
        suppliers = await supplier_cursor.to_list(length=1000)
        supp_map = {str(s["_id"]): s["name"] for s in suppliers}

        return [_serialize_product(d, cat_map, supp_map) for d in docs]


inventory_service = InventoryService()
