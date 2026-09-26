import React from 'react';
import {
  TrendingUp,
  PackageX,
  Layers,
  ShieldAlert,
} from 'lucide-react';

export function IntelligenceKpis({ summary }) {
  if (!summary) return null;

  const {
    fast_moving_count = 0,
    fast_moving_percentage = 0,
    dead_stock_count = 0,
    dead_stock_percentage = 0,
    dead_stock_capital_tied_up = 0,
    stockout_risk_count = 0,
    critical_stockout_count = 0,
    potential_revenue_at_risk = 0,
    overstock_risk_count = 0,
    excess_capital_tied_up = 0,
    average_runway_days = 0,
  } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Stockout Risk Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium text-slate-500">Stockout Risk</span>
          <ShieldAlert className={`h-4 w-4 ${critical_stockout_count > 0 ? 'text-rose-600' : 'text-amber-500'}`} />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${critical_stockout_count > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {stockout_risk_count}
          </span>
          <span className="text-xs text-slate-500">
            products ({critical_stockout_count} critical)
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 truncate">
          ${Number(potential_revenue_at_risk).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} potential revenue at risk
        </p>
      </div>

      {/* 2. Dead Stock Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium text-slate-500">Dead Stock Exposure</span>
          <PackageX className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            ${Number(dead_stock_capital_tied_up).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 truncate">
          {dead_stock_count} stagnant product{dead_stock_count === 1 ? '' : 's'} ({dead_stock_percentage}%) with zero sales
        </p>
      </div>

      {/* 3. Overstock Risk Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium text-slate-500">Overstock Capital</span>
          <Layers className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            ${Number(excess_capital_tied_up).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 truncate">
          {overstock_risk_count} products holding excess buffer supply
        </p>
      </div>

      {/* 4. Velocity Health Ratio & Runway */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium text-slate-500">Velocity & Runway</span>
          <TrendingUp className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{fast_moving_count}</span>
          <span className="text-xs text-slate-500">
            fast-moving ({fast_moving_percentage}%)
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 truncate">
          Average runway: {average_runway_days} days
        </p>
      </div>
    </div>
  );
}
