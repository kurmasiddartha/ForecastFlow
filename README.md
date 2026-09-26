# ForecastFlow

> **AI Inventory and Demand Forecasting System for Small Businesses**

ForecastFlow is a full-stack inventory management and predictive demand forecasting platform. It replaces guesswork and paper ledger notebooks with automated machine learning forecasts, supplier lead-time awareness, inventory risk diagnostics, and formula-driven restock recommendations with 1-click purchase orders.

---

## Key Features

- **Product & Vendor Catalog:** Manage products, categories, suppliers, lead times, safety stocks, and reorder levels.
- **Stock Movements & Audit Ledger:** Real-time physical inventory adjustments with an immutable, traceable audit log.
- **Sales & Purchase Order Workflows:** Multi-item sales orders with atomic stock deductions and purchase orders with automated inventory replenishment upon delivery.
- **Time-Series Demand Forecasting:**
  - Ensemble of statistical & ML models: **Ridge Regression (L2)**, **Exponential Smoothing (SES)**, **Moving Average**, and **Naive Baseline**.
  - Strict chronological holdout splits and automated **champion model selection** based on MAE, RMSE, MAPE, and sMAPE.
  - Sub-10ms cached projections with optional on-demand retraining.
- **Inventory Intelligence & Diagnostics:**
  - **Fast vs. Slow-Moving Classification:** Identifies velocity trends and high-demand inventory.
  - **Dead Stock Detection:** Flags stagnant items with zero sales to unlock idle working capital.
  - **Runway & Stockout Risk:** Predicts days of supply remaining and flags stockouts before they occur.
- **Formula-Driven Restock Recommendations:**
  - Transparent, auditable mathematical logic:
    $$\text{Recommended Order} = \max\left(0, \lceil (\text{Forecast Demand} + \text{Safety Stock}) - (\text{Current Stock} + \text{Incoming POs}) \rceil\right)$$
  - Automatic urgency categorization (`critical`, `high`, `medium`, `low`).
  - **1-Click PO Conversion:** Converts recommendations directly into open Purchase Orders.
- **Interactive Executive Dashboard:** Single-pane-of-glass overview of sales velocity, inventory valuation, risk alerts, and demand projections.
- **Mobile & Laptop Friendly:** Touch-optimized mobile navigation drawer, bottom dock for handheld devices, and responsive data tables with horizontal scrolling.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic v2, Pydantic Settings |
| **Data Science & ML** | scikit-learn, Pandas, NumPy |
| **Database** | MongoDB Atlas / Local MongoDB (Motor Async Driver, PyMongo) |
| **Authentication** | Bcrypt (12 rounds), PyJWT (HS256 Bearer tokens) |
| **Testing** | Pytest, HTTPX, Pytest-Asyncio |

---

## Project Structure

```
ForecastFlow/
├── backend/
│   ├── app/
│   │   ├── core/              # Configuration (pydantic-settings), security & JWT utils
│   │   ├── database/          # Motor async client & compound indexes
│   │   ├── ml/                # Time-series pipeline (extraction, imputation, features, models)
│   │   ├── models/            # MongoDB document schemas (PyObjectId)
│   │   ├── routes/            # REST API route handlers
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── services/          # Business logic services (inventory, forecasting, restock)
│   │   └── main.py            # FastAPI entry point & lifespan manager
│   ├── tests/                 # Automated pytest test suites
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI widgets, tables, charts, and modals
│   │   ├── context/           # React Context (AuthContext)
│   │   ├── layouts/           # MainLayout with responsive sidebar & mobile bottom nav
│   │   ├── pages/             # Route views (Dashboard, Products, Forecast, Restock, etc.)
│   │   ├── services/          # API client services (fetch wrapper with auto JWT)
│   │   └── index.css          # Tailwind CSS and mobile touch styles
│   ├── package.json           # Node dependencies & build scripts
│   ├── vercel.json            # SPA routing rewrite configuration
│   └── vite.config.js         # Vite configuration
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18.0 or higher) & **npm**
- **Python** (v3.12 or higher)
- **MongoDB** (Local instance or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

---

### 1. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your MongoDB connection string and security keys:
   ```env
   MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=forecastflow_db
   JWT_SECRET_KEY=your_super_secret_jwt_key_here
   CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
   ```

5. **Start the backend development server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API Docs available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   Open your browser at: `http://localhost:5173`

---

### 3. Demo Store Login

The application includes a pre-configured demo for **Siddu Kirana & General Store** (featuring 26 fast-moving retail products, 35 days of sales records, and restock alerts):

- **Login URL:** `http://localhost:5173/login`
- **Email:** `siddu@kirana.com`
- **Password:** `Password123`
- Or click the **1-Click Demo Login** button directly on the login page.

---

## REST API Overview

| Group | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT Bearer token |
| | `POST` | `/api/v1/auth/register` | Register a new store owner account |
| | `GET` | `/api/v1/auth/me` | Fetch active profile |
| **Catalog** | `GET/POST` | `/api/v1/products` | Paginated product catalog & creation |
| | `GET/POST` | `/api/v1/categories` | Product aisle & category management |
| | `GET/POST` | `/api/v1/suppliers` | Vendor directory with lead-time tracking |
| **Inventory** | `GET` | `/api/v1/inventory/summary` | Real-time stock counts and valuation |
| | `POST` | `/api/v1/inventory/adjust` | Record manual physical count adjustments |
| | `GET` | `/api/v1/inventory/movements` | Chronological audit ledger |
| **Sales & Orders**| `GET/POST` | `/api/v1/sales` | Record customer sales with atomic stock deduction |
| | `GET/POST` | `/api/v1/purchases` | Purchase orders with automated receiving restock |
| **Forecasting** | `POST` | `/api/v1/forecasting/generate` | Run ML demand forecasting models |
| | `GET` | `/api/v1/forecasting/latest/{product_id}` | Retrieve latest cached demand projections |
| | `POST` | `/api/v1/forecasting/batch` | Execute scheduled batch pipeline across catalog |
| **Intelligence** | `GET` | `/api/v1/intelligence/summary` | Portfolio health & dead stock capital exposure |
| | `GET` | `/api/v1/intelligence/products` | Velocity classifications & stockout runways |
| **Restocking** | `GET` | `/api/v1/recommendations` | List formula-based replenishment recommendations |
| | `POST` | `/api/v1/recommendations/{id}/convert-to-purchase`| 1-click convert recommendation to Purchase Order |
| **Dashboard** | `GET` | `/api/v1/analytics/ai-dashboard` | Single-call consolidated executive metrics & chart data |

---

## Automated Testing

To run backend unit and integration test suites:

```bash
cd backend
pytest tests -v
```

---

## Deployment

- **Frontend on Vercel:** Deploy the `frontend/` directory with Framework Preset `Vite` and set `VITE_API_BASE_URL` to your backend URL.
- **Backend on Render / Railway:** Deploy `backend/` as a Web Service running `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Database:** Free MongoDB Atlas M0 Cluster.

---

## License

MIT License. Designed and built for small retail businesses, supermarkets, and neighborhood kirana stores.
