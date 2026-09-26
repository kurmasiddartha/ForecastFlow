from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.analytics import (
    AIDashboardResponse,
    CategorySalesPoint,
    DashboardAnalyticsResponse,
    DashboardRestockItem,
    DashboardRestockSummary,
    DashboardSummaryMetrics,
    DeadStockItem,
    FastSlowMovingProduct,
    FeaturedForecastData,
    ForecastChartDataPoint,
    ForecastSummaryData,
    InventoryDistributionPoint,
    InventoryOverviewMetrics,
    LowStockAlertItem,
    SalesOverTimePoint,
    SalesOverviewMetrics,
    SlowDeadStockSummary,
    StockMovementTrendPoint,
    StockoutRiskItem,
    TopSellingProduct,
)


class AnalyticsService:
    """Service layer delivering aggregated commercial and inventory analytics."""

    @staticmethod
    def _resolve_timeframe_range(
        timeframe: Optional[str] = "30d",
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> tuple[datetime, datetime]:
        now = datetime.now(timezone.utc)

        if start_date and end_date:
            return start_date, end_date

        tf = (timeframe or "30d").lower()
        if tf == "7d":
            return now - timedelta(days=7), now
        elif tf == "30d":
            return now - timedelta(days=30), now
        elif tf == "90d":
            return now - timedelta(days=90), now
        elif tf == "1y":
            return now - timedelta(days=365), now
        elif tf == "all":
            return datetime(2020, 1, 1, tzinfo=timezone.utc), now
        else:
            return now - timedelta(days=30), now

    async def get_dashboard_analytics(
        self,
        db: AsyncIOMotorDatabase,
        timeframe: Optional[str] = "30d",
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category_id: Optional[str] = None,
    ) -> DashboardAnalyticsResponse:
        start_dt, end_dt = self._resolve_timeframe_range(timeframe, start_date, end_date)

        # -------------------------------------------------------------
        # 1. Product Inventory Summary & Low Stock Detection
        # -------------------------------------------------------------
        prod_filter: dict = {"is_active": {"$ne": False}}
        if category_id and ObjectId.is_valid(category_id):
            prod_filter["category_id"] = ObjectId(category_id)

        all_products = await db.products.find(prod_filter).to_list(length=10000)

        total_products = len(all_products)
        total_stock = 0
        inventory_value = 0.0
        low_stock_count = 0
        prod_lookup: Dict[str, dict] = {}

        for p in all_products:
            pid = str(p["_id"])
            prod_lookup[pid] = p
            stock = int(p.get("current_stock", 0))
            cost = float(p.get("cost_price", 0.0))
            reorder_point = int(p.get("reorder_point", p.get("reorder_level", 10)))

            total_stock += stock
            inventory_value += stock * cost
            if stock <= reorder_point:
                low_stock_count += 1

        inventory_value = round(inventory_value, 2)

        # -------------------------------------------------------------
        # 2. Sales in Period Summary & Sales Over Time
        # -------------------------------------------------------------
        sales_match: dict = {
            "sale_date": {"$gte": start_dt, "$lte": end_dt}
        }

        sales_timeline_pipeline = [
            {"$match": sales_match},
            {"$unwind": "$items"},
            {
                "$group": {
                    "_id": {
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$sale_date"}
                    },
                    "revenue": {"$sum": "$items.total_price"},
                    "units_sold": {"$sum": "$items.quantity"},
                    "sales_set": {"$addToSet": "$_id"},
                }
            },
            {"$sort": {"_id": 1}},
            {
                "$project": {
                    "date": "$_id",
                    "revenue": {"$round": ["$revenue", 2]},
                    "units_sold": 1,
                    "order_count": {"$size": "$sales_set"},
                    "_id": 0,
                }
            },
        ]

        timeline_docs = await db.sales.aggregate(sales_timeline_pipeline).to_list(length=500)
        sales_over_time = [SalesOverTimePoint(**doc) for doc in timeline_docs]

        total_sales_amount = round(sum(p.revenue for p in sales_over_time), 2)
        total_sales_count = await db.sales.count_documents(sales_match)

        # -------------------------------------------------------------
        # 3. Purchases in Period Summary
        # -------------------------------------------------------------
        purchases_match: dict = {
            "order_date": {"$gte": start_dt, "$lte": end_dt}
        }
        purchases_summary_pipeline = [
            {"$match": purchases_match},
            {
                "$group": {
                    "_id": None,
                    "total_amount": {"$sum": "$total_amount"},
                    "total_count": {"$sum": 1},
                }
            },
        ]
        purchases_summary = await db.purchases.aggregate(purchases_summary_pipeline).to_list(length=1)
        total_purchases_amount = round(float(purchases_summary[0]["total_amount"]), 2) if purchases_summary else 0.0
        total_purchases_count = purchases_summary[0]["total_count"] if purchases_summary else 0

        # -------------------------------------------------------------
        # 4. Top-Selling & Fast-Moving Products
        # -------------------------------------------------------------
        top_prods_pipeline = [
            {"$match": sales_match},
            {"$unwind": "$items"},
            {
                "$group": {
                    "_id": "$items.product_id",
                    "product_name": {"$first": "$items.product_name"},
                    "product_sku": {"$first": "$items.product_sku"},
                    "units_sold": {"$sum": "$items.quantity"},
                    "revenue": {"$sum": "$items.total_price"},
                }
            },
            {"$sort": {"units_sold": -1}},
            {"$limit": 25},
        ]
        top_docs = await db.sales.aggregate(top_prods_pipeline).to_list(length=25)

        top_selling_products = []
        fast_moving_products = []
        product_sales_volume: Dict[str, int] = {}

        for doc in top_docs:
            pid = str(doc["_id"])
            units = int(doc["units_sold"])
            rev = round(float(doc["revenue"]), 2)
            product_sales_volume[pid] = units

            prod_meta = prod_lookup.get(pid, {})
            name = doc.get("product_name") or prod_meta.get("name", "Product")
            sku = doc.get("product_sku") or prod_meta.get("sku", "SKU")
            curr_stock = int(prod_meta.get("current_stock", 0))
            cost = float(prod_meta.get("cost_price", 0.0))
            reorder = int(prod_meta.get("reorder_point", prod_meta.get("reorder_level", 10)))

            top_selling_products.append(
                TopSellingProduct(
                    product_id=pid,
                    product_name=name,
                    sku=sku,
                    units_sold=units,
                    revenue=rev,
                )
            )

            fast_moving_products.append(
                FastSlowMovingProduct(
                    product_id=pid,
                    product_name=name,
                    sku=sku,
                    units_sold=units,
                    revenue=rev,
                    current_stock=curr_stock,
                    cost_price=cost,
                    reorder_point=reorder,
                )
            )

        # -------------------------------------------------------------
        # 5. Slow-Moving Products (Stocked but lowest sales velocity)
        # -------------------------------------------------------------
        # Fetch all sales units per product in period for complete velocity map
        all_sales_volume_pipeline = [
            {"$match": sales_match},
            {"$unwind": "$items"},
            {
                "$group": {
                    "_id": "$items.product_id",
                    "units_sold": {"$sum": "$items.quantity"},
                    "revenue": {"$sum": "$items.total_price"},
                }
            },
        ]
        all_sales_docs = await db.sales.aggregate(all_sales_volume_pipeline).to_list(length=5000)
        full_volume_map = {str(d["_id"]): (d["units_sold"], float(d["revenue"])) for d in all_sales_docs}

        # Candidate slow movers: products with current_stock > 0
        candidate_slow = []
        for p in all_products:
            pid = str(p["_id"])
            stock = int(p.get("current_stock", 0))
            if stock > 0:
                sold_qty, sold_rev = full_volume_map.get(pid, (0, 0.0))
                candidate_slow.append((
                    sold_qty,
                    -stock,  # higher stock ranks higher for slow-moving risk
                    pid,
                    p,
                    sold_rev,
                ))

        candidate_slow.sort(key=lambda x: (x[0], x[1]))
        slow_moving_products = []
        for sold_qty, _, pid, p, sold_rev in candidate_slow[:6]:
            slow_moving_products.append(
                FastSlowMovingProduct(
                    product_id=pid,
                    product_name=p.get("name", "Product"),
                    sku=p.get("sku", "SKU"),
                    units_sold=sold_qty,
                    revenue=round(sold_rev, 2),
                    current_stock=int(p.get("current_stock", 0)),
                    cost_price=float(p.get("cost_price", 0.0)),
                    reorder_point=int(p.get("reorder_point", p.get("reorder_level", 10))),
                )
            )

        # -------------------------------------------------------------
        # 6. Category-Wise Sales
        # -------------------------------------------------------------
        category_sales_pipeline = [
            {"$match": sales_match},
            {"$unwind": "$items"},
            {
                "$addFields": {
                    "productObjId": {"$toObjectId": "$items.product_id"}
                }
            },
            {
                "$lookup": {
                    "from": "products",
                    "localField": "productObjId",
                    "foreignField": "_id",
                    "as": "prod",
                }
            },
            {"$unwind": {"path": "$prod", "preserveNullAndEmptyArrays": True}},
            {
                "$lookup": {
                    "from": "categories",
                    "localField": "prod.category_id",
                    "foreignField": "_id",
                    "as": "cat",
                }
            },
            {"$unwind": {"path": "$cat", "preserveNullAndEmptyArrays": True}},
            {
                "$group": {
                    "_id": {"$ifNull": ["$cat.name", "General / Uncategorized"]},
                    "revenue": {"$sum": "$items.total_price"},
                    "units_sold": {"$sum": "$items.quantity"},
                }
            },
            {"$sort": {"revenue": -1}},
            {"$limit": 10},
        ]
        cat_sales_docs = await db.sales.aggregate(category_sales_pipeline).to_list(length=20)
        category_sales = [
            CategorySalesPoint(
                category=doc["_id"],
                revenue=round(float(doc["revenue"]), 2),
                units_sold=int(doc["units_sold"]),
            )
            for doc in cat_sales_docs
        ]

        # -------------------------------------------------------------
        # 7. Inventory Distribution by Category
        # -------------------------------------------------------------
        inv_dist_pipeline = [
            {"$match": {"is_active": {"$ne": False}}},
            {
                "$lookup": {
                    "from": "categories",
                    "localField": "category_id",
                    "foreignField": "_id",
                    "as": "category",
                }
            },
            {"$unwind": {"path": "$category", "preserveNullAndEmptyArrays": True}},
            {
                "$group": {
                    "_id": {"$ifNull": ["$category.name", "Uncategorized"]},
                    "product_count": {"$sum": 1},
                    "total_stock": {"$sum": "$current_stock"},
                    "inventory_value": {
                        "$sum": {"$multiply": ["$current_stock", "$cost_price"]}
                    },
                }
            },
            {"$sort": {"inventory_value": -1}},
            {"$limit": 10},
        ]
        inv_dist_docs = await db.products.aggregate(inv_dist_pipeline).to_list(length=20)
        inventory_distribution = [
            InventoryDistributionPoint(
                category=doc["_id"],
                product_count=int(doc["product_count"]),
                total_stock=int(doc["total_stock"]),
                inventory_value=round(float(doc["inventory_value"]), 2),
            )
            for doc in inv_dist_docs
        ]

        # -------------------------------------------------------------
        # 8. Stock Movement Trends (In vs Out over time)
        # -------------------------------------------------------------
        movements_match: dict = {
            "created_at": {"$gte": start_dt, "$lte": end_dt}
        }
        trends_pipeline = [
            {"$match": movements_match},
            {
                "$group": {
                    "_id": {
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                    },
                    "stock_in": {
                        "$sum": {
                            "$cond": [{"$gt": ["$quantity", 0]}, "$quantity", 0]
                        }
                    },
                    "stock_out": {
                        "$sum": {
                            "$cond": [{"$lt": ["$quantity", 0]}, {"$abs": "$quantity"}, 0]
                        }
                    },
                    "net_change": {"$sum": "$quantity"},
                }
            },
            {"$sort": {"_id": 1}},
            {
                "$project": {
                    "date": "$_id",
                    "stock_in": 1,
                    "stock_out": 1,
                    "net_change": 1,
                    "_id": 0,
                }
            },
        ]
        trend_docs = await db.stock_movements.aggregate(trends_pipeline).to_list(length=500)
        stock_movement_trends = [StockMovementTrendPoint(**doc) for doc in trend_docs]

        return DashboardAnalyticsResponse(
            summary=DashboardSummaryMetrics(
                total_products=total_products,
                inventory_value=inventory_value,
                total_stock=total_stock,
                low_stock_count=low_stock_count,
                total_sales_amount=total_sales_amount,
                total_sales_count=total_sales_count,
                total_purchases_amount=total_purchases_amount,
                total_purchases_count=total_purchases_count,
            ),
            fast_moving_products=fast_moving_products,
            slow_moving_products=slow_moving_products,
            sales_over_time=sales_over_time,
            top_selling_products=top_selling_products,
            category_sales=category_sales,
            inventory_distribution=inventory_distribution,
            stock_movement_trends=stock_movement_trends,
            timeframe=timeframe or "30d",
            start_date=start_dt,
            end_date=end_dt,
        )

    async def get_ai_dashboard(
        self,
        db: AsyncIOMotorDatabase,
        timeframe: Optional[str] = "30d",
        target_product_id: Optional[str] = None,
    ) -> AIDashboardResponse:
        """Consolidates commercial overview, AI demand forecasts, velocity diagnostics,

        stockout alerts, and restock recommendations in one optimized, zero-duplication query.
        """
        start_dt, end_dt = self._resolve_timeframe_range(timeframe)
        days_in_window = max(1, (end_dt - start_dt).days)
        now = datetime.now(timezone.utc)

        # 1. Fetch active products & metadata
        all_products = await db.products.find({"is_active": {"$ne": False}}).to_list(length=2000)
        prod_lookup = {str(p["_id"]): p for p in all_products}

        cat_ids = [
            ObjectId(str(p["category_id"]))
            for p in all_products
            if ObjectId.is_valid(str(p.get("category_id", "")))
        ]
        cats = await db.categories.find({"_id": {"$in": cat_ids}}).to_list(length=len(cat_ids)) if cat_ids else []
        cat_map = {str(c["_id"]): c.get("name", "General") for c in cats}

        # 2. Inventory Overview & Low-Stock Alerts
        total_products = len(all_products)
        total_stock_units = 0
        total_inventory_value = 0.0
        low_stock_count = 0
        out_of_stock_count = 0
        low_stock_alerts: List[LowStockAlertItem] = []

        for p in all_products:
            stock = int(p.get("current_stock", 0))
            cost = float(p.get("cost_price", 0.0))
            reorder = int(p.get("reorder_point", p.get("reorder_level", 10)))

            total_stock_units += stock
            total_inventory_value += stock * cost

            if stock <= 0:
                out_of_stock_count += 1
                low_stock_count += 1
                low_stock_alerts.append(
                    LowStockAlertItem(
                        product_id=str(p["_id"]),
                        product_name=p.get("name", "Product"),
                        sku=p.get("sku", ""),
                        current_stock=stock,
                        reorder_point=reorder,
                        category_name=cat_map.get(str(p.get("category_id")), "General"),
                        urgency="out_of_stock",
                    )
                )
            elif stock <= reorder:
                low_stock_count += 1
                low_stock_alerts.append(
                    LowStockAlertItem(
                        product_id=str(p["_id"]),
                        product_name=p.get("name", "Product"),
                        sku=p.get("sku", ""),
                        current_stock=stock,
                        reorder_point=reorder,
                        category_name=cat_map.get(str(p.get("category_id")), "General"),
                        urgency="critical" if stock <= max(1, reorder // 2) else "warning",
                    )
                )

        low_stock_alerts.sort(key=lambda x: (0 if x.urgency == "out_of_stock" else 1 if x.urgency == "critical" else 2, x.current_stock))
        low_stock_alerts = low_stock_alerts[:8]

        inventory_overview = InventoryOverviewMetrics(
            total_products=total_products,
            total_stock_units=total_stock_units,
            total_inventory_value=round(total_inventory_value, 2),
            low_stock_count=low_stock_count,
            out_of_stock_count=out_of_stock_count,
        )

        # 3. Sales Overview & Sales Over Time Trends
        sales_timeline_pipeline = [
            {"$match": {"sale_date": {"$gte": start_dt, "$lte": end_dt}}},
            {"$unwind": "$items"},
            {
                "$group": {
                    "_id": {
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$sale_date"}
                    },
                    "revenue": {"$sum": "$items.total_price"},
                    "units_sold": {"$sum": "$items.quantity"},
                    "order_ids": {"$addToSet": "$_id"},
                }
            },
            {"$sort": {"_id": 1}},
            {
                "$project": {
                    "date": "$_id",
                    "revenue": {"$round": ["$revenue", 2]},
                    "units_sold": 1,
                    "order_count": {"$size": "$order_ids"},
                    "_id": 0,
                }
            },
        ]
        sales_timeline_docs = await db.sales.aggregate(sales_timeline_pipeline).to_list(length=500)
        sales_trends = [SalesOverTimePoint(**doc) for doc in sales_timeline_docs]

        total_revenue = round(sum(p.revenue for p in sales_trends), 2)
        total_units_sold = sum(p.units_sold for p in sales_trends)
        total_orders_count = sum(p.order_count for p in sales_trends)

        purch_docs = await db.purchases.aggregate([
            {"$match": {"order_date": {"$gte": start_dt, "$lte": end_dt}}},
            {
                "$group": {
                    "_id": None,
                    "total_amount": {"$sum": "$total_amount"},
                    "count": {"$sum": 1},
                }
            },
        ]).to_list(length=1)
        total_purchases_amount = round(float(purch_docs[0]["total_amount"]), 2) if purch_docs else 0.0
        total_purchases_count = purch_docs[0]["count"] if purch_docs else 0

        sales_overview = SalesOverviewMetrics(
            total_revenue=total_revenue,
            total_units_sold=total_units_sold,
            total_orders_count=total_orders_count,
            total_purchases_amount=total_purchases_amount,
            total_purchases_count=total_purchases_count,
        )

        # 4. Product Sales Velocity & Fast / Slow Moving
        prod_sales_pipeline = [
            {"$match": {"sale_date": {"$gte": start_dt, "$lte": end_dt}}},
            {"$unwind": "$items"},
            {
                "$group": {
                    "_id": "$items.product_id",
                    "units_sold": {"$sum": "$items.quantity"},
                    "revenue": {"$sum": "$items.total_price"},
                }
            },
            {"$sort": {"units_sold": -1}},
        ]
        prod_sales_docs = await db.sales.aggregate(prod_sales_pipeline).to_list(length=500)
        prod_sales_map = {str(d["_id"]): d for d in prod_sales_docs}

        top_fast_moving: List[FastSlowMovingProduct] = []
        for d in prod_sales_docs[:5]:
            pid = str(d["_id"])
            prod = prod_lookup.get(pid)
            if prod:
                top_fast_moving.append(
                    FastSlowMovingProduct(
                        product_id=pid,
                        product_name=prod.get("name", "Product"),
                        sku=prod.get("sku", ""),
                        units_sold=d["units_sold"],
                        revenue=round(float(d["revenue"]), 2),
                        current_stock=int(prod.get("current_stock", 0)),
                        cost_price=float(prod.get("cost_price", 0.0)),
                        reorder_point=int(prod.get("reorder_point", prod.get("reorder_level", 10))),
                    )
                )

        dead_stock_items: List[DeadStockItem] = []
        slow_moving_count = 0
        total_dead_capital = 0.0

        for p in all_products:
            pid = str(p["_id"])
            stock = int(p.get("current_stock", 0))
            cost = float(p.get("cost_price", 0.0))
            sales_info = prod_sales_map.get(pid)
            units = sales_info["units_sold"] if sales_info else 0

            if stock > 0 and units == 0:
                cap = round(stock * cost, 2)
                total_dead_capital += cap
                dead_stock_items.append(
                    DeadStockItem(
                        product_id=pid,
                        product_name=p.get("name", "Product"),
                        sku=p.get("sku", ""),
                        current_stock=stock,
                        cost_price=cost,
                        capital_tied_up=cap,
                        days_without_sale=days_in_window,
                    )
                )
            elif stock > 0 and (units / days_in_window) < 0.2:
                slow_moving_count += 1

        dead_stock_items.sort(key=lambda x: x.capital_tied_up, reverse=True)
        slow_dead_stock_summary = SlowDeadStockSummary(
            dead_stock_count=len(dead_stock_items),
            slow_moving_count=slow_moving_count,
            total_capital_tied_up=round(total_dead_capital, 2),
            top_dead_stock_items=dead_stock_items[:5],
        )

        # 5. Stockout-Risk Products
        stockout_risk_products: List[StockoutRiskItem] = []
        for p in all_products:
            pid = str(p["_id"])
            stock = int(p.get("current_stock", 0))
            sales_info = prod_sales_map.get(pid)
            units = sales_info["units_sold"] if sales_info else 0
            daily_vel = units / days_in_window

            if daily_vel > 0:
                dos = stock / daily_vel
                if dos <= 10.0 or stock <= 0:
                    shortfall = max(0.0, (daily_vel * 14) - stock)
                    rev_risk = round(shortfall * float(p.get("selling_price", 0.0)), 2)
                    urgency = "critical" if stock <= 0 or dos <= 3.0 else "high"
                    stockout_risk_products.append(
                        StockoutRiskItem(
                            product_id=pid,
                            product_name=p.get("name", "Product"),
                            sku=p.get("sku", ""),
                            current_stock=stock,
                            daily_velocity=round(daily_vel, 2),
                            days_of_supply=round(dos, 1),
                            urgency=urgency,
                            shortfall_units=round(shortfall, 1),
                            revenue_at_risk=rev_risk,
                        )
                    )

        stockout_risk_products.sort(
            key=lambda x: (0 if x.urgency == "critical" else 1, x.days_of_supply)
        )
        stockout_risk_products = stockout_risk_products[:6]

        # 6. Demand Forecast Summary & Featured Forecast
        forecast_docs = await db.forecasts.find().sort("generated_timestamp", -1).to_list(length=100)
        total_fc_units = 0.0
        model_counts: Dict[str, int] = {}
        for fc in forecast_docs:
            preds = fc.get("predictions", [])
            total_fc_units += sum(float(pr.get("demand", 0.0)) for pr in preds[:14])
            m = fc.get("model_used", "Statistical Baseline")
            model_counts[m] = model_counts.get(m, 0) + 1

        primary_model = max(model_counts, key=model_counts.get) if model_counts else "Ridge Demand Forecaster"
        forecast_summary = ForecastSummaryData(
            total_forecasted_units_14d=round(total_fc_units, 1),
            active_forecasts_count=len(forecast_docs),
            primary_model=primary_model,
            horizon_days=14,
        )

        # Featured Forecast Selection
        target_pid = target_product_id
        if not target_pid and stockout_risk_products:
            target_pid = stockout_risk_products[0].product_id
        elif not target_pid and top_fast_moving:
            target_pid = top_fast_moving[0].product_id
        elif not target_pid and forecast_docs:
            target_pid = forecast_docs[0].get("product_id")
        elif not target_pid and all_products:
            target_pid = str(all_products[0]["_id"])

        featured_forecast: Optional[FeaturedForecastData] = None
        if target_pid and ObjectId.is_valid(target_pid):
            fc_doc = await db.forecasts.find_one({"product_id": target_pid}, sort=[("generated_timestamp", -1)])
            target_prod = prod_lookup.get(target_pid)
            if fc_doc and target_prod:
                raw_hist = fc_doc.get("historical_data", [])[-21:]
                raw_preds = fc_doc.get("predictions", [])[:14]
                chart_points: List[ForecastChartDataPoint] = []
                for h in raw_hist:
                    chart_points.append(
                        ForecastChartDataPoint(
                            date=h.get("date", ""),
                            actual=round(float(h.get("demand", 0.0)), 2),
                            predicted=None,
                        )
                    )
                if chart_points and raw_preds:
                    chart_points[-1].predicted = chart_points[-1].actual

                for pr in raw_preds:
                    chart_points.append(
                        ForecastChartDataPoint(
                            date=pr.get("date", ""),
                            actual=None,
                            predicted=round(float(pr.get("demand", 0.0)), 2),
                        )
                    )

                featured_forecast = FeaturedForecastData(
                    product_id=target_pid,
                    product_name=target_prod.get("name", "Product"),
                    sku=target_prod.get("sku", ""),
                    model_used=fc_doc.get("model_used", "Ridge Demand Forecaster"),
                    horizon_days=len(raw_preds),
                    data_points=chart_points,
                )

        # 7. Restock Recommendations Summary
        rec_docs = await db.recommendations.find({"status": "pending"}).sort("created_at", -1).to_list(length=100)
        if not rec_docs and all_products:
            from app.services.recommendation_service import recommendation_service
            try:
                await recommendation_service.generate_recommendations(db, planning_horizon_days=14, save=True)
                rec_docs = await db.recommendations.find({"status": "pending"}).sort("created_at", -1).to_list(length=100)
            except Exception as e:
                pass

        pending_count = len(rec_docs)
        critical_count = sum(1 for r in rec_docs if r.get("urgency") == "critical")
        high_count = sum(1 for r in rec_docs if r.get("urgency") == "high")
        total_units_needed = sum(int(r.get("suggested_order_quantity", 0)) for r in rec_docs)
        total_budget_needed = sum(float(r.get("estimated_cost", 0.0)) for r in rec_docs)

        top_recommendations: List[DashboardRestockItem] = []
        for r in rec_docs[:5]:
            top_recommendations.append(
                DashboardRestockItem(
                    id=str(r["_id"]),
                    product_id=str(r.get("product_id")),
                    product_name=r.get("product_name", "Product"),
                    sku=r.get("product_sku", ""),
                    suggested_order_quantity=int(r.get("suggested_order_quantity", 0)),
                    urgency=r.get("urgency", "medium"),
                    estimated_cost=round(float(r.get("estimated_cost", 0.0)), 2),
                    reason=r.get("reason", "Restock advised"),
                    current_stock=int(r.get("current_stock", 0)),
                    incoming_stock=int(r.get("incoming_stock", 0)),
                    forecast_demand=round(float(r.get("forecast_demand", 0.0)), 1),
                    safety_stock=int(r.get("safety_stock", 0)),
                    status=r.get("status", "pending"),
                )
            )

        restock_summary = DashboardRestockSummary(
            pending_count=pending_count,
            critical_count=critical_count,
            high_count=high_count,
            total_units_needed=total_units_needed,
            total_budget_needed=round(total_budget_needed, 2),
            top_recommendations=top_recommendations,
        )

        available_products_for_forecast = [
            {"id": str(p["_id"]), "name": p.get("name", "Product"), "sku": p.get("sku", "")}
            for p in all_products[:50]
        ]

        return AIDashboardResponse(
            inventory_overview=inventory_overview,
            sales_overview=sales_overview,
            low_stock_alerts=low_stock_alerts,
            stockout_risk_products=stockout_risk_products,
            forecast_summary=forecast_summary,
            top_fast_moving=top_fast_moving,
            slow_dead_stock_summary=slow_dead_stock_summary,
            restock_summary=restock_summary,
            sales_trends=sales_trends,
            featured_forecast=featured_forecast,
            available_products_for_forecast=available_products_for_forecast,
            timeframe=timeframe or "30d",
            generated_at=now,
        )


analytics_service = AnalyticsService()

