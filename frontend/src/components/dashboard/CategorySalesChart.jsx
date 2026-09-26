import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Tags } from 'lucide-react';

const PALETTE = [
  '#0284c7', // Sky
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
        <p className="font-bold text-slate-900 mb-1">{data.category}</p>
        <div className="space-y-0.5">
          <p className="text-emerald-600 font-semibold">
            Revenue: <span className="font-bold">${data.revenue.toFixed(2)}</span>
          </p>
          <p className="text-sky-600 font-medium">
            Units: <span className="font-bold">{data.units_sold}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function CategorySalesChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center justify-center min-h-[340px] text-center">
        <Tags className="h-10 w-10 text-slate-300 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Category Breakdown</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Categorized product sales will appear here once sales transactions occur.
        </p>
      </div>
    );
  }

  const totalCatRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Tags className="h-4 w-4 text-violet-600" />
            Category Revenue Share
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            ${totalCatRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Answers: Which product lines generate the majority of commercial earnings?
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="category"
              cx="50%"
              cy="48%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={4}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-[11px] font-medium text-slate-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
