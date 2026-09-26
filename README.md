# ForecastFlow: AI Inventory and Demand Forecasting System for Small Businesses

ForecastFlow is a production-style full-stack application designed to help small and medium-sized businesses manage inventory, analyze historical sales patterns, forecast future demand using interpretable statistical baselines and machine learning, and make intelligent restocking decisions.

---

## 1. Tech Stack

### Frontend
- **Framework & Bundler:** React 18, Vite 5
- **Styling:** Tailwind CSS, PostCSS
- **Navigation:** React Router v6
- **Icons:** Lucide React
- **Architecture:** Layered structure (layouts, pages, reusable components, dedicated API service layer, React Context state management)

### Backend
- **Framework:** Python 3.12, FastAPI
- **Security & Auth:** Bcrypt password hashing (12 rounds), PyJWT (HS256 Bearer tokens), Email-validator
- **Validation & Configuration:** Pydantic v2, Pydantic Settings
- **Server:** Uvicorn ASGI
- **Architecture:** Layered modular structure (routes $\rightarrow$ services $\rightarrow$ database & ML engine)
- **Testing:** Pytest, HTTPX, Pytest-Asyncio

### Database Layer
- **Database Engine:** MongoDB Atlas (replicaSet on MongoDB 6.0+)
- **Driver / Connector:** Motor (Async PyMongo) with DNS python support
- **Connection Lifecycle:** Managed via FastAPI lifespan hooks and connection pooling
- **Validation:** Pydantic domain models with custom `PyObjectId` serialization and type constraints

### ML / Forecasting Layer (Planned - Phase 7)
- **Frameworks:** Pandas, NumPy, scikit-learn, statsmodels

---

## 2. API Endpoints

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | No | User registration with 12-round bcrypt hash |
| `POST` | `/api/v1/auth/login` | No | Authenticate and issue JWT Bearer token |
| `GET` | `/api/v1/auth/me` | Bearer Token | Current user profile |
| `POST` | `/api/v1/auth/logout` | Bearer Token | User session logout |

### Categories (`/api/v1/categories`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/categories` | Bearer Token | List all categories sorted by name |
| `GET` | `/api/v1/categories/{id}` | Bearer Token | Get category by ID |
| `POST` | `/api/v1/categories` | Bearer Token | Create category (unique name) |
| `PUT` | `/api/v1/categories/{id}` | Bearer Token | Update category name and description |
| `DELETE` | `/api/v1/categories/{id}` | Bearer Token | Guarded deletion (blocked if products assigned) |

### Suppliers (`/api/v1/suppliers`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/suppliers` | Bearer Token | List all vendors and suppliers |
| `GET` | `/api/v1/suppliers/{id}` | Bearer Token | Get supplier details |
| `POST` | `/api/v1/suppliers` | Bearer Token | Add supplier with lead time (days) |
| `PUT` | `/api/v1/suppliers/{id}` | Bearer Token | Update supplier profile |
| `DELETE` | `/api/v1/suppliers/{id}` | Bearer Token | Guarded deletion (blocked if products assigned) |

### Products (`/api/v1/products`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/products` | Bearer Token | Paginated products list (`page`, `page_size`, `search`, `category_id`, `is_active`) |
| `GET` | `/api/v1/products/{id}` | Bearer Token | Get product by ID with category and supplier names |
| `POST` | `/api/v1/products` | Bearer Token | Create product with unique SKU and inventory parameters |
| `PUT` | `/api/v1/products/{id}` | Bearer Token | Update product attributes, prices, and stock levels |
| `DELETE` | `/api/v1/products/{id}` | Bearer Token | Delete product |

### Inventory Management (`/api/v1/inventory`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/v1/inventory/adjust` | Bearer Token | Record stock movement (stock-in, stock-out, physical count adjustment) and audit log |
| `GET` | `/api/v1/inventory/movements` | Bearer Token | Paginated chronological movement audit ledger (`product_id`, `movement_type`) |
| `GET` | `/api/v1/inventory/summary` | Bearer Token | Total products, total units, low stock count, stockout count, and inventory valuation |
| `GET` | `/api/v1/inventory/low-stock` | Bearer Token | Filter products where stock on hand is at or below reorder threshold |

---

## 3. Project Structure

