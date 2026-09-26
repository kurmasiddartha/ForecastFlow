import React, { useState } from 'react';
import { TrendingUp, PackageX, Clock, ArrowRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export function InventoryVelocitySummary({ fastMoving = [], slowDeadSummary }) {
  const [activeTab, setActiveTab] = useState('fast');

  const deadItems = slowDeadSummary?.top_dead_stock_items || [];
  const deadCapital = slowDeadSummary?.total_capital_tied_up || 0;
  const deadCount = slowDeadSummary?.dead_stock_count || 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header & Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('fast')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all ${
                activeTab === 'fast'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span>Fast-Moving ({fastMoving.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dead')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all ${
                activeTab === 'dead'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PackageX className="h-3.5 w-3.5 text-amber-600" />
              <span>Dead / Slow ({deadCount})</span>
            </button>
          </div>

          <Link
            to="/intelligence"
            className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            <span>Full Analysis</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Tab 1: Fast-Moving Products */}
        {activeTab === 'fast' && (
          <div className="mt-4">
            <p className="text-[11px] text-slate-500 mb-3">
              Top volume drivers with highest sales velocity in the selected period.
            </p>
            {fastMoving.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No high-velocity sales recorded in this timeframe.
              </div>
            ) : (
              <div className="space-y-2.5">
                {fastMoving.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-800 shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.product_name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono ml-7">
                        {item.sku} • Stock: <span className={item.current_stock <= item.reorder_point ? 'text-rose-600 font-semibold' : 'text-slate-700 font-semibold'}>{item.current_stock}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                        {item.units_sold} sold
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        ${item.revenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Slow-Moving / Dead Stock */}
        {activeTab === 'dead' && (
          <div className="mt-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-2.5 mb-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-amber-900">Working Capital Tied Up:</span>
                <p className="text-[11px] text-amber-800">{deadCount} products with physical stock but zero recent sales</p>
              </div>
              <span className="text-base font-black text-amber-950">
                ${deadCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {deadItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No dead stock detected. Inventory turnover is healthy!
              </div>
            ) : (
              <div className="space-y-2.5">
                {deadItems.slice(0, 5).map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.product_name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {item.sku} • {item.current_stock} units inactive
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                        ${item.capital_tied_up.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.days_without_sale}d no sales
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Velocity analysis active</span>
        <Link to="/inventory" className="text-slate-600 hover:text-slate-900 font-medium">
          Manage stock movements →
        </Link>
      </div>
    </div>
  );
}
