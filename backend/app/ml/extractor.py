from datetime import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class SalesDataExtractor:
    """Extracts raw historical sales line-item transactions from MongoDB."""

    @staticmethod
    async def extract_sales_records(
        db: AsyncIOMotorDatabase,
        product_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Extract historical sales transactions for a single product or the entire catalog."""
        match_query: Dict[str, Any] = {}

        if start_date and end_date:
            match_query["sale_date"] = {"$gte": start_date, "$lte": end_date}
        elif start_date:
            match_query["sale_date"] = {"$gte": start_date}
        elif end_date:
            match_query["sale_date"] = {"$lte": end_date}

        if product_id:
            match_query["items.product_id"] = str(product_id)

        pipeline = [
            {"$match": match_query},
            {"$unwind": "$items"},
        ]

        if product_id:
            pipeline.append({"$match": {"items.product_id": str(product_id)}})

        pipeline.append({
            "$project": {
                "sale_id": {"$toString": "$_id"},
                "sale_date": "$sale_date",
                "product_id": "$items.product_id",
                "product_sku": "$items.product_sku",
                "product_name": "$items.product_name",
                "quantity": "$items.quantity",
                "unit_price": "$items.unit_price",
                "total_price": "$items.total_price",
                "_id": 0,
            }
        })

        cursor = db.sales.aggregate(pipeline)
        records = await cursor.to_list(length=100000)

        # Batch fill product metadata if SKU or name are missing
        missing_pids = {r["product_id"] for r in records if not r.get("product_name") or not r.get("product_sku")}
        valid_obj_ids = [ObjectId(pid) for pid in missing_pids if ObjectId.is_valid(pid)]

        if valid_obj_ids:
            prod_cursor = db.products.find({"_id": {"$in": valid_obj_ids}}, {"_id": 1, "sku": 1, "name": 1})
            prod_docs = await prod_cursor.to_list(length=len(valid_obj_ids))
            lookup = {str(p["_id"]): p for p in prod_docs}

            for r in records:
                if r["product_id"] in lookup:
                    p = lookup[r["product_id"]]
                    r["product_sku"] = r.get("product_sku") or p.get("sku")
                    r["product_name"] = r.get("product_name") or p.get("name")

        return records


sales_extractor = SalesDataExtractor()