```
ForecastFlow/
├── backend/
│   ├── app/
│   │   ├── core/              # Centralized configuration & security utilities
│   │   ├── database/          # Centralized MongoDB connection manager and indexes
│   │   │   ├── connection.py  # Async Motor client, ping health check, pooling
│   │   │   └── indexes.py     # Selective index definitions for all 9 collections
│   │   ├── models/            # Domain database schemas with Pydantic validation
│   │   │   ├── common.py      # BaseMongoModel, PyObjectId, UTC timestamp helpers
│   │   │   ├── user.py        # User document model
│   │   │   ├── category.py    # Product categories
│   │   │   ├── supplier.py    # Suppliers with lead time parameters
│   │   │   ├── product.py     # Catalog products with reorder, target, and safety stock
│   │   │   ├── stock_movement.py # Stock audit movements
│   │   │   ├── sale.py        # Historical sales transactions for time series
│   │   │   ├── purchase.py    # Purchase orders with supplier reference & items
│   │   │   ├── forecast.py    # Forecast projections & evaluation metrics (MAE, RMSE)
│   │   │   └── recommendation.py # Actionable restock recommendations with urgency & reason
│   │   ├── routes/            # Thin API route handlers (health, auth, categories, suppliers, products, inventory)
│   │   │   ├── inventory.py   # Stock adjustments, audit ledger, summary metrics, low stock
│   │   │   ├── products.py
│   │   │   ├── categories.py
│   │   │   ├── suppliers.py
│   │   │   ├── auth.py
│   │   │   └── health.py
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   │   ├── inventory.py   # StockAdjustmentRequest, StockMovementResponse, InventorySummary
│   │   │   ├── product.py
│   │   │   ├── category.py
│   │   │   ├── supplier.py
│   │   │   └── auth.py
│   │   ├── services/          # Pure business logic layer
│   │   │   ├── inventory_service.py # Stock adjustment calculations, audit logging, summary aggregation
│   │   │   ├── product_service.py
│   │   │   ├── category_service.py
│   │   │   ├── supplier_service.py
│   │   │   └── auth_service.py
│   │   ├── utils/             # Helper utilities
│   │   ├── __init__.py
│   │   └── main.py            # FastAPI application factory and lifespan manager
│   ├── tests/                 # Automated pytest test suites (inventory, auth, catalog, database, models, health)
│   │   ├── test_inventory.py  # Stock increase, decrease, insufficient stock, invalid qty, low stock tests
│   │   ├── test_catalog.py
│   │   ├── test_auth.py
│   │   ├── test_database.py
│   │   ├── test_health.py
│   │   └── test_models.py
│   ├── .env.example           # Environment template for backend
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/                # Static public assets
│   ├── src/
│   │   ├── assets/            # Client asset files
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/        # Modal, ConfirmDialog, Pagination, ProtectedRoute
│   │   │   ├── inventory/     # StockAdjustmentModal
│   │   │   └── layout/        # Header with user menu, Sidebar, Footer
│   │   ├── context/           # React context (AuthContext with persistent session)
│   │   ├── layouts/           # Composable page layouts (MainLayout)
│   │   ├── pages/             # Route page views
│   │   │   ├── auth/          # LoginPage, RegisterPage
│   │   │   ├── catalog/       # ProductsPage, CategoriesPage, SuppliersPage
│   │   │   ├── inventory/     # InventoryPage
│   │   │   ├── HomePage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── routes/            # Application router configuration
│   │   ├── services/          # Client API services (inventory, product, category, supplier, auth, api)
│   │   ├── utils/             # Client utility helpers (e.g. cn)
│   │   ├── App.jsx            # Root application component wrapped with AuthProvider
│   │   ├── index.css          # Tailwind CSS definitions
│   │   └── main.jsx           # React DOM root render
│   ├── .env.example           # Environment template for frontend
│   ├── index.html             # HTML entry template
│   ├── package.json           # Node dependencies and scripts
│   ├── postcss.config.js      # PostCSS configuration
│   ├── tailwind.config.js     # Tailwind CSS theme & content configuration
│   └── vite.config.js         # Vite configuration with aliases
├── .gitignore                 # Root gitignore for Python, Node, and environments
└── README.md                  # Project overview and setup documentation
```

---

## 4. Development Setup & Verification

### Running the Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows (.venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Running Backend Tests
```bash
pytest tests -v
```

### Running the Frontend
```bash
cd frontend
npm install
npm run dev                  # Serves on http://localhost:5173
```

### Frontend Production Build
```bash
npm run build
```

---

