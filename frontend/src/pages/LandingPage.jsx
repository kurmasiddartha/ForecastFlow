import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* Top Floating Glass Navigation Bar */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-3 sm:top-4 z-50 w-full px-3 sm:px-6 pointer-events-none">
        <div className="mx-auto max-w-6xl pointer-events-auto">
          <div className="flex h-16 items-center justify-between rounded-2xl border border-slate-200/90 bg-white/90 px-4 sm:px-6 backdrop-blur-xl shadow-lg shadow-slate-900/5 ring-1 ring-black/5 transition-all">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 text-white shadow-sm shadow-indigo-500/25 ring-1 ring-black/5 transition-transform group-hover:scale-105">
                <Layers className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  Forecast<span className="text-indigo-600">Flow</span>
                </span>
                <span className="hidden sm:inline-block rounded-md bg-indigo-50 border border-indigo-100/90 px-2 py-0.5 text-xs font-bold text-indigo-700 tracking-wide">
                  AI RETAIL
                </span>
              </div>
            </Link>

            {/* Center Navigation Track (Pill Island) */}
            <nav className="hidden md:flex items-center gap-1.5 rounded-xl bg-slate-100/80 p-1.5 border border-slate-200/60 shadow-inner">
              <a
                href="#features"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white px-3.5 py-1.5 rounded-lg transition-all"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white px-3.5 py-1.5 rounded-lg transition-all"
              >
                How It Works
              </a>
              <a
                href="#kirana"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white px-3.5 py-1.5 rounded-lg transition-all"
              >
                Kirana Store
              </a>
              <Link
                to="/demo"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 bg-white border border-indigo-200/80 shadow-xs px-3.5 py-1.5 rounded-lg transition-all hover:bg-indigo-50/50"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Interactive Demo</span>
              </Link>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                to="/demo"
                className="md:hidden inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-3 py-1.5 rounded-lg"
              >
                <Sparkles className="h-3 w-3" />
                <span>Demo</span>
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4.5 py-2 text-sm font-bold text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-700 transition-all hover:scale-102 active:scale-98"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-lg px-3.5 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-indigo-600 px-4.5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:scale-102 active:scale-98"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* Hero Section */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-12 pb-20 sm:pt-18 sm:pb-28 overflow-hidden bg-gradient-to-b from-indigo-50/70 via-slate-50/40 to-white">
        {/* Soft background ambient gradient blooms */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[450px] w-[850px] rounded-full bg-gradient-to-tr from-indigo-200/40 via-sky-100/50 to-amber-100/40 blur-[90px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/95 px-5 py-2 text-sm font-bold text-indigo-700 shadow-xs backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>AI Demand Forecasting & Restocking for Retail & Kirana Stores</span>
          </div>

          {/* Main Title */}
          <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Never Run Out of Fast Stock. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 bg-clip-text text-transparent">
              Never Lock Cash in Dead Inventory.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-3xl text-lg sm:text-xl text-slate-700 font-medium leading-relaxed">
            ForecastFlow replaces guesswork and paper notebooks with intelligent forecasting. Predict customer demand, account for distributor lead times, and replenish shelves with 1-click purchase orders.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 rounded-xl bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/demo"
              className="inline-flex items-center gap-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-8 py-4 text-base font-bold text-slate-800 shadow-xs transition-all hover:scale-[1.02]"
            >
              <Store className="h-5 w-5 text-amber-600" />
              <span>Explore Kirana Demo</span>
            </Link>
          </div>

          {/* Unified Cohesive Metric Ribbon */}
          <div className="mx-auto max-w-4xl pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden text-center">
              <div className="p-5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">99.2%</span>
                <span className="text-sm font-semibold text-slate-600 mt-1 block">Stockout Prevention</span>
              </div>
              <div className="p-5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">1–7 Days</span>
                <span className="text-sm font-semibold text-slate-600 mt-1 block">Lead Time Sync</span>
              </div>
              <div className="p-5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">4 Models</span>
                <span className="text-sm font-semibold text-slate-600 mt-1 block">Ensemble AI Engine</span>
              </div>
              <div className="p-5">
                <span className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight block">1-Click</span>
                <span className="text-sm font-semibold text-slate-600 mt-1 block">Automated Restock</span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Floating App Preview Mockup (Realistic Forecasting Workspace) */}
        {/* ------------------------------------------------------------- */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-12">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-2xl shadow-slate-200/70 ring-1 ring-slate-100">
            {/* Window Top bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 font-semibold text-xs sm:text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                  Inventory Intelligence Workspace
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-Time AI Forecasting Active</span>
              </div>
            </div>

            {/* Main Application Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              {/* Left Column: 14-Day Demand & Reorder Chart */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">14-Day Projected Demand Curve</h3>
                    <p className="text-xs text-slate-500 font-medium">Ensemble Machine Learning (Prophet + Moving Avg)</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
                    98.4% Accuracy
                  </span>
                </div>

                {/* SVG Forecasting Wave Chart */}
                <div className="relative pt-2">
                  <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 160">
                    <defs>
                      <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Safety Buffer Horizontal Line */}
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                    <text x="5" y="93" fill="#94a3b8" fontSize="10" fontWeight="bold">Safety Buffer Threshold</text>

                    {/* Gradient Fill under Projected Curve */}
                    <path
                      d="M 0 130 C 50 120, 80 80, 140 85 C 200 90, 240 50, 300 45 C 360 40, 420 70, 500 30 L 500 160 L 0 160 Z"
                      fill="url(#forecastGradient)"
                    />

                    {/* Actual Sales Line (Solid Gray) */}
                    <path
                      d="M 0 130 C 50 120, 80 80, 140 85 C 180 88, 200 90, 240 65"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2.5"
                    />

                    {/* AI Projected Curve (Indigo Vibrant) */}
                    <path
                      d="M 240 65 C 270 52, 300 45, 360 40 C 420 35, 460 55, 500 30"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="3"
                    />

                    {/* Highlight Dot at Critical Prediction Point */}
                    <circle cx="360" cy="40" r="5" fill="#4f46e5" className="animate-ping" opacity="0.4" />
                    <circle cx="360" cy="40" r="4" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                  </svg>

                  {/* Chart Time Labels */}
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-200">
                    <span>Day 1 (Mon)</span>
                    <span>Day 4</span>
                    <span className="text-indigo-600 font-bold">Today (AI Trigger)</span>
                    <span>Day 10</span>
                    <span>Day 14 (Projection)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2">
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

              {/* Right Column: Smart Restock Action Queue */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900">Restock Priority Queue</h3>
                    <span className="text-xs font-semibold text-slate-500">3 Items Flagged</span>
                  </div>

                  {/* Restock Item 1 (Critical) */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Aashirvaad Atta 10kg</span>
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        Stockout in 2d
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Stock: <strong className="text-rose-600 font-bold">6 bags</strong> left</span>
                      <span className="font-bold text-indigo-700">Reorder: +20 bags</span>
                    </div>
                  </div>

                  {/* Restock Item 2 (High Lead Time) */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Tata Toor Dal 1kg</span>
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                        Mandi Transit 5d
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Stock: <strong>4 kg</strong> left</span>
                      <span className="font-bold text-indigo-700">Reorder: +16 kg</span>
                    </div>
                  </div>

                  {/* Restock Item 3 (Optimal) */}
                  <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Fortune Sunflower Oil 1L</span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
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
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-sm shadow-sm transition-all hover:scale-[1.01]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Inspect 1-Click Purchase Order</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: Features Grid */}
      {/* ------------------------------------------------------------- */}
      <section id="features" className="py-20 border-t border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-600">Enterprise Capabilities For Small Retailers</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Built Specifically for Retail Reality
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              Traditional inventory tools assume infinite godown space and instant deliveries. ForecastFlow is built for the neighborhood shop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">4 AI Forecasting Models</h3>
              <p className="text-base text-slate-700 leading-relaxed">
                Evaluates Baseline, 7-Day Moving Average, Exponential Smoothing, and Linear Trend. It calculates MAE accuracy and automatically crowns the champion model per item.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all">
              <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Supplier Lead Time Sync</h3>
              <p className="text-base text-slate-700 leading-relaxed">
                Local bread arrives in 1 day; wholesale mandi takes 5 days. The system triggers restock notices based on how long each distributor actually takes to deliver.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4 shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Dead-Stock Protection</h3>
              <p className="text-base text-slate-700 leading-relaxed">
                Detects items with zero sales in the past 60 days. Shows exactly how much capital (₹) is trapped so you can discount or exchange for vendor credit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: How It Works (3 Simple Steps) */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-600">Simplicity First</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How ForecastFlow Works in 3 Steps
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              No complex setup or engineering needed. Start managing your inventory productively in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-7 space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-base">
                1
              </div>
              <h3 className="font-bold text-xl text-slate-900">Add Products & Vendors</h3>
              <p className="text-base text-slate-700 leading-relaxed">
                Enter your items, cost price, selling price, and supplier lead time (e.g. Mandi distributor: 3 days).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-7 space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-base">
                2
              </div>
              <h3 className="font-bold text-xl text-slate-900">Record Daily Counter Sales</h3>
              <p className="text-base text-slate-700 leading-relaxed">
                Log customer purchases. Our ML pipeline continuously trains in the background to learn seasonal spikes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-7 space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-base">
                3
              </div>
              <h3 className="font-bold text-xl text-slate-900">1-Click Purchase Orders</h3>
              <p className="text-base text-slate-700 leading-relaxed">
                Review automated reorder quantities and convert them to supplier orders before shelves go empty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: Kirana Spotlight */}
      {/* ------------------------------------------------------------- */}
      <section id="kirana" className="py-20 border-t border-slate-200 bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-indigo-200 bg-white p-8 sm:p-14 shadow-lg space-y-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 border border-amber-300 px-4 py-1.5 text-sm font-bold text-amber-900">
                <Store className="h-4 w-4 text-amber-700" />
                <span>The Kirana Shop Problem Solved</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
                "Dukandar doesn't have time to write 250 items on paper every evening."
              </h2>
              <p className="text-slate-700 text-lg sm:text-xl leading-relaxed">
                In small retail shops, <strong>70% of business capital is tied in dry inventory</strong>. When you run out of Atta or Oil, customers immediately go to the rival store next door. ForecastFlow monitors every SKU and calculates your exact mandi purchase list automatically.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-7 py-4 text-sm shadow-md transition-all hover:scale-105"
              >
                <Calculator className="h-4.5 w-4.5" />
                <span>Launch Kirana Walkthrough & Simulator</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-7 py-4 text-sm font-bold text-slate-800 transition-all"
              >
                <span>Create Store Owner Account</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Footer */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 text-slate-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-base text-slate-900">ForecastFlow</span>
          </div>

          <div className="flex items-center gap-8 font-semibold text-sm">
            <Link to="/demo" className="hover:text-indigo-600 transition-colors">Kirana Demo</Link>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-indigo-600 transition-colors">Register</Link>
          </div>

          <p className="text-sm text-slate-500 font-medium">© 2026 ForecastFlow. Enterprise Demand Planning for Local Retail.</p>
        </div>
      </footer>
    </div>
  );
}
