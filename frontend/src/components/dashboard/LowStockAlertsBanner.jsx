import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, ShieldAlert, ChevronRight, X } from 'lucide-react';

export function LowStockAlertsBanner({ alerts = [] }) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!alerts || alerts.length === 0 || isDismissed) {
    return null;
  }

  const outOfStockItems = alerts.filter((a) => a.urgency === 'out_of_stock');
  const criticalItems = alerts.filter((a) => a.urgency === 'critical');

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-rose-100 p-2 text-rose-700 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                Low Stock & Depletion Warning
              </h4>
              <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                {alerts.length} Products Affected
              </span>
            </div>
            <p className="mt-0.5 text-xs text-rose-800">
              {outOfStockItems.length > 0 ? (
                <>
                  <strong className="font-semibold text-rose-950">{outOfStockItems.length} products</strong> have zero physical inventory on hand.
                </>
              ) : null}
              {criticalItems.length > 0 ? (
                <>
                  {' '}<strong className="font-semibold text-rose-950">{criticalItems.length} products</strong> are at or below 50% of reorder buffer.
                </>
              ) : null}
              {' '}Immediate replenishment recommended to avoid operational disruption.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 sm:self-center">
          <Link
            to="/recommendations"
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
          >
            <span>Review Restocks</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-100 hover:text-rose-700 transition-colors"
            title="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mini alert tags */}
      <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-rose-200/60">
        {alerts.slice(0, 5).map((item) => (
          <div
            key={item.product_id}
            className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-white/90 px-2.5 py-1 text-[11px]"
          >
            <span className="font-bold text-slate-800">{item.product_name}</span>
            <span className="font-mono text-[10px] text-slate-400">{item.sku}</span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                item.current_stock <= 0
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {item.current_stock} / {item.reorder_point} units
            </span>
          </div>
        ))}
        {alerts.length > 5 && (
          <span className="self-center text-[11px] font-medium text-rose-700">
            +{alerts.length - 5} more items
          </span>
        )}
      </div>
    </div>
  );
}
