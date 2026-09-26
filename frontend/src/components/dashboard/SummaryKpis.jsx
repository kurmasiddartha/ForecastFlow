import React from 'react';
import {
  Box,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Layers,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function SummaryKpis({ summary, isLoading }) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-slate-200 bg-white p-4 animate-pulse flex flex-col justify-between"
          >
            <div className="h-4 w-20 bg-slate-100 rounded" />
            <div className="h-8 w-28 bg-slate-100 rounded" />
            <div className="h-3 w-16 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Products',
      value: summary.total_products?.toLocaleString() || '0',
      subtitle: `${summary.total_stock?.toLocaleString() || 0} total units`,
      icon: Box,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
      link: '/products',
    },
    {
      title: 'Inventory Value',
      value: `$${(summary.inventory_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Valued at acquisition cost',
      icon: DollarSign,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      link: '/inventory',
    },
    {
      title: 'Low-Stock Alerts',
      value: summary.low_stock_count?.toLocaleString() || '0',
      subtitle: summary.low_stock_count > 0 ? 'Requires restock attention' : 'All items well-stocked',
      icon: AlertTriangle,
      color:
        summary.low_stock_count > 0
          ? 'text-amber-600 bg-amber-50 border-amber-200'
          : 'text-emerald-600 bg-emerald-50 border-emerald-100',
      link: '/inventory',
      highlight: summary.low_stock_count > 0,
    },
    {
      title: 'Total Sales Revenue',
      value: `$${(summary.total_sales_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${summary.total_sales_count || 0} orders in period`,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      link: '/sales',
    },
    {
      title: 'Procurement Spend',
      value: `$${(summary.total_purchases_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${summary.total_purchases_count || 0} purchase orders`,
      icon: ShoppingBag,
      color: 'text-violet-600 bg-violet-50 border-violet-100',
      link: '/purchases',
    },
    {
      title: 'Gross Margin est.',
      value: (() => {
        const sales = summary.total_sales_amount || 0;
        const purchases = summary.total_purchases_amount || 0;
        if (sales === 0) return '0%';
        const margin = ((sales - purchases) / sales) * 100;
        return `${margin > 0 ? '+' : ''}${margin.toFixed(1)}%`;
      })(),
      subtitle: 'Sales vs purchases flow',
      icon: Layers,
      color: 'text-slate-700 bg-slate-100 border-slate-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const CardWrapper = kpi.link ? Link : 'div';

        return (
          <CardWrapper
            key={idx}
            to={kpi.link}
            className={`group rounded-2xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
              kpi.highlight
                ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/80 hover:border-amber-400'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {kpi.title}
                </span>
                <div className={`rounded-xl p-2 border ${kpi.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="mt-2 text-xl font-black tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                {kpi.value}
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="truncate">{kpi.subtitle}</span>
              {kpi.link && (
                <ArrowUpRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </CardWrapper>
        );
      })}
    </div>
  );
}