- [x] **Phase 1: Project Foundation** (Vite + React, FastAPI, Health Checks, Settings, Router)
- [x] **Phase 2: MongoDB Atlas Integration** (Connection pooling, lifespan hooks, 9 collection schemas, compound indexes, health ping)
- [x] **Phase 3: Authentication & User Management** (JWT authentication, bcrypt 12 rounds, route guards, AuthContext, Login/Register pages)
- [x] **Phase 4: Categories, Suppliers & Product Catalog Management** (CRUD APIs, validation, pagination, search, category/status filters)
- [x] **Phase 5: Inventory Management & Auditable Stock Movements** (Stock-in, stock-out, physical count adjustments, low-stock detection, KPI summary, audit ledger)
- [x] **Phase 6: Sales & Purchasing Order Management** (Multi-item sales with atomic stock deductions, supplier purchase orders with stock replenishment, consistency rollbacks, and audit movement logs)
- [x] **Phase 7: Dashboard and Inventory Analytics** (Executive business dashboard, Recharts visualizations, sales velocity, turnover analysis, fast/slow moving goods, and aggregation endpoints)
- [x] **Phase 8: Demand Forecasting Data Pipeline** (Sales extraction, sanitization, continuous date imputation, non-leaking feature engineering, validation)
- [x] **Phase 9: Demand Forecasting Engine & Evaluation Pipeline** (Baseline Naive, Moving Average, Exponential Smoothing, Ridge Regression, time-aware backtesting, and persistent forecasting service)


---

## 6. Phase 6: Sales and Purchase Management

### Business Rules & Consistency Guarantees
- **Sales Orders:**
  - Multi-item sales orders with quantity, unit price (customizable or defaults to catalog selling price), product reference, and sale date.
  - **Stock Deductions:** Automatically decrements inventory for every line item.
  - **Pre-validation & Guardrails:** Strictly prevents over-selling. Validates stock sufficiency across all line items prior to any mutation. If any item is insufficient, rejects with `400 Bad Request`.
  - **Transactional Consistency:** Uses MongoDB multi-document transactions when operating on a replica set, with automated compensation rollback fallback to prevent partially applied mutations.
  - **Stock Movement Ledger:** Writes an auditable `stock_movements` record for every sold item (`movement_type="SALE"`, negative quantity, referenced by `sale_id`).

- **Purchase Orders:**
  - Multi-item supplier purchase orders with quantity, negotiated unit cost, supplier reference, order date, and expected delivery date.
  - **Stock Replenishment:** When `status="received"`, automatically increments inventory for every line item and creates `PURCHASE` stock movement records linked to `purchase_id`.
  - Can optionally create orders in `ordered` (pending) status without mutating stock until received.

### REST Endpoints
- `POST /api/v1/sales`: Register a sales order, validate stock, atomically deduct inventory, and record stock movements.
- `GET /api/v1/sales`: List sales history with pagination (`page`, `page_size`) and optional product filter (`product_id`).
- `GET /api/v1/sales/{id}`: Retrieve detailed breakdown of a sales order.
- `POST /api/v1/purchases`: Create a purchase order, optionally replenishing inventory if received.
- `GET /api/v1/purchases`: List purchase orders with pagination (`page`, `page_size`), supplier filter (`supplier_id`), and status filter (`status`).
- `GET /api/v1/purchases/{id}`: Retrieve detailed breakdown of a purchase order.

---

## 7. Phase 7: Dashboard and Inventory Analytics

### High-Performance Aggregation Architecture
The backend aggregates commercial and inventory metrics server-side using optimized MongoDB pipelines, avoiding raw dataset over-fetching:
- **Product & Stock Valuation:** Aggregates active products to calculate total catalog size, total physical units on hand, capital valuation (`current_stock * cost_price`), and low-stock items (`current_stock <= reorder_point`).
- **Sales Velocity Timeline:** Aggregates sales orders grouped by date (`YYYY-MM-DD`) with line totals, units sold, and unique order counts.
- **Top-Selling & Fast-Moving Products:** Identifies products with the highest turnover volume and sales revenue.
- **Slow-Moving Goods Detection:** Filters stocked products (`current_stock > 0`) with the lowest sales velocity in the window to identify holding risks and idle working capital.
- **Category Sales Breakdown:** Unwinds sales line items and joins category definitions to calculate dollar revenue share and units sold per category.
- **Inventory Valuation Distribution:** Categorizes capital investment across product lines.
- **Stock Movement Trends:** Groups auditable ledger movements into inbound stock (purchases/returns) vs outbound stock (sales/dispatches) over time.

### Analytics Endpoints
- `GET /api/v1/analytics/dashboard`: Returns complete KPI summary, fast/slow movers, and chart datasets with query filters (`timeframe`, `start_date`, `end_date`, `category_id`).

