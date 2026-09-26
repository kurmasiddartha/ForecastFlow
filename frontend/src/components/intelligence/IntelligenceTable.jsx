import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  PackageX,
  Layers,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Info,
} from 'lucide-react';

const renderVelocityBadge = (category, label) => {
  switch (category) {
    case 'FAST_MOVING':
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <TrendingUp className="h-3.5 w-3.5" />
          {label}
        </span>
      );
    case 'SLOW_MOVING':
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
          <Clock className="h-3.5 w-3.5" />
          {label}
        </span>
      );
    case 'DEAD_STOCK':
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
          <PackageX className="h-3.5 w-3.5" />
          {label}
        </span>
      );
    case 'OUT_OF_STOCK':
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
          Out of Stock
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
          {label}
        </span>
      );
  }
};

const renderRiskBadge = (item) => {
  if (item.stockout_risk === 'CRITICAL' || item.stockout_risk === 'HIGH') {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200 w-fit">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
          Stockout Risk ({item.stockout_risk})
        </span>
        <span className="text-xs text-rose-600 font-medium mt-0.5">
          Shortfall: {item.projected_shortfall_units}u (${item.revenue_at_risk.toFixed(2)})
        </span>
      </div>
    );
  }

  if (item.is_dead_stock) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200 w-fit">
          <PackageX className="h-3.5 w-3.5 text-amber-700" />
          Dead Stock
        </span>
        <span className="text-xs text-amber-700 font-medium mt-0.5">
          ${item.dead_stock_capital.toFixed(2)} tied up
        </span>
      </div>
    );
  }

  if (item.overstock_risk === 'HIGH' || item.overstock_risk === 'MEDIUM') {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 border border-blue-200 w-fit">
          <Layers className="h-3.5 w-3.5 text-blue-700" />
          Overstock ({item.overstock_risk})
        </span>
        <span className="text-xs text-blue-700 font-medium mt-0.5">
          +{item.excess_units}u excess (${item.excess_capital_tied_up.toFixed(2)})
        </span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
      Optimal Range
    </span>
  );
};

export function IntelligenceTable({ products = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
        Evaluating inventory intelligence metrics and business rules...
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <Info className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-base font-semibold text-slate-700">No Products Matched</h4>
        <p className="text-xs text-slate-400 mt-1">
          Try adjusting your search criteria, category filters, or threshold settings.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="py-3.5 px-4">Product Details</th>
              <th className="py-3.5 px-4 text-right">Current Stock</th>
              <th className="py-3.5 px-4 text-right">Daily Velocity</th>
              <th className="py-3.5 px-4 text-right">Runway (Days)</th>
              <th className="py-3.5 px-4">Velocity Category</th>
              <th className="py-3.5 px-4">Inventory Risk Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((item) => {
              const isLowStock = item.current_stock <= item.reorder_level;
              const runwayText =
                item.days_of_inventory_remaining !== null && item.days_of_inventory_remaining !== undefined
                  ? `${item.days_of_inventory_remaining.toFixed(1)}d`
                  : item.current_stock === 0
                  ? '0d (Empty)'
                  : '∞ (No Sales)';

              return (
                <tr key={item.product_id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Product Details */}
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="font-mono text-slate-600">{item.sku}</span>
                        <span>•</span>
                        <span>{item.category_name}</span>
                      </div>
                    </div>
                  </td>

                  {/* Stock vs Reorder */}
                  <td className="py-4 px-4 text-right">
                    <p className={`font-bold text-base ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                      {item.current_stock}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Reorder: {item.reorder_level}u
                    </p>
                  </td>

                  {/* Velocity */}
                  <td className="py-4 px-4 text-right">
                    <span className="font-bold text-base text-slate-900">
                      {item.daily_sales_velocity.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">units/day</span>
                  </td>

                  {/* Runway Days */}
                  <td className="py-4 px-4 text-right font-medium">
                    <span
                      className={`text-base font-semibold ${
                        item.runway_status === 'CRITICAL' || item.runway_status === 'LOW'
                          ? 'text-rose-600 font-bold'
                          : item.runway_status === 'EXCESS'
                          ? 'text-blue-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {runwayText}
                    </span>
                  </td>

                  {/* Velocity Badge */}
                  <td className="py-4 px-4">
                    {renderVelocityBadge(item.velocity_category, item.velocity_label)}
                  </td>

                  {/* Risk Badge & Reason */}
                  <td className="py-4 px-4">
                    {renderRiskBadge(item)}
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
