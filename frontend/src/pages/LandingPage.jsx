import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Zap,
  Truck,
  ShoppingCart,
  BrainCircuit,
  Store,
  Calculator,
  TrendingUp,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Star,
  Activity,
  BarChart3,
  Check,
  AlertTriangle,
  RefreshCw,
  FileText,
  BadgePercent,
  ChevronRight,
  DollarSign,
  Package,
} from 'lucide-react';
import { PublicNavbar } from '../components/layout/PublicNavbar';

export function LandingPage() {
  const [activeTab, setActiveTab] = useState('forecast');

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* Top Floating Glass Navigation Bar */}
      {/* ------------------------------------------------------------- */}
      <PublicNavbar />

      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION (Ramp & Cin7 Inspired) */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-6 sm:pt-14 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-indigo-50/70 via-slate-50/40 to-white">
        {/* Soft background ambient gradient blooms */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[380px] sm:h-[480px] w-[95%] sm:w-[850px] rounded-full bg-gradient-to-tr from-indigo-200/40 via-sky-100/50 to-amber-100/40 blur-[80px] sm:blur-[100px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/95 px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-indigo-700 shadow-xs backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>The AI Inventory Brain for Growing Retailers</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.18] sm:leading-[1.15]">
            Never Run Out of Fast Stock. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 bg-clip-text text-transparent">
              Never Lock Cash in Dead Inventory.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-sm sm:text-lg text-slate-600 font-normal sm:font-medium leading-relaxed px-1">
            Stop guessing customer demand on paper notebooks. ForecastFlow predicts exact sales spikes, synchronizes distributor lead times, and generates 1-click purchase orders before shelves go empty.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-1 w-full max-w-xs sm:max-w-none mx-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-7 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            <Link
              to="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 px-6 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-slate-800 shadow-xs transition-all hover:scale-[1.02]"
            >
              <Store className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              <span>Explore Kirana Demo</span>
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE WORKSPACE SHOWCASE (Netstock & Ramp Inspired) */}
        {/* ------------------------------------------------------------- */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
          {/* Subtle Ambient Back-Glow */}
          <div className="absolute -inset-1 rounded-[36px] bg-gradient-to-r from-indigo-500/15 via-sky-500/15 to-violet-500/15 blur-2xl opacity-75 pointer-events-none" />

          {/* Main App Container */}
          <div className="relative rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-7 shadow-2xl shadow-slate-200/80 ring-1 ring-slate-100">
            {/* Window Top Header */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5 mb-5">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>

            {/* Interactive Feature Tabs (Cin7 & Inventory Planner Style) */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveTab('forecast')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'forecast'
                    ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
                <span>14-Day Demand Curve</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reorder')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'reorder'
                    ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-sky-600" />
                <span>Lead Time Restock Queue</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('deadstock')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'deadstock'
                    ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <DollarSign className="h-3.5 w-3.5 text-amber-600" />
                <span>Dead Stock Defense</span>
              </button>
            </div>

            {/* Showcase Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
              {/* Left Column: 14-Day Demand Chart */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      {activeTab === 'deadstock' ? 'Capital Trapped in Slow Movers' : 'Aashirvaad Atta 10kg — Demand Spike Forecast'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {activeTab === 'deadstock' ? 'Zero sales in 45 days • Recommend 15% discount' : 'Ensemble Model (L2 Ridge + 7-Day Moving Avg)'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
                    {activeTab === 'deadstock' ? '₹14,500 At Risk' : '98.4% Accuracy'}
                  </span>
                </div>

                {/* SVG Demand Curve */}
                <div className="relative pt-1">
                  <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 150">
                    <defs>
                      <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Safety Buffer Horizontal Line */}
                    <line x1="0" y1="95" x2="500" y2="95" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                    <text x="5" y="88" fill="#94a3b8" fontSize="10" fontWeight="bold">Safety Buffer Threshold (10 Bags)</text>

                    {/* Gradient Fill */}
                    <path
                      d="M 0 120 C 50 110, 80 75, 140 80 C 200 85, 240 45, 300 40 C 360 35, 420 65, 500 25 L 500 150 L 0 150 Z"
                      fill="url(#forecastGradient)"
                    />

                    {/* Past Sales (Gray Line) */}
                    <path
                      d="M 0 120 C 50 110, 80 75, 140 80 C 180 82, 200 85, 240 60"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2.5"
                    />

                    {/* AI Projected Spike (Indigo Line) */}
                    <path
                      d="M 240 60 C 270 48, 300 40, 360 35 C 420 30, 460 50, 500 25"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="3"
                    />

                    {/* Pulsing AI Indicator */}
                    <circle cx="360" cy="35" r="5" fill="#4f46e5" className="animate-ping" opacity="0.4" />
                    <circle cx="360" cy="35" r="4" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                  </svg>

                  {/* Chart Time Labels */}
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-200">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span className="text-indigo-600 font-bold">Today (AI Trigger)</span>
                    <span>Sat (Weekend Rush)</span>
                    <span>Next Mon</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    <span>Past Sales</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-indigo-700">
                    <span className="h-2 w-2 rounded-full bg-indigo-600" />
                    <span>AI Predicted Spike</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="h-0.5 w-3 border-t border-dashed border-slate-400" />
                    <span>Reorder Point</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Restock Priority Queue */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">Restock Priority Queue</h3>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      3 Urgent Items
                    </span>
                  </div>

                  {/* Item 1 */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">Aashirvaad Atta 10kg</span>
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                        Stockout in 2d
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Stock: <strong className="text-rose-600 font-bold">6 bags</strong> left</span>
                      <span className="font-bold text-indigo-700">Reorder: +20 bags</span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">Tata Toor Dal 1kg</span>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                        Mandi Transit 5d
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Stock: <strong>4 kg</strong> left</span>
                      <span className="font-bold text-indigo-700">Reorder: +16 kg</span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">Fortune Sunflower Oil 1L</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Optimal Buffer
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Stock: <strong>28 pouches</strong></span>
                      <span className="text-emerald-700 font-semibold">Adequate for 7 days</span>
                    </div>
                  </div>
                </div>

                {/* 1-Click PO CTA Button */}
                <Link
                  to="/demo"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.01]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Inspect 1-Click Purchase Order</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Segment Strip (Cin7 & Netstock style) */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 text-center">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Purpose-Built for High-Velocity Modern Retail
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:border-indigo-300 transition-colors">
              <Store className="h-4 w-4 text-indigo-600" />
              <span>Kirana & Provision Stores</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:border-sky-300 transition-colors">
              <ShoppingCart className="h-4 w-4 text-sky-600" />
              <span>Neighborhood Supermarts</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:border-emerald-300 transition-colors">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span>Regional FMCG Distributors</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:border-amber-300 transition-colors">
              <Zap className="h-4 w-4 text-amber-600" />
              <span>Campus Quick-Commerce Hubs</span>
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: PROBLEM VS SOLUTION (Netstock & Motion Inspired) */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 sm:py-20 border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              The Retail Reality
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Why Manual Notebooks Cost You Thousands
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Traditional inventory assumes you have enterprise warehouse software. ForecastFlow is engineered specifically for fast-moving retail counters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Way */}
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
                <span className="h-6 w-6 rounded-lg bg-rose-100 flex items-center justify-center text-xs">✕</span>
                <span>The Guesswork Method (Without AI)</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Writing down stock counts on paper registers late at night after closing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Turning away regular customers when fast-selling staples run out unexpectedly.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Cash locked in slow-moving items gathering dust on back shelves.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Emergency runs to distant wholesale mandis with costly surge pricing.</span>
                </li>
              </ul>
            </div>

            {/* The ForecastFlow Way */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <span className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center text-xs">✓</span>
                <span>The ForecastFlow System (With AI)</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Predictive algorithms automatically anticipate weekend and festive spikes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Distributor lead times factored in so orders land before stock hits zero.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Dead-stock alerts detect stagnant capital so you can liquidate and free up funds.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>1-click purchase orders pre-formatted for direct WhatsApp sending to vendors.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: 4 CORE CAPABILITIES (Bento Grid Style) */}
      {/* ------------------------------------------------------------- */}
      <section id="features" className="py-16 sm:py-20 border-t border-slate-200/80 bg-slate-50/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              Enterprise Brain, Consumer Simplicity
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Engineered for Complete Inventory Clarity
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Everything you need to predict customer demand, prevent shortages, and maximize store profits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-slate-200/90 bg-white p-6 space-y-3.5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">4-Model AI Ensemble Engine</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Evaluates Baseline, 7-Day Moving Average, Exponential Smoothing, and L2 Ridge Regression. Automatically benchmarks MAE accuracy and crowns the winning model per product.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-slate-200/90 bg-white p-6 space-y-3.5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all">
              <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Supplier Lead Time Synchronization</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bread arrives daily, but bulk pulses from wholesale mandis take 5 days. ForecastFlow computes safety buffers based on how long each supplier actually takes to deliver.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl border border-slate-200/90 bg-white p-6 space-y-3.5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dead Stock & Working Capital Shield</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Flags items with zero movement over 45 days. Calculates exactly how many thousands of rupees are trapped on your shelves so you can run bundles or claim vendor credit.
              </p>
            </div>

            {/* Card 4 */}
            <div className="group rounded-2xl border border-slate-200/90 bg-white p-6 space-y-3.5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1-Click Purchase Orders</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transform suggested restock recommendations into formatted purchase orders in 1 second. Ready to copy, export, or send via WhatsApp directly to your distributor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: 3-STEP WALKTHROUGH (Calendly & Toast Style) */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-t border-slate-200/80">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              Zero Complexity
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              No ERP training, expensive barcode guns, or complex installations needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 space-y-3 text-left">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">Add Inventory & Vendors</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Add your fast-moving items, cost price, and supplier transit days (e.g. Mandi distributor: 3 days).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 space-y-3 text-left">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">Log Daily Sales</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Record daily sales in seconds. The ensemble ML models automatically learn weekend and monthly customer patterns.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 space-y-3 text-left">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">Restock in 1-Click</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Get proactive restock alerts and generate formatted purchase orders before items ever hit zero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: LIVE DEMO SPOTLIGHT (Toast / 7shifts Style) */}
      {/* ------------------------------------------------------------- */}
      <section id="kirana" className="py-16 sm:py-20 border-t border-slate-200/80 bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-indigo-200/90 bg-white p-6 sm:p-10 shadow-xl space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                  <Store className="h-3.5 w-3.5 text-amber-700" />
                  <span>Real Retail Walkthrough</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Siddu Kirana & General Store
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Campus-area grocery store managing 250+ SKUs across FMCG, dry grains, and dairy.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/demo"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Launch Live Simulation</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <span className="text-2xl font-black text-slate-900 block">99.2%</span>
                <span className="text-xs font-semibold text-slate-500 mt-1 block">In-Stock Consistency</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <span className="text-2xl font-black text-slate-900 block">₹48,200</span>
                <span className="text-xs font-semibold text-slate-500 mt-1 block">Tied Capital Recovered</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <span className="text-2xl font-black text-indigo-600 block">5.2 Hours</span>
                <span className="text-xs font-semibold text-slate-500 mt-1 block">Saved Each Week</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FINAL HIGH-CONVERSION CTA BANNER (Ramp & Netstock Style) */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 sm:py-20 border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-14 text-center text-white shadow-2xl space-y-6">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to Take the Guesswork Out of Your Inventory?
            </h2>
            <p className="mx-auto max-w-xl text-xs sm:text-base text-indigo-200 leading-relaxed">
              Join forward-thinking retailers and kirana owners using ForecastFlow to eliminate stockouts, cut dead inventory, and automate restock orders.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-bold px-7 py-3.5 text-sm shadow-md transition-all hover:scale-[1.02]"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white font-bold px-6 py-3.5 text-sm transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Test Interactive Demo</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-slate-200 bg-slate-50 py-10 text-slate-600 text-xs sm:text-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-slate-900 text-sm">ForecastFlow</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <Link to="/demo" className="hover:text-indigo-600 transition-colors">Kirana Demo</Link>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-indigo-600 transition-colors">Register</Link>
          </div>

          <p className="text-slate-400">© 2026 ForecastFlow. Enterprise Demand Planning for Local Retail.</p>
        </div>
      </footer>
    </div>
  );
}
