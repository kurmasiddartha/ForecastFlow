import React from 'react';
import { ShoppingCart, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

const RISK_BADGES = {
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
  high: 'bg-amber-50 text-amber-700 border-amber-200',
  medium: 'bg-slate-100 text-slate-700 border-slate-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function RecommendationTable({
  recommendations = [],
  isLoading = false,
  onShowWhy,
  onStatusChange,
  onConvertToPurchase,
  isProcessingAction = false,
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse space-y-3">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <p className="text-sm font-medium text-slate-700">No restock recommendations found</p>
        <p className="text-xs text-slate-500 mt-1">
          Stock levels are sufficient for current demand forecasts, or try adjusting the filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[720px]">
          <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-3">Risk</th>
              <th className="py-3.5 px-3 text-right">Stock</th>
              <th className="py-3.5 px-3 text-right">Forecast</th>
              <th className="py-3.5 px-3 text-right">Recommended Order</th>
              <th className="py-3.5 px-3 text-right">Estimated Cost</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {recommendations.map((rec) => {
              const badgeClass = RISK_BADGES[rec.urgency] || RISK_BADGES.medium;

              return (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Product */}
                  <td className="py-4 px-4">
                    <div className="text-base font-semibold text-slate-900">{rec.product_name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {rec.product_sku}
                      {rec.category_name ? ` • ${rec.category_name}` : ''}
                    </div>
                  </td>

                  {/* Risk */}
                  <td className="py-4 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold capitalize ${badgeClass}`}
                    >
                      {rec.urgency}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="py-4 px-3 text-right whitespace-nowrap">
                    <span className={`text-base font-semibold ${rec.current_stock <= 0 ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                      {rec.current_stock}
                    </span>
                    {rec.incoming_stock > 0 && (
                      <span className="text-xs text-slate-500 ml-1">
                        (+{rec.incoming_stock})
                      </span>
                    )}
                  </td>

                  {/* Forecast */}
                  <td className="py-4 px-3 text-right whitespace-nowrap text-sm font-medium text-slate-600">
                    {Math.round(rec.forecast_demand)}
                  </td>

                  {/* Recommended Order */}
                  <td className="py-4 px-3 text-right whitespace-nowrap text-base font-bold text-slate-900">
                    {rec.suggested_order_quantity} units
                  </td>

                  {/* Estimated Cost */}
                  <td className="py-4 px-3 text-right whitespace-nowrap text-base font-semibold text-slate-900">
                    ${(rec.estimated_cost ?? 0).toFixed(2)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onShowWhy && onShowWhy(rec)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        title="View calculation breakdown"
                      >
                        Why?
                      </button>

                      {rec.status === 'ordered' ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                          Ordered
                        </span>
                      ) : rec.status === 'dismissed' ? (
                        <button
                          type="button"
                          onClick={() => onStatusChange && onStatusChange(rec, 'pending')}
                          disabled={isProcessingAction}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                          title="Restore recommendation"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Restore</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onConvertToPurchase && onConvertToPurchase(rec)}
                            disabled={isProcessingAction || rec.suggested_order_quantity <= 0}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
                            title="Generate purchase order"
                          >
                            <ShoppingCart className="h-3 w-3" />
                            <span>Order</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onStatusChange && onStatusChange(rec, 'dismissed')}
                            disabled={isProcessingAction}
                            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Dismiss recommendation"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
