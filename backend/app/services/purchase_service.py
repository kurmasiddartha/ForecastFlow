import math
from datetime import datetime, timezone
from typing import Dict, List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import OperationFailure
from app.schemas.purchase import (
    PurchaseCreate,
    PurchaseResponse,
    PurchaseItemResponse,
    PaginatedPurchasesResponse,
)


class PurchaseService:
    """Service layer managing supplier purchase orders and automated stock receipts."""

    @staticmethod
    async def create_purchase(
        db: AsyncIOMotorDatabase, request: PurchaseCreate
    ) -> PurchaseResponse:
        now = datetime.now(timezone.utc)
        order_date = request.order_date or now

        # 1. Validate Supplier exists
        if not ObjectId.is_valid(request.supplier_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid supplier ID format.",
            )
        supplier = await db.suppliers.find_one({"_id": ObjectId(request.supplier_id)})
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referenced supplier not found.",
            )

        # 2. Validate all products exist
        item_product_ids = [item.product_id for item in request.items]
        valid_obj_ids = [ObjectId(pid) for pid in item_product_ids if ObjectId.is_valid(pid)]

        if len(valid_obj_ids) != len(item_product_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more product IDs are invalid.",
            )

        products_cursor = db.products.find({"_id": {"$in": valid_obj_ids}})
        products_list = await products_cursor.to_list(length=len(valid_obj_ids))
        prod_map = {str(p["_id"]): p for p in products_list}

        if len(prod_map) != len(set(item_product_ids)):
            missing = set(item_product_ids) - set(prod_map.keys())
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Products not found in catalog: {', '.join(missing)}",
            )

        # 3. Calculate line items and total order value
        purchase_items_data = []
        total_amount = 0.0

        for item in request.items:
            product = prod_map[item.product_id]
            cost = item.unit_cost if item.unit_cost is not None else float(product.get("cost_price", 0.0))
            line_total = round(item.quantity * cost, 2)
            total_amount += line_total

            purchase_items_data.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_cost": cost,
                "total_cost": line_total,
                "product_sku": product.get("sku"),
                "product_name": product.get("name"),
            })

        total_amount = round(total_amount, 2)

        # 4. Insert Purchase document
        purchase_doc = {
            "supplier_id": request.supplier_id,
            "items": purchase_items_data,
            "total_amount": total_amount,
            "order_date": order_date,
            "expected_delivery_date": request.expected_delivery_date,
            "status": request.status,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.purchases.insert_one(purchase_doc)
        purchase_id_str = str(result.inserted_id)

        # 5. If status is 'received', automatically increase stock and record stock movements
        if request.status == "received":
            for item in purchase_items_data:
                pid = item["product_id"]
                qty = item["quantity"]
                p_obj_id = ObjectId(pid)

                p_current = await db.products.find_one({"_id": p_obj_id})
                prev_stock = int(p_current.get("current_stock", 0))
                new_stock = prev_stock + qty

                await db.products.update_one(
                    {"_id": p_obj_id},
                    {"$set": {"current_stock": new_stock, "updated_at": now}},
                )

                movement_doc = {
                    "product_id": pid,
                    "movement_type": "PURCHASE",
                    "quantity": qty,
                    "previous_stock": prev_stock,
                    "new_stock": new_stock,
                    "reference_id": purchase_id_str,
                    "notes": f"Purchase receipt PO ({purchase_id_str[:8]})",
                    "created_at": now,
                }
                await db.stock_movements.insert_one(movement_doc)

        return PurchaseResponse(
            id=purchase_id_str,
            supplier_id=request.supplier_id,
            supplier_name=supplier.get("name"),
            items=[
                PurchaseItemResponse(
                    product_id=it["product_id"],
                    product_sku=it["product_sku"],
                    product_name=it["product_name"],
                    quantity=it["quantity"],
                    unit_cost=it["unit_cost"],
                    total_cost=it["total_cost"],
                )
                for it in purchase_items_data
            ],
            total_amount=total_amount,
            order_date=order_date,
            expected_delivery_date=request.expected_delivery_date,
            status=request.status,
            created_at=now,
        )

    @staticmethod
    async def list_purchases(
        db: AsyncIOMotorDatabase,
        page: int = 1,
        page_size: int = 20,
        supplier_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> PaginatedPurchasesResponse:
        filter_query: dict = {}
        if supplier_id:
            filter_query["supplier_id"] = supplier_id
        if status:
            filter_query["status"] = status

        total = await db.purchases.count_documents(filter_query)
        total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1
        skip = (page - 1) * page_size

        cursor = db.purchases.find(filter_query).sort("order_date", -1).skip(skip).limit(page_size)
        purchase_docs = await cursor.to_list(length=page_size)

        # Batch load suppliers and products for enrichment
        supplier_ids = [ObjectId(p["supplier_id"]) for p in purchase_docs if ObjectId.is_valid(p.get("supplier_id", ""))]
        supp_cursor = db.suppliers.find({"_id": {"$in": supplier_ids}}, {"_id": 1, "name": 1})
        supps = await supp_cursor.to_list(length=len(supplier_ids))
        supp_map = {str(s["_id"]): s["name"] for s in supps}

        all_pids = set()
        for doc in purchase_docs:
            for item in doc.get("items", []):
                all_pids.add(str(item.get("product_id", "")))

        valid_obj_ids = [ObjectId(pid) for pid in all_pids if ObjectId.is_valid(pid)]
        prod_cursor = db.products.find({"_id": {"$in": valid_obj_ids}}, {"_id": 1, "sku": 1, "name": 1})
        prods = await prod_cursor.to_list(length=len(valid_obj_ids))
        prod_map = {str(p["_id"]): p for p in prods}

        items = []
        for p in purchase_docs:
            s_id = str(p.get("supplier_id", ""))
            line_items = [
                PurchaseItemResponse(
                    product_id=str(it.get("product_id", "")),
                    product_sku=it.get("product_sku") or prod_map.get(str(it.get("product_id", "")), {}).get("sku"),
                    product_name=it.get("product_name") or prod_map.get(str(it.get("product_id", "")), {}).get("name"),
                    quantity=it["quantity"],
                    unit_cost=float(it["unit_cost"]),
                    total_cost=float(it["total_cost"]),
                )
                for it in p.get("items", [])
            ]

            items.append(
                PurchaseResponse(
                    id=str(p["_id"]),
                    supplier_id=s_id,
                    supplier_name=supp_map.get(s_id),
                    items=line_items,
                    total_amount=float(p.get("total_amount", 0.0)),
                    order_date=p.get("order_date", datetime.now(timezone.utc)),
                    expected_delivery_date=p.get("expected_delivery_date"),
                    status=p.get("status", "received"),
                    created_at=p.get("created_at", datetime.now(timezone.utc)),
                )
            )

        return PaginatedPurchasesResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    @staticmethod
    async def get_purchase(db: AsyncIOMotorDatabase, purchase_id: str) -> PurchaseResponse:
        if not ObjectId.is_valid(purchase_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase not found.")

        doc = await db.purchases.find_one({"_id": ObjectId(purchase_id)})
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase not found.")

        supp_name = None
        s_id = str(doc.get("supplier_id", ""))
        if ObjectId.is_valid(s_id):
            supp = await db.suppliers.find_one({"_id": ObjectId(s_id)})
            if supp:
                supp_name = supp.get("name")

        item_pids = [ObjectId(str(it.get("product_id", ""))) for it in doc.get("items", []) if ObjectId.is_valid(str(it.get("product_id", "")))]
        prod_cursor = db.products.find({"_id": {"$in": item_pids}}, {"_id": 1, "sku": 1, "name": 1})
        prods = await prod_cursor.to_list(length=len(item_pids))
        prod_map = {str(p["_id"]): p for p in prods}

        line_items = [
            PurchaseItemResponse(
                product_id=str(it.get("product_id", "")),
                product_sku=it.get("product_sku") or prod_map.get(str(it.get("product_id", "")), {}).get("sku"),
                product_name=it.get("product_name") or prod_map.get(str(it.get("product_id", "")), {}).get("name"),
                quantity=it["quantity"],
                unit_cost=float(it["unit_cost"]),
                total_cost=float(it["total_cost"]),
            )
            for it in doc.get("items", [])
        ]

        return PurchaseResponse(
            id=str(doc["_id"]),
            supplier_id=s_id,
            supplier_name=supp_name,
            items=line_items,
            total_amount=float(doc.get("total_amount", 0.0)),
            order_date=doc.get("order_date", datetime.now(timezone.utc)),
            expected_delivery_date=doc.get("expected_delivery_date"),
            status=doc.get("status", "received"),
            created_at=doc.get("created_at", datetime.now(timezone.utc)),
        )


purchase_service = PurchaseService()