---

## 8. Phase 8: Demand Forecasting Data Pipeline

### Architecture (`app/ml/`)
- **`extractor.py`**: Extracts historical sales line-item records from MongoDB with product and date filtering.
- **`cleaner.py`**: Sanitizes timestamps, removes invalid/negative values, filters out incomplete records, and coerces numeric types.
- **`aggregator.py`**: Resamples and groups transactional line items into regular periodic demand (daily `'D'` or weekly `'W'`) per product.
- **`imputer.py`**: Constructs a continuous calendar grid for each product, filling non-trading or zero-sales days with `0.0` demand rather than dropping timestamps.
- **`features.py`**: Generates calendar features, autoregressive lags, and rolling window demand statistics with strict data leakage prevention.
- **`pipeline.py`**: Reproducible end-to-end execution combining all stages and producing data quality audits.
- **`schemas.py`**: Strongly typed Pydantic models for time-series datasets, features, and validation summaries.

### Dataset Structure & Engineered Features
| Feature Column | Type | Description | Leakage Prevention Strategy |
| :--- | :--- | :--- | :--- |
| `date` | `string` | Normalized ISO calendar date (`YYYY-MM-DD`) | Calendar index |
| `product_id` | `string` | Product identifier | Entity grouping key |
| `product_sku` | `string` | Stock Keeping Unit | Metadata |
| `product_name` | `string` | Product display name | Metadata |
| `demand` | `float` | Target variable: units sold on `date` | Actual target $y_t$ |
| `revenue` | `float` | Gross sales revenue generated on `date` | Auxiliary target |
| `order_count` | `int` | Customer transaction count on `date` | Auxiliary target |
| `day` | `int` | Day of month (1-31) | Deterministic calendar coordinate |
| `day_of_week` | `int` | Day of week (0=Monday, 6=Sunday) | Deterministic calendar coordinate |
| `is_weekend` | `int` | Weekend binary indicator (1 if Sat/Sun, else 0) | Deterministic calendar coordinate |
| `week_of_year` | `int` | ISO calendar week number (1-53) | Deterministic calendar coordinate |
| `month` | `int` | Month of year (1-12) | Deterministic calendar coordinate |
| `quarter` | `int` | Calendar quarter (1-4) | Deterministic calendar coordinate |
| `year` | `int` | Calendar year | Deterministic calendar coordinate |
| `lag_1` | `float` | Previous day demand ($y_{t-1}$) | Strictly shifted past observation |
| `lag_7` | `float` | Same day prior week demand ($y_{t-7}$) | Strictly shifted past observation |
| `lag_14` | `float` | Two weeks prior demand ($y_{t-14}$) | Strictly shifted past observation |
| `rolling_7_mean` | `float` | 7-day rolling mean demand ($t-7$ to $t-1$) | Shifted by 1 prior to window: strictly excludes $y_t$ |
| `rolling_7_std` | `float` | 7-day rolling standard deviation | Shifted by 1 prior to window: strictly excludes $y_t$ |
| `rolling_30_mean`| `float` | 30-day rolling mean demand ($t-30$ to $t-1$) | Shifted by 1 prior to window: strictly excludes $y_t$ |
| `rolling_30_std` | `float` | 30-day rolling standard deviation | Shifted by 1 prior to window: strictly excludes $y_t$ |

### Data Leakage Avoidance
When training predictive forecasting models, feature values at time step $t$ must never incorporate target demand $y_t$. 
In this pipeline, every rolling statistic ($7$-day, $30$-day) and lag ($1$, $7$, $14$) is computed over shifted historical series (`.shift(1)`), ensuring that features for day $t$ strictly reflect information available at or before $t-1$.
The pipeline includes an automated validator `verify_no_data_leakage(df)` that guarantees this invariant.

---

## 9. Phase 9: Demand Forecasting Engine & Evaluation Pipeline

### Model Architecture (`app/ml/models/`)
ForecastFlow adopts a progressive, empirical approach starting with parsimonious baseline models before introducing regularized statistical learning:

1. **Baseline Model (`NaiveForecaster`):**
   - Projects the most recent observed demand ($y_T$) or historical mean.
   - Serves as the minimal benchmark to verify that more complex models add real predictive value.
2. **Moving Average (`MovingAverageForecaster`):**
   - Smooths short-term fluctuations by projecting the arithmetic mean over the last $W$ days (e.g. 7-day window).
