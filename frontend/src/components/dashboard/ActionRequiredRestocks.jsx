import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, HelpCircle, PackageCheck } from 'lucide-react';

const RISK_BADGES = {
  critical: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
  high: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
  medium: 'bg-slate-100 text-slate-700 border-slate-200 font-semibold',
  low: 'bg-slate-50 text-slate-600 border-slate-200 font-medium',
};

export function ActionRequiredRestocks({
  recommendations = [],
  totalPendingCount = 0,
  onShowWhy,
  onOrderNow,
  isProcessingAction = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Action Required: Restock Priority</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Recommended purchase orders generated from statistical demand forecasting, lead times, and safety buffers.
          </p>
        </div>

        {totalPendingCount > 0 && (
          <Link
            to="/recommendations"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>View all ({totalPendingCount})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {recommendations.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
            <PackageCheck className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Shelves are Fully Stocked</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            No restock actions required right now. All active products have sufficient runway based on predicted demand.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-sm min-w-[680px]">
            <thead className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 pr-4">Product</th>
                <th className="py-3.5 px-3">Risk Level</th>
                <th className="py-3.5 px-3 text-right">Current Stock</th>
                <th className="py-3.5 px-3 text-right">Forecast Demand</th>
                <th className="py-3.5 px-3 text-right">Suggested Order</th>
                <th className="py-3.5 px-3 text-right">Estimated Cost</th>
                <th className="py-3.5 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-slate-800">
              {recommendations.slice(0, 5).map((rec) => {
                const badgeClass = RISK_BADGES[rec.urgency] || RISK_BADGES.medium;

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Product */}
                    <td className="py-4 pr-4">
                      <div className="text-sm font-bold text-slate-900">{rec.product_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{rec.sku}</div>
                    </td>

                    {/* Risk */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs capitalize ${badgeClass}`}
                      >
                        {rec.urgency}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <span className={`text-sm font-bold ${rec.current_stock <= 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {rec.current_stock}
                      </span>
                    </td>

                    {/* Forecast */}
                    <td className="py-4 px-3 text-right whitespace-nowrap text-sm font-semibold text-slate-600">
                      {Math.round(rec.forecast_demand)}
                    </td>

                    {/* Recommended Order */}
                    <td className="py-4 px-3 text-right whitespace-nowrap text-sm font-black text-slate-900">
                      {rec.suggested_order_quantity} units
                    </td>

                    {/* Estimated Cost */}
                    <td className="py-4 px-3 text-right whitespace-nowrap text-sm font-bold text-slate-900">
                      ${rec.estimated_cost.toFixed(2)}
                    </td>

                    {/* Action */}
                    <td className="py-4 pl-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onShowWhy && onShowWhy(rec)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
                          title="View calculation breakdown"
                        >
                          Why?
                        </button>
                        <button
                          type="button"
                          onClick={() => onOrderNow && onOrderNow(rec)}
                          disabled={isProcessingAction || rec.suggested_order_quantity <= 0}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-xs active:scale-[0.98]"
                          title="Create purchase order"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          <span>Order</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
