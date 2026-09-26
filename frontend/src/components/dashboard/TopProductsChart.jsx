import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Award, Package } from 'lucide-react';

const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
        <p className="font-bold text-slate-900 mb-0.5">{data.product_name}</p>
        <p className="font-mono text-[10px] text-slate-400 mb-1.5">{data.sku}</p>
        <div className="space-y-0.5">
          <p className="text-sky-600 font-semibold">
            Units Sold: <span className="font-bold">{data.units_sold}</span>
          </p>
          <p className="text-emerald-600 font-semibold">
            Revenue: <span className="font-bold">${data.revenue.toFixed(2)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function TopProductsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center justify-center min-h-[340px] text-center">
        <Package className="h-10 w-10 text-slate-300 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Product Sales Recorded</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Top-selling products will populate as sales orders are fulfilled.
        </p>
      </div>
    );
  }

  // Truncate product names for compact axis display
  const chartData = data.slice(0, 6).map((item) => ({
    ...item,
    shortName:
      item.product_name.length > 14
        ? `${item.product_name.slice(0, 14)}...`
        : item.product_name,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-4 w-4 text-sky-600" />
            Top-Selling Products by Volume
          </h3>
          <span className="text-[11px] font-medium text-slate-400">
            Top {chartData.length} items
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Answers: Which catalog items are driving the bulk of sales demand?
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="units_sold" radius={[0, 6, 6, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