3. **Exponential Smoothing (`ExponentialSmoothingForecaster`):**
   - Simple Exponential Smoothing (SES) assigning exponentially decreasing weights to older observations:
     $$\hat{y}_{t+1} = \alpha y_t + (1 - \alpha) \hat{y}_t$$
   - Optimizes smoothing parameter $\alpha \in (0, 1)$ via in-sample SSE grid search.
4. **Ridge Regression (`RidgeDemandForecaster`):**
   - Stronger supervised time-series regressor capturing day-of-week seasonality (`day_of_week`, `is_weekend`, `month`) and temporal dependencies (`lag_1`, `lag_7`, `rolling_7_mean`).
   - Applies L2 regularization to control collinearity among autoregressive features and clips projections to non-negative physical demand ($\ge 0$).

### Time-Aware Model Evaluation Pipeline (`app/ml/evaluator.py`)
- **Strict Chronological Splitting:** Uses `time_series_train_test_split` where all training data strictly precedes test data ($t_{\text{train}} \le t_{\text{test}}$). Data is **never** randomly shuffled.
- **Evaluation Metrics:**
  - **MAE (Mean Absolute Error):** Measures average forecast magnitude in unit terms: $\frac{1}{N}\sum |y - \hat{y}|$.
  - **RMSE (Root Mean Squared Error):** Penalizes larger forecast misses: $\sqrt{\frac{1}{N}\sum (y - \hat{y})^2}$.
  - **MAPE (Mean Absolute Percentage Error):** Evaluates relative percentage accuracy, applying a safety epsilon for non-trading / zero-sales days.
  - **sMAPE (Symmetric MAPE):** Bounded between $0\%$ and $200\%$ to handle zero-demand periods gracefully.
- **Champion Selection:** The evaluator tests all candidate models on the held-out validation window, ranks them by MAE, and selects the champion model before refitting on all data for forward projections.

### High-Performance Forecasting Service (`app/services/forecast_service.py`)
- Decoupled from HTTP controllers.
- Accepts `product_id`, `horizon` (days), and `model_preference` (`auto` or specific model).
- Outputs predicted demand, future calendar dates, model used, and validation metrics.
- **Persisted Forecast Caching:** Persists forecast documents to MongoDB (`forecasts` collection), allowing dashboard views to fetch latest forecasts instantly with sub-10ms latency rather than retraining on every request.

### Endpoints
- `POST /api/v1/forecasting/generate`: Triggers model evaluation and generates forward-looking demand projections.
- `GET /api/v1/forecasting/latest/{product_id}`: Retrieves the newest persisted forecast without retraining.
- `GET /api/v1/forecasting/dataset`: Previews clean time-series features and validation audits.

---

## 10. Phase 10: Demand Forecasting Application Integration

### Architecture & Service Design
Phase 10 integrates the ML demand forecasting engine directly into the application stack with intelligent caching, scheduled batch execution, and interactive frontend visualizations:

1. **Intelligent Caching Policy:**
   - To prevent unnecessary GPU/CPU compute and redundant model retraining, `ForecastService` checks for fresh persisted forecasts generated within the last 24 hours (`CACHE_TTL_HOURS = 24.0`).
   - If a valid cached forecast exists with a horizon covering the request, it is returned immediately with sub-10ms latency.
   - Users can optionally toggle `force_retrain: true` to bypass the cache and force a complete re-evaluation.

2. **Dual-Trigger Execution Architecture:**
   - **Manual On-Demand:** Triggered through `POST /api/v1/forecasting/generate` with custom horizons (7, 14, 30 days) and model preferences (`auto`, `ridge`, `exponential_smoothing`, `moving_average`, `baseline`).
   - **Scheduled / Batch Job:** Accessible via `POST /api/v1/forecasting/batch` to iterate through active catalog items on a nightly cron or background worker, updating forecasts while automatically skipping products with fresh caches.

3. **Sparse & Cold-Start Data Graceful Fallback:**
   - When a product has insufficient historical sales (< 4 periods), the pipeline automatically falls back to a conservative baseline based on catalog reorder thresholds and available mean sales.
   - Sets `insufficient_data: true` and attaches clear explanatory guidance so inventory planners understand the rationale without system exceptions.

4. **Rich Interactive Recharts Visualizations (`/forecast`):**
   - **Visual Distinction:** Historical measured sales are rendered as a solid emerald line (`●`), while future projected demand is shown as a distinctive dashed indigo line with an 80% confidence interval band.
   - **Timeline Reference Line:** A vertical boundary marker explicitly identifies the transition from observed historical data to forward-looking projection.
   - **Model Comparison Leaderboard:** Displays backtested MAE, RMSE, MAPE %, and sMAPE % across all candidate models, highlighting the selected champion.
   - **Day-by-Day Depletion Schedule:** Projects remaining stock levels across the forecast horizon, flagging dates when cumulative consumption breaches reorder points.

