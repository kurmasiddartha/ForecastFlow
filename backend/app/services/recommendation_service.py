import logging
import math
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.recommendation import (
    ConvertToPurchaseResponse,
    FormulaBreakdown,
    RecommendationGenerateRequest,
    RecommendationListResponse,
    RecommendationResponse,
    RecommendationStatus,
    RecommendationSummary,
    RecommendationUrgency,
)

logger = logging.getLogger("forecastflow.recommendations")


def _safe_formula_breakdown(data: Optional[dict]) -> Optional[FormulaBreakdown]:
    """Safely instantiates FormulaBreakdown from a MongoDB dictionary, falling back if malformed."""
    if not data or not isinstance(data, dict):
        return None
    try:
        return FormulaBreakdown(**data)
    except Exception:
        return FormulaBreakdown(
            forecast_demand=float(data.get("forecast_demand") or data.get("lead_time_demand") or 0.0),
            safety_stock=int(data.get("safety_stock") or data.get("safety_buffer") or 0),
            gross_target=float(data.get("gross_target") or 0.0),
            current_stock=int(data.get("current_stock") or 0),
            incoming_stock=int(data.get("incoming_stock") or data.get("incoming_po_stock") or 0),
            total_available=int(data.get("total_available") or 0),
            net_shortfall=float(data.get("net_shortfall") or 0.0),
            recommended_order=int(data.get("recommended_order") or data.get("calculated_need") or 0),
            formula_text=str(data.get("formula_text") or data.get("explanation") or ""),
        )


