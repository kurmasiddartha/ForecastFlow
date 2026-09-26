import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
import pandas as pd

from app.schemas.intelligence import (
    IntelligenceListResponse,
    IntelligenceSummary,
    InventoryIntelligenceConfig,
    ProductIntelligenceItem,
    RiskLevel,
    VelocityCategory,
)

logger = logging.getLogger("forecastflow.intelligence")


class InventoryIntelligenceService:
    """Service layer delivering analytical inventory intelligence without unnecessary ML overhead."""

    @staticmethod
    def _ensure_utc(dt: Optional[datetime]) -> datetime:
        if dt is None:
            return datetime.now(timezone.utc)
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)

    async def _fetch_categories_and_suppliers_map(
        self, db: AsyncIOMotorDatabase
    ) -> Tuple[Dict[str, str], Dict[str, str]]:
        """Constructs ID to Name lookup dictionaries for categories and suppliers."""
        cats_cursor = db.categories.find({}, {"_id": 1, "name": 1})
        categories = await cats_cursor.to_list(length=1000)
        cat_map = {str(c["_id"]): c.get("name", "Category") for c in categories}

        supp_cursor = db.suppliers.find({}, {"_id": 1, "name": 1})
        suppliers = await supp_cursor.to_list(length=1000)
        supp_map = {str(s["_id"]): s.get("name", "Supplier") for s in suppliers}

        return cat_map, supp_map

    async def _fetch_window_sales_data(
        self,
        db: AsyncIOMotorDatabase,
        window_start: datetime,
    ) -> Dict[str, Dict[str, Any]]:
        """Aggregates sales volume, transaction count, and recent sale dates in the analysis window."""
        pipeline = [
            {"$match": {"sale_date": {"$gte": window_start}}},
            {"$unwind": "$items"},
            {
                "$group": {
                    "_id": "$items.product_id",
                    "total_units": {"$sum": "$items.quantity"},
                    "order_count": {"$sum": 1},
                    "last_sale_date": {"$max": "$sale_date"},
                }
            },
        ]
        results = await db.sales.aggregate(pipeline).to_list(length=5000)
        sales_map = {}
        for r in results:
            p_id = str(r["_id"])
            sales_map[p_id] = {
                "total_units": r.get("total_units", 0),
                "order_count": r.get("order_count", 0),
                "last_sale_date": r.get("last_sale_date"),
            }
        return sales_map

    async def _fetch_all_time_last_sale_dates(
        self, db: AsyncIOMotorDatabase
    ) -> Dict[str, datetime]:
        """Fetches the all-time most recent sale timestamp per product for dead-stock analysis."""
        pipeline = [
            {"$unwind": "$items"},
            {
                "$group": {
                    "_id": "$items.product_id",
                    "last_sale_date": {"$max": "$sale_date"},
                }
            },
        ]
        results = await db.sales.aggregate(pipeline).to_list(length=5000)
        return {str(r["_id"]): r["last_sale_date"] for r in results if r.get("last_sale_date")}

    async def _fetch_latest_forecasts_map(
        self, db: AsyncIOMotorDatabase
    ) -> Dict[str, Dict[str, Any]]:
        """Fetches the latest forecasted daily demand per product if available."""
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
            preds = doc.get("predictions", [])
            if preds:
                avg_daily = float(sum(p.get("predicted_demand", 0.0) for p in preds) / len(preds))
                forecast_map[p_id] = {
                    "forecast_daily_demand": round(avg_daily, 2),
                    "forecast_horizon": doc.get("horizon_days", len(preds)),
                    "model_used": doc.get("model_used"),
                }
        return forecast_map

    async def compute_intelligence_metrics(
        self,
        db: AsyncIOMotorDatabase,
        config: Optional[InventoryIntelligenceConfig] = None,
        category_id: Optional[str] = None,
    ) -> Tuple[List[ProductIntelligenceItem], IntelligenceSummary]:
        """Evaluates all active products against the configurable business rules."""
        cfg = config or InventoryIntelligenceConfig()
        now = datetime.now(timezone.utc)
        window_start = now - timedelta(days=cfg.analysis_window_days)

        # 1. Fetch reference maps
        cat_map, supp_map = await self._fetch_categories_and_suppliers_map(db)
        window_sales = await self._fetch_window_sales_data(db, window_start)
        all_time_sales = await self._fetch_all_time_last_sale_dates(db)
        forecasts = await self._fetch_latest_forecasts_map(db)

        # 2. Fetch active products
        query: Dict[str, Any] = {"is_active": {"$ne": False}}
        if category_id and ObjectId.is_valid(category_id):
            query["category_id"] = ObjectId(category_id)

        products_cursor = db.products.find(query)
        products = await products_cursor.to_list(length=5000)

        items: List[ProductIntelligenceItem] = []

        total_units = 0
        total_valuation = 0.0

        fast_moving_count = 0
        normal_moving_count = 0
        slow_moving_count = 0
        dead_stock_count = 0
        out_of_stock_count = 0

        dead_stock_capital_total = 0.0
        stockout_risk_count = 0
        critical_stockout_count = 0
        potential_revenue_at_risk_total = 0.0
        overstock_risk_count = 0
        excess_capital_total = 0.0

        runway_days_list = []

        for p in products:
            p_id = str(p["_id"])
            p_name = p.get("name", "Product")
            p_sku = p.get("sku", "SKU")
            c_id = str(p.get("category_id")) if p.get("category_id") else None
            s_id = str(p.get("supplier_id")) if p.get("supplier_id") else None

            stock = int(p.get("current_stock", 0))
            cost_p = float(p.get("cost_price", 0.0))
            sell_p = float(p.get("selling_price", 0.0))
            reorder_p = int(p.get("reorder_point", 10))
            target_stock = int(p.get("target_stock_level") or max(reorder_p * 3, 30))
            safety_stock = int(p.get("safety_stock", 10))

            inventory_value = round(stock * cost_p, 2)
            total_units += stock
            total_valuation += inventory_value

            # Sales velocity calculations
            sale_info = window_sales.get(p_id, {})
            sales_in_win = int(sale_info.get("total_units", 0))
            orders_in_win = int(sale_info.get("order_count", 0))
            daily_velocity = round(sales_in_win / float(cfg.analysis_window_days), 2)

            # Last sale determination
            last_sale = sale_info.get("last_sale_date") or all_time_sales.get(p_id)
            days_since_sale = None
            if last_sale:
                last_sale_utc = self._ensure_utc(last_sale)
                days_since_sale = max(0, (now - last_sale_utc).days)

            # Forecast integration
            fc_info = forecasts.get(p_id)
            fc_daily = fc_info.get("forecast_daily_demand") if fc_info else None
            fc_horizon = fc_info.get("forecast_horizon") if fc_info else None

            # Effective demand preference: ML forecast when present > 0, else sales velocity
            if fc_daily is not None and fc_daily > 0:
                effective_daily = fc_daily
            else:
                effective_daily = daily_velocity

            # Runway (Days of Inventory Remaining)
            if stock == 0:
                runway = 0.0
                runway_status = "CRITICAL"
            elif effective_daily > 0:
                runway = round(stock / effective_daily, 1)
                runway_days_list.append(runway)
                if runway <= cfg.stockout_risk_days:
                    runway_status = "LOW"
                elif runway >= cfg.overstock_days:
                    runway_status = "EXCESS"
                else:
                    runway_status = "HEALTHY"
            else:
                runway = 999.0
                runway_status = "INFINITE"

            # ---------------------------------------------------------
            # 1. Velocity Categorization
            # ---------------------------------------------------------
            is_dead_stock = False
            dead_stock_cap = 0.0

            if stock == 0 and daily_velocity == 0:
                vel_cat: VelocityCategory = "OUT_OF_STOCK"
                vel_label = "Out of Stock"
                out_of_stock_count += 1
            elif (
                stock > 0
                and sales_in_win == 0
                and (days_since_sale is None or days_since_sale >= cfg.dead_stock_days)
            ):
                vel_cat = "DEAD_STOCK"
                vel_label = "Dead Stock"
                is_dead_stock = True
                dead_stock_cap = inventory_value
                dead_stock_count += 1
                dead_stock_capital_total += dead_stock_cap
            elif daily_velocity >= cfg.fast_moving_daily_velocity:
                vel_cat = "FAST_MOVING"
                vel_label = "Fast Moving"
                fast_moving_count += 1
            elif daily_velocity < cfg.slow_moving_daily_velocity:
                vel_cat = "SLOW_MOVING"
                vel_label = "Slow Moving"
                slow_moving_count += 1
            else:
                vel_cat = "NORMAL"
                vel_label = "Normal Velocity"
                normal_moving_count += 1

            # ---------------------------------------------------------
            # 2. Stockout Risk Evaluation
            # ---------------------------------------------------------
            stockout_risk: RiskLevel = "NONE"
            stockout_reason = None
            shortfall_units = 0
            rev_at_risk = 0.0

            if stock == 0:
                stockout_risk = "CRITICAL"
                stockout_reason = "Physical inventory exhausted (0 units on hand)."
                shortfall_units = int(max(1.0, effective_daily) * cfg.stockout_risk_days)
                rev_at_risk = round(shortfall_units * sell_p, 2)
                critical_stockout_count += 1
                stockout_risk_count += 1
            elif effective_daily > 0 and runway <= 3.0:
                stockout_risk = "CRITICAL"
                stockout_reason = f"Imminent stockout: only {runway} days of inventory remaining (< 3 days)."
                shortfall_units = max(0, int(effective_daily * cfg.stockout_risk_days) - stock)
                rev_at_risk = round(shortfall_units * sell_p, 2)
                critical_stockout_count += 1
                stockout_risk_count += 1
            elif effective_daily > 0 and runway <= cfg.stockout_risk_days:
                stockout_risk = "HIGH"
                stockout_reason = f"Runway ({runway}d) is below recommended safety horizon ({cfg.stockout_risk_days}d)."
                shortfall_units = max(0, int(effective_daily * cfg.stockout_risk_days) - stock)
                rev_at_risk = round(shortfall_units * sell_p, 2)
                stockout_risk_count += 1
            elif stock <= reorder_p:
                stockout_risk = "MEDIUM"
                stockout_reason = f"Current stock ({stock}u) has breached reorder threshold ({reorder_p}u)."
                shortfall_units = max(0, reorder_p - stock)
                rev_at_risk = round(shortfall_units * sell_p, 2)
                stockout_risk_count += 1

            potential_revenue_at_risk_total += rev_at_risk

            # ---------------------------------------------------------
            # 3. Overstock Risk Evaluation
            # ---------------------------------------------------------
            overstock_risk: RiskLevel = "NONE"
            overstock_reason = None
            excess_units = 0
            excess_capital = 0.0

            if stock > target_stock and (runway >= cfg.overstock_days or runway == 999.0):
                overstock_risk = "HIGH"
                excess_units = stock - target_stock
                excess_capital = round(excess_units * cost_p, 2)
                overstock_reason = (
                    f"Stock ({stock}u) exceeds target ({target_stock}u) with "
                    f"{'infinite' if runway == 999.0 else f'{runway}d'} runway (> {cfg.overstock_days}d)."
                )
                overstock_risk_count += 1
                excess_capital_total += excess_capital
            elif stock > target_stock or (runway >= 60.0 and stock > reorder_p * 2):
                overstock_risk = "MEDIUM"
                excess_units = max(0, stock - target_stock)
                excess_capital = round(excess_units * cost_p, 2)
                overstock_reason = f"Stock level ({stock}u) exceeds optimal turnover thresholds."
                overstock_risk_count += 1
                excess_capital_total += excess_capital

            items.append(
                ProductIntelligenceItem(
                    product_id=p_id,
                    name=p_name,
                    sku=p_sku,
                    category_id=c_id,
                    category_name=cat_map.get(c_id, "Uncategorized"),
                    supplier_id=s_id,
                    supplier_name=supp_map.get(s_id, "Unknown"),
                    current_stock=stock,
                    reorder_level=reorder_p,
                    target_stock_level=target_stock,
                    safety_stock=safety_stock,
                    cost_price=cost_p,
                    selling_price=sell_p,
                    total_inventory_value=inventory_value,
                    sales_in_window=sales_in_win,
                    orders_in_window=orders_in_win,
                    daily_sales_velocity=daily_velocity,
                    last_sale_date=last_sale,
                    days_since_last_sale=days_since_sale,
                    forecast_daily_demand=fc_daily,
                    forecast_horizon=fc_horizon,
                    effective_daily_demand=effective_daily,
                    days_of_inventory_remaining=runway if runway != 999.0 else None,
                    runway_status=runway_status,
                    velocity_category=vel_cat,
                    velocity_label=vel_label,
                    stockout_risk=stockout_risk,
                    stockout_reason=stockout_reason,
                    projected_shortfall_units=shortfall_units,
                    revenue_at_risk=rev_at_risk,
                    overstock_risk=overstock_risk,
                    overstock_reason=overstock_reason,
                    excess_units=excess_units,
                    excess_capital_tied_up=excess_capital,
                    is_dead_stock=is_dead_stock,
                    dead_stock_capital=dead_stock_cap,
                )
            )

        total_prods = len(items)
        avg_runway = round(sum(runway_days_list) / len(runway_days_list), 1) if runway_days_list else 0.0

        summary = IntelligenceSummary(
            total_products_analyzed=total_prods,
            total_inventory_units=total_units,
            total_inventory_valuation=round(total_valuation, 2),
            fast_moving_count=fast_moving_count,
            fast_moving_percentage=round((fast_moving_count / max(1, total_prods)) * 100, 1),
            normal_moving_count=normal_moving_count,
            normal_moving_percentage=round((normal_moving_count / max(1, total_prods)) * 100, 1),
            slow_moving_count=slow_moving_count,
            slow_moving_percentage=round((slow_moving_count / max(1, total_prods)) * 100, 1),
            dead_stock_count=dead_stock_count,
            dead_stock_percentage=round((dead_stock_count / max(1, total_prods)) * 100, 1),
            out_of_stock_count=out_of_stock_count,
            dead_stock_capital_tied_up=round(dead_stock_capital_total, 2),
            stockout_risk_count=stockout_risk_count,
            critical_stockout_count=critical_stockout_count,
            potential_revenue_at_risk=round(potential_revenue_at_risk_total, 2),
            overstock_risk_count=overstock_risk_count,
            excess_capital_tied_up=round(excess_capital_total, 2),
            average_runway_days=avg_runway,
            config=cfg,
            evaluated_at=now,
        )

        return items, summary

    async def get_intelligence_overview(
        self,
        db: AsyncIOMotorDatabase,
        config: Optional[InventoryIntelligenceConfig] = None,
        category_id: Optional[str] = None,
        search: Optional[str] = None,
        velocity_filter: Optional[str] = None,
        risk_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 50,
        sort_by: str = "daily_sales_velocity",
        sort_desc: bool = True,
    ) -> IntelligenceListResponse:
        """Retrieves filtered, sorted, and paginated intelligence evaluations."""
        items, summary = await self.compute_intelligence_metrics(db, config, category_id)

        # Filtering
        filtered = items
        if search:
            q = search.lower()
            filtered = [
                i
                for i in filtered
                if q in i.name.lower() or q in i.sku.lower() or (i.category_name and q in i.category_name.lower())
            ]

        if velocity_filter and velocity_filter.upper() != "ALL":
            v_upper = velocity_filter.upper()
            filtered = [i for i in filtered if i.velocity_category == v_upper]

        if risk_filter and risk_filter.upper() != "ALL":
            r_upper = risk_filter.upper()
            if r_upper == "STOCKOUT":
                filtered = [i for i in filtered if i.stockout_risk in ("CRITICAL", "HIGH", "MEDIUM")]
            elif r_upper == "OVERSTOCK":
                filtered = [i for i in filtered if i.overstock_risk in ("HIGH", "MEDIUM")]
            elif r_upper == "DEAD_STOCK":
                filtered = [i for i in filtered if i.is_dead_stock]

        # Sorting
        def sort_key(item: ProductIntelligenceItem):
            val = getattr(item, sort_by, None)
            if val is None:
                return -1 if sort_desc else 999999
            return val

        filtered.sort(key=sort_key, reverse=sort_desc)

        total_count = len(filtered)
        total_pages = max(1, (total_count + limit - 1) // limit)
        offset = (page - 1) * limit
        paginated_items = filtered[offset : offset + limit]

        return IntelligenceListResponse(
            summary=summary,
            products=paginated_items,
            total_count=total_count,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )

    async def get_fast_moving_products(
        self,
        db: AsyncIOMotorDatabase,
        config: Optional[InventoryIntelligenceConfig] = None,
        category_id: Optional[str] = None,
        limit: int = 20,
    ) -> List[ProductIntelligenceItem]:
        items, _ = await self.compute_intelligence_metrics(db, config, category_id)
        fast = [i for i in items if i.velocity_category == "FAST_MOVING"]
        fast.sort(key=lambda x: x.daily_sales_velocity, reverse=True)
        return fast[:limit]

    async def get_slow_moving_products(
        self,
        db: AsyncIOMotorDatabase,
        config: Optional[InventoryIntelligenceConfig] = None,
        category_id: Optional[str] = None,
        limit: int = 20,
    ) -> List[ProductIntelligenceItem]:
        items, _ = await self.compute_intelligence_metrics(db, config, category_id)
        slow = [i for i in items if i.velocity_category == "SLOW_MOVING"]
        slow.sort(key=lambda x: x.daily_sales_velocity)
        return slow[:limit]

    async def get_dead_stock_products(
        self,
        db: AsyncIOMotorDatabase,
        config: Optional[InventoryIntelligenceConfig] = None,
        category_id: Optional[str] = None,
        limit: int = 20,
    ) -> List[ProductIntelligenceItem]:
        items, _ = await self.compute_intelligence_metrics(db, config, category_id)
        dead = [i for i in items if i.is_dead_stock]
        dead.sort(key=lambda x: x.dead_stock_capital, reverse=True)
        return dead[:limit]

    async def get_stockout_risks(
        self,
        db: AsyncIOMotorDatabase,
        config: Optional[InventoryIntelligenceConfig] = None,
        category_id: Optional[str] = None,
        limit: int = 20,
    ) -> List[ProductIntelligenceItem]:
        items, _ = await self.compute_intelligence_metrics(db, config, category_id)
        risks = [i for i in items if i.stockout_risk in ("CRITICAL", "HIGH", "MEDIUM")]
        severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "NONE": 4}
        risks.sort(key=lambda x: (severity_order.get(x.stockout_risk, 4), x.days_of_inventory_remaining or 0))
        return risks[:limit]

    async def get_overstock_risks(
        self,
        db: AsyncIOMotorDatabase,
        config: Optional[InventoryIntelligenceConfig] = None,
        category_id: Optional[str] = None,
        limit: int = 20,
    ) -> List[ProductIntelligenceItem]:
        items, _ = await self.compute_intelligence_metrics(db, config, category_id)
        over = [i for i in items if i.overstock_risk in ("HIGH", "MEDIUM")]
        over.sort(key=lambda x: x.excess_capital_tied_up, reverse=True)
        return over[:limit]


intelligence_service = InventoryIntelligenceService()
