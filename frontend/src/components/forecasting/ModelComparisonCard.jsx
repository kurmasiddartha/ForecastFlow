import React from 'react';
import {
  Trophy,
  CheckCircle2,
  HelpCircle,
  Cpu,
  BarChart,
  Layers,
} from 'lucide-react';

export function ModelComparisonCard({
  modelComparison = [],
  championModel = '',
  evaluationMetrics = {},
}) {
  if (!modelComparison || modelComparison.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Cpu className="h-4 w-4 text-indigo-600" />
          Model Evaluation Pipeline
        </h3>
        <p className="text-xs text-slate-500">
          Model backtesting is skipped or using single baseline fallback due to sparse historical records.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Time-Aware Model Backtest Leaderboard
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated on a chronological holdout test split. The champion model minimizes prediction error (MAE / RMSE).
          </p>
        </div>

        <span className="self-start sm:self-auto rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {modelComparison.length} Models Tested
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="py-3.5 px-4">Candidate Model</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">MAE</th>
              <th className="py-3.5 px-4 text-right">RMSE</th>
              <th className="py-3.5 px-4 text-right">MAPE</th>
              <th className="py-3.5 px-4 text-right">sMAPE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {modelComparison.map((model) => {
              const isSelected = model.is_selected || model.model_name === championModel;
              return (
                <tr
                  key={model.model_name}
                  className={`transition-colors ${
                    isSelected ? 'bg-indigo-50/40 font-medium' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isSelected ? 'bg-indigo-600 ring-2 ring-indigo-200' : 'bg-slate-300'
                        }`}
                      />
                      <span className={`text-base font-semibold ${isSelected ? 'text-indigo-950 font-bold' : 'text-slate-800'}`}>
                        {model.model_name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100/90 px-3 py-1 text-xs font-bold text-indigo-700">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        Selected Champion
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                        Evaluated
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-sm text-slate-800">
                    {Number(model.mae).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-sm text-slate-800">
                    {Number(model.rmse).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-sm text-slate-800">
                    {(Number(model.mape) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-sm text-slate-800">
                    {(Number(model.smape) * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
          <span>Lower MAE & RMSE values indicate higher accuracy on test demand.</span>
        </div>
        <span>Time-aware chronological split (no random shuffling)</span>
      </div>
    </div>
  );
}
