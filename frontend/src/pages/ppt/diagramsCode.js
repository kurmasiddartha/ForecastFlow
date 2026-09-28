/**
 * diagramsCode.js
 * 
 * Formal Mermaid.js, PlantUML source code, and AI LLM Generation Prompts
 * for all ForecastFlow UML diagrams.
 * 
 * Evaluators, faculty, developers, and students can copy these definitions
 * directly into ChatGPT, Claude, Gemini, GitHub Markdown, Notion, or PlantText.
 */

export const MASTER_AI_PROMPT = `Act as an Expert Senior Software Architect and UML Specialist.
Generate professional, standards-compliant UML diagram code in PlantUML (@startuml ... @enduml) and Mermaid.js format for our real-world major engineering project:

PROJECT NAME: "ForecastFlow: AI Inventory and Demand Forecasting System for Small Businesses"
INSTITUTION: CVR College of Engineering — Department of Computer Science & Engineering (Review-II / Stage-I)

=== DOMAIN CONTEXT & SYSTEM SPECIFICATIONS ===
1. Domain & Problem:
   - Target Users: Unorganized Kirana stores, grocery merchants, and retail SMBs.
   - Core Problem: Eliminates manual paper ledger ("khata") guesswork, stockouts of fast-moving staples (Atta, Oil, Pulses costing 4-8% revenue), and capital lock-in in dead stock (15-22% working capital).
2. Technology Stack:
   - Frontend: React 18 Single-Page Application, Vite 5, Tailwind CSS v3.4, Recharts 3.10
   - Backend: Python 3.12, FastAPI, Uvicorn ASGI Server, Pydantic v2 schemas
   - Machine Learning: scikit-learn, Pandas, NumPy (Multi-model competitive tournament: Ridge Regression L2 with lag/rolling features, Single Exponential Smoothing SES, 7-day Moving Average, and Naive baseline. Champion model selected dynamically on 7-day chronological holdouts using MAE/RMSE).
   - Storage & Ledger: MongoDB Atlas 7.0 with Motor asynchronous non-blocking driver. Collections: users, products, categories, suppliers, stock_movements (atomic audit ledger), sales, purchases, forecasts (TTL cached), recommendations.
   - Security: Stateless JWT HS256 Bearer tokens, Passlib Bcrypt (12 rounds).
3. Core Mathematical Restock Formula:
   Recommended_Order_Qty = max(0, ceil((Forecast_Demand_During_Lead_Time + Safety_Stock) - (Current_Stock + Incoming_Open_POs)))
4. Benchmark Operational Data (Siddu Kirana & General Store):
   - Product: SKU-ATTA-01 "Aashirvaad Shudh Chakki Atta 10kg", Cost: ₹360, Price: ₹420, CurrentStock: 6 (Critical), ReorderPoint: 10, SafetyStock: 5
   - Supplier: SUP-001 "Sri Balaji Wholesale Mandi", LeadTime: 3 Days, Contact: orders@balajimandi.in
   - Category: CAT-GRAIN-01 "Grains & Flours", Aisle: Godown
   - Customer Order: SO-2026-114, Total: ₹1,680.00, Payment: UPI
   - Stock Movement: SM-9042, Date: 2026-09-28, Quantity: -4, Reason: Sale Deduction
   - Purchase Order: PO-0089, Total: ₹9,000.00, Status: Ordered, LeadTime: 3 Days
   - ML Forecast: Champion = Ridge L2, MAE: 1.14, 7-Day Demand Projection: 28 units

=== INSTRUCTIONS FOR LLM ===
Based on the above specifications, generate clean, production-ready, error-free PlantUML (@startuml ... @enduml) or Mermaid.js code for the requested diagram.
- Use clean node boxes with proper attribute rows and data types.
- Label all connectors with domain relationship descriptions (e.g. "orders", "placed with", "belongs to", "affected by", "tracked in").
- Ensure syntax works directly on PlantText.com and Mermaid Live Editor without external dependencies.`;

