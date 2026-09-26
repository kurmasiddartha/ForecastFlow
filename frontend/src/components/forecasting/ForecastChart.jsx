import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

const CustomForecastTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload || {};
  const isForecast = dataPoint.predicted !== null && dataPoint.predicted !== undefined;
  const isActual = dataPoint.actual !== null && dataPoint.actual !== undefined;

  const dateObj = new Date(dataPoint.date);
  const dayName = isNaN(dateObj) ? '' : dateObj.toLocaleDateString(undefined, { weekday: 'long' });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl text-xs min-w-[210px]">
      <div className="border-b border-slate-100 pb-2 mb-2">
        <p className="font-bold text-slate-800">{dataPoint.date}</p>
        <p className="text-[11px] text-slate-400 font-medium">{dayName}</p>
      </div>

      <div className="space-y-2">
        {isActual && (
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Actual Demand:
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {Number(dataPoint.actual).toFixed(1)} units
            </span>
          </div>
        )}

        {isForecast && (
          <div className="space-y-1.5 pt-1 border-t border-slate-50">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-indigo-600">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Predicted Demand:
              </span>
              <span className="font-black text-indigo-600 text-sm">
                {Number(dataPoint.predicted).toFixed(1)} units
              </span>
            </div>

            {dataPoint.lower !== undefined && dataPoint.upper !== undefined && (
              <div className="flex items-center justify-between gap-4 text-[11px] text-slate-500">
                <span>Confidence Range (80%):</span>
                <span className="font-medium text-slate-700">
                  [{Number(dataPoint.lower).toFixed(1)} – {Number(dataPoint.upper).toFixed(1)}]
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export function ForecastChart({
  forecast = null,
  product = null,
}) {
  if (!forecast) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 flex flex-col items-center justify-center text-center min-h-[380px]">
        <TrendingUp className="h-10 w-10 text-slate-300 mb-3" />
        <h4 className="text-sm font-semibold text-slate-700">No Forecast Selected</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Select a product and horizon above to run the predictive demand pipeline and visualize trends.
        </p>
      </div>
    );
  }

  const predictions = Array.isArray(forecast?.predictions) ? forecast.predictions : [];
  const historical_data = Array.isArray(forecast?.historical_data) ? forecast.historical_data : [];
  const model_used = forecast?.model_used || 'Forecaster';
  const forecast_horizon = forecast?.forecast_horizon || 7;
  const evaluation_metrics = forecast?.evaluation_metrics && typeof forecast.evaluation_metrics === 'object' ? forecast.evaluation_metrics : {};
  const insufficient_data = Boolean(forecast?.insufficient_data);
  const message = forecast?.message || null;

  // Build unified chronological timeline
  const chartData = [];
  const lastHistorical = historical_data.length > 0 ? historical_data[historical_data.length - 1] : null;

  // Add historical points
  historical_data.forEach((h) => {
    chartData.push({
      date: h.date,
      displayDate: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      actual: h.demand,
      predicted: null,
      lower: null,
      upper: null,
    });
  });

  // To bridge the line visual smoothly, connect at the junction point
  if (lastHistorical && predictions.length > 0 && chartData.length > 0) {
    const junctionIndex = chartData.length - 1;
    chartData[junctionIndex].predicted = chartData[junctionIndex].actual;
  }

  // Add forward prediction points
  predictions.forEach((p) => {
    chartData.push({
      date: p.date,
      displayDate: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      actual: null,
      predicted: p.predicted_demand,
      lower: p.lower_bound,
      upper: p.upper_bound,
    });
  });

  const totalForecastDemand = predictions.reduce((sum, p) => sum + (p.predicted_demand || 0), 0);
  const avgDailyPredicted = predictions.length > 0 ? totalForecastDemand / predictions.length : 0;
  const boundaryDate = lastHistorical?.date;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      {/* Header and Legend Information */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Demand Trajectory & Forecast Horizon
            </h3>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200">
              {forecast_horizon}-Day Horizon
            </span>
            {insufficient_data && (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Sparse History
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comparing historical consumption against future projected inventory demand using{' '}
            <strong className="text-slate-700 font-semibold">{model_used}</strong>.
          </p>
        </div>

        {/* Visual Differentiation Indicators */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">Historical / Actual</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-6 border-b-2 border-dashed border-indigo-600" />
            <span className="font-semibold text-indigo-700">Predicted / Forecast</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-4 rounded-sm bg-indigo-100" />
            <span className="text-[11px] text-slate-500">80% Interval</span>
          </div>
        </div>
      </div>

      {/* Insufficient Data Alert Banner */}
      {insufficient_data && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Limited Historical Observations Detected</p>
            <p className="mt-0.5 text-amber-700 leading-relaxed">
              {message ||
                'This item has fewer than 4 recorded sales periods. The system has applied a conservative baseline heuristic based on target inventory thresholds to ensure safe stock coverage without false regression assumptions.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
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
              tickFormatter={(v) => `${v}u`}
            />
            <Tooltip content={<CustomForecastTooltip />} />

            {/* Boundary marker between past and future */}
            {boundaryDate && (
              <ReferenceLine
                x={chartData.find((d) => d.date === boundaryDate)?.displayDate}
                stroke="#6366f1"
                strokeDasharray="4 4"
                label={{
                  value: 'Forecast Start',
                  fill: '#4f46e5',
                  fontSize: 10,
                  position: 'insideTopRight',
                  fontWeight: 600,
                }}
              />
            )}

            {/* Shaded Area for Forecast */}
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="none"
              fillOpacity={1}
              fill="url(#forecastAreaGrad)"
            />

            {/* 1. Historical Actual Solid Line (Emerald) */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#059669' }}
              name="Historical Actual"
            />

            {/* 2. Forecast Projected Dashed Line (Indigo) */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#6366f1"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#ffffff', stroke: '#6366f1', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#4f46e5' }}
              name="Predicted Demand"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Total Expected Demand
          </p>
          <p className="text-base font-black text-indigo-600 mt-0.5">
            {totalForecastDemand.toFixed(1)} units
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Daily Average (Forecast)
          </p>
          <p className="text-base font-black text-slate-800 mt-0.5">
            {avgDailyPredicted.toFixed(1)} units/day
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Validation MAE
          </p>
          <p className="text-base font-black text-slate-800 mt-0.5">
            {evaluation_metrics.mae !== undefined ? Number(evaluation_metrics.mae).toFixed(2) : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Validation RMSE
          </p>
          <p className="text-base font-black text-slate-800 mt-0.5">
            {evaluation_metrics.rmse !== undefined ? Number(evaluation_metrics.rmse).toFixed(2) : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
