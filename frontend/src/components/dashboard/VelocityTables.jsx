import React from 'react';
import { Zap, AlertCircle, TrendingDown, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function VelocityTables({ fastMoving = [], slowMoving = [] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Fast Moving Products Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600" />
              Fast-Moving Products (High Velocity)
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              High Turnover
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Answers: Which products are experiencing the fastest stock turnover and driving cash flow?
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3.5">Product</th>
                  <th className="py-3 px-3.5 text-center">Units Sold</th>
                  <th className="py-3 px-3.5 text-right">Revenue</th>
                  <th className="py-3 px-3.5 text-right">In Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fastMoving.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      No fast-moving items detected in this timeframe.
                    </td>
                  </tr>
                ) : (
                  fastMoving.map((p) => {
                    const isLow = p.current_stock <= p.reorder_point;
                    return (
                      <tr key={p.product_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-3.5">
                          <p className="font-semibold text-slate-900 text-sm">{p.product_name}</p>
                          <p className="font-mono text-xs text-slate-400">{p.sku}</p>
                        </td>
                        <td className="py-3.5 px-3.5 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded text-sm">
                            {p.units_sold}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 text-right font-bold text-emerald-600 text-sm font-mono">
                          ${p.revenue.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3.5 text-right">
                          <span
                            className={`font-semibold text-sm ${
                              isLow ? 'text-amber-600' : 'text-slate-700'
                            }`}
                          >
                            {p.current_stock}
                          </span>
                          {isLow && (
                            <span className="block text-xs font-bold text-amber-600">
                              Low Stock!
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-right">
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            Review Restock Priorities
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Slow Moving Products Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-600" />
              Slow-Moving Products (Capital Tied Up)
            </h3>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Holding Risk
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Answers: Which products sit idle in the warehouse with capital locked in unsold inventory?
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3.5">Product</th>
                  <th className="py-3 px-3.5 text-center">Units Sold</th>
                  <th className="py-3 px-3.5 text-right">Stock on Hand</th>
                  <th className="py-3 px-3.5 text-right">Capital Tied Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slowMoving.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      No slow-moving inventory detected.
                    </td>
                  </tr>
                ) : (
                  slowMoving.map((p) => {
                    const capitalTied = (p.current_stock || 0) * (p.cost_price || 0);
                    return (
                      <tr key={p.product_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-3.5">
                          <p className="font-semibold text-slate-900 text-sm">{p.product_name}</p>
                          <p className="font-mono text-xs text-slate-400">{p.sku}</p>
                        </td>
                        <td className="py-3.5 px-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded font-semibold text-sm ${
                              p.units_sold === 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.units_sold} sold
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 text-right font-semibold text-slate-800 text-sm">
                          {p.current_stock}
                        </td>
                        <td className="py-3.5 px-3.5 text-right font-bold text-slate-900 text-sm font-mono">
                          ${capitalTied.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-right">
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            Manage Catalog & Pricing
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
