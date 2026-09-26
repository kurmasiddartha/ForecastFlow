import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Package,
  Truck,
  Sparkles,
  Clock,
  Calculator,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Layers,
  IndianRupee,
  RefreshCw,
  Box,
  BrainCircuit,
  Tags,
  Check,
  Calendar,
  Zap,
} from 'lucide-react';

const KIRANA_STAGES = [
  {
    id: 'setup',
    title: '1. Suppliers & Categories',
    tag: 'Foundation',
    icon: Truck,
    description: 'Set up your wholesale mandi vendors, local distributors, and product aisles.',
  },
  {
    id: 'catalog',
    title: '2. Products & Thresholds',
    tag: 'Stock Logic',
    icon: Box,
    description: 'Define wholesale cost, retail price, reorder points, and safety buffers.',
  },
  {
    id: 'sales',
    title: '3. Daily Counter Sales',
    tag: 'Daily Operation',
    icon: TrendingUp,
    description: 'Record counter customer orders and automatically decrement shelf inventory.',
  },
  {
    id: 'audit',
    title: '4. Stock Audits & Wastage',
    tag: 'Accuracy',
    icon: RefreshCw,
    description: 'Record spillage, rat damage, broken pouches, or physical godown counts.',
  },
  {
    id: 'forecast',
    title: '5. AI Demand Forecasting',
    tag: 'Predictive',
    icon: BrainCircuit,
    description: 'Predict next 7 to 30 days consumption using statistical moving averages.',
  },
  {
    id: 'intelligence',
    title: '6. Dead-Stock & Capital Risks',
    tag: 'Financial Health',
    icon: Zap,
    description: 'Identify fast-moving cash generators vs money locked in slow-moving goods.',
  },
  {
    id: 'restocks',
    title: '7. 1-Click Purchase Orders',
    tag: 'Automated Replenish',
    icon: ShoppingCart,
    description: 'Use the transparent formula to generate vendor POs before shelves go empty.',
  },
];

