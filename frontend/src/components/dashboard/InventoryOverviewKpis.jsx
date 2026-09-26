import React from 'react';
import { Package, DollarSign, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export function InventoryOverviewKpis({ inventoryOverview, salesOverview }) {
  if (!inventoryOverview || !salesOverview) return null;

  const lowStockCount = inventoryOverview.low_stock_count ?? 0;
  const outOfStockCount = inventoryOverview.out_of_stock_count ?? 0;

  const kpis = [
    {
      label: 'Products',
      value: (inventoryOverview.total_products ?? 0).toLocaleString(),
      detail: `${(inventoryOverview.total_stock_units ?? 0).toLocaleString()} units on hand`,
      icon: Package,
      iconBg: 'bg-indigo-50 border border-indigo-100 text-indigo-600',
    },
    {
      label: 'Inventory Value',
      value: `$${(inventoryOverview.total_inventory_value ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      detail: 'Current stock at cost value',
      icon: DollarSign,
      iconBg: 'bg-emerald-50 border border-emerald-100 text-emerald-600',
    },
    {
      label: 'Sales Revenue',
      value: `$${(salesOverview.total_revenue ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      detail: `${(salesOverview.total_units_sold ?? 0).toLocaleString()} units sold across ${salesOverview.total_orders_count ?? 0} orders`,
      icon: TrendingUp,
      iconBg: 'bg-sky-50 border border-sky-100 text-sky-600',
    },
    {
      label: 'Low Stock Alerts',
      value: lowStockCount,
      detail: outOfStockCount > 0 ? `${outOfStockCount} items out of stock` : 'At or below reorder threshold',
      icon: lowStockCount > 0 ? AlertTriangle : ShieldCheck,
      iconBg: outOfStockCount > 0
        ? 'bg-rose-50 border border-rose-100 text-rose-600'
        : lowStockCount > 0
        ? 'bg-amber-50 border border-amber-100 text-amber-600'
        : 'bg-slate-50 border border-slate-100 text-slate-500',
      isAlert: lowStockCount > 0,
      isCritical: outOfStockCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {kpi.label}
              </span>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.iconBg} shadow-xs`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <div
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  kpi.isCritical
                    ? 'text-rose-600'
                    : kpi.isAlert
                    ? 'text-amber-600'
                    : 'text-slate-900'
                }`}
              >
                {kpi.value}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500 truncate">
                {kpi.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
