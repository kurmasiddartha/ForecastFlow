import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-xs text-slate-500 mb-16 lg:mb-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto text-center sm:text-left">
        <p>© 2026 ForecastFlow — AI Inventory & Demand Forecasting System for Small Businesses.</p>
        <p className="text-slate-400 text-[11px]">Empowering retail & neighborhood stores with predictive restock intelligence.</p>
      </div>
    </footer>
  );
}
