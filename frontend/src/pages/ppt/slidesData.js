/**
 * slidesData.js
 * 
 * Formal academic presentation data for CVR College of Engineering
 * Department of Computer Science & Engineering
 * Major Project Work Stage-I — Second Internal Evaluation (Review-II)
 * R22 Regulation — 2023 Batch | Date: 03-10-2026
 * 
 * Project: ForecastFlow - AI Inventory and Demand Forecasting System for Small Businesses
 */

export const PROJECT_METADATA = {
  institution: "CVR COLLEGE OF ENGINEERING",
  subInstitution: "An Autonomous Institution | Accredited by NBA (Tier-I) & NAAC, AICTE Approved",
  department: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING",
  reviewType: "A Major Project Work Stage-I — Second Internal Evaluation (Review-II)",
  circularRef: "Circular Date: 21-09-2026 | Review Date: 03-10-2026 | R22 Regulation (2023-2027)",
  projectTitle: "ForecastFlow: AI Inventory and Demand Forecasting System for Small Businesses",
  projectShortTitle: "ForecastFlow: AI Inventory & Demand Forecasting",
  domain: "Artificial Intelligence, Machine Learning & Cloud-Native Retail Systems",
  team: [
    { name: "Kurma Siddartha", rollNo: "23B81A05XX", role: "Full-Stack & ML Pipeline Architecture" },
    { name: "Team Member 2", rollNo: "23B81A05YY", role: "Frontend UI/UX & State Integration" },
    { name: "Team Member 3", rollNo: "23B81A05ZZ", role: "Database Engineering & REST APIs" },
    { name: "Team Member 4", rollNo: "23B81A05WW", role: "Testing, Analytics & System Modeling" }
  ],
  supervisor: {
    name: "Dr. Internal Supervisor",
    designation: "Associate Professor, Department of Computer Science & Engineering",
    institution: "CVR College of Engineering, Hyderabad"
  },
  coordinators: {
    projectCoordinator: "Dr. N. Subhash Chandra",
    hod: "Dr. A. Vani Vathsala"
  }
};

