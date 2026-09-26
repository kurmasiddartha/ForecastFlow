import React from 'react';
import { Modal } from '../common/Modal';
import { HelpCircle } from 'lucide-react';

const RISK_BADGES = {
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
  high: 'bg-amber-50 text-amber-700 border-amber-200',
  medium: 'bg-slate-100 text-slate-700 border-slate-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function WhyExplanationModal({ isOpen, onClose, recommendation }) {
  if (!recommendation) return null;

  const currentStock = recommendation.current_stock ?? 0;
  const incomingStock = recommendation.incoming_stock ?? 0;
  const forecastDemand = Math.round((recommendation.forecast_demand ?? 0) * 10) / 10;
  const safetyStock = recommendation.safety_stock ?? 0;
  const recommendedOrder = recommendation.suggested_order_quantity ?? 0;
  const urgency = recommendation.urgency || 'medium';

  // Math calculation string
  // (Forecast + Safety Stock) - (Current Stock + Incoming Stock)
  const grossReq = forecastDemand + safetyStock;
  const pipeline = currentStock + incomingStock;
  const netShortfall = Math.max(0, Math.ceil(grossReq - pipeline));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restock Recommendation Calculation"
      maxWidth="max-w-lg"
    >
      <div className="space-y-6 text-sm">
        {/* Product Summary Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-base font-semibold text-slate-900">
              {recommendation.product_name}
            </h4>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              SKU: {recommendation.product_sku}
              {recommendation.category_name ? ` • ${recommendation.category_name}` : ''}
            </div>
          </div>
          <span
            className={`rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${
              RISK_BADGES[urgency] || RISK_BADGES.medium
            }`}
          >
            {urgency} risk
          </span>
        </div>

        {/* Input Variables */}
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Inventory & Demand Inputs
          </h5>
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Current stock:</span>
              <span className="font-semibold text-slate-900">{currentStock} units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Incoming stock (open POs):</span>
              <span className="font-semibold text-slate-900">{incomingStock} units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Forecast demand (planning window):</span>
              <span className="font-semibold text-slate-900">{forecastDemand} units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Safety stock buffer:</span>
              <span className="font-semibold text-slate-900">{safetyStock} units</span>
            </div>
          </div>
        </div>

        {/* Transparent Formula Calculation */}
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Formula
          </h5>
          <div className="rounded-lg border border-slate-200 bg-white p-3.5 font-mono text-xs text-slate-700 space-y-1.5">
            <div className="text-slate-500">
              (Forecast + Safety Stock) - (Current Stock + Incoming Stock)
            </div>
            <div className="pt-1.5 border-t border-slate-100 text-slate-900 font-semibold text-sm">
              ({forecastDemand} + {safetyStock}) - ({currentStock} + {incomingStock}) = {netShortfall} units
            </div>
          </div>
        </div>

        {/* Recommended Quantity */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recommended Order
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {recommendedOrder} <span className="text-sm font-normal text-slate-500">units</span>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500">Estimated Cost:</span>
            <div className="text-base font-semibold text-slate-900 mt-0.5">
              ${(recommendation.estimated_cost ?? 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Business Reason */}
        {recommendation.reason && (
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Reason
            </h5>
            <p className="text-sm text-slate-700 leading-relaxed">
              {recommendation.reason}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
