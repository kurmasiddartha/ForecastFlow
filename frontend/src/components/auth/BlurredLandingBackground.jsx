import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

/**
 * Renders a high-fidelity, blurred background preview of the ForecastFlow landing page.
 * Creates a frosted-glass macOS/modern SaaS effect where auth cards float on top.
 */
export function BlurredLandingBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Blurred Landing Page Replica */}
      <div className="w-full h-full filter blur-[7px] brightness-[0.97] scale-[1.03] transform-gpu bg-slate-50">
        {/* Mock Top Floating Island Navbar */}
        <div className="pt-4 px-6 max-w-5xl mx-auto">
          <div className="h-14 rounded-2xl border border-slate-200 bg-white/95 px-5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold shadow-sm">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <span className="font-extrabold text-slate-900 text-base">Forecast<span className="text-indigo-600">Flow</span></span>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 border border-slate-200/50">
              <span className="text-xs font-semibold text-slate-600 px-3 py-1">Features</span>
              <span className="text-xs font-semibold text-slate-600 px-3 py-1">How It Works</span>
              <span className="text-xs font-bold text-indigo-700 bg-white shadow-xs px-3 py-1 rounded-lg">Demo</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-7 w-14 rounded-lg bg-slate-200/80" />
              <div className="h-7 w-24 rounded-lg bg-slate-900" />
            </div>
          </div>
        </div>

        {/* Mock Hero Section */}
        <div className="max-w-6xl mx-auto px-6 pt-10 sm:pt-14 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1 text-xs font-bold text-indigo-700 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>AI Demand Forecasting for Retail & Kirana Stores</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Never Run Out of Fast Stock. <br />
            <span className="bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
              Never Lock Cash in Dead Inventory.
            </span>
          </h1>

          <p className="text-slate-600 text-base max-w-xl mx-auto">
            ForecastFlow replaces guesswork with predictive machine learning and automated 1-click purchase orders.
          </p>

          {/* Unified Cohesive Metric Ribbon */}
          <div className="mx-auto max-w-3xl pt-4">
            <div className="grid grid-cols-4 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden text-center">
              <div className="p-3">
                <span className="text-xl font-black text-slate-900 block">99.2%</span>
                <span className="text-xs font-semibold text-slate-600 mt-0.5 block">Stockout Guard</span>
              </div>
              <div className="p-3">
                <span className="text-xl font-black text-slate-900 block">1–7 Days</span>
                <span className="text-xs font-semibold text-slate-600 mt-0.5 block">Lead Time</span>
              </div>
              <div className="p-3">
                <span className="text-xl font-black text-slate-900 block">4 Models</span>
                <span className="text-xs font-semibold text-slate-600 mt-0.5 block">AI Engines</span>
              </div>
              <div className="p-3">
                <span className="text-xl font-black text-indigo-600 block">1-Click</span>
                <span className="text-xs font-semibold text-slate-600 mt-0.5 block">Restock POs</span>
              </div>
            </div>
          </div>

          {/* Mock Dashboard Window with Chart & Queue */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl text-left mt-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-xs text-slate-500">forecastflow.app/workspace</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ● Live Forecasting Active
              </span>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-7 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>14-Day Demand Curve</span>
                  <span className="text-indigo-600">98.4% Accuracy</span>
                </div>
                <div className="h-24 bg-gradient-to-t from-indigo-100/60 to-transparent rounded-lg border-b-2 border-indigo-600" />
              </div>

              <div className="col-span-5 space-y-2.5">
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>Aashirvaad Atta 10kg</span>
                    <span className="text-amber-800 text-[10px] bg-amber-100 px-1.5 py-0.5 rounded">Reorder</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Stock: 6 bags · PO: +20 bags</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>Tata Toor Dal 1kg</span>
                    <span className="text-slate-600 text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">Lead 5d</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Stock: 4 kg · PO: +16 kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frosted Glass Overlay Scrim (Gives the modern modal focus effect) */}
      <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-[3px] pointer-events-none" />
    </div>
  );
}
