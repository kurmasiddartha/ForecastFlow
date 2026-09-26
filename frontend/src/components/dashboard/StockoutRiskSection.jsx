import React from 'react';
import { ShieldAlert, AlertTriangle, Clock, ArrowRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export function StockoutRiskSection({ products = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              High-Probability Stockout Risks
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Products projected to deplete before standard supplier replenishment lead time.
          </p>
        </div>

        <Link
          to="/intelligence"
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
        >
          <span>All At-Risk ({products.length})</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No impending stockouts detected. All product runways exceed risk horizons.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((item) => {
            const isCritical = item.urgency === 'critical';

            return (
              <div
                key={item.product_id}
                className={`rounded-xl border p-3.5 transition-all ${
                  isCritical
                    ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-50'
                    : 'border-orange-200 bg-orange-50/40 hover:bg-orange-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.product_name}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500">{item.sku}</p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-orange-100 text-orange-800 border border-orange-200'
                    }`}
                  >
                    {item.urgency}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-200/50 pt-2">
                  <div>
                    <span className="text-[11px] text-slate-500">Current Stock:</span>
                    <p className={`font-bold ${item.current_stock <= 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {item.current_stock} units
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Runway:</span>
                    <p className={`font-bold ${item.days_of_supply <= 3 ? 'text-rose-700' : 'text-orange-700'}`}>
                      {item.days_of_supply <= 0 ? '0 Days (Stockout)' : `${item.days_of_supply.toFixed(1)} Days`}
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/50 pt-2 text-[11px]">
                  <span className="text-slate-500">
                    Revenue at risk: <strong className="text-slate-900">${item.revenue_at_risk.toFixed(2)}</strong>
                  </span>
                  <Link
                    to="/recommendations"
                    className="font-bold text-sky-600 hover:text-sky-800"
                  >
                    Restock →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
