import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const revenue = payload.find((p) => p.dataKey === 'revenue')?.value || 0;
    const units = payload.find((p) => p.dataKey === 'units_sold')?.value || 0;
    const orders = payload[0]?.payload?.order_count || 0;

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1.5">
          {label}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-emerald-600 font-semibold">
            <span>Revenue:</span>
            <span>${Number(revenue).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sky-600 font-medium">
            <span>Units Sold:</span>
            <span>{units} units</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-500 text-[11px]">
            <span>Orders:</span>
            <span>{orders} order{orders === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function SalesOverTimeChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center justify-center min-h-[340px] text-center">
        <TrendingUp className="h-10 w-10 text-slate-300 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Sales in Selected Period</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Record customer sales orders or select a wider timeframe to observe daily revenue velocity.
        </p>
      </div>
    );
  }

  // Format date display for X Axis
  const chartData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }));

  const totalRevenue = data.reduce((acc, d) => acc + (d.revenue || 0), 0);
  const totalUnits = data.reduce((acc, d) => acc + (d.units_sold || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Sales Velocity & Revenue Over Time
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Answers: How is daily sales volume and turnover evolving across the selected window?
          </p>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Period Total
            </p>
            <p className="text-base font-black text-emerald-600">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Total Units
            </p>
            <p className="text-base font-black text-slate-800">
              {totalUnits.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#salesRevenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