### Phase 10 Endpoints
- `POST /api/v1/forecasting/generate`: Generate/retrieve forecast for a single product (with caching & force-retrain controls).
- `GET /api/v1/forecasting/latest/{product_id}`: Sub-10ms lookup of latest forecast document with historical and future points.
- `POST /api/v1/forecasting/batch`: Trigger batch scheduled forecasting across active catalog products.
- `GET /api/v1/forecasting/products`: Returns inventory products with current forecast status and last-generated timestamps.

---

## 11. Phase 11: Inventory Intelligence & Risk Diagnostics

### Analytical Capabilities & Understandable Business Rules
Rather than wrapping simple diagnostic heuristics into opaque machine learning models, ForecastFlow Phase 11 implements clean, transparent, and auditable business rules to evaluate inventory velocity and financial risk:

1. **Fast-Moving Products:**
   - **Criteria:** Daily sales velocity $V \ge \text{fast\_moving\_daily\_velocity}$ (default: $\ge 2.0$ units/day in the recent analysis window).
   - **Business Value:** High turnover catalog items requiring automated reorder pipelines and tight lead-time monitoring.

2. **Slow-Moving Products:**
   - **Criteria:** Active sales recorded in the window, but daily velocity $0 < V < \text{slow\_moving\_daily\_velocity}$ (default: $< 0.5$ units/day).
   - **Business Value:** Products moving sluggishly that consume shelf space and risk gradual depreciation.

3. **Dead-Stock Detection:**
   - **Criteria:** Physical stock on hand $> 0$, but zero customer sales recorded over the dead stock window ($t_{\text{no-sale}} \ge \text{dead\_stock\_days}$, default: $\ge 60$ days).
   - **Financial Calculation:** $\text{Dead Stock Capital} = \text{Current Stock} \times \text{Cost Price}$.
   - **Business Value:** Pinpoints dormant capital tying up liquidity, providing an actionable liquidation or clearance candidate list.

4. **Stockout Risk Diagnostics:**
   - **Criteria:**
     - **CRITICAL:** Physical stock $= 0$, or days of inventory remaining ($\text{Runway}$) $\le 3.0$ days.
     - **HIGH:** Runway $\le \text{stockout\_risk\_days}$ (default: $\le 7.0$ days).
     - **MEDIUM:** Current stock has breached the catalog `reorder_point`.
   - **Shortfall Calculation:** $\text{Shortfall} = \max(0, \text{Effective Demand} \times \text{Risk Horizon} - \text{Current Stock})$.
   - **Revenue at Risk:** $\text{Shortfall} \times \text{Selling Price}$.
   - **Business Value:** Prevents stockouts, backorders, and lost revenue before supply runs dry.

5. **Overstock Risk Diagnostics:**
   - **Criteria:** Current stock exceeds `target_stock_level` while Runway $\ge \text{overstock\_days}$ (default: $\ge 90$ days) or is infinite ($\text{Runway} = 999\text{d}$).
   - **Excess Capital Tied Up:** $(\text{Current Stock} - \text{Target Stock}) \times \text{Cost Price}$.
   - **Business Value:** Highlights oversized purchase batches that inflate carrying and warehousing costs.

### Configurable Business Thresholds (`InventoryIntelligenceConfig`)
All thresholds can be dynamically tuned at runtime without hardcoding:
| Parameter | Default | Supported Range | Description |
| :--- | :--- | :--- | :--- |
| `analysis_window_days` | `30` days | 7 to 180 days | Historical rolling window to compute recent sales velocity |
| `dead_stock_days` | `60` days | 14 to 365 days | Inactivity window (zero sales) triggering dead stock alerts |
| `fast_moving_daily_velocity`| `2.0` u/day | 0.1 to 100.0 u/day | Daily sales velocity cutoff for fast-moving items |
| `slow_moving_daily_velocity`| `0.5` u/day | 0.01 to 50.0 u/day | Velocity cutoff below which an active product is slow-moving |
| `stockout_risk_days` | `7.0` days | 1.0 to 60.0 days | Runway horizon triggering urgent restock warnings |
| `overstock_days` | `90.0` days | 14.0 to 365.0 days | Runway horizon above which inventory is considered surplus |

