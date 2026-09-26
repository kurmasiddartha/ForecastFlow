import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const revenue = payload.find((p) => p.dataKey === 'revenue')?.value ?? 0;
    const units = payload.find((p) => p.dataKey === 'units_sold')?.value ?? 0;
    const orders = payload[0]?.payload?.order_count ?? 0;

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <p className="text-xs font-bold text-slate-800">{label}</p>
        <div className="mt-2 space-y-1 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Revenue:
            </span>
            <span className="font-bold text-slate-900">${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500"></span>
              Units Sold:
            </span>
            <span className="font-bold text-slate-900">{units.toLocaleString()} units</span>
          </div>
          {orders > 0 && (
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 text-[11px] text-slate-400">
              <span>Customer Orders:</span>
              <span className="font-semibold text-slate-700">{orders}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export function SalesTrendsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
        <TrendingUp className="h-10 w-10 text-slate-300" />
        <p className="mt-2 text-xs font-semibold text-slate-600">No Sales Recorded in Timeframe</p>
        <p className="text-[11px] text-slate-400">Sales transactions will chart automatically here as orders are placed.</p>
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Commercial Sales & Demand Velocity
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total of <strong className="text-slate-800">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> revenue across {totalUnits.toLocaleString()} units sold.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span>Revenue ($)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
            <span>Units Sold</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="unitsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGrad)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="units_sold"
              stroke="#0284c7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#unitsGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