class RecommendationService:
    """Service layer delivering transparent, formula-driven restock recommendations."""

    @staticmethod
    def _ensure_utc(dt: Optional[datetime]) -> datetime:
        if dt is None:
            return datetime.now(timezone.utc)
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)

    async def _fetch_incoming_stock_map(self, db: AsyncIOMotorDatabase) -> Dict[str, int]:
        """Calculates total incoming units across all open purchase orders (status='ordered')."""
        pipeline = [
            {"$match": {"status": "ordered"}},
            {"$unwind": "$items"},
            {
                "$group": {
                    "_id": "$items.product_id",
                    "total_incoming": {"$sum": "$items.quantity"},
                }
            },
        ]
        results = await db.purchases.aggregate(pipeline).to_list(length=5000)
        return {str(r["_id"]): int(r.get("total_incoming", 0)) for r in results}

    async def _fetch_latest_forecasts_map(
        self, db: AsyncIOMotorDatabase
    ) -> Dict[str, Dict[str, Any]]:
        """Fetches the most recent demand forecast per product."""
        pipeline = [
            {"$sort": {"generated_timestamp": -1, "created_at": -1}},
            {
                "$group": {
                    "_id": "$product_id",
                    "latest_doc": {"$first": "$$ROOT"},
                }
            },
        ]
        results = await db.forecasts.aggregate(pipeline).to_list(length=5000)
        forecast_map = {}
        for r in results:
            p_id = str(r["_id"])
            doc = r.get("latest_doc", {})
            forecast_map[p_id] = {
                "forecast_id": doc.get("_id"),
                "predictions": doc.get("predictions", []),
                "horizon_days": doc.get("horizon_days", 7),
                "model_used": doc.get("model_used", "Auto"),
            }
        return forecast_map

    async def _fetch_recent_sales_velocity_map(
        self, db: AsyncIOMotorDatabase, days: int = 30
    ) -> Dict[str, float]:
        """Calculates historical daily velocity as fallback when no forecast model is present."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        pipeline = [
            {"$match": {"sale_date": {"$gte": cutoff}}},
            {"$unwind": "$items"},
            {
                "$group": {
                    "_id": "$items.product_id",
                    "units_sold": {"$sum": "$items.quantity"},
                }
            },
        ]
        results = await db.sales.aggregate(pipeline).to_list(length=5000)
        return {str(r["_id"]): round(float(r.get("units_sold", 0)) / float(days), 2) for r in results}

    async def generate_recommendations(
        self,
        db: AsyncIOMotorDatabase,
        request: Optional[RecommendationGenerateRequest] = None,
    ) -> List[RecommendationResponse]:
        """Calculates rule-based restocking recommendations using demand forecasts and inventory state."""
        req = request or RecommendationGenerateRequest()
        now = datetime.now(timezone.utc)

        # 1. Fetch reference maps
        incoming_map = await self._fetch_incoming_stock_map(db)
        forecasts_map = await self._fetch_latest_forecasts_map(db)
        velocity_map = await self._fetch_recent_sales_velocity_map(db, days=30)

        # Fetch Category and Supplier metadata
        cats_list = await db.categories.find({}).to_list(length=1000)
        cat_map = {str(c["_id"]): c.get("name", "Category") for c in cats_list}

        supp_list = await db.suppliers.find({}).to_list(length=1000)
        supp_map = {str(s["_id"]): s for s in supp_list}

        # 2. Query target products
        query: Dict[str, Any] = {"is_active": {"$ne": False}}
        if req.product_id:
            if not ObjectId.is_valid(req.product_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid product ID: '{req.product_id}'",
                )
            query["_id"] = ObjectId(req.product_id)

        products = await db.products.find(query).to_list(length=2000)

        recommendations: List[RecommendationResponse] = []

        for p in products:
            p_id = str(p["_id"])
            p_name = p.get("name", "Product")
            p_sku = p.get("sku", "SKU")
            c_id = str(p.get("category_id")) if p.get("category_id") else None
            s_id = str(p.get("supplier_id")) if p.get("supplier_id") else None

            supplier = supp_map.get(s_id) if s_id else None
            lead_time = int(supplier.get("lead_time_days", 7)) if supplier else 7
            supp_name = supplier.get("name", "Default Supplier") if supplier else "Unassigned Supplier"

            # Inventory Variables
            current_stock = int(p.get("current_stock", 0))
            incoming_stock = incoming_map.get(p_id, 0)
            total_available = current_stock + incoming_stock

            reorder_level = int(p.get("reorder_point", 10))
            safety_stock = int(p.get("safety_stock", max(5, int(reorder_level * 0.5))))
            cost_price = float(p.get("cost_price", 0.0))

            # Total planning horizon = supplier lead time + review cycle
            planning_window_days = lead_time + req.planning_horizon_days

            # Demand Projection
            fc_data = forecasts_map.get(p_id)
            forecast_id_obj = fc_data.get("forecast_id") if fc_data else None
            forecast_id_str = str(forecast_id_obj) if forecast_id_obj else None

            forecast_demand = 0.0
            if fc_data and fc_data.get("predictions"):
                preds = fc_data["predictions"]
                daily_avg = sum(pt.get("predicted_demand", 0.0) for pt in preds) / max(1, len(preds))
                if len(preds) >= planning_window_days:
                    forecast_demand = sum(preds[i].get("predicted_demand", 0.0) for i in range(planning_window_days))
                else:
                    forecast_demand = daily_avg * planning_window_days
            else:
                # Fallback to historical velocity
                vel = velocity_map.get(p_id, 0.0)
                forecast_demand = vel * planning_window_days

            forecast_demand = round(max(0.0, float(forecast_demand)), 1)
            effective_daily = forecast_demand / max(1, planning_window_days)

            # -------------------------------------------------------------
            # Transparent Mathematical Formula:
            # Gross Requirement = Forecast Demand + Safety Stock
            # Available Pipeline = Current Stock + Incoming Stock
            # Recommended Purchase = max(0, ceil(Gross Requirement - Available Pipeline))
            # -------------------------------------------------------------
            gross_target = round(forecast_demand + safety_stock, 1)
            net_shortfall = round(gross_target - total_available, 1)
            recommended_qty = max(0, math.ceil(net_shortfall))
            estimated_cost = round(recommended_qty * cost_price, 2)

            # Determine Priority / Urgency & Risk Factors
            urgency: RecommendationUrgency = "low"
            risk_factors: List[str] = []

            lead_time_demand = round(effective_daily * lead_time, 1)
            current_runway = (
                round(current_stock / effective_daily, 1) if effective_daily > 0 else (0.0 if current_stock == 0 else 999.0)
            )

            if current_stock == 0 and incoming_stock == 0:
                urgency = "critical"
                risk_factors.append("Zero physical stock in warehouse")
                risk_factors.append("No open purchase orders in pipeline")
            elif current_runway <= 3.0 and incoming_stock == 0:
                urgency = "critical"
                risk_factors.append(f"Critical inventory runway ({current_runway}d supply remaining)")
                risk_factors.append("No open incoming shipment")
            elif total_available < lead_time_demand:
                urgency = "critical"
                risk_factors.append(f"Stockout unavoidable: pipeline ({total_available}u) < lead time demand ({lead_time_demand}u)")
            elif total_available <= reorder_level and recommended_qty > 0:
                urgency = "high"
                risk_factors.append(f"Available stock ({total_available}u) is at or below reorder threshold ({reorder_level}u)")
            elif effective_daily > 0 and (total_available / effective_daily) <= (lead_time + 3):
                urgency = "high"
                risk_factors.append(f"Runway will breach safety buffer before lead time window ({lead_time}d) completes")
            elif recommended_qty > 0:
                urgency = "medium"
                risk_factors.append("Projected demand will deplete inventory below target buffer during review period")
            else:
                urgency = "low"
                risk_factors.append("Inventory pipeline is currently sufficient")

            # Construct human-readable transparent explanation
            formula_text = (
                f"[Forecast Demand ({forecast_demand:.1f}u) + Safety Stock ({safety_stock}u)] "
                f"- [Current Stock ({current_stock}u) + Incoming Stock ({incoming_stock}u)] "
                f"= Recommended: {recommended_qty}u"
            )

            reason_lines = [
                f"Recommended order quantity of {recommended_qty} units computed for {p_name} ({p_sku}).",
                f"1. Gross Target: {forecast_demand:.1f} units projected demand over {planning_window_days}-day planning horizon + {safety_stock} units safety stock = {gross_target:.1f} units required.",
                f"2. Pipeline Inventory: {current_stock} units on hand + {incoming_stock} units on order = {total_available} units available.",
                f"3. Priority {urgency.upper()}: {'; '.join(risk_factors)}.",
            ]
            reason = " ".join(reason_lines)

            breakdown = FormulaBreakdown(
                forecast_demand=forecast_demand,
                safety_stock=safety_stock,
                gross_target=gross_target,
                current_stock=current_stock,
                incoming_stock=incoming_stock,
                total_available=total_available,
                net_shortfall=net_shortfall,
                recommended_order=recommended_qty,
                formula_text=formula_text,
            )

            rec_doc = {
                "product_id": ObjectId(p_id),
                "product_name": p_name,
                "product_sku": p_sku,
                "category_name": cat_map.get(c_id, "Uncategorized"),
                "supplier_id": ObjectId(s_id) if s_id else None,
                "supplier_name": supp_name,
                "forecast_id": forecast_id_obj,
                "suggested_order_quantity": recommended_qty,
                "urgency": urgency,
                "reason": reason,
                "status": "pending",
                "forecast_demand": forecast_demand,
                "current_stock": current_stock,
                "incoming_stock": incoming_stock,
                "safety_stock": safety_stock,
                "reorder_level": reorder_level,
                "lead_time_days": lead_time,
                "unit_cost": cost_price,
                "estimated_cost": estimated_cost,
                "formula_breakdown": breakdown.model_dump(),
                "risk_factors": risk_factors,
                "purchase_id": None,
                "created_at": now,
            }

            rec_id_str = str(ObjectId())

            # Save / update in database if requested and recommended_qty > 0 or single product requested
            if req.save and (recommended_qty > 0 or req.product_id):
                # Update existing pending recommendation or insert new
                existing = await db.recommendations.find_one(
                    {"product_id": ObjectId(p_id), "status": "pending"}
                )
                if existing:
                    await db.recommendations.update_one(
                        {"_id": existing["_id"]},
                        {"$set": {**rec_doc, "updated_at": now}},
                    )
                    rec_id_str = str(existing["_id"])
                else:
                    res = await db.recommendations.insert_one(rec_doc)
                    rec_id_str = str(res.inserted_id)

            rec_item = RecommendationResponse(
                id=rec_id_str,
                product_id=p_id,
                product_name=p_name,
                product_sku=p_sku,
                category_name=cat_map.get(c_id, "Uncategorized"),
                supplier_id=s_id,
                supplier_name=supp_name,
                forecast_id=forecast_id_str,
                suggested_order_quantity=recommended_qty,
                urgency=urgency,
                reason=reason,
                status="pending",
                forecast_demand=forecast_demand,
                current_stock=current_stock,
                incoming_stock=incoming_stock,
                safety_stock=safety_stock,
                reorder_level=reorder_level,
                lead_time_days=lead_time,
                unit_cost=cost_price,
                estimated_cost=estimated_cost,
                formula_breakdown=breakdown,
                risk_factors=risk_factors,
                purchase_id=None,
                created_at=now,
            )

            # Include if order is needed or single item request
            if recommended_qty > 0 or req.product_id:
                recommendations.append(rec_item)

        # Sort recommendations by urgency: critical -> high -> medium -> low
        urgency_ranks = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        recommendations.sort(key=lambda r: (urgency_ranks.get(r.urgency, 4), -r.estimated_cost))

        return recommendations

    async def get_recommendations_list(
        self,
        db: AsyncIOMotorDatabase,
        status_filter: Optional[str] = "pending",
        urgency_filter: Optional[str] = None,
        category_id: Optional[str] = None,
        supplier_id: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 25,
    ) -> RecommendationListResponse:
        """Retrieves paginated recommendations with executive summary."""
        # 1. Build query
        query: Dict[str, Any] = {}
        if status_filter and status_filter.upper() != "ALL":
            query["status"] = status_filter.lower()
        if urgency_filter and urgency_filter.upper() != "ALL":
            query["urgency"] = urgency_filter.lower()
        if category_id and ObjectId.is_valid(category_id):
            query["category_id"] = ObjectId(category_id)
        if supplier_id and ObjectId.is_valid(supplier_id):
            query["supplier_id"] = ObjectId(supplier_id)
        if search:
            q = search.strip()
            query["$or"] = [
                {"product_name": {"$regex": q, "$options": "i"}},
                {"product_sku": {"$regex": q, "$options": "i"}},
                {"supplier_name": {"$regex": q, "$options": "i"}},
            ]

        # 2. Get total matching count & paginated items
        total_count = await db.recommendations.count_documents(query)
        total_pages = max(1, (total_count + limit - 1) // limit)
        skip = (page - 1) * limit

        cursor = (
            db.recommendations.find(query)
            .sort([("created_at", -1)])
            .skip(skip)
            .limit(limit)
        )
        docs = await cursor.to_list(length=limit)

        items: List[RecommendationResponse] = []
        for d in docs:
            breakdown_obj = _safe_formula_breakdown(d.get("formula_breakdown"))

            items.append(
                RecommendationResponse(
                    id=str(d["_id"]),
                    product_id=str(d.get("product_id") or d["_id"]),
                    product_name=d.get("product_name") or "Product",
                    product_sku=d.get("product_sku") or d.get("sku") or "SKU",
                    category_name=d.get("category_name"),
                    supplier_id=str(d["supplier_id"]) if d.get("supplier_id") else None,
                    supplier_name=d.get("supplier_name"),
                    forecast_id=str(d["forecast_id"]) if d.get("forecast_id") else None,
                    suggested_order_quantity=int(d.get("suggested_order_quantity") or 0),
                    urgency=str(d.get("urgency") or "medium").lower(),
                    reason=str(d.get("reason") or "Restock recommended to maintain inventory buffer."),
                    status=str(d.get("status") or "pending").lower(),
                    forecast_demand=float(d.get("forecast_demand") or 0.0),
                    current_stock=int(d.get("current_stock") or 0),
                    incoming_stock=int(d.get("incoming_stock") or 0),
                    safety_stock=int(d.get("safety_stock") or 0),
                    reorder_level=int(d.get("reorder_level") or 0),
                    lead_time_days=int(d.get("lead_time_days") or 7),
                    unit_cost=float(d.get("unit_cost") or 0.0),
                    estimated_cost=float(d.get("estimated_cost") or 0.0),
                    formula_breakdown=breakdown_obj,
                    risk_factors=d.get("risk_factors") or [],
                    purchase_id=str(d["purchase_id"]) if d.get("purchase_id") else None,
                    created_at=d.get("created_at") or datetime.now(timezone.utc),
                )
            )

        # 3. Compute Summary Statistics across all recommendations
        all_docs = await db.recommendations.find({}).to_list(length=5000)
        summary = RecommendationSummary(
            total_recommendations=len(all_docs),
            pending_count=sum(1 for d in all_docs if d.get("status") == "pending"),
            critical_count=sum(1 for d in all_docs if d.get("urgency") == "critical" and d.get("status") == "pending"),
            high_count=sum(1 for d in all_docs if d.get("urgency") == "high" and d.get("status") == "pending"),
            medium_count=sum(1 for d in all_docs if d.get("urgency") == "medium" and d.get("status") == "pending"),
            low_count=sum(1 for d in all_docs if d.get("urgency") == "low" and d.get("status") == "pending"),
            total_recommended_units=sum(d.get("suggested_order_quantity", 0) for d in all_docs if d.get("status") == "pending"),
            total_estimated_budget=round(
                sum(d.get("estimated_cost", 0.0) for d in all_docs if d.get("status") == "pending"), 2
            ),
            approved_count=sum(1 for d in all_docs if d.get("status") == "approved"),
            ordered_count=sum(1 for d in all_docs if d.get("status") == "ordered"),
            dismissed_count=sum(1 for d in all_docs if d.get("status") == "dismissed"),
        )

        return RecommendationListResponse(
            summary=summary,
            items=items,
            total=total_count,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )

    async def update_recommendation_status(
        self,
        db: AsyncIOMotorDatabase,
        recommendation_id: str,
        new_status: RecommendationStatus,
    ) -> RecommendationResponse:
        """Updates the lifecycle status of a restock recommendation."""
        if not ObjectId.is_valid(recommendation_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid recommendation ID: '{recommendation_id}'",
            )

        rec = await db.recommendations.find_one({"_id": ObjectId(recommendation_id)})
        if not rec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recommendation not found: '{recommendation_id}'",
            )

        now = datetime.now(timezone.utc)
        await db.recommendations.update_one(
            {"_id": ObjectId(recommendation_id)},
            {"$set": {"status": new_status, "updated_at": now}},
        )

        updated_rec = await db.recommendations.find_one({"_id": ObjectId(recommendation_id)})
        breakdown_obj = _safe_formula_breakdown(updated_rec.get("formula_breakdown"))

        return RecommendationResponse(
            id=str(updated_rec["_id"]),
            product_id=str(updated_rec.get("product_id") or updated_rec["_id"]),
            product_name=updated_rec.get("product_name") or "Product",
            product_sku=updated_rec.get("product_sku") or updated_rec.get("sku") or "SKU",
            category_name=updated_rec.get("category_name"),
            supplier_id=str(updated_rec["supplier_id"]) if updated_rec.get("supplier_id") else None,
            supplier_name=updated_rec.get("supplier_name"),
            forecast_id=str(updated_rec["forecast_id"]) if updated_rec.get("forecast_id") else None,
            suggested_order_quantity=int(updated_rec.get("suggested_order_quantity") or 0),
            urgency=str(updated_rec.get("urgency") or "medium").lower(),
            reason=str(updated_rec.get("reason") or "Restock recommended to maintain inventory buffer."),
            status=str(updated_rec.get("status") or "pending").lower(),
            forecast_demand=float(updated_rec.get("forecast_demand") or 0.0),
            current_stock=int(updated_rec.get("current_stock") or 0),
            incoming_stock=int(updated_rec.get("incoming_stock") or 0),
            safety_stock=int(updated_rec.get("safety_stock") or 0),
            reorder_level=int(updated_rec.get("reorder_level") or 0),
            lead_time_days=int(updated_rec.get("lead_time_days") or 7),
            unit_cost=float(updated_rec.get("unit_cost") or 0.0),
            estimated_cost=float(updated_rec.get("estimated_cost") or 0.0),
            formula_breakdown=breakdown_obj,
            risk_factors=updated_rec.get("risk_factors") or [],
            purchase_id=str(updated_rec["purchase_id"]) if updated_rec.get("purchase_id") else None,
            created_at=updated_rec.get("created_at") or now,
        )

    async def convert_to_purchase_order(
        self,
        db: AsyncIOMotorDatabase,
        recommendation_id: str,
    ) -> ConvertToPurchaseResponse:
        """Converts an approved restock recommendation directly into an open Purchase Order."""
        if not ObjectId.is_valid(recommendation_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid recommendation ID: '{recommendation_id}'",
            )

        rec = await db.recommendations.find_one({"_id": ObjectId(recommendation_id)})
        if not rec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recommendation not found: '{recommendation_id}'",
            )

        if rec.get("status") == "ordered" and rec.get("purchase_id"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Recommendation has already been converted to Purchase Order '{rec['purchase_id']}'.",
            )

        qty = int(rec.get("suggested_order_quantity", 0))
        if qty <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot convert a recommendation with 0 suggested order quantity to a purchase order.",
            )

        prod_id = rec["product_id"]
        product = await db.products.find_one({"_id": prod_id})
        if not product:
            raise HTTPException(status_code=404, detail="Referenced product no longer exists.")

        supp_id = rec.get("supplier_id") or product.get("supplier_id")
        if not supp_id:
            # Fallback to any active supplier or create placeholder
            first_supp = await db.suppliers.find_one({})
            if first_supp:
                supp_id = first_supp["_id"]
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot create Purchase Order: No supplier associated with product.",
                )

        cost_p = float(rec.get("unit_cost") or product.get("cost_price", 0.0))
        total_amt = round(qty * cost_p, 2)
        lead_time = int(rec.get("lead_time_days", 7))
        now = datetime.now(timezone.utc)
        expected_delivery = now + timedelta(days=lead_time)

        # Create formal Purchase Order in 'purchases' collection
        purchase_doc = {
            "supplier_id": str(supp_id),
            "order_date": now,
            "expected_delivery_date": expected_delivery,
            "status": "ordered",
            "items": [
                {
                    "product_id": str(prod_id),
                    "product_sku": product.get("sku"),
                    "product_name": product.get("name"),
                    "quantity": qty,
                    "unit_cost": cost_p,
                    "total_cost": total_amt,
                }
            ],
            "total_amount": total_amt,
            "created_at": now,
            "updated_at": now,
        }
        res = await db.purchases.insert_one(purchase_doc)
        new_purchase_id = res.inserted_id

        # Update recommendation with status='ordered' and purchase_id reference
        await db.recommendations.update_one(
            {"_id": ObjectId(recommendation_id)},
            {
                "$set": {
                    "status": "ordered",
                    "purchase_id": new_purchase_id,
                    "updated_at": now,
                }
            },
        )

        logger.info(
            "Recommendation %s converted to Purchase Order %s for %d units of %s",
            recommendation_id,
            str(new_purchase_id),
            qty,
            rec.get("product_name"),
        )

        return ConvertToPurchaseResponse(
            purchase_id=str(new_purchase_id),
            recommendation_id=recommendation_id,
            product_name=rec.get("product_name", "Product"),
            quantity=qty,
            total_amount=total_amt,
            status="ordered",
            message=f"Successfully generated Purchase Order for {qty} units at ${total_amt:.2f}.",
        )


recommendation_service = RecommendationService()
