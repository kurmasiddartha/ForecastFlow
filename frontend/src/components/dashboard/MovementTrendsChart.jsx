import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ArrowLeftRight } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const stockIn = payload.find((p) => p.dataKey === 'stock_in')?.value || 0;
    const stockOut = payload.find((p) => p.dataKey === 'stock_out')?.value || 0;
    const net = stockIn - stockOut;

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
        <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1.5">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-emerald-600 font-semibold">
            <span>Stock-In (Procured):</span>
            <span>+{stockIn} units</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-rose-600 font-semibold">
            <span>Stock-Out (Dispatched):</span>
            <span>-{stockOut} units</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-700 font-bold border-t border-slate-100 pt-1">
            <span>Net Change:</span>
            <span className={net >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {net >= 0 ? `+${net}` : net} units
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function MovementTrendsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center justify-center min-h-[340px] text-center">
        <ArrowLeftRight className="h-10 w-10 text-slate-300 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Stock Movements in Window</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Physical inventory movements (purchases, sales, adjustments) will show replenishment velocity here.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }));

  const totalIn = data.reduce((sum, d) => sum + (d.stock_in || 0), 0);
  const totalOut = data.reduce((sum, d) => sum + (d.stock_out || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-sky-600" />
            Stock Inflow vs Outflow Trends
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Answers: Are we replenishing stock at the rate customers are buying, or accumulating excess?
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            In: +{totalIn.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            Out: -{totalOut.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              height={30}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-[11px] font-medium text-slate-600 capitalize">
                  {value === 'stock_in' ? 'Stock-In (Restock)' : 'Stock-Out (Sales)'}
                </span>
              )}
            />
            <Bar dataKey="stock_in" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="stock_out" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
