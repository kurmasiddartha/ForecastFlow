import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Boxes } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload.find((p) => p.dataKey === 'inventory_value')?.value || 0;
    const stock = payload[0]?.payload?.total_stock || 0;
    const prods = payload[0]?.payload?.product_count || 0;

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
        <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1.5">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-indigo-600 font-semibold">
            <span>Capital Value:</span>
            <span>${Number(value).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-600">
            <span>Physical Units:</span>
            <span>{stock} units</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px]">
            <span>Catalog Items:</span>
            <span>{prods} products</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function InventoryDistributionChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center justify-center min-h-[340px] text-center">
        <Boxes className="h-10 w-10 text-slate-300 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Inventory Distribution</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Categorized inventory capital will display here once products are created.
        </p>
      </div>
    );
  }

  const chartData = data.slice(0, 8).map((d) => ({
    ...d,
    shortCat: d.category.length > 12 ? `${d.category.slice(0, 12)}...` : d.category,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="h-4 w-4 text-indigo-600" />
            Inventory Valuation by Category
          </h3>
          <span className="text-[11px] font-medium text-slate-400">
            Working Capital Distribution
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Answers: In which categories is our working capital and physical inventory most heavily tied up?
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="shortCat"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="inventory_value" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