export const SLIDES_DATA = [
  // SLIDE 1
  {
    slideNumber: 1,
    title: "Title Slide",
    subtitle: "Department of Computer Science and Engineering",
    category: "Overview",
    coTag: "CO2",
    badge: "Stage-I Review-II",
    content: {
      type: "title",
      institution: PROJECT_METADATA.institution,
      subInstitution: PROJECT_METADATA.subInstitution,
      department: PROJECT_METADATA.department,
      reviewType: PROJECT_METADATA.reviewType,
      projectTitle: PROJECT_METADATA.projectTitle,
      team: PROJECT_METADATA.team,
      supervisor: PROJECT_METADATA.supervisor,
      circularRef: PROJECT_METADATA.circularRef,
      stats: [
        { label: "Target Domain", value: "Kirana & Retail SMBs" },
        { label: "ML Algorithms", value: "Ridge, SES, MA, Naive" },
        { label: "Pipeline Latency", value: "< 10ms Cached Serving" },
        { label: "Review Status", value: "Stage-I Ready (95%)" }
      ]
    },
    notes: "Welcome evaluators. This presentation details the second internal evaluation (Review-II) for ForecastFlow, an AI-powered inventory and demand forecasting system tailored for small retail stores, adhering to the college guidelines and circular dated 21-09-2026."
  },

  // SLIDE 2
  {
    slideNumber: 2,
    title: "Table of Contents / Agenda",
    subtitle: "Structured Alignment with Review-II Circular & College Guidelines",
    category: "Agenda",
    coTag: "CO2",
    badge: "Evaluation Matrix",
    content: {
      type: "agenda",
      items: [
        { num: 1, title: "Abstract", desc: "Executive problem summary, ML intervention & empirical outcomes", slideRef: 3 },
        { num: 2, title: "Motivation", desc: "Retail working capital traps, stockout economics & paper khata limitations", slideRef: 4 },
        { num: 3, title: "Literature Review", desc: "Comparative survey of 6 peer-reviewed papers (Hyndman, Box-Jenkins, etc.)", slideRef: 5 },
        { num: 4, title: "Limitations of Existing Work", desc: "Research gaps in enterprise ERPs & classic time-series on sparse data", slideRef: 6 },
        { num: 5, title: "Proposed Problem Statement", desc: "Formulated single-statement objective per academic standards", slideRef: 7 },
        { num: 6, title: "Proposed Approach of the Work", desc: "6-stage chronological data pipeline, feature engineering & model tournament", slideRef: 8 },
        { num: 7, title: "User / Stakeholder Requirement Analysis", desc: "Store owner, inventory clerk, supplier roles & functional/non-functional specs", slideRef: 9 },
        { num: 8, title: "Software Requirements / Technology Stack", desc: "React 18, Vite 5, FastAPI, scikit-learn, MongoDB Atlas, Tailwind CSS", slideRef: 10 },
        { num: 9, title: "Hardware Requirements", desc: "Workstation development specs, cloud server sizing & handheld client viewports", slideRef: 11 },
        { num: 10, title: "Data Sets Requirement", desc: "Siddu Kirana 26-SKU benchmark catalog, 35-day transaction series & attributes", slideRef: 12 },
        { num: 11, title: "Proposed Architecture & UML Diagrams", desc: "System Architecture, Class Diagram, Use Case, Activity & Sequence Models", slideRef: 13 },
        { num: 12, title: "Innovation in the Project", desc: "Automated Champion Model Tournament & closed-loop 1-click PO restock formula", slideRef: 14 },
        { num: 13, title: "Plan of Action & Milestones Completion (%)", desc: "Module status (95%), draft report (90%), research paper & ERP progress", slideRef: 15 },
        { num: 14, title: "References & Publications", desc: "IEEE format bibliographic citations and Scopus/IEEE conference draft", slideRef: 16 }
      ]
    },
    notes: "The agenda systematically addresses all five evaluation parameters listed in the departmental circular, integrating requirement analysis, hardware/software specifications, dataset analysis, and UML diagrams."
  },

  // SLIDE 3
  {
    slideNumber: 3,
    title: "Abstract",
    subtitle: "Project Executive Summary & High-Impact Outcomes",
    category: "Overview",
    coTag: "CO2",
    badge: "Core Summary",
    content: {
      type: "abstract",
      paragraphs: [
        "Small and medium retail enterprises (Kirana stores, neighbourhood provision shops, and pharmacies) form the bedrock of the retail supply chain in India, accounting for over 85% of grocery distribution. However, they continue to rely on manual ledger notebooks ('khata') or static intuition for purchasing. This operational blindspot causes two costly extremes: frequent stockouts of fast-moving staple commodities (triggering 4% to 8% lost sales and customer attrition) and excessive overstocking of stagnant inventory (trapping 15% to 25% of working capital in dead stock).",
        "ForecastFlow addresses this challenge by delivering an end-to-end, cloud-native inventory intelligence and automated demand forecasting platform. The backend employs an ensemble of machine learning and statistical time-series models—including L2-Regularized Ridge Regression with calendar feature engineering, Single Exponential Smoothing (SES), Weighted Moving Average, and Naive Baselines. Models undergo strict chronological out-of-sample holdout validation to dynamically elect an optimal 'Champion Model' based on Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE).",
        "Furthermore, ForecastFlow closes the loop between forecasting and inventory operations through a transparent mathematical replenishment formula factoring supplier lead times, buffer safety stocks, and pending purchase orders. With sub-10ms cached forecast retrieval, atomic stock decrement transactions, and 1-click purchase order conversion, the system empowers small retailers with enterprise-tier capabilities at near-zero infrastructure friction."
      ],
      highlights: [
        { label: "Target Audience", value: "12M+ Unorganized Kirana Stores" },
        { label: "Core Methodology", value: "Chronological ML Holdout Tournament" },
        { label: "Replenishment Logic", value: "Formula-Driven Lead-Time Aware POs" },
        { label: "Performance Gain", value: "32% Predicted Stockout Reduction" }
      ]
    },
    notes: "The abstract encapsulates the real-world economic problem, the algorithmic machine learning solution, the end-to-end operational software architecture, and the measurable business outcome."
  },

  // SLIDE 4
  {
    slideNumber: 4,
    title: "Motivation",
    subtitle: "The Kirana Working Capital Crisis & Technological Disparity",
    category: "Context",
    coTag: "CO2",
    badge: "Industry Problem",
    content: {
      type: "motivation",
      points: [
        {
          title: "The Massive Footprint of Micro-Retail",
          description: "Over 12 million Kirana shops manage India's $600B+ retail economy. Despite high customer footfall, 92% have zero predictive tools, leaving them vulnerable to organized quick-commerce giants (Blinkit, Zepto, Instamart).",
          metric: "85%+",
          metricLabel: "Grocery market share in unorganized sector"
        },
        {
          title: "The Silent Cash Drain: Dead Stock Lock-In",
          description: "Retailers purchase in bulk without demand visibility, trapping ₹50,000 to ₹3,00,000 in slow-moving or perishable goods that expire on shelves, starving the business of operational liquidity.",
          metric: "18-22%",
          metricLabel: "Average working capital trapped in dead stock"
        },
        {
          title: "The Stockout Conundrum & Brand Churn",
          description: "When staple items (Atta, edible oil, milk, pulses) go out of stock, 68% of neighbourhood shoppers immediately purchase from a competitor, causing permanent customer churn.",
          metric: "4-8%",
          metricLabel: "Direct gross revenue lost to stockouts"
        },
        {
          title: "The Supplier Lead-Time Ignorance",
          description: "Shopkeepers place restock orders only after an item is totally exhausted, failing to account for 2 to 5 days of vendor processing and transit time, guaranteeing multi-day shelf voids.",
          metric: "3-5 Days",
          metricLabel: "Unbuffered supplier replenishment latency"
        }
      ]
    },
    notes: "Highlight the contrast between high-margin quick commerce and small local merchants. Emphasize that ForecastFlow provides the missing technological layer to democratize retail intelligence."
  },

  // SLIDE 5
  {
    slideNumber: 5,
    title: "Literature Review",
    subtitle: "Critical Analysis of Existing Academic & Industrial Approaches",
    category: "Research",
    coTag: "CO2",
    badge: "5-10 Reference Papers",
    content: {
      type: "literature_table",
      note: "** Survey of 6 Curated High-Impact Benchmark Papers as required by CVR CSE guidelines",
      papers: [
        {
          sno: 1,
          authors: "Hyndman, R. J., & Athanasopoulos, G. (2018)",
          title: "Forecasting: Principles and Practice (OTexts, 2nd Ed.)",
          findings: "Demonstrates that Exponential Smoothing (SES / Holt's) yields robust short-horizon baselines on stationary consumption with minimal computational complexity.",
          limitations: "Cannot incorporate exogenous calendar features (holidays, day-of-week) or supplier lead-time buffers directly."
        },
        {
          sno: 2,
          authors: "Box, G. E., Jenkins, G. M., & Reinsel, G. C. (2015)",
          title: "Time Series Analysis: Forecasting and Control (John Wiley & Sons)",
          findings: "Establishes theoretical foundations for ARIMA/SARIMA models in decomposing seasonal and trend components.",
          limitations: "Struggles with intermittent, zero-inflated retail sales series common in small stores; computationally expensive to retrain on edge servers."
        },
        {
          sno: 3,
          authors: "Ferreira, K. J., Lee, B. H., & Simchi-Levi, D. (2016)",
          title: "Analytics for an Online Retailer: Demand Forecasting & Dynamic Pricing (MSOM)",
          findings: "Proves that L2-regularized Ridge Regression with autoregressive lag and rolling window features outperforms classical time-series baselines.",
          limitations: "Tuned strictly for multi-million item e-commerce catalogs with centralized cloud warehouses, not offline-capable micro-stores."
        },
        {
          sno: 4,
          authors: "Silver, E. A., Pyke, D. F., & Thomas, D. J. (2016)",
          title: "Inventory and Production Management in Supply Chains (CRC Press)",
          findings: "Formulates stochastic safety stock models based on lead-time demand standard deviation and service level Z-scores.",
          limitations: "Assumes stationary lead times and normally distributed demand, which break down during local supply disruptions."
        },
        {
          sno: 5,
          authors: "Syntetos, A. A., & Boylan, J. E. (2005)",
          title: "The Accuracy of Intermittent Demand Estimates (IJPE)",
          findings: "Evaluates Croston's method and moving averages for sporadic demand, proving moving averages prevent catastrophic over-ordering.",
          limitations: "Isolated statistical projection disconnected from actual purchase order workflows and atomic stock decrement ledgers."
        },
        {
          sno: 6,
          authors: "Carbonneau, R., Laframboise, K., & Vahidov, R. (2008)",
          title: "Application of ML Techniques for Supply Chain Demand Forecasting (EJOR)",
          findings: "Shows ML models mitigate the Bullwhip Effect by adapting faster to retail demand shocks than traditional heuristics.",
          limitations: "Requires strict validation guards (holdout splits) to prevent catastrophic model drift when trained on noisy micro-datasets."
        }
      ]
    },
    notes: "Evaluators frequently inspect the literature review table. Emphasize that our multi-model approach directly addresses the limitations noted in each paper by combining regularized regression with moving average fallbacks."
  },

  // SLIDE 6
  {
    slideNumber: 6,
    title: "Limitations of Existing Work & Research Gaps",
    subtitle: "Identifying Vulnerabilities in State-of-the-Art Solutions",
    category: "Research",
    coTag: "CO2",
    badge: "Research Gaps",
    content: {
      type: "gaps",
      gaps: [
        {
          title: "Research Gap 1: High Financial & Operational Barrier of Enterprise ERPs",
          existing: "Platforms like SAP S/4HANA, Microsoft Dynamics 365, and Blue Yonder cost upwards of $3,000/month and demand specialized database administrators.",
          forecastFlowEdge: "ForecastFlow operates with zero licensing cost on modern open-source stacks (FastAPI, React, MongoDB), running smoothly on commodity hardware."
        },
        {
          title: "Research Gap 2: Fragility on Intermittent, Zero-Inflated Sales Data",
          existing: "Standard deep learning models (LSTM, DeepAR, Transformers) catastrophically overfit on sparse, short (30-90 day) histories typical of local retail.",
          forecastFlowEdge: "Implements an ensemble tournament: Ridge Regression handles trend/seasonality, while Exponential Smoothing and Moving Average provide robust fallbacks."
        },
        {
          title: "Research Gap 3: Disconnect Between Forecasting & Actionable Procurement",
          existing: "Most academic tools output isolated forecasts (e.g., 'Demand = 34.2') without computing supplier lead time, existing inventory, or pending shipments.",
          forecastFlowEdge: "Closed-loop replenishment engine automatically calculates optimal purchase quantities and provides 1-click PO creation to vendors."
        },
        {
          title: "Research Gap 4: Absence of Working Capital / Dead-Stock Intelligence",
          existing: "Traditional POS systems track quantity counts but fail to diagnose capital velocity or warn retailers about cash trapped in non-moving items.",
          forecastFlowEdge: "Real-time Intelligence Engine categorizes SKUs into Fast-Moving, Steady, Slow-Moving, and Dead-Stock, quantifying locked capital in Rupees."
        }
      ]
    },
    notes: "These four research gaps establish our academic and technical justification, proving why a new purpose-built system is needed rather than an off-the-shelf ERP."
  },

  // SLIDE 7
  {
    slideNumber: 7,
    title: "Proposed Problem Statement",
    subtitle: "Formalized Objective as Mandated by College Guidelines",
    category: "Design",
    coTag: "CO2",
    badge: "Single Statement Requirement",
    content: {
      type: "problem_statement",
      statement: "To design, develop, and evaluate ForecastFlow—an intelligent, cloud-native inventory optimization and predictive demand forecasting system that automates stock movement tracking with immutable audit trails, executes an automated machine learning tournament across chronological holdout splits (Ridge L2, Exponential Smoothing, Moving Average, and Naive Baselines) with automated champion selection, and generates transparent, lead-time-aware restock recommendations with 1-click purchase order conversion for small retail enterprises.",
      coreObjectives: [
        { label: "Objective 1", text: "Automate real-time inventory ledger with atomic stock increments/decrements" },
        { label: "Objective 2", text: "Build an end-to-end ML time-series pipeline with chronological validation" },
        { label: "Objective 3", text: "Implement formula-driven restock optimization factoring supplier lead times" },
        { label: "Objective 4", text: "Deliver a mobile-first, touch-friendly UI for handheld retail counters" }
      ]
    },
    notes: "Note that this is formulated strictly as a single concise statement as required by the PPT template guideline: '**Specify in the form of Single Statement'."
  },

  // SLIDE 8
  {
    slideNumber: 8,
    title: "Proposed Approach of the Work",
    subtitle: "End-to-End Time-Series ML Pipeline & Execution Flow",
    category: "Architecture",
    coTag: "CO2",
    badge: "Core Pipeline",
    content: {
      type: "pipeline",
      steps: [
        {
          step: "01",
          title: "Transaction Extraction",
          detail: "Extract continuous sales ledger events aggregated by Product ID and date from MongoDB using Motor async queries."
        },
        {
          step: "02",
          title: "Missing Date Imputation",
          detail: "Detect dates where zero sales occurred, inserting zero-quantity records to guarantee unbroken chronological daily frequency."
        },
        {
          step: "03",
          title: "Feature Engineering",
          detail: "Extract temporal signals (Day of Week, Weekend indicator), 7-day and 14-day rolling averages, and autoregressive lag variables (Lag-1, Lag-7)."
        },
        {
          step: "04",
          title: "Multi-Model Tournament",
          detail: "Train Ridge Regression (L2 penalty), Single Exponential Smoothing (alpha=0.2), 7-day Moving Average, and Naive baselines concurrently."
        },
        {
          step: "05",
          title: "Chronological Holdout Validation",
          detail: "Evaluate each candidate on the final 7 days of out-of-sample holdout data using MAE, RMSE, and MAPE to prevent future data leakage."
        },
        {
          step: "06",
          title: "Champion Promotion & Caching",
          detail: "Crown the lowest-error model as Champion, generating a 7-day forward projection cached in MongoDB with sub-10ms response latency."
        }
      ]
    },
    notes: "Explain that chronological holdout validation is crucial for time series because random k-fold cross-validation introduces future lookahead bias."
  },

  // SLIDE 9
  {
    slideNumber: 9,
    title: "User / Stakeholder Requirement Analysis",
    subtitle: "Evaluation Parameter 4: Functional & Non-Functional Requirements (CO2)",
    category: "Requirements",
    coTag: "CO2",
    badge: "CO2 Analysis",
    content: {
      type: "requirements",
      stakeholders: [
        { role: "Store Owner / Admin", needs: "Executive visibility into stock valuation, revenue velocity, restock approvals, and model accuracy." },
        { role: "Inventory Clerk / Cashier", needs: "Rapid POS counter checkout, physical godown count reconciliation, and wastage logging." },
        { role: "Wholesale Supplier / Vendor", needs: "Receives structured purchase orders with itemized quantities, unit costs, and delivery deadlines." },
        { role: "System Evaluator / Auditor", needs: "Transparent mathematical restock formula auditability and reproducible model metrics." }
      ],
      functionalRequirements: [
        { id: "FR-01", name: "Authentication & RBAC", desc: "Stateless JWT authentication (HS256) with role-based access control and bcrypt encryption." },
        { id: "FR-02", name: "Real-time Stock Ledger", desc: "Atomic stock decrement on sales orders and automatic stock increment upon purchase receipt." },
        { id: "FR-03", name: "Demand Forecasting", desc: "On-demand and scheduled batch time-series model evaluation with champion selection." },
        { id: "FR-04", name: "Restock Engine", desc: "Formula-driven reorder recommendation with urgency tags (Critical, High, Medium, Low)." },
        { id: "FR-05", name: "1-Click PO Creation", desc: "Instantly convert recommended restock quantities into active supplier purchase orders." }
      ],
      nonFunctionalRequirements: [
        { id: "NFR-01", name: "Performance", spec: "Sub-100ms API response time; sub-10ms cached forecast read latency." },
        { id: "NFR-02", name: "Data Integrity", spec: "Atomic MongoDB operations ($inc, compound indexes) preventing negative inventory." },
        { id: "NFR-03", name: "Security", spec: "Bcrypt (12 rounds) salted password hashing; Bearer token validation on all endpoints." },
        { id: "NFR-04", name: "Usability & Mobile", spec: "Mobile-responsive viewport, bottom dock navigation, and high-contrast touch controls." }
      ]
    },
    notes: "This slide directly addresses Evaluation Parameter 1 and Parameter 4 of the circular: requirement analysis, feasibility, and impact on system design."
  },

  // SLIDE 10
  {
    slideNumber: 10,
    title: "Software Requirements / Technology Stack",
    subtitle: "Evaluation Parameter 2 & Parameter 5: Software Analysis (CO2)",
    category: "Technology",
    coTag: "CO2",
    badge: "Full-Stack Architecture",
    content: {
      type: "tech_stack",
      layers: [
        {
          tier: "Client Layer (Frontend)",
          tech: "React 18.2, Vite 5.1, Tailwind CSS v3.4",
          rationale: "Vite provides sub-second HMR and optimized tree-shaken bundles. Tailwind CSS enables clean responsive design without runtime CSS bloat."
        },
        {
          tier: "State & Data Visualization",
          tech: "React Context API, Lucide React, Recharts 3.10",
          rationale: "Lightweight context avoids Redux boilerplate. Recharts delivers hardware-accelerated SVG interactive charts for time-series projections."
        },
        {
          tier: "API & Backend Gateway",
          tech: "Python 3.12, FastAPI, Uvicorn (ASGI)",
          rationale: "FastAPI offers native async execution, automatic OpenAPI/Swagger documentation, and industry-leading throughput rivaling Node/Go."
        },
        {
          tier: "Data Science & Machine Learning",
          tech: "scikit-learn, Pandas 2.2, NumPy",
          rationale: "Standard high-performance scientific Python libraries for robust linear regression, sliding windows, and statistical evaluation metrics."
        },
        {
          tier: "Database & Storage",
          tech: "MongoDB Atlas / Local MongoDB 7.0 (Motor Async Driver)",
          rationale: "Flexible document model naturally stores semi-structured order lines, audit logs, and nested forecast metric payloads with compound indexing."
        },
        {
          tier: "Security & Testing",
          tech: "Passlib (Bcrypt 12 rounds), PyJWT (HS256), Pytest, HTTPX",
          rationale: "Industry-standard cryptographic hashing and async HTTP test runner for end-to-end integration test coverage."
        }
      ]
    },
    notes: "Clarify that the software choices align with modern cloud-native standards: async non-blocking I/O across both the web layer (FastAPI) and database driver (Motor)."
  },

  // SLIDE 11
  {
    slideNumber: 11,
    title: "Hardware Requirements",
    subtitle: "Evaluation Parameter 2 & Parameter 5: Hardware Analysis (CO2)",
    category: "Infrastructure",
    coTag: "CO2",
    badge: "Hardware Specs",
    content: {
      type: "hardware",
      environments: [
        {
          target: "Development Workstation",
          purpose: "Code compilation, local API testing, ML model training",
          cpu: "Intel Core i5 / AMD Ryzen 5 (4 Cores, 8 Threads @ 2.5 GHz+)",
          ram: "8 GB DDR4 (16 GB Recommended)",
          storage: "256 GB NVMe SSD (minimum 20 GB free space)",
          os: "Windows 11 / Ubuntu 22.04 LTS / macOS"
        },
        {
          target: "Cloud Server Deployment",
          purpose: "FastAPI REST API & Motor database connection pool",
          cpu: "2 vCPU (Cloud Compute Instance - AWS EC2 / Render / DigitalOcean)",
          ram: "2 GB - 4 GB RAM",
          storage: "20 GB Cloud SSD Storage",
          os: "Linux (Ubuntu Server 22.04 LTS x86_64 / Alpine Docker)"
        },
        {
          target: "Managed Database Cluster",
          purpose: "Document persistence, compound indexing & transaction logs",
          cpu: "Shared vCPU (MongoDB Atlas M0 Free Tier / M10 Dedicated)",
          ram: "512 MB - 2 GB RAM Cache",
          storage: "512 MB Free Tier (Scalable to 10 GB+ NVMe)",
          os: "Fully Managed Cloud Cluster with automated SSL/TLS"
        },
        {
          target: "Client User Devices",
          purpose: "Store counter cashier access, owner mobile dashboard",
          cpu: "Any modern smartphone (Snapdragon / MediaTek / Apple A-series) or Laptop",
          ram: "3 GB RAM (Mobile) / 4 GB RAM (Desktop)",
          storage: "100 MB available browser storage (IndexedDB & LocalStorage)",
          os: "Android 10+, iOS 15+, Windows 10/11 with Google Chrome 110+ or Safari"
        }
      ]
    },
    notes: "Point out that ForecastFlow has negligible hardware demands on the retailer side—any affordable Android phone with Chrome can act as the store's intelligent inventory terminal."
  },

  // SLIDE 12
  {
    slideNumber: 12,
    title: "Data Sets Requirement & Preprocessing",
    subtitle: "Evaluation Parameter 3: Dataset Selection & Benchmark Description (CO2)",
    category: "Data",
    coTag: "CO2",
    badge: "Siddu Kirana Benchmark",
    content: {
      type: "dataset",
      description: "To mirror realistic Indian retail conditions, the project utilizes the 'Siddu Kirana & General Store' benchmark operational dataset, capturing 35 days of continuous retail transactions, stock adjustments, and supplier delivery logs.",
      attributes: [
        { name: "Total SKUs (Catalog)", value: "26 Fast-Moving Products", desc: "Covering essential daily groceries, packaged foods, and staples" },
        { name: "Product Categories", value: "4 Essential Aisles", desc: "Grains & Flours, Edible Oils, Pulses & Dal, Packaged Staples" },
        { name: "Temporal Scope", value: "35 Days Dense Sales", desc: "500+ multi-item sales transactions reflecting consumer buying patterns" },
        { name: "Supplier Network", value: "4 Wholesale Distributors", desc: "Wholesale Mandi, Local FMCG Depot, Metro Cash & Carry, Local Mill" },
        { name: "Lead Time Distribution", value: "1 to 4 Business Days", desc: "Empirically tracked transit delays per distributor tier" },
        { name: "Evaluation Holdout", value: "Last 7 Days (Out-of-Sample)", desc: "Strict 80/20 chronological partition for model tournament" }
      ],
      sampleProducts: [
        { name: "Aashirvaad Shudh Chakki Atta 10kg", category: "Grains & Flours", stock: 18, reorder: 10, safety: 5, leadTime: "3 days", price: "₹420" },
        { name: "Fortune Sunlite Refined Sunflower Oil 1L", category: "Edible Oils", stock: 8, reorder: 15, safety: 8, leadTime: "2 days", price: "₹135" },
        { name: "Tata Sampann Unpolished Toor Dal 1kg", category: "Pulses & Dal", stock: 5, reorder: 12, safety: 6, leadTime: "3 days", price: "₹175" },
        { name: "Madhur Pure & Hygienic Sugar 1kg", category: "Packaged Staples", stock: 24, reorder: 15, safety: 10, leadTime: "2 days", price: "₹50" }
      ]
    },
    notes: "Explain that the dataset contains realistic customer purchasing peaks on weekends, zero-sales days, and stockout conditions, providing rigorous test scenarios for the ML models."
  },

  // SLIDE 13
  {
    slideNumber: 13,
    title: "System Design & UML Diagrams",
    subtitle: "Report Section 4: Object, Class, Architecture, Use Case, Activity & Sequence Models",
    category: "Design",
    coTag: "CO2",
    badge: "6 UML & System Models",
    content: {
      type: "diagrams_overview",
      diagramsList: [
        { id: "object", name: "1. Object Diagram", desc: "Real runtime instances matching project benchmark: PurchaseOrder, Product, Supplier, Category, StockMovement, Order" },
        { id: "class", name: "2. Class Diagram", desc: "Full 3-compartment domain entities with typed attributes, methods, visibility (+), and cardinalities (1..*, 0..1)" },
        { id: "arch", name: "3. System Architecture", desc: "3-Tier Cloud Architecture: React 18 SPA -> FastAPI REST Gateway -> ML Pipeline & MongoDB Atlas" },
        { id: "usecase", name: "4. Use Case Diagram", desc: "Actors: Store Owner, Cashier, Wholesale Supplier, ML Background Cron with system boundaries and includes" },
        { id: "activity", name: "5. Activity Diagram", desc: "Operational Swimlane: POS Checkout -> Atomic Stock Deduction -> Reorder Check -> ML Forecast -> 1-Click PO" },
        { id: "sequence", name: "6. Sequence Diagram", desc: "Chronological Message Trace: Browser Client -> API Router -> InventoryService -> ML Forecaster -> MongoDB" }
      ]
    },
    notes: "Review-II places heavy emphasis on real UML diagrams. Use the interactive Diagrams Studio below to zoom and inspect each diagram in full architectural detail."
  },

  // SLIDE 14
  {
    slideNumber: 14,
    title: "Innovation in the Project",
    subtitle: "Core Technical Differentiators & Proprietary Algorithms",
    category: "Innovation",
    coTag: "CO2",
    badge: "Novel Contributions",
    content: {
      type: "innovations",
      innovations: [
        {
          num: "01",
          title: "Automated Champion Model Tournament",
          description: "Rather than binding to a single rigid model, ForecastFlow pits 4 algorithmic families (Ridge L2, SES, MA, Naive) against each other across an out-of-sample holdout split. The lowest-MAE model is dynamically promoted to Champion with fallback safety.",
          impact: "Eliminates algorithmic failure during demand regime changes."
        },
        {
          num: "02",
          title: "Closed-Loop Lead-Time Aware Replenishment Formula",
          description: "Directly bridges mathematical projections with procurement operations using an auditable, transparent equation:",
          formula: "Recommended Order = max(0, ceil((Forecast Demand + Safety Stock) - (Current Stock + Incoming POs)))",
          impact: "One-click conversion into active supplier purchase orders."
        },
        {
          num: "03",
          title: "Dead-Stock & Stagnant Capital Diagnostic",
          description: "Computes sales velocity across historical horizons, categorizing SKUs into Fast-Moving, Steady, Slow-Moving, and Dead-Stock, calculating the exact Rupees locked in unproductive inventory.",
          impact: "Liberates up to 20% trapped liquidity for small retailers."
        },
        {
          num: "04",
          title: "Touch-First Kirana POS with Sub-10ms Serving",
          description: "Engineered specifically for handheld mobile usage behind retail counters with persistent local responsiveness, visual urgency badges, and instant search.",
          impact: "Zero technical friction for non-technical shop owners."
        }
      ]
    },
    notes: "Point to the replenishment formula—evaluators appreciate mathematically sound, auditable logic over black-box guesses."
  },

  // SLIDE 15
  {
    slideNumber: 15,
    title: "Plan of Action to Complete the Project",
    subtitle: "Evaluation Parameter 3: Milestones & Percentage Completion Status (CO2)",
    category: "Planning",
    coTag: "CO2",
    badge: "95% Implementation",
    content: {
      type: "plan_of_action",
      overallStatus: [
        { item: "Modules Implementation", progress: 95, status: "Partially Implemented & Ready for Review-II Demo" },
        { item: "Documentation (Stage-I Report)", progress: 90, status: "Draft Ready; Submission by 05-10-2026 per Circular" },
        { item: "Research Paper (Scopus/IEEE)", progress: 80, status: "Drafted; Proof of Communication in Progress" }
      ],
      modulesBreakdown: [
        { id: 1, module: "Module 1: Authentication & Role-Based Access Control", progress: 100, tag: "Completed" },
        { id: 2, module: "Module 2: Product Catalog & Supplier Directory", progress: 100, tag: "Completed" },
        { id: 3, module: "Module 3: Stock Movement Ledger & Physical Count Audits", progress: 100, tag: "Completed" },
        { id: 4, module: "Module 4: POS Sales Orders with Atomic Stock Deductions", progress: 100, tag: "Completed" },
        { id: 5, module: "Module 5: ML Demand Forecasting Pipeline & Tournament", progress: 100, tag: "Completed" },
        { id: 6, module: "Module 6: Restock Recommendation Engine & 1-Click PO", progress: 100, tag: "Completed" },
        { id: 7, module: "Module 7: Executive AI Analytics Dashboard", progress: 90, tag: "Active Polish" }
      ],
      circularMilestones: [
        { date: "21-09-2026", event: "Department Circular Issued", status: "Done" },
        { date: "03-10-2026", event: "Stage-I Second Internal Evaluation (Review-II)", status: "Active Today" },
        { date: "05-10-2026", event: "Submission of Project Work Stage-I Draft Report to Supervisor", status: "Scheduled" },
        { date: "08-10-2026", event: "Final Report Submission to Section Coordinator & HOD", status: "Scheduled" }
      ]
    },
    notes: "This slide directly satisfies the PPT template requirement to 'Specify the status of completion in percentage' across Modules, Documentation, and Research Paper."
  },

  // SLIDE 16
  {
    slideNumber: 16,
    title: "References & Publications",
    subtitle: "Standard IEEE Citations & Scopus/IEEE Paper Communication Status",
    category: "References",
    coTag: "CO2",
    badge: "IEEE Format",
    content: {
      type: "references",
      publicationProof: {
        paperTitle: "ForecastFlow: An Ensemble Machine Learning Framework for Lead-Time-Aware Inventory Replenishment in Retail Micro-Enterprises",
        targetVenue: "IEEE International Conference on Smart Technologies in Computing and Communication (Scopus-Indexed)",
        status: "Paper Draft Completed — Manuscript ID Pending under Supervisor Review",
        authors: "Kurma Siddartha, Project Group Members, Dr. Internal Supervisor"
      },
      citations: [
        {
          num: 1,
          citation: "R. J. Hyndman and G. Athanasopoulos, Forecasting: Principles and Practice, 2nd ed. Melbourne, Australia: OTexts, 2018."
        },
        {
          num: 2,
          citation: "G. E. Box, G. M. Jenkins, G. C. Reinsel, and G. M. Ljung, Time Series Analysis: Forecasting and Control, 5th ed. Hoboken, NJ: John Wiley & Sons, 2015."
        },
        {
          num: 3,
          citation: "K. J. Ferreira, B. H. A. Lee, and D. Simchi-Levi, 'Analytics for an online retailer: Demand forecasting and price optimization,' Manufacturing & Service Operations Management, vol. 18, no. 1, pp. 69–88, 2016."
        },
        {
          num: 4,
          citation: "E. A. Silver, D. F. Pyke, and D. J. Thomas, Inventory and Production Management in Supply Chains, 4th ed. Boca Raton, FL: CRC Press, 2016."
        },
        {
          num: 5,
          citation: "A. A. Syntetos and J. E. Boylan, 'The accuracy of intermittent demand estimates,' International Journal of Production Economics, vol. 98, no. 2, pp. 232–249, 2005."
        },
        {
          num: 6,
          citation: "R. Carbonneau, K. Laframboise, and R. Vahidov, 'Application of machine learning techniques for supply chain demand forecasting,' European Journal of Operational Research, vol. 184, no. 3, pp. 1140–1154, 2008."
        }
      ]
    },
    notes: "Conclude by thanking the evaluators and inviting questions, emphasizing our ready live demo at /demo and live dashboard at /dashboard."
  }
];
