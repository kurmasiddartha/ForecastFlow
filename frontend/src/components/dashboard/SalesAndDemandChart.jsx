import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const revenue = payload.find((p) => p.dataKey === 'revenue')?.value ?? 0;
    const units = payload.find((p) => p.dataKey === 'units_sold')?.value ?? 0;
    const orders = payload[0]?.payload?.order_count ?? 0;

    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-sm p-4 shadow-xl text-slate-900 min-w-[180px]">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="mt-2.5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 font-medium">Revenue:</span>
            <span className="font-extrabold text-slate-900">
              ${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 font-medium">Units Sold:</span>
            <span className="font-bold text-indigo-600">{units.toLocaleString()}</span>
          </div>
          {orders > 0 && (
            <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-slate-100 text-slate-400 text-[11px]">
              <span>Orders:</span>
              <span className="font-semibold">{orders}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export function SalesAndDemandChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Sales & Demand Trajectory</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Historical revenue and demand throughput</p>
          </div>
        </div>
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-600 mb-3 shadow-xs">
            <TrendingUp className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Sales Recorded In This Period</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            Sales orders and daily velocity will render as an interactive forecast & revenue curve once transactions occur.
          </p>
        </div>
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    displayDate: d.date.length > 5 ? d.date.substring(5) : d.date,
  }));

  const totalRevenue = data.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalUnits = data.reduce((acc, curr) => acc + (curr.units_sold || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Sales & Demand Trajectory</h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            <span className="text-indigo-600 font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> revenue • {totalUnits.toLocaleString()} units sold
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
            <span>Revenue ($)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span>Units Sold</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="units_sold"
              stroke="#0284c7"
              strokeWidth={2}
              fillOpacity={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
