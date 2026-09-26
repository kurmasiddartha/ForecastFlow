import React from 'react';
import { Calendar, AlertCircle, ArrowUpRight } from 'lucide-react';

export function ForecastScheduleTable({
  predictions = [],
  currentStock = 0,
  reorderLevel = 10,
}) {
  if (!predictions || predictions.length === 0) {
    return null;
  }

  let cumulativeDemand = 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-600" />
            Day-by-Day Forecast Schedule
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential expected consumption plan and cumulative drawdown vs current inventory ({currentStock} units).
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="py-3.5 px-4">Forecast Date</th>
              <th className="py-3.5 px-4">Day</th>
              <th className="py-3.5 px-4 text-right">Predicted Demand</th>
              <th className="py-3.5 px-4 text-right">80% Interval</th>
              <th className="py-3.5 px-4 text-right">Cumulative Demand</th>
              <th className="py-3.5 px-4 text-right">Projected Stock Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {predictions.map((p, idx) => {
              cumulativeDemand += p.predicted_demand;
              const remainingStock = Math.max(0, currentStock - cumulativeDemand);
              const isBelowReorder = remainingStock <= reorderLevel;

              const dateObj = new Date(p.date);
              const dayName = isNaN(dateObj) ? '' : dateObj.toLocaleDateString(undefined, { weekday: 'short' });

              return (
                <tr key={p.date} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {p.date}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {dayName}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-base text-indigo-600 font-mono">
                    {p.predicted_demand.toFixed(1)} u
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-xs">
                    [{p.lower_bound?.toFixed(1) ?? '—'} – {p.upper_bound?.toFixed(1) ?? '—'}]
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-800 font-mono">
                    {cumulativeDemand.toFixed(1)} u
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isBelowReorder
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'text-slate-800 font-medium'
                      }`}
                    >
                      {remainingStock.toFixed(1)} u
                      {isBelowReorder && <AlertCircle className="h-3.5 w-3.5 text-amber-600" />}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
