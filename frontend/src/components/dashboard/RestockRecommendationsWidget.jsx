import React from 'react';
import {
  Sparkles,
  ShoppingCart,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PRIORITY_BADGES = {
  critical: 'bg-rose-100 text-rose-800 border-rose-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-sky-100 text-sky-800 border-sky-200',
};

export function RestockRecommendationsWidget({
  restockSummary,
  onShowWhy,
  onOrderNow,
  isProcessingAction = false,
}) {
  const recommendations = restockSummary?.top_recommendations || [];
  const pendingCount = restockSummary?.pending_count || 0;
  const criticalCount = restockSummary?.critical_count || 0;
  const totalUnits = restockSummary?.total_units_needed || 0;
  const totalBudget = restockSummary?.total_budget_needed || 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Actionable AI Restock Orders
            </h3>
            {criticalCount > 0 && (
              <span className="rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 text-[10px] font-bold">
                {criticalCount} Critical Urgency
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formula-driven purchase quantities balancing demand projections, physical stock, and open PO pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-slate-400">Total Commitment:</span>
            <span className="ml-1 font-bold text-slate-900">
              ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <Link
            to="/recommendations"
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition-colors"
          >
            <span>All Recommendations ({pendingCount})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">
          <Boxes className="mx-auto h-8 w-8 text-slate-300 mb-1" />
          No restock orders pending. Inventory is balanced for the current review window!
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Product / SKU</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Pipeline On Hand</th>
                <th className="py-3.5 px-4 text-center">Recommended Order</th>
                <th className="py-3.5 px-4">Est. Budget</th>
                <th className="py-3.5 px-4 text-center">Audit Why</th>
                <th className="py-3.5 px-4 text-right">Direct Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recommendations.map((rec) => {
                const priorityBadge = PRIORITY_BADGES[rec.urgency] || PRIORITY_BADGES.medium;

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-base text-slate-900">{rec.product_name}</div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">{rec.sku}</div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${priorityBadge}`}
                      >
                        {rec.urgency}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-slate-900 font-bold text-base">
                        {rec.current_stock} <span className="text-slate-400 text-xs font-normal">on hand</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {rec.incoming_stock > 0 ? `+${rec.incoming_stock} incoming PO` : '0 in pipeline'}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="inline-block rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1">
                        <span className="font-bold text-indigo-900 text-base">{rec.suggested_order_quantity}</span>
                        <span className="text-xs font-semibold text-indigo-600 ml-1">units</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap font-bold text-base text-slate-900 font-mono">
                      ${rec.estimated_cost.toFixed(2)}
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onShowWhy && onShowWhy(rec)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        title="View transparent formula breakdown"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                        <span>Why?</span>
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOrderNow && onOrderNow(rec)}
                        disabled={isProcessingAction || rec.suggested_order_quantity <= 0}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
                        title="Generate formal Purchase Order instantly"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Order Now</span>
                      </button>
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