export const DIAGRAMS_CODE = {
  object: {
    title: "1. UML Object Diagram",
    summary: "Real runtime instances matching the project benchmark (PurchaseOrder, Product, Supplier, Category, StockMovement, Order).",
    prompt: `Generate a detailed UML Object Diagram in PlantUML (@startuml ... @enduml) for the project "ForecastFlow: AI Inventory and Demand Forecasting System for Small Businesses".

Requirements:
- Show real runtime object instances matching the Siddu Kirana benchmark:
  1. PurchaseOrder instance (PurchaseOrderID = "PO-0089", OrderDate = "2026-09-24", SupplierID = "SUP-001", Status = "Pending", Total = "₹9,000")
  2. Supplier instance (SupplierID = "SUP-001", Name = "Sri Balaji Mandi", LeadTime = "3 Days", Contact = "orders@balajimandi.in")
  3. Product instance (ProductID = "SKU-ATTA-01", Name = "Aashirvaad Atta 10kg", Price = 420.00, Cost = 360.00, CurrentStock = 6, ReorderPoint = 10)
  4. Category instance (CategoryID = "CAT-GRAIN-01", Name = "Grains & Flours")
  5. StockMovement instance (MovementID = "SM-9042", Date = "2026-09-28", Quantity = -4, Reason = "Sale Deduction")
  6. Order / SalesOrder instance (OrderID = "SO-2026-114", Total = ₹1,680, Payment = "UPI", Status = "Completed")
  7. Inventory instance (Warehouse = "Siddu Godown", SafetyStock = 5, ReorderPoint = 10)
  8. ForecastModel instance (Champion = "Ridge L2", 7DayDemand = 28, MAE = 1.14)
- Connect them with labeled relationship arrows:
  - PurchaseOrder -> Product (orders)
  - PurchaseOrder -> Supplier (placed with)
  - Product -> Category (belongs to)
  - Product -> StockMovement (affected by)
  - Product -> Order (included in)
  - StockMovement -> Inventory (tracked in)
  - StockMovement -> ForecastModel (trains)
- Provide valid, standalone PlantUML code that renders on PlantText.com.`,
    mermaid: `classDiagram
    direction TB
    note "ForecastFlow Benchmark Object Instances (Siddu Kirana)"
    
    class PurchaseOrder {
        PurchaseOrderID = "PO-0089"
        OrderDate = "2026-09-24"
        SupplierID = "SUP-001"
        Status = "Pending"
        TotalCost = "₹9,000.00"
    }
    class Supplier {
        SupplierID = "SUP-001"
        SupplierName = "Sri Balaji Mandi"
        LeadTime = "3 Days"
        Contact = "orders@balajimandi.in"
    }
    class Product {
        ProductID = "SKU-ATTA-01"
        Name = "Aashirvaad Atta 10kg"
        Price = 420.00
        Cost = 360.00
        CurrentStock = 6
        ReorderPoint = 10
    }
    class Category {
        CategoryID = "CAT-GRAIN-01"
        Category = "Grains & Flours"
        Aisle = "Aisle 1 - Godown"
    }
    class StockMovement {
        MovementID = "SM-9042"
        Date = "2026-09-28"
        Quantity = -4
        Reason = "Counter Sale"
        BalanceStock = 6
    }
    class Order {
        OrderID = "SO-2026-114"
        OrderDate = "2026-09-28"
        Total = "₹1,680.00"
        Payment = "UPI"
        Status = "Completed"
    }
    class Inventory {
        Warehouse = "Siddu Godown"
        SafetyStock = 5
        ReorderPoint = 10
    }
    class ForecastModel {
        ChampionModel = "Ridge L2"
        MAE = 1.14
        7DayDemand = 28
    }

    PurchaseOrder --> Product : orders
    PurchaseOrder --> Supplier : placed with
    Product --> Category : belongs to
    Product --> StockMovement : affected by
    Product --> Order : included in
    StockMovement --> Inventory : tracked in
    StockMovement --> ForecastModel : trains`,
    plantuml: `@startuml
title ForecastFlow - UML Object Diagram (Siddu Kirana Instance)

object "PO-0089 : PurchaseOrder" as po {
  PurchaseOrderID = "PO-0089"
  OrderDate = "2026-09-24"
  SupplierID = "SUP-001"
  Status = "Pending"
  TotalCost = "₹9,000.00"
}

object "SUP-001 : Supplier" as sup {
  SupplierID = "SUP-001"
  SupplierName = "Sri Balaji Mandi"
  LeadTime = "3 Days"
  Contact = "orders@balajimandi.in"
}

object "SKU-ATTA-01 : Product" as prod {
  ProductID = "SKU-ATTA-01"
  Name = "Aashirvaad Atta 10kg"
  Price = 420.00
  Cost = 360.00
  CurrentStock = 6
  ReorderPoint = 10
}

object "CAT-01 : Category" as cat {
  CategoryID = "CAT-GRAIN-01"
  Category = "Grains & Flours"
}

object "SM-9042 : StockMovement" as sm {
  MovementID = "SM-9042"
  Date = "2026-09-28"
  Quantity = -4
  Reason = "Counter Sale"
}

object "SO-114 : Order" as ord {
  OrderID = "SO-2026-114"
  Total = 1680.00
  Payment = "UPI"
  Status = "Completed"
}

object "SidduGodown : Inventory" as inv {
  Warehouse = "Siddu Godown"
  SafetyStock = 5
  ReorderPoint = 10
}

object "FC-1002 : ForecastModel" as fc {
  ChampionModel = "Ridge L2"
  MAE = 1.14
  ProjectedDemand = 28
}

po --> prod : orders
po --> sup : placed with
prod --> cat : belongs to
prod --> sm : affected by
prod --> ord : included in
sm --> inv : tracked in
sm --> fc : trains
@enduml`
  },

  class: {
    title: "2. UML Class Diagram",
    summary: "Standard 3-compartment domain entities with typed attributes, methods, visibility markers (+), and relational cardinalities.",
    prompt: `Generate a formal UML 2.5 Class Diagram in PlantUML (@startuml ... @enduml) for the software project "ForecastFlow: AI Inventory and Demand Forecasting System for Small Businesses".

Requirements:
- Represent full 3-compartment classes: Class Name, Attributes with data types, and Operations/Methods with return types.
- Entities to model:
  1. User (_id, email, full_name, hashed_password, role, is_active | verify_password(), generate_jwt(), is_admin())
  2. Product (_id, sku, name, category_id, supplier_id, unit_cost, selling_price, current_stock, reorder_point, safety_stock, lead_time_days | adjust_stock(), is_low_stock(), calculate_valuation())
  3. Category (_id, name, description | get_products(), count_skus())
  4. Supplier (_id, name, contact_name, email, phone, lead_time_days | create_po(), get_active_orders())
  5. StockMovement (_id, product_id, movement_type, quantity, previous_stock, new_stock, reason, created_at | log_audit_entry(), validate_non_negative())
  6. SaleOrder (_id, sale_number, items, total_amount, payment_method | deduct_stock_atomic(), generate_receipt())
  7. PurchaseOrder (_id, po_number, supplier_id, items, total_cost, status | receive_and_restock(), mark_delivered())
  8. Forecast (_id, product_id, champion_model, metrics, predictions | get_demand(), is_cache_valid())
  9. RestockRecommendation (_id, product_id, recommended_qty, urgency, formula_inputs, is_converted | convert_to_po(), compute_urgency())
- Add cardinalities (1, 1..*, 0..*) and dependency arrows (e.g. RestockRecommendation ..> PurchaseOrder : <<converts to>>).
- Output valid PlantUML code.`,
    mermaid: `classDiagram
    direction TB
    
    class User {
        +ObjectId _id
        +string email
        +string full_name
        +string hashed_password
        +string role
        +bool is_active
        +verify_password(plain_pwd: str) bool
        +generate_jwt() string
        +is_admin() bool
    }

    class Product {
        +ObjectId _id
        +string sku
        +string name
        +ObjectId category_id
        +ObjectId supplier_id
        +float unit_cost
        +float selling_price
        +int current_stock
        +int reorder_point
        +int safety_stock
        +int lead_time_days
        +adjust_stock(delta: int) void
        +is_low_stock() bool
        +calculate_valuation() float
    }

    class Category {
        +ObjectId _id
        +string name
        +string description
        +get_products() List
        +count_skus() int
    }

    class Supplier {
        +ObjectId _id
        +string name
        +string contact_name
        +string email
        +string phone
        +int lead_time_days
        +create_po(items: List) PurchaseOrder
        +get_active_orders() List
    }

    class StockMovement {
        +ObjectId _id
        +ObjectId product_id
        +string movement_type
        +int quantity
        +int previous_stock
        +int new_stock
        +string reason
        +datetime created_at
        +log_audit_entry() void
        +validate_non_negative() bool
    }

    class SaleOrder {
        +ObjectId _id
        +string sale_number
        +List~SaleItem~ items
        +float total_amount
        +string payment_method
        +datetime created_at
        +deduct_stock_atomic() void
        +generate_receipt() string
    }

    class PurchaseOrder {
        +ObjectId _id
        +string po_number
        +ObjectId supplier_id
        +List~POItem~ items
        +float total_cost
        +string status
        +datetime received_at
        +receive_and_restock() void
        +mark_delivered() void
    }

    class Forecast {
        +ObjectId _id
        +ObjectId product_id
        +string champion_model
        +Dict~str, float~ metrics
        +List~float~ predictions
        +datetime generated_at
        +get_demand(days: int) float
        +is_cache_valid() bool
    }

    class RestockRecommendation {
        +ObjectId _id
        +ObjectId product_id
        +int recommended_qty
        +string urgency
        +Dict formula_inputs
        +bool is_converted
        +convert_to_po() PurchaseOrder
        +compute_urgency() string
    }

    Category "1" -- "0..*" Product : contains
    Supplier "1" -- "1..*" Product : supplies
    Product "1" -- "0..*" StockMovement : tracks
    Product "1" -- "1..*" SaleOrder : included_in
    Supplier "1" -- "0..*" PurchaseOrder : receives
    Product "1" -- "1" Forecast : projects
    Forecast "1" ..> "0..*" RestockRecommendation : generates
    RestockRecommendation ..> PurchaseOrder : converts_to`,
    plantuml: `@startuml
title ForecastFlow - UML Class Diagram

class User {
  + ObjectId _id
  + string email
  + string full_name
  + string hashed_password
  + string role
  + bool is_active
  + verify_password(plain_pwd: str): bool
  + generate_jwt(): string
}

class Product {
  + ObjectId _id
  + string sku
  + string name
  + ObjectId category_id
  + ObjectId supplier_id
  + float unit_cost
  + float selling_price
  + int current_stock
  + int reorder_point
  + int safety_stock
  + int lead_time_days
  + adjust_stock(delta: int): void
  + is_low_stock(): bool
}

class Category {
  + ObjectId _id
  + string name
  + string description
  + get_products(): List
}

class Supplier {
  + ObjectId _id
  + string name
  + string email
  + int lead_time_days
  + create_po(): PurchaseOrder
}

class StockMovement {
  + ObjectId _id
  + ObjectId product_id
  + string movement_type
  + int quantity
  + int previous_stock
  + int new_stock
  + log_audit_entry(): void
}

class SaleOrder {
  + ObjectId _id
  + string sale_number
  + float total_amount
  + deduct_stock_atomic(): void
}

class PurchaseOrder {
  + ObjectId _id
  + string po_number
  + ObjectId supplier_id
  + string status
  + receive_and_restock(): void
}

class Forecast {
  + ObjectId _id
  + ObjectId product_id
  + string champion_model
  + Dict metrics
  + List predictions
  + get_demand(days: int): float
}

class RestockRecommendation {
  + ObjectId _id
  + int recommended_qty
  + string urgency
  + bool is_converted
  + convert_to_po(): PurchaseOrder
}

Category "1" -- "0..*" Product
Supplier "1" -- "1..*" Product
Product "1" -- "0..*" StockMovement
Product "1" -- "1..*" SaleOrder
Supplier "1" -- "0..*" PurchaseOrder
Product "1" -- "1" Forecast
Forecast ..> RestockRecommendation
RestockRecommendation ..> PurchaseOrder : <<converts to>>
@enduml`
  },

  arch: {
    title: "3. 3-Tier System Architecture Diagram",
    summary: "Visual cloud topology mapping Client SPA -> FastAPI Gateway -> Logic & ML Pipeline -> MongoDB Atlas.",
    prompt: `Generate a clean 3-Tier Cloud System Architecture Diagram in PlantUML (@startuml ... @enduml) for the web application "ForecastFlow".

Layers to include:
1. Tier 1: Client Presentation Layer (React 18 SPA, Vite 5, Tailwind CSS, Recharts 3.10, Context API).
2. Tier 2: API Gateway Layer (FastAPI REST server, Uvicorn ASGI on Python 3.12, PyJWT HS256 authentication, Pydantic v2 schemas).
3. Tier 3: Business Logic & Machine Learning Pipeline (InventoryService atomic ledger, Sales & Purchase workflows, ML Ensemble Forecaster with Ridge L2, SES, and Moving Average champion selection, and Restock Recommendation engine).
4. Tier 4: Storage & Ledger Tier (MongoDB Atlas 7.0 with Motor asynchronous driver; collections: users, products, stock_movements, sales, purchases, forecasts).
Show network protocol communication: HTTPS / Bearer JWT (< 100ms), Service Coroutine Calls, and Motor Async TCP Wire Protocol. Output standalone PlantUML code.`,
    mermaid: `graph TB
    subgraph Tier1 ["Tier 1: Client Presentation (React 18 + Vite 5)"]
        UI["React SPA & Context API"]
        Tailwind["Tailwind CSS 3.4 & Mobile Drawer"]
        Charts["Recharts 3.10 SVG Visualizer"]
        APIClient["API Client + JWT Bearer Injection"]
    end

    subgraph Tier2 ["Tier 2: FastAPI Gateway (Uvicorn ASGI)"]
        ASGI["Uvicorn Async Runtime (Python 3.12)"]
        Auth["PyJWT HS256 & Passlib Bcrypt"]
        Pydantic["Pydantic v2 Schema Validation"]
        Router["REST Endpoints (/products, /sales, /forecast)"]
    end

    subgraph Tier3 ["Tier 3: Business Logic & ML Pipeline"]
        Services["Inventory, Sales & PO Services"]
        ML["ML Forecaster: Ridge L2, SES, MA"]
        Champion["Champion Tournament (Holdout MAE)"]
        Restock["Restock Engine: max(0, ceil(Fcast+Safety - Stock))"]
    end

    subgraph Tier4 ["Tier 4: Storage & Ledger (MongoDB Atlas 7.0)"]
        UsersDB[("users")]
        ProductsDB[("products (SKUs & safety stock)")]
        MovementsDB[("stock_movements (Atomic Ledger)")]
        OrdersDB[("sales & purchases")]
        ForecastsDB[("forecasts (TTL Cached)")]
    end

    Tier1 -->|HTTPS / Bearer JWT| Tier2
    Tier2 -->|Service Coroutine| Tier3
    Tier3 -->|Async Motor Wire Protocol| Tier4`,
    plantuml: `@startuml
title ForecastFlow - 3-Tier System Architecture

package "Tier 1: Client Presentation Layer" {
  [React 18 Single-Page Application] as SPA
  [Tailwind CSS & Mobile Bottom Nav] as CSS
  [Recharts 3.10 Interactive Engine] as Charts
}

package "Tier 2: API Gateway Layer" {
  [FastAPI REST Controllers] as API
  [Uvicorn ASGI Server] as ASGI
  [JWT HS256 & Bcrypt Auth] as Auth
  [Pydantic v2 Serialization] as Schema
}

package "Tier 3: Business Logic & ML Layer" {
  [Atomic Inventory Service] as InvSvc
  [Sales & Purchase Order Workflows] as OrderSvc
  [ML Ensemble Pipeline (Ridge, SES, MA)] as ML
  [Formula Restock Recommendation Engine] as Restock
}

database "Tier 4: Database & Storage" {
  folder "MongoDB Atlas 7.0" {
    [users collection]
    [products collection]
    [stock_movements ledger]
    [sales & purchases collections]
    [forecasts (TTL cached)]
  }
}

SPA --> API : HTTPS / Bearer JWT (< 100ms)
API --> InvSvc : Internal Service Call
InvSvc --> ML : Asynchronous Batch Execution
ML --> [forecasts (TTL cached)] : Motor Async Driver
InvSvc --> [stock_movements ledger] : Atomic $inc mutations
@enduml`
  },

  usecase: {
    title: "4. UML Use Case Diagram",
    summary: "Primary Human Actors (Store Owner, Cashier) and Secondary System Actors (ML Cron, Supplier) mapped to System Boundary.",
    prompt: `Generate a UML Use Case Diagram in PlantUML (@startuml ... @enduml) for the retail system "ForecastFlow".

Actors to include:
- Left: "Store Owner (Admin)" and "Store Clerk (Cashier)"
- Right: "ML Cron Engine (Background)" and "Wholesale Supplier (Vendor)"
System Boundary: "ForecastFlow System Boundary"
Use Cases:
- UC-01: User Login & JWT Auth
- UC-02: Manage Catalog & Thresholds
- UC-03: Execute ML Forecast Tournament
- UC-04: View Dead-Stock & Capital Runway
- UC-05: Record POS Counter Sale
- UC-06: 1-Click Convert Restock to PO
- UC-07: Atomic Stock Decrement Ledger
- UC-08: Inbound Receiving & Auto-Restock
Include <<include>> between UC-05 and UC-07, and <<extend>> between UC-06 and UC-08. Output valid PlantUML code.`,
    mermaid: `flowchart LR
    subgraph ActorsLeft ["Human Actors"]
        Owner(("Store Owner<br/>(Admin)"))
        Clerk(("Store Clerk<br/>(POS Cashier)"))
    end

    subgraph SystemBoundary ["ForecastFlow System Boundary"]
        UC1(["UC-01: User Login & JWT Auth"])
        UC2(["UC-02: Manage Catalog & Thresholds"])
        UC3(["UC-03: Execute ML Forecast Tournament"])
        UC4(["UC-04: View Dead-Stock & Capital Runway"])
        UC5(["UC-05: Record POS Counter Sale"])
        UC6(["UC-06: 1-Click Convert Restock to PO"])
        UC7(["UC-07: Atomic Stock Decrement Ledger"])
        UC8(["UC-08: Inbound Receiving & Auto-Restock"])
    end

    subgraph ActorsRight ["System & Vendor Actors"]
        MLCron(("ML Cron Engine<br/>(Background)"))
        Vendor(("Wholesale Vendor<br/>(Supplier)"))
    end

    Owner --- UC1
    Owner --- UC2
    Owner --- UC3
    Owner --- UC4
    Owner --- UC6

    Clerk --- UC1
    Clerk --- UC5
    Clerk --- UC7
    Clerk --- UC8

    UC3 --- MLCron
    UC4 --- MLCron
    UC6 --- Vendor
    UC8 --- Vendor

    UC5 -.->|<<include>>| UC7
    UC6 -.->|<<extend>>| UC8`,
    plantuml: `@startuml
title ForecastFlow - UML Use Case Diagram
left to right direction

actor "Store Owner (Admin)" as Owner
actor "Store Clerk (Cashier)" as Cashier
actor "ML Cron Engine" as MLCron <<System>>
actor "Wholesale Supplier" as Vendor

rectangle "ForecastFlow System Boundary" {
  usecase "UC-01: User Authentication & JWT" as UC1
  usecase "UC-02: Manage Products & Suppliers" as UC2
  usecase "UC-03: Run Demand Forecast Pipeline" as UC3
  usecase "UC-04: View Dead Stock & Runway Risks" as UC4
  usecase "UC-05: Process POS Counter Sale" as UC5
  usecase "UC-06: 1-Click Convert Restock to PO" as UC6
  usecase "UC-07: Atomic Stock Decrement Ledger" as UC7
  usecase "UC-08: Inbound Goods Receiving & Restock" as UC8
}

Owner --> UC1
Owner --> UC2
Owner --> UC3
Owner --> UC4
Owner --> UC6

Cashier --> UC1
Cashier --> UC5
Cashier --> UC7
Cashier --> UC8

UC3 --> MLCron
UC4 --> MLCron
UC6 --> Vendor
UC8 --> Vendor

UC5 ..> UC7 : <<include>>
UC6 ..> UC8 : <<extend>>
@enduml`
  },

  activity: {
    title: "5. UML Activity Diagram",
    summary: "Swimlane workflow tracking cashier checkout, atomic inventory decrement, threshold check, and automated PO fulfillment.",
    prompt: `Generate a UML Activity Diagram with Swimlanes in PlantUML (@startuml ... @enduml) for "ForecastFlow: AI Inventory and Demand Forecasting System for Small Businesses".

Swimlanes:
1. |Store Cashier (POS)|
2. |ForecastFlow Core & ML|
3. |Store Owner & Supplier|

Workflow to model:
- Cashier scans SKUs at checkout.
- Decision: Is stock > 0? If no, display out-of-stock alert and select alternative.
- If yes: ForecastFlow executes atomic stock decrement ($inc) in MongoDB ledger.
- Decision: Is Current Stock <= Reorder Point?
  - If no: Normal stock maintained, print bill, end transaction.
  - If yes: Trigger ML demand forecast (Ridge/SES/MA), compute restock formula: max(0, ceil((Forecast + Safety) - Stock)).
  - Display critical restock recommendation on dashboard.
  - Store owner clicks "1-Click PO", transmitting electronic PO to wholesale supplier.
  - Vendor delivers goods; cashier clicks "Receive Goods", auto-incrementing stock ledger.
- Cashier prints receipt and customer transaction completes. Output valid PlantUML code.`,
    mermaid: `stateDiagram-v2
    [*] --> ScanSKUs : Customer at POS Counter
    ScanSKUs --> CheckStock : Check Inventory Level

    state CheckStock <<choice>>
    CheckStock --> OutOfStockAlert : [Stock <= 0]
    OutOfStockAlert --> ScanSKUs : Select Alternative
    CheckStock --> AtomicDecrement : [Stock > 0]

    AtomicDecrement --> CheckThreshold : Decrement Stock ($inc)

    state CheckThreshold <<choice>>
    CheckThreshold --> PrintBill : [Stock > ReorderPoint]
    CheckThreshold --> TriggerForecast : [Stock <= ReorderPoint]

    TriggerForecast --> ComputeFormula : Retrieve Champion ML Forecast
    ComputeFormula --> DisplayAlert : Formula: max(0, ceil(Fcast+Safety - Stock))
    DisplayAlert --> OwnerApproval : Dashboard Restock Warning
    OwnerApproval --> DispatchPO : 1-Click PO Conversion
    DispatchPO --> InboundDelivery : Vendor Dispatches Goods
    InboundDelivery --> ReceiveRestock : Click 'Receive Goods'
    ReceiveRestock --> PrintBill : Inventory Auto-Incremented

    PrintBill --> [*] : Transaction Completed`,
    plantuml: `@startuml
title ForecastFlow - UML Activity Diagram

|Store Cashier (POS)|
start
:Scan Customer SKUs at Checkout;
if (Stock on Hand > 0?) then (yes)
  |ForecastFlow Core & ML|
  :Execute Atomic Stock Decrement ($inc);
  if (Current Stock <= Reorder Point?) then (yes)
    :Trigger ML Demand Forecast;
    :Calculate Formula:
    max(0, ceil(Forecast + Safety - Stock));
    |Store Owner & Supplier|
    :Display Urgent Restock Card on Dashboard;
    :Store Owner Clicks "1-Click PO";
    :Transmit Electronic PO to Vendor;
    :Vendor Delivers Restock Stock;
    :Cashier Clicks "Receive Goods";
    |ForecastFlow Core & ML|
    :Auto-Increment Inventory Ledger;
  else (no)
    :Maintain Normal Stock Status;
  endif
else (no)
  |Store Cashier (POS)|
  :Display Out-of-Stock Alert to Cashier;
  stop
endif

|Store Cashier (POS)|
:Print Receipt / Send WhatsApp Bill;
stop
@enduml`
  },

  sequence: {
    title: "6. UML Sequence Diagram",
    summary: "Chronological message trace across Store Owner, React UI, FastAPI Gateway, ML Pipeline, and MongoDB Atlas.",
    prompt: `Generate a UML Sequence Diagram in PlantUML (@startuml ... @enduml) for the predictive forecasting and restock purchase order workflow in "ForecastFlow".

Lifelines:
- actor "Store Owner" as Owner
- boundary "React 18 SPA" as UI
- control "FastAPI Gateway" as API
- entity "ML Forecasting Engine" as ML
- database "MongoDB Atlas" as DB

Chronological Interaction Trace:
1. Owner clicks "Run ML Forecast" on UI.
2. UI issues POST /api/v1/forecasting/generate with Bearer JWT token to API.
3. API queries DB: find({product_id, date: {$gte: 35d}}).
4. DB returns 35-day daily sales history series.
5. API triggers ML pipeline: train_and_evaluate_holdout([Ridge, SES, MA]).
6. ML trains candidate models, tests on 7-day chronological holdout, and elects Champion = Ridge L2 (MAE: 1.14).
7. API caches forecast projection to DB.
8. API calculates restock formula: max(0, ceil(28 + 5 - 6)) = 27 units.
9. API returns JSON restock recommendation (Urgency: CRITICAL) to UI.
10. Owner reviews alert and clicks "1-Click Convert to PO".
11. UI sends POST /api/v1/recommendations/{id}/convert to API.
12. API inserts Purchase Order document into DB (status: "ordered").
13. DB responds with 201 Created (PO-0089).
14. API notifies UI, and electronic PO is dispatched to Wholesale Supplier.
Use autonumbering and activation boxes. Output valid PlantUML code.`,
    mermaid: `sequenceDiagram
    autonumber
    actor Owner as Store Owner
    participant UI as React Frontend
    participant API as FastAPI Gateway
    participant ML as ML Forecaster
    participant DB as MongoDB Atlas

    Owner->>UI: 1. Click "Run ML Forecast"
    UI->>API: 2. POST /api/v1/forecasting/generate (Bearer JWT)
    activate API
    API->>DB: 3. find({product_id, date: {$gte: 35d}})
    DB-->>API: 4. Return sales & stock time series
    API->>ML: 5. train_and_evaluate_holdout([Ridge, SES, MA])
    activate ML
    Note over ML: Train Ridge L2, SES, MA<br/>Evaluate on 7d holdout
    ML-->>API: 6. Champion = Ridge L2 (MAE: 1.14)
    deactivate ML
    API->>DB: 7. upsert_forecast_cache()
    Note over API: Formula: max(0, ceil(28+5 - 6)) = 27 units
    API-->>UI: 8. Return Restock Alert (Urgency: Critical)
    deactivate API
    Owner->>UI: 9. Click "1-Click Convert to PO"
    UI->>API: 10. POST /api/v1/recommendations/{id}/convert
    activate API
    API->>DB: 11. purchases.insert_one({status: "ordered"})
    DB-->>API: 12. 201 Created (PO-0089)
    API-->>UI: 13. PO Created & Supplier Notified
    deactivate API`,
    plantuml: `@startuml
title ForecastFlow - UML Sequence Diagram (Forecast & Restock Execution)
autonumber

actor "Store Owner" as Owner
boundary "React 18 SPA" as UI
control "FastAPI Gateway" as API
entity "ML Forecasting Engine" as ML
database "MongoDB Atlas" as DB

Owner -> UI : Click "Run Forecast"
activate UI
UI -> API : POST /api/v1/forecasting/generate (Bearer JWT)
activate API

API -> DB : find({product_id, date: {$gte: 35d}})
activate DB
DB --> API : Return daily sales time series
deactivate DB

API -> ML : train_and_evaluate_holdout([Ridge, SES, MA])
activate ML
note over ML: Train candidate models\\nEvaluate MAE on 7-day holdout
ML --> API : Champion = Ridge L2 (MAE: 1.14)
deactivate ML

API -> DB : upsert_forecast_cache()
note over API: Formula: max(0, ceil(28 + 5 - 6)) = 27 units
API --> UI : 200 OK (Restock Alert: CRITICAL)
deactivate API

Owner -> UI : Click "1-Click Convert to PO"
UI -> API : POST /api/v1/recommendations/{id}/convert
activate API
API -> DB : purchases.insert_one({status: "ordered"})
activate DB
DB --> API : 201 Created (PO-0089)
deactivate DB
API --> UI : Purchase Order Dispatched to Vendor
deactivate API
deactivate UI
@enduml`
  }
};
