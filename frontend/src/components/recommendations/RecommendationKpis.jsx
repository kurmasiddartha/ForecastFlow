import React from 'react';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
} from 'lucide-react';

export function RecommendationKpis({ summary }) {
  if (!summary) return null;

  const criticalCount = summary.critical_count ?? 0;

  const kpis = [
    {
      title: 'Actionable Restocks',
      value: (summary.pending_count ?? 0).toLocaleString(),
      subtext: `${summary.total_recommendations ?? 0} total active items`,
      icon: Clock,
      isCritical: false,
    },
    {
      title: 'Critical Attention',
      value: criticalCount.toLocaleString(),
      subtext: `${summary.high_count ?? 0} high priority items`,
      icon: AlertTriangle,
      isCritical: criticalCount > 0,
    },
    {
      title: 'Total Units Needed',
      value: (summary.total_recommended_units ?? 0).toLocaleString(),
      subtext: 'Calculated order requirement',
      icon: Package,
      isCritical: false,
    },
    {
      title: 'Procurement Budget',
      value: `$${(summary.total_estimated_budget ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: `${summary.ordered_count ?? 0} converted to purchase order`,
      icon: DollarSign,
      isCritical: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {kpi.title}
              </span>
              <Icon
                className={`h-4 w-4 ${
                  kpi.isCritical ? 'text-rose-600' : 'text-slate-400'
                }`}
              />
            </div>
            <div className="mt-2">
              <span
                className={`text-2xl font-bold tracking-tight ${
                  kpi.isCritical ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {kpi.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 truncate">{kpi.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
