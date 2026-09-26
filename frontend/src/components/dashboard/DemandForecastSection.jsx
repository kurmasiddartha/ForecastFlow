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
import { Cpu, Sparkles, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function CustomForecastTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const actual = payload.find((p) => p.dataKey === 'actual')?.value;
    const predicted = payload.find((p) => p.dataKey === 'predicted')?.value;

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <p className="text-xs font-bold text-slate-800">{label}</p>
        <div className="mt-2 space-y-1 text-xs">
          {actual !== undefined && actual !== null && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-600"></span>
                Historical Actual:
              </span>
              <span className="font-bold text-slate-900">{actual} units</span>
            </div>
          )}
          {predicted !== undefined && predicted !== null && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-indigo-600 flex items-center gap-1.5 font-semibold">
                <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                AI Predicted:
              </span>
              <span className="font-bold text-indigo-900">{predicted} units</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export function DemandForecastSection({
  forecastSummary,
  featuredForecast,
  availableProducts = [],
  onSelectProduct,
  isLoadingForecast = false,
}) {
  const chartData = featuredForecast?.data_points || [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header & Meta Summary */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Forward Demand Intelligence & Projections
            </h3>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              14-Day Horizon
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive model backtested on time-series historical consumption using {forecastSummary?.primary_model || 'Ridge Demand Forecaster'}.
          </p>
        </div>

        {/* Portfolio Summary Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-slate-700 font-medium">
            <span className="text-slate-400 mr-1.5">Projected Demand:</span>
            <strong className="text-slate-900 font-bold">
              {(forecastSummary?.total_forecasted_units_14d ?? 0).toLocaleString()} units
            </strong>
          </div>
          <Link
            to="/forecast"
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <span>Model Lab</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Featured Forecast Selector & Chart */}
      <div className="mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <label htmlFor="forecast-prod-select" className="text-xs font-semibold text-slate-500">
              Viewing Trajectory:
            </label>
            <select
              id="forecast-prod-select"
              value={featuredForecast?.product_id || ''}
              onChange={(e) => onSelectProduct && onSelectProduct(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
            >
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
              <span>Historical Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
              <span className="font-semibold text-indigo-700">Projected Demand</span>
            </div>
          </div>
        </div>

        {isLoadingForecast ? (
          <div className="flex h-64 items-center justify-center animate-pulse">
            <span className="text-xs text-slate-400">Updating demand projection...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <Cpu className="h-10 w-10 text-slate-300" />
            <p className="mt-2 text-xs font-semibold text-slate-600">No Forecast Points Available</p>
            <p className="text-[11px] text-slate-400">Select a product with sales history or generate forecasts in the demand lab.</p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(d) => (d.length > 5 ? d.substring(5) : d)}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomForecastTooltip />} />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#475569"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#actualGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#predictedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