### Inventory Intelligence Service (`app/services/intelligence_service.py`)
- Computes product-level velocity metrics and portfolio-level health statistics.
- Seamlessly fuses historical sales aggregations with Phase 9/10 ML demand forecasts to produce effective daily demand.
- Supports sorting, text search, category filtering, and risk/velocity filtering.

### Phase 11 REST API Endpoints
- `GET /api/v1/intelligence/summary`: Portfolio health summary (dead stock capital, stockout counts, overstock exposure, runway).
- `GET /api/v1/intelligence/products`: Filterable, searchable, and paginated product diagnostics.
- `GET /api/v1/intelligence/fast-moving`: List high-velocity items.
- `GET /api/v1/intelligence/slow-moving`: List sluggish items.
- `GET /api/v1/intelligence/dead-stock`: List obsolete items with tied-up capital.
- `GET /api/v1/intelligence/stockout-risk`: List critical restock risk products with revenue shortfall.
- `GET /api/v1/intelligence/overstock-risk`: List overstocked items with excess capital.
- `POST /api/v1/intelligence/simulate`: What-if threshold scenario simulation.

### Frontend Dashboard (`/intelligence`)
- Dedicated **Inventory Intelligence & Risk Diagnostics** dashboard.
- Executive KPI summary cards with live financial impact.
- Interactive **Configurable Intelligence Rules & Thresholds** drawer.
- Segmented view tabs: **All Products**, **Stockout Risk**, **Dead Stock**, **Overstock Risk**, **Fast-Moving**, and **Slow-Moving**.
- Visual indicators for inventory runway, shortfall units, and excess holding capital.

---

## 9. Phase 12: Intelligent Restock Recommendations

### Core Architectural Principle
* **The forecasting model predicts demand.**
* **The recommendation engine uses the prediction plus inventory and business information to calculate the recommended purchase quantity.**
* **The recommendation engine is NOT an ML model.** It is a deterministic, fully auditable, formula- and rule-based system ensuring business transparency, compliance, and zero black-box confusion.

### Replenishment Formula & Math
The purchase quantity balances gross requirement against all available inventory in the pipeline:

$$\text{Gross Target} = \text{Forecast Demand} + \text{Safety Stock}$$
$$\text{Total Pipeline} = \text{Current Stock On Hand} + \text{Incoming Stock (Open POs)}$$
$$\text{Net Shortfall} = \text{Gross Target} - \text{Total Pipeline}$$
$$\text{Recommended Order Quantity} = \max\left(0, \lceil \text{Net Shortfall} \rceil\right)$$

* **Non-Negativity Guarantee:** If $\text{Total Pipeline} \ge \text{Gross Target}$, the output is strictly $0$ (never negative).
* **Incoming PO Pipeline Awareness:** Queries the `purchases` collection for active orders with `status: "ordered"` to prevent duplicate reorders.
* **Lead Time & Review Horizon:** Integrates supplier lead times with review cycle windows (7 to 90 days, default: 14 days) so that procurement lead times are adequately covered.

### Priority Assignment Rules (Non-Arbitrary Logic)
Every recommendation is assigned an urgency classification based on transparent business rules:

| Priority | Criteria & Rationale |
| :--- | :--- |
| **`critical`** | Physical stock on hand $= 0$ with 0 incoming units, OR current inventory runway $\le 3$ days with 0 incoming units, OR total pipeline is strictly less than projected demand across the supplier lead time. Imminent stockout risk. |
| **`high`** | Total pipeline inventory $\le \text{reorder\_point}$, OR inventory runway $\le (\text{Lead Time} + 3\text{ days})$. Reordering is urgent to prevent safety buffer erosion. |
| **`medium`** | Total pipeline has sufficient runway to survive lead time, but has a deficit relative to target safety stock across the review horizon. |
| **`low`** | Pipeline is nearly balanced; recommended order is a discretionary top-off to reach target replenishment buffer. |

### Recommendation Lifecycle & PO Conversion
* Recommendations transition across statuses: `pending` $\rightarrow$ `approved` $\rightarrow$ `ordered` (or `dismissed`).
* **1-Click PO Conversion (`POST /convert-to-purchase`):** Instantly creates a formal order in the `purchases` collection with status `"ordered"`. Once ordered, those units automatically count toward incoming pipeline stock in all future recommendation runs.

