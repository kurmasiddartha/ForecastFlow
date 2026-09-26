import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, AlertTriangle, CheckCircle2, ShoppingBag } from 'lucide-react';

export function AttentionRequiredSection({
  inventoryOverview,
  stockoutRiskProducts = [],
  slowDeadSummary,
  restockSummary,
}) {
  const outOfStockCount = inventoryOverview?.out_of_stock_count ?? 0;
  const stockoutRiskCount = stockoutRiskProducts.length;
  const deadCount = slowDeadSummary?.dead_stock_count ?? 0;
  const deadCapital = slowDeadSummary?.total_capital_tied_up ?? 0;
  const pendingRestocks = restockSummary?.pending_count ?? 0;

  const items = [
    {
      title: 'Out of Stock',
      count: outOfStockCount,
      description:
        outOfStockCount > 0
          ? `${outOfStockCount} ${outOfStockCount === 1 ? 'product is' : 'products are'} completely out of stock.`
          : 'All active products have stock on hand.',
      linkText: 'View products',
      linkTo: '/inventory?filter=out_of_stock',
      status: outOfStockCount > 0 ? 'critical' : 'good',
    },
    {
      title: 'Stockout Risk',
      count: stockoutRiskCount,
      description:
        stockoutRiskCount > 0
          ? `${stockoutRiskCount} ${stockoutRiskCount === 1 ? 'product is' : 'products are'} projected to run dry within lead time.`
          : 'No immediate stockout risks detected.',
      linkText: 'View risks',
      linkTo: '/intelligence',
      status: stockoutRiskCount > 0 ? 'warning' : 'good',
    },
    {
      title: 'Overstock & Dead Stock',
      count: deadCount,
      description:
        deadCount > 0
          ? `${deadCount} ${deadCount === 1 ? 'product has' : 'products have'} stagnant stock ($${Math.round(deadCapital).toLocaleString()} tied up).`
          : 'Stock turnover is healthy with no dead stock.',
      linkText: 'View excess',
      linkTo: '/intelligence',
      status: deadCount > 0 ? 'warning' : 'good',
    },
    {
      title: 'Restock Actions',
      count: pendingRestocks,
      description:
        pendingRestocks > 0
          ? `${pendingRestocks} recommended ${pendingRestocks === 1 ? 'order' : 'orders'} ready for purchase creation.`
          : 'No purchase recommendations pending.',
      linkText: 'Review restocks',
      linkTo: '/recommendations',
      status: pendingRestocks > 0 ? 'action' : 'good',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">Attention Required</h2>
        <span className="text-xs font-medium text-slate-500">Operational alerts & risks</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const isCritical = item.status === 'critical';
          const isWarning = item.status === 'warning';
          const isAction = item.status === 'action';

          return (
            <div
              key={item.title}
              className={`group flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-sm hover:shadow-md ${
                isCritical
                  ? 'border-rose-200/90 bg-rose-50/40 hover:border-rose-300'
                  : isWarning
                  ? 'border-amber-200/90 bg-amber-50/30 hover:border-amber-300'
                  : isAction
                  ? 'border-indigo-200/90 bg-indigo-50/30 hover:border-indigo-300'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {item.title}
                  </span>
                  {isCritical ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
                      Critical
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                      Warning
                    </span>
                  ) : isAction ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Healthy
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-800 leading-snug">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-end">
                <Link
                  to={item.linkTo}
                  className={`inline-flex items-center gap-1 text-xs font-bold transition-all group-hover:gap-1.5 ${
                    isCritical
                      ? 'text-rose-700 hover:text-rose-900'
                      : isWarning
                      ? 'text-amber-700 hover:text-amber-900'
                      : isAction
                      ? 'text-indigo-700 hover:text-indigo-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{item.linkText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
