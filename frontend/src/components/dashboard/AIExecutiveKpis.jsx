import React from 'react';
import {
  Boxes,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Package,
} from 'lucide-react';

export function AIExecutiveKpis({ inventoryOverview, salesOverview, restockSummary, lowStockAlerts }) {
  if (!inventoryOverview || !salesOverview) return null;

  const lowStockCount = inventoryOverview.low_stock_count ?? 0;
  const outOfStockCount = inventoryOverview.out_of_stock_count ?? 0;
  const pendingRecs = restockSummary?.pending_count ?? 0;
  const criticalRecs = restockSummary?.critical_count ?? 0;

  const kpis = [
    {
      title: 'Total Inventory Valuation',
      value: `$${(inventoryOverview.total_inventory_value ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtitle: `${(inventoryOverview.total_stock_units ?? 0).toLocaleString()} units • ${inventoryOverview.total_products ?? 0} active products`,
      icon: Boxes,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50/80',
      borderColor: 'border-indigo-200',
    },
    {
      title: 'Commercial Sales Revenue',
      value: `$${(salesOverview.total_revenue ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtitle: `${(salesOverview.total_units_sold ?? 0).toLocaleString()} units sold • ${salesOverview.total_orders_count ?? 0} customer orders`,
      icon: TrendingUp,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-200',
    },
    {
      title: 'Stockout & Low Stock Alerts',
      value: lowStockCount,
      subtitle: outOfStockCount > 0 ? `${outOfStockCount} completely depleted` : 'All products have physical stock',
      icon: lowStockCount > 0 ? AlertTriangle : Package,
      color: lowStockCount > 0 ? 'text-rose-700' : 'text-slate-700',
      bgColor: lowStockCount > 0 ? 'bg-rose-50/80' : 'bg-slate-50',
      borderColor: lowStockCount > 0 ? 'border-rose-300' : 'border-slate-200',
      isWarning: lowStockCount > 0,
    },
    {
      title: 'AI Restock Requirements',
      value: pendingRecs,
      subtitle: criticalRecs > 0 ? `${criticalRecs} critical urgent orders` : `${(restockSummary?.total_units_needed ?? 0).toLocaleString()} units needed`,
      icon: Sparkles,
      color: 'text-sky-700',
      bgColor: 'bg-sky-50/80',
      borderColor: 'border-sky-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className={`flex items-center justify-between rounded-2xl border bg-white p-5.5 shadow-sm transition-all hover:shadow-md ${
              kpi.isWarning ? 'border-rose-200/90' : 'border-slate-200/90'
            }`}
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                {kpi.title}
              </p>
              <h4 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                {kpi.value}
              </h4>
              <p className="mt-1.5 text-xs font-bold text-slate-700 line-clamp-1">{kpi.subtitle}</p>
            </div>
            <div
              className={`flex h-13 w-13 items-center justify-center rounded-2xl border ${kpi.borderColor} ${kpi.bgColor} shadow-2xs shrink-0`}
            >
              <Icon className={`h-6 w-6 ${kpi.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
