import math
from datetime import datetime, timezone
from typing import Dict, List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import OperationFailure
from app.schemas.sale import (
    SaleCreate,
    SaleResponse,
    SaleItemResponse,
    PaginatedSalesResponse,
)


class SaleService:
    """Service layer managing sales transactions, inventory deductions, and consistency guarantees."""

    @staticmethod
    async def create_sale(db: AsyncIOMotorDatabase, request: SaleCreate) -> SaleResponse:
        now = request.sale_date or datetime.now(timezone.utc)

        # 1. Pre-fetch and validate all requested products
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

        # 2. Check stock sufficiency across all items before applying any changes
        demand_per_product: Dict[str, int] = {}
        for item in request.items:
            demand_per_product[item.product_id] = demand_per_product.get(item.product_id, 0) + item.quantity

        for pid, requested_qty in demand_per_product.items():
            product = prod_map[pid]
            current_stock = int(product.get("current_stock", 0))
            if current_stock < requested_qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Insufficient stock for '{product.get('name')}' ({product.get('sku')}): "
                        f"Requested {requested_qty}, but only {current_stock} currently available."
                    ),
                )

        # 3. Calculate line totals and construct line items
        sale_items_data = []
        total_amount = 0.0

        for item in request.items:
            product = prod_map[item.product_id]
            price = item.unit_price if item.unit_price is not None else float(product.get("selling_price", 0.0))
            line_total = round(item.quantity * price, 2)
            total_amount += line_total

            sale_items_data.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": price,
                "total_price": line_total,
                "product_sku": product.get("sku"),
                "product_name": product.get("name"),
            })

        total_amount = round(total_amount, 2)

        # 4. Atomic execution using MongoDB multi-document transactions when supported,
        # with automated compensation rollback fallback for standalone dev environments.
        can_use_transactions = True
        try:
            async with await db.client.start_session() as session:
                async with session.start_transaction():
                    # A. Insert Sale record
                    sale_doc = {
                        "items": sale_items_data,
                        "total_amount": total_amount,
                        "sale_date": now,
                        "notes": request.notes.strip() if request.notes else None,
                        "created_at": now,
                    }
                    sale_result = await db.sales.insert_one(sale_doc, session=session)
                    sale_id_str = str(sale_result.inserted_id)
                    sale_doc["_id"] = sale_result.inserted_id

                    # B. Decrement stock for each product & log stock movement
                    for item_data in sale_items_data:
                        pid = item_data["product_id"]
                        qty = item_data["quantity"]
                        p_obj_id = ObjectId(pid)

                        # Fetch latest state inside session
                        p_current = await db.products.find_one({"_id": p_obj_id}, session=session)
                        prev_stock = int(p_current.get("current_stock", 0))
                        new_stock = prev_stock - qty

                        # Update product
                        await db.products.update_one(
                            {"_id": p_obj_id},
                            {"$set": {"current_stock": new_stock, "updated_at": now}},
                            session=session,
                        )

                        # Log stock movement
                        movement_doc = {
                            "product_id": pid,
                            "movement_type": "SALE",
                            "quantity": -qty,
                            "previous_stock": prev_stock,
                            "new_stock": new_stock,
                            "reference_id": sale_id_str,
                            "notes": f"Sale order transaction ({sale_id_str[:8]})",
                            "created_at": now,
                        }
                        await db.stock_movements.insert_one(movement_doc, session=session)

                    return SaleResponse(
                        id=sale_id_str,
                        items=[
                            SaleItemResponse(
                                product_id=it["product_id"],
                                product_sku=it["product_sku"],
                                product_name=it["product_name"],
                                quantity=it["quantity"],
                                unit_price=it["unit_price"],
                                total_price=it["total_price"],
                            )
                            for it in sale_items_data
                        ],
                        total_amount=total_amount,
                        sale_date=now,
                        notes=sale_doc.get("notes"),
                        created_at=now,
                    )
        except OperationFailure as op_err:
            # If transactions aren't supported by the connection mode, execute with linear compensation
            can_use_transactions = False

        if not can_use_transactions:
            # Linear atomic compensation pattern
            sale_doc = {
                "items": sale_items_data,
                "total_amount": total_amount,
                "sale_date": now,
                "notes": request.notes.strip() if request.notes else None,
                "created_at": now,
            }
            sale_result = await db.sales.insert_one(sale_doc)
            sale_id_str = str(sale_result.inserted_id)

            mutated_products = []
            try:
                for item_data in sale_items_data:
                    pid = item_data["product_id"]
                    qty = item_data["quantity"]
                    p_obj_id = ObjectId(pid)

                    p_current = await db.products.find_one({"_id": p_obj_id})
                    prev_stock = int(p_current.get("current_stock", 0))
                    new_stock = prev_stock - qty

                    await db.products.update_one(
                        {"_id": p_obj_id},
                        {"$set": {"current_stock": new_stock, "updated_at": now}},
                    )
                    mutated_products.append((p_obj_id, prev_stock))

                    movement_doc = {
                        "product_id": pid,
                        "movement_type": "SALE",
                        "quantity": -qty,
                        "previous_stock": prev_stock,
                        "new_stock": new_stock,
                        "reference_id": sale_id_str,
                        "notes": f"Sale order transaction ({sale_id_str[:8]})",
                        "created_at": now,
                    }
                    await db.stock_movements.insert_one(movement_doc)
            except Exception as err:
                # Rollback previously mutated products
                for roll_pid, orig_stock in mutated_products:
                    await db.products.update_one({"_id": roll_pid}, {"$set": {"current_stock": orig_stock}})
                await db.sales.delete_one({"_id": sale_result.inserted_id})
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Sale processing failed and was rolled back: {err}",
                )

            return SaleResponse(
                id=sale_id_str,
                items=[
                    SaleItemResponse(
                        product_id=it["product_id"],
                        product_sku=it["product_sku"],
                        product_name=it["product_name"],
                        quantity=it["quantity"],
                        unit_price=it["unit_price"],
                        total_price=it["total_price"],
                    )
                    for it in sale_items_data
                ],
                total_amount=total_amount,
                sale_date=now,
                notes=sale_doc.get("notes"),
                created_at=now,
            )

    @staticmethod
    async def list_sales(
        db: AsyncIOMotorDatabase,
        page: int = 1,
        page_size: int = 20,
        product_id: Optional[str] = None,
    ) -> PaginatedSalesResponse:
        filter_query: dict = {}
        if product_id:
            filter_query["items.product_id"] = product_id

        total = await db.sales.count_documents(filter_query)
        total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1
        skip = (page - 1) * page_size

        cursor = db.sales.find(filter_query).sort("sale_date", -1).skip(skip).limit(page_size)
        sale_docs = await cursor.to_list(length=page_size)

        # Batch load product metadata for line item enrichment
        all_product_ids = set()
        for doc in sale_docs:
            for item in doc.get("items", []):
                all_product_ids.add(item["product_id"])

        valid_obj_ids = [ObjectId(pid) for pid in all_product_ids if ObjectId.is_valid(pid)]
        prod_cursor = db.products.find({"_id": {"$in": valid_obj_ids}}, {"_id": 1, "sku": 1, "name": 1})
        prods = await prod_cursor.to_list(length=len(valid_obj_ids))
        prod_map = {str(p["_id"]): p for p in prods}

        items = []
        for s in sale_docs:
            line_items = []
            for it in s.get("items", []):
                meta = prod_map.get(it["product_id"], {})
                line_items.append(
                    SaleItemResponse(
                        product_id=it["product_id"],
                        product_sku=it.get("product_sku") or meta.get("sku"),
                        product_name=it.get("product_name") or meta.get("name"),
                        quantity=it["quantity"],
                        unit_price=float(it["unit_price"]),
                        total_price=float(it["total_price"]),
                    )
                )

            items.append(
                SaleResponse(
                    id=str(s["_id"]),
                    items=line_items,
                    total_amount=float(s.get("total_amount", 0.0)),
                    sale_date=s.get("sale_date", datetime.now(timezone.utc)),
                    notes=s.get("notes"),
                    created_at=s.get("created_at", datetime.now(timezone.utc)),
                )
            )

        return PaginatedSalesResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    @staticmethod
    async def get_sale(db: AsyncIOMotorDatabase, sale_id: str) -> SaleResponse:
        if not ObjectId.is_valid(sale_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found.")

        doc = await db.sales.find_one({"_id": ObjectId(sale_id)})
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found.")

        item_pids = [ObjectId(it["product_id"]) for it in doc.get("items", []) if ObjectId.is_valid(it["product_id"])]
        prod_cursor = db.products.find({"_id": {"$in": item_pids}}, {"_id": 1, "sku": 1, "name": 1})
        prods = await prod_cursor.to_list(length=len(item_pids))
        prod_map = {str(p["_id"]): p for p in prods}

        line_items = [
            SaleItemResponse(
                product_id=it["product_id"],
                product_sku=it.get("product_sku") or prod_map.get(it["product_id"], {}).get("sku"),
                product_name=it.get("product_name") or prod_map.get(it["product_id"], {}).get("name"),
                quantity=it["quantity"],
                unit_price=float(it["unit_price"]),
                total_price=float(it["total_price"]),
            )
            for it in doc.get("items", [])
        ]

        return SaleResponse(
            id=str(doc["_id"]),
            items=line_items,
            total_amount=float(doc.get("total_amount", 0.0)),
            sale_date=doc.get("sale_date", datetime.now(timezone.utc)),
            notes=doc.get("notes"),
            created_at=doc.get("created_at", datetime.now(timezone.utc)),
        )


sale_service = SaleService()