export function DemoPage() {
  const [activeStage, setActiveStage] = useState('setup');

  // Interactive Sandbox Simulator State
  const [simProduct, setSimProduct] = useState('atta');
  const [simCurrentStock, setSimCurrentStock] = useState(6);
  const [simLeadTime, setSimLeadTime] = useState(3);
  const [simDailyDemand, setSimDailyDemand] = useState(4);
  const [simSafetyStock, setSimSafetyStock] = useState(5);

  const productPresets = {
    atta: { name: 'Aashirvaad Shudh Chakki Atta 10kg', cost: 360, price: 420, unit: 'bags' },
    oil: { name: 'Fortune Sunlite Refined Sunflower Oil 1L', cost: 110, price: 135, unit: 'pouches' },
    dal: { name: 'Tata Sampann Unpolished Toor Dal 1kg', cost: 145, price: 175, unit: 'kg' },
    sugar: { name: 'Madhur Pure & Hygienic Sugar 1kg', cost: 42, price: 50, unit: 'kg' },
  };

  const selectedPreset = productPresets[simProduct];
  const simForecastDemand = simDailyDemand * simLeadTime;
  const simRecommendedQty = Math.max(0, simForecastDemand + simSafetyStock - simCurrentStock);
  const simEstCost = simRecommendedQty * selectedPreset.cost;

  let simUrgency = 'low';
  let simUrgencyColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (simCurrentStock <= 2) {
    simUrgency = 'Critical (Stockout Imminent)';
    simUrgencyColor = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (simCurrentStock <= simDailyDemand * 2) {
    simUrgency = 'High (Reorder Urgently)';
    simUrgencyColor = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (simRecommendedQty > 0) {
    simUrgency = 'Medium (Regular Replenish)';
    simUrgencyColor = 'bg-sky-50 text-sky-700 border-sky-200';
  } else {
    simUrgency = 'Optimal (Adequate Stock)';
  }

  return (
    <div className="space-y-10 pb-16">
      {/* ------------------------------------------------------------- */}
      {/* Hero Banner */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/40 px-4 py-1.5 text-sm font-bold text-amber-300">
            <Store className="h-4 w-4" />
            <span>Kirana & Retail Store Operational Playbook</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            How ForecastFlow Powers a Small Kirana Business End-to-End
          </h1>

          <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed">
            In a neighborhood grocery shop, <strong className="text-white font-bold">70% of working capital</strong> is tied up in dry staples, oils, and packaged foods. Running out of Atta or Oil loses loyal customers, while over-buying slow items locks away critical cash. Here is the complete blueprint to run your shop with precision.
          </p>

          <div className="flex flex-wrap gap-4 pt-3">
            <a
              href="#sandbox"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-md hover:bg-amber-300 transition-all hover:scale-102"
            >
              <Calculator className="h-4.5 w-4.5" />
              <span>Try Restock Simulator</span>
            </a>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 px-6 py-3 text-sm font-bold text-white transition-all hover:scale-102"
            >
              <span>Open Products Catalog</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>

        {/* 3 Core Kirana Realities Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10 pt-8 border-t border-white/15">
          <div className="rounded-2xl bg-white/10 p-5 border border-white/15 backdrop-blur-sm">
            <span className="text-amber-400 font-black block text-xl">01. Zero Stockouts</span>
            <span className="text-slate-200 mt-2 block text-sm sm:text-base leading-relaxed">
              Forecast demand before weekend spikes so milk, bread, and dal never run out.
            </span>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 border border-white/15 backdrop-blur-sm">
            <span className="text-sky-400 font-black block text-xl">02. Lead Time Buffer</span>
            <span className="text-slate-200 mt-2 block text-sm sm:text-base leading-relaxed">
              Accounts for 1-day local dairy delivery vs 5-day rice mandi truck transit.
            </span>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 border border-white/15 backdrop-blur-sm">
            <span className="text-emerald-400 font-black block text-xl">03. Liquid Cash Flow</span>
            <span className="text-slate-200 mt-2 block text-sm sm:text-base leading-relaxed">
              Detects dead stock so you never tie up ₹20,000 in unmoving premium products.
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Stage Selector Navigation */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <span>Step-by-Step Store Walkthrough</span>
          </h2>
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">
            Click any step to inspect exact fields & workflows
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {KIRANA_STAGES.map((st) => {
            const Icon = st.icon;
            const isSelected = activeStage === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStage(st.id)}
                className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-2 ring-indigo-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-4.5 w-4.5 ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`} />
                  <span className={`text-xs uppercase font-extrabold tracking-wider ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>
                    {st.tag}
                  </span>
                </div>
                <div className={`text-sm font-bold leading-snug ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                  {st.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Detailed Stage Content Panels */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        {/* STAGE 1: SUPPLIERS & CATEGORIES */}
        {activeStage === 'setup' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Step 1 of 7</span>
                <h3 className="text-xl font-bold text-slate-900">Setting Up Suppliers & Product Categories</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Before adding products, set up who supplies you and how your shelves are categorized.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/suppliers"
                  className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Manage Suppliers
                </Link>
                <Link
                  to="/categories"
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Manage Categories
                </Link>
              </div>
            </div>

            {/* Field by field explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">What to enter for Suppliers</h4>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="rounded-lg bg-white p-3 border border-slate-200">
                    <strong className="text-slate-900 block">Supplier Name</strong>
                    <span className="text-slate-600">The distributor/wholesaler name (e.g. <em>"Sri Balaji Rice Wholesale Mandi"</em> or <em>"ITC FMCG Distributor"</em>).</span>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-slate-200">
                    <strong className="text-indigo-600 block">Lead Time (in Days) — CRITICAL!</strong>
                    <span className="text-slate-600">How many days it takes for stock to arrive after placing the order.</span>
                    <ul className="mt-1.5 list-disc list-inside text-slate-500 space-y-0.5">
                      <li>Local Milk / Bread delivery: <strong>1 day</strong></li>
                      <li>City FMCG distributor: <strong>2–3 days</strong></li>
                      <li>Outstation Grain Mandi: <strong>5–7 days</strong></li>
                    </ul>
                    <span className="mt-1 text-[11px] text-amber-700 block bg-amber-50 p-1.5 rounded">
                      💡 Why: ForecastFlow uses this number to trigger orders days before your stock runs out!
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Tags className="h-5 w-5 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">What to enter for Categories</h4>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="rounded-lg bg-white p-3 border border-slate-200">
                    <strong className="text-slate-900 block">Staples & Grains</strong>
                    <span className="text-slate-600">Rice, Wheat Atta, Toor Dal, Moong Dal, Sugar, Salt. High volume, daily necessity.</span>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-slate-200">
                    <strong className="text-slate-900 block">Edible Oils & Ghee</strong>
                    <span className="text-slate-600">Sunflower Oil pouches, Mustard Oil, Cow Ghee tins. High ticket value.</span>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-slate-200">
                    <strong className="text-slate-900 block">Snacks, Biscuits & Beverages</strong>
                    <span className="text-slate-600">Tea dust, Coffee, Parle-G, Maggi Noodles, Soft Drinks. Fast moving.</span>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-slate-200">
                    <strong className="text-slate-900 block">Personal & Home Care</strong>
                    <span className="text-slate-600">Detergent powder, Bathing soaps, Dishwash bars, Toothpaste. Predictable monthly cycle.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: PRODUCTS & THRESHOLDS */}
        {activeStage === 'catalog' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Step 2 of 7</span>
                <h3 className="text-xl font-bold text-slate-900">Configuring Products & Reorder Thresholds</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  This is the heart of automated inventory control. Every field has a clear business purpose.
                </p>
              </div>
              <Link
                to="/products"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors inline-flex items-center gap-1.5"
              >
                <Box className="h-4 w-4" />
                Go to Products Page
              </Link>
            </div>

            {/* Field breakdown table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Field Name</th>
                    <th className="py-3 px-4">Kirana Example</th>
                    <th className="py-3 px-4">Why it Matters for Your Shop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">SKU (Stock Keeping Unit)</td>
                    <td className="py-3 px-4 font-mono text-indigo-700 bg-indigo-50/40 font-bold">STA-ATTA-10K</td>
                    <td className="py-3 px-4 text-slate-600">Short readable code for quick counter search. E.g. Category (STA) + Product (ATTA) + Size (10K).</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">Product Name</td>
                    <td className="py-3 px-4 text-slate-800">Aashirvaad Shudh Chakki Atta 10kg</td>
                    <td className="py-3 px-4 text-slate-600">The exact brand and weight so staff don't mix up 5kg vs 10kg bags.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">Cost Price</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹360.00</td>
                    <td className="py-3 px-4 text-slate-600">Wholesale price you pay to distributor. Used to calculate total inventory value and restock budgets.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">Selling Price</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹420.00</td>
                    <td className="py-3 px-4 text-slate-600">MRP/retail selling rate. Margin = ₹60 per bag. Used in sales revenue and turnover analytics.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">Current Stock</td>
                    <td className="py-3 px-4 font-bold text-slate-900">12 bags</td>
                    <td className="py-3 px-4 text-slate-600">Physical count in shop right now. Updates automatically with every sale or restock.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 bg-amber-50/30">
                    <td className="py-3 px-4 font-bold text-amber-900">Reorder Point (Min Alert)</td>
                    <td className="py-3 px-4 font-bold text-amber-800">8 bags</td>
                    <td className="py-3 px-4 text-amber-950 font-medium">When stock drops to 8 bags, system raises a "Low Stock Alert" on your dashboard.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">Target Stock Level</td>
                    <td className="py-3 px-4 font-bold text-slate-900">30 bags</td>
                    <td className="py-3 px-4 text-slate-600">Max capacity of your shelf/godown. System will not recommend ordering beyond this limit.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-indigo-900">Safety Stock Buffer</td>
                    <td className="py-3 px-4 font-bold text-indigo-800">4 bags</td>
                    <td className="py-3 px-4 text-slate-600">Emergency reserve against unexpected weekend rush or supplier truck breakdown.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STAGE 3: DAILY SALES */}
        {activeStage === 'sales' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Step 3 of 7</span>
                <h3 className="text-xl font-bold text-slate-900">Recording Daily Counter Sales</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  How everyday counter customer transactions drive real-time stock deduction and machine learning.
                </p>
              </div>
              <Link
                to="/sales"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors inline-flex items-center gap-1.5"
              >
                <TrendingUp className="h-4 w-4" />
                Open Sales Orders
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">1</div>
                <h4 className="font-bold text-slate-900 text-sm">Customer at Counter</h4>
                <p className="text-slate-600 leading-relaxed">
                  A neighborhood resident buys:
                  <br />• 2 bags of Aashirvaad Atta 10kg
                  <br />• 3 pouches of Fortune Sunflower Oil 1L
                  <br />• 1 kg Tata Salt
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="h-8 w-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">2</div>
                <h4 className="font-bold text-slate-900 text-sm">Instant Ledger Deduction</h4>
                <p className="text-slate-600 leading-relaxed">
                  When you submit the sale, ForecastFlow executes an atomic stock reduction in MongoDB:
                  <br />• Atta: 12 bags → 10 bags
                  <br />• Oil: 20 pouches → 17 pouches
                  <br />• Audit ledger records who sold what and when.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">3</div>
                <h4 className="font-bold text-slate-900 text-sm">ML Model Learning</h4>
                <p className="text-slate-600 leading-relaxed">
                  The transaction timestamp and quantities are ingested by the demand forecasting engine. It learns your store's:
                  <br />• Friday/Saturday weekend spikes
                  <br />• Month-end grocery replenishment habits
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4: STOCK AUDIT & WASTAGE */}
        {activeStage === 'audit' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Step 4 of 7</span>
                <h3 className="text-xl font-bold text-slate-900">Stock Audits, Spillage & Rat Damage</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  In every grocery shop, physical stock does not always match computer stock due to leaks, breakages, or miscounts.
                </p>
              </div>
              <Link
                to="/inventory"
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" />
                Record Movement & Audit
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                  Movement Type: In
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Vendor Delivery In</h4>
                <p className="text-slate-600">
                  When the rice truck delivers 20 sacks, record a "Stock In" adjustment with note "Wholesale Mandi Invoice #482".
                </p>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5 space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] uppercase">
                  Movement Type: Out
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Damaged / Expired / Rat Bite</h4>
                <p className="text-slate-600">
                  1 oil pouch leaked or 1 biscuit packet torn by rodents? Record "Stock Out" with note "Damaged stock write-off".
                </p>
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-5 space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px] uppercase">
                  Movement Type: Physical Count
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Monthly Shelf Verification</h4>
                <p className="text-slate-600">
                  You physically counted 18 sugar packets on the rack, but the app shows 20? Set adjustment to align physical reality!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 5: DEMAND FORECASTING */}
        {activeStage === 'forecast' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Step 5 of 7</span>
                <h3 className="text-xl font-bold text-slate-900">AI Demand Forecasting for Kirana Essentials</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  How machine learning algorithms turn messy historical sales slips into reliable future demand numbers.
                </p>
              </div>
              <Link
                to="/forecast"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors inline-flex items-center gap-1.5"
              >
                <BrainCircuit className="h-4 w-4" />
                Go to Demand Forecast
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">The 4 Forecasting Models Tested Automatically</h4>
                <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1">
                  <strong className="text-slate-900">1. Baseline (Naive):</strong>
                  <p className="text-slate-600">Assumes tomorrow's demand will equal the recent average. Fast baseline.</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1">
                  <strong className="text-slate-900">2. 7-Day Moving Average:</strong>
                  <p className="text-slate-600">Smooths out random day-to-day jumps. Ideal for steady essentials like salt and tea.</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1">
                  <strong className="text-indigo-700">3. Exponential Smoothing (Champion for Groceries):</strong>
                  <p className="text-slate-600">Places higher weight on recent days. Catches seasonal shifts (e.g. higher cold beverage sales in summer).</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1">
                  <strong className="text-slate-900">4. Linear Trend Model:</strong>
                  <p className="text-slate-600">Detects if a new brand (e.g. organic oats) is steadily rising in consumer popularity.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-indigo-950 text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    How Forecast Horizon Works in Practice
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    When you select <strong>7 Days</strong> vs <strong>30 Days</strong>:
                    <br /><br />
                    • <strong>7-Day Horizon</strong>: Best for perishable or high-turnover items (Milk, Bread, Eggs, Fresh Snacks).
                    <br /><br />
                    • <strong>30-Day Horizon</strong>: Best for non-perishable monthly staples (Rice 25kg, Atta 10kg, Toor Dal, Washing Powder).
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4 border border-indigo-200">
                  <span className="font-bold text-slate-900 block text-xs">Automatic Champion Selection:</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    ForecastFlow calculates MAE (Mean Absolute Error) for all 4 models and picks the most accurate one automatically!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 6: INTELLIGENCE */}
        {activeStage === 'intelligence' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Step 6 of 7</span>
                <h3 className="text-xl font-bold text-slate-900">Inventory Intelligence: Protecting Working Capital</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Answers the 2 biggest financial questions for a shopkeeper: "Where is my money stuck?" and "What will run out first?"
                </p>
              </div>
              <Link
                to="/intelligence"
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
              >
                <Zap className="h-4 w-4" />
                View Intelligence Screen
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-1.5">
                <span className="font-bold text-emerald-800 text-xs block">🚀 Fast-Moving (Cash Cow)</span>
                <p className="text-slate-700">Atta, Milk, Cooking Oil, Maggi.</p>
                <p className="text-slate-500 text-[11px]">High sales velocity. High turnover. Never let these run dry, as customers won't return if basic staples are missing.</p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-1.5">
                <span className="font-bold text-amber-800 text-xs block">🐢 Slow-Moving (Tied Cash)</span>
                <p className="text-slate-700">High-end Olive Oil, Exotic Spices, Large Detergent drums.</p>
                <p className="text-slate-500 text-[11px]">Takes 60+ days to sell. Do not reorder in large batches. Order only 1–2 pieces.</p>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-1.5">
                <span className="font-bold text-rose-800 text-xs block">⚠️ Stockout Risk</span>
                <p className="text-slate-700">Stock on hand &lt; Expected sales during vendor delivery.</p>
                <p className="text-slate-500 text-[11px]">You have 4 bags left, vendor takes 3 days, and customers buy 3 bags a day. You will run out tomorrow!</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                <span className="font-bold text-slate-800 text-xs block">📦 Dead-Stock (0 Sales)</span>
                <p className="text-slate-700">Products with zero sales in the past 60 days.</p>
                <p className="text-slate-500 text-[11px]">Action: Put on clearance discount or return to the distributor for credit note exchange.</p>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 7: RESTOCKS & 1-CLICK PO */}
        {activeStage === 'restocks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Step 7 of 7</span>
                <h3 className="text-xl font-bold text-slate-900">Automated Restock Recommendations & 1-Click Orders</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  How ForecastFlow synthesizes forecasts, lead times, and current stock into exact purchase orders.
                </p>
              </div>
              <Link
                to="/recommendations"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors inline-flex items-center gap-1.5"
              >
                <ShoppingCart className="h-4 w-4" />
                Review Restock Orders
              </Link>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/80 p-6 space-y-4">
              <h4 className="font-bold text-indigo-950 text-base">The Transparent Restock Formula</h4>
              <div className="rounded-xl bg-white p-4 border border-indigo-100 shadow-xs font-mono text-xs sm:text-sm font-bold text-indigo-900 text-center">
                Recommended Purchase = Forecast Demand + Safety Stock − Current Stock − Incoming PO
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 pt-2">
                <div className="space-y-1.5">
                  <strong className="text-slate-900 block">Why Current Stock is subtracted:</strong>
                  <span>Because you already own those packets on the shelf; you only need to order the deficit!</span>
                </div>
                <div className="space-y-1.5">
                  <strong className="text-slate-900 block">Why Incoming PO is subtracted:</strong>
                  <span>If you already ordered 10 bags yesterday that are arriving today, the system won't duplicate the order!</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-slate-900 block">What happens when you click "Order Now":</span>
                <span className="text-slate-600">
                  ForecastFlow instantly generates a formal Purchase Order in the <strong>Purchases</strong> tab, links the designated vendor, sets status to "Ordered", and marks the recommendation as approved!
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: Interactive Kirana Shop Restock Simulator */}
      {/* ------------------------------------------------------------- */}
      <div id="sandbox" className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-sm font-bold text-indigo-700 mb-2">
            <Calculator className="h-4 w-4" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Try a Live Kirana Restock Calculation
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1 font-normal">
            Change current stock, lead time, or daily sales below to watch the formula calculate your purchase order in real-time.
          </p>
        </div>

        {/* Product selector buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {Object.entries(productPresets).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSimProduct(key)}
              className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer ${
                simProduct === key
                  ? 'border-indigo-600 bg-indigo-50/80 font-semibold text-indigo-950 ring-2 ring-indigo-500/25'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="block truncate font-bold text-slate-900 text-sm sm:text-base">{item.name}</span>
              <span className="text-xs font-semibold text-slate-600 block mt-1.5">Cost: ₹{item.cost} | MRP: ₹{item.price}</span>
            </button>
          ))}
        </div>

        {/* Sliders grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-slate-900 mb-2">
                <span>Physical Stock on Hand in Shop</span>
                <span className="font-mono text-indigo-600 text-base font-black">{simCurrentStock} {selectedPreset.unit}</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={simCurrentStock}
                onChange={(e) => setSimCurrentStock(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 block">Packets physically sitting on your shelf or store room.</span>
            </div>

            <div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-slate-900 mb-2">
                <span>Vendor Transit Lead Time</span>
                <span className="font-mono text-indigo-600 text-base font-black">{simLeadTime} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={simLeadTime}
                onChange={(e) => setSimLeadTime(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 block">Days taken by the supplier to deliver after receiving order.</span>
            </div>

            <div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-slate-900 mb-2">
                <span>Average Daily Sales Consumption</span>
                <span className="font-mono text-indigo-600 text-base font-black">{simDailyDemand} {selectedPreset.unit}/day</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={simDailyDemand}
                onChange={(e) => setSimDailyDemand(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 block">How many packets customers buy on an average day.</span>
            </div>
          </div>

          {/* Real-time Calculation Result Box */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Live AI Output</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${simUrgencyColor}`}>
                  {simUrgency}
                </span>
              </div>

              <div className="space-y-2.5 border-b border-slate-200 pb-4 text-sm sm:text-base">
                <div className="flex justify-between text-slate-700">
                  <span className="font-medium">Forecast Demand during Lead Time:</span>
                  <span className="font-mono font-bold text-slate-900">{simForecastDemand} {selectedPreset.unit} ({simDailyDemand} × {simLeadTime}d)</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="font-medium">Safety Buffer Stock:</span>
                  <span className="font-mono font-bold text-slate-900">+{simSafetyStock} {selectedPreset.unit}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="font-medium">Current Physical Stock (Deducted):</span>
                  <span className="font-mono font-bold text-slate-900">−{simCurrentStock} {selectedPreset.unit}</span>
                </div>
              </div>

              <div className="flex items-end justify-between pt-2">
                <div>
                  <span className="text-sm text-slate-600 block font-semibold">Recommended Purchase</span>
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    {simRecommendedQty} <span className="text-base font-bold text-slate-600">{selectedPreset.unit}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-slate-600 block font-semibold">Estimated Vendor Cost</span>
                  <span className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono">
                    ₹{simEstCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">
                {simRecommendedQty > 0
                  ? 'Ready to dispatch to wholesale vendor via PO'
                  : 'Sufficient stock on hand. No purchase necessary!'}
              </span>
              <Link
                to="/recommendations"
                className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-700 text-sm"
              >
                <span>View Live Orders</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: Quick Action Hub */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="font-black text-slate-900 text-lg">Quick Access to Every Screen</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-sm">
          <Link
            to="/products"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-center transition-all group"
          >
            <Box className="h-6 w-6 text-slate-600 group-hover:text-indigo-600 mb-2" />
            <span className="font-bold text-slate-900 text-base">Products</span>
            <span className="text-xs font-semibold text-slate-500 mt-1">Catalog & Prices</span>
          </Link>
          <Link
            to="/sales"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-center transition-all group"
          >
            <TrendingUp className="h-6 w-6 text-slate-600 group-hover:text-emerald-600 mb-2" />
            <span className="font-bold text-slate-900 text-base">Sales</span>
            <span className="text-xs font-semibold text-slate-500 mt-1">Daily Orders</span>
          </Link>
          <Link
            to="/inventory"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-center transition-all group"
          >
            <RefreshCw className="h-6 w-6 text-slate-600 group-hover:text-sky-600 mb-2" />
            <span className="font-bold text-slate-900 text-base">Inventory</span>
            <span className="text-xs font-semibold text-slate-500 mt-1">Stock & Audit</span>
          </Link>
          <Link
            to="/forecast"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-center transition-all group"
          >
            <BrainCircuit className="h-6 w-6 text-slate-600 group-hover:text-indigo-600 mb-2" />
            <span className="font-bold text-slate-900 text-base">Forecast</span>
            <span className="text-xs font-semibold text-slate-500 mt-1">AI Projections</span>
          </Link>
          <Link
            to="/intelligence"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-center transition-all group"
          >
            <Zap className="h-6 w-6 text-slate-600 group-hover:text-amber-600 mb-2" />
            <span className="font-bold text-slate-900 text-base">Intelligence</span>
            <span className="text-xs font-semibold text-slate-500 mt-1">Dead-Stock</span>
          </Link>
          <Link
            to="/recommendations"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-center transition-all group"
          >
            <ShoppingCart className="h-6 w-6 text-slate-600 group-hover:text-indigo-600 mb-2" />
            <span className="font-bold text-slate-900 text-base">Restocks</span>
            <span className="text-xs font-semibold text-slate-500 mt-1">1-Click POs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