### Phase 12 REST API Endpoints (`/api/v1/recommendations`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/recommendations/generate` | Executes the recommendation engine over catalog products for a specified planning horizon (7–90 days). Persists recommendations to MongoDB. |
| `GET` | `/api/v1/recommendations` | Paginated restock recommendations with executive portfolio summary, filterable by `status`, `urgency`, `category_id`, `supplier_id`, and `search`. |
| `PATCH` | `/api/v1/recommendations/{id}/status` | Updates recommendation lifecycle status (`approved`, `dismissed`, `pending`). |
| `POST` | `/api/v1/recommendations/{id}/convert-to-purchase` | Converts recommendation directly into an official Purchase Order in `purchases`. |

### Frontend Experience (`/recommendations`)
* **Executive Restock KPIs:** Actionable restocks count, critical attention count, total units needed, and total estimated procurement capital ($).
* **Dimensional Filtering:** Segment by status tabs (Pending, Approved, Ordered, Dismissed, All), urgency levels, category, and supplier.
* **Transparent "Why?" Modal:** Displays step-by-step mathematical calculations ($F$, $SS$, $S_{\text{current}}$, $S_{\text{incoming}}$, net shortfall), lead times, risk factor flags, and the explicit rationale for the priority classification.
* **Procurement Actions:** Approve, dismiss, restore, or 1-click convert to purchase order with confirmation dialogs and feedback toasts.

---

## 10. Phase 13: Final AI Inventory Dashboard (Executive Command Center)

### Unified Operational Philosophy
Phase 13 unites ForecastFlow's major commercial, predictive, and replenishment capabilities into one cohesive, single-pane-of-glass executive command center. It answers three essential business questions without clutter, chart overload, or redundant data fetching:

```
  ┌─────────────────────────────────────────────────────────┐
  │       AI INVENTORY & DEMAND COMMAND CENTER              │
  ├─────────────────────────────────────────────────────────┤
  │ 1. WHAT IS HAPPENING WITH MY INVENTORY?                 │
  │    • Inventory & Sales Overview KPIs                    │
  │    • Low-Stock Alerts Banner                            │
  │    • Commercial Sales & Demand Velocity Trends Chart    │
  │    • Inventory Velocity Summary (Fast vs Dead/Slow)     │
  ├─────────────────────────────────────────────────────────┤
  │ 2. WHAT WILL LIKELY HAPPEN?                             │
  │    • High-Probability Stockout Risks                    │
  │    • 14-Day Demand Forecast Portfolio Summary           │
  │    • Interactive Product Forecast Trajectory Chart      │
  ├─────────────────────────────────────────────────────────┤
  │ 3. WHAT SHOULD I DO?                                    │
  │    • Actionable AI Restock Recommendations              │
  │    • Transparent "Why?" Mathematical Audit Modal        │
  │    • 1-Click Purchase Order Generation                  │
  └─────────────────────────────────────────────────────────┘
```

### High-Performance Unified API (`GET /api/v1/analytics/ai-dashboard`)
Instead of initiating multiple fragmented HTTP calls that cause waterfall latency and redundant DB queries, the frontend invokes a single optimized endpoint:

* **Endpoint:** `GET /api/v1/analytics/ai-dashboard`
* **Query Parameters:** `timeframe` (`7d`, `30d`, `90d`, `1y`), `target_product_id` (optional for featured forecast).
* **Response Payload (`AIDashboardResponse`):**
  - `inventory_overview`: Total products, total physical units, inventory valuation ($), low-stock count, and stockout count.
  - `sales_overview`: Total sales revenue, units sold, order count, total purchases outlay, and PO count.
  - `low_stock_alerts`: Prioritized list of products below reorder thresholds.
  - `sales_trends`: Time-series points with daily revenue, units sold, and orders.
  - `top_fast_moving`: Products ranked by sales velocity.
  - `slow_dead_stock_summary`: Dormant products with idle capital tied up ($).
  - `stockout_risk_products`: Products projected to run dry within supplier lead time, with runway and revenue at risk.
  - `forecast_summary`: Portfolio-wide projected demand units across the 14-day horizon and primary ML model used.
  - `featured_forecast`: Historical actuals merged with forward predictions for interactive chart visualization.
  - `restock_summary`: Critical and high-priority restock orders with 1-click PO action and formula explanations.

### Frontend Dashboard Experience (`/`)
* **Timeframe Presets:** Quickly switch between `7 Days`, `30 Days` (Standard), `90 Days`, and `1 Year`.
* **Zero Duplication:** All widgets consume the single consolidated backend response.
* **Interactive Forecast Inspection:** Select any catalog product from the dropdown to immediately view its dual-zone actual vs forecast curve without reloading the page.
* **Direct PO Conversion:** Order restock recommendations directly from the dashboard with instant confirmation modals.








