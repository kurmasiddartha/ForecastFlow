import React, { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { recommendationService } from '../../services/recommendationService';
import { systemService } from '../../services/systemService';
import { InventoryOverviewKpis } from '../../components/dashboard/InventoryOverviewKpis';
import { AttentionRequiredSection } from '../../components/dashboard/AttentionRequiredSection';
import { SalesAndDemandChart } from '../../components/dashboard/SalesAndDemandChart';
import { ActionRequiredRestocks } from '../../components/dashboard/ActionRequiredRestocks';
import { WhyExplanationModal } from '../../components/recommendations/WhyExplanationModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { RefreshCw, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';


const TIMEFRAME_PRESETS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year', value: '1y' },
];

export function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [whyRecommendation, setWhyRecommendation] = useState(null);
  const [confirmOrderTarget, setConfirmOrderTarget] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await analyticsService.getAIDashboard({
        timeframe,
      });
      setDashboardData(res);
    } catch (err) {
      console.error('Failed to load Dashboard data:', err);
      setError(
        err?.response?.data?.detail || err.message || 'Failed to load dashboard overview.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleConfirmOrder = async () => {
    if (!confirmOrderTarget) return;
    setIsProcessingAction(true);
    setError('');
    try {
      const res = await recommendationService.convertToPurchase(confirmOrderTarget.id);
      setSuccessMessage(
        `Purchase Order #${res.purchase_order_id} created successfully for ${res.ordered_quantity} units of ${confirmOrderTarget.product_name}.`
      );
      setConfirmOrderTarget(null);
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to convert recommendation to PO:', err);
      setError(
        err?.response?.data?.detail || err.message || 'Failed to generate purchase order.'
      );
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    setError('');
    try {
      const res = await systemService.resetOperationalData();
      setSuccessMessage(res.message || 'All operational test data has been permanently cleared.');
      setIsResetDialogOpen(false);
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to reset operational data:', err);
      setError(
        err?.response?.data?.detail || err.message || 'Failed to wipe operational data from database.'
      );
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-32 rounded-xl bg-slate-100" />
        <div className="h-80 rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* ------------------------------------------------------------- */}
      {/* Page Header */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Inventory Dashboard
            </h1>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              Live
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Real-time stock monitoring, demand trends, and AI-driven restock priorities.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe selector pill track */}
          <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-1 shadow-inner max-w-full overflow-x-auto">
            {TIMEFRAME_PRESETS.map((tf) => {
              const isSelected = timeframe === tf.value;
              return (
                <button
                  key={tf.value}
                  type="button"
                  onClick={() => setTimeframe(tf.value)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs transition-all ${
                    isSelected
                      ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-white/50'
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => fetchDashboard()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all active:scale-[0.98]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50/80 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 shadow-xs transition-all active:scale-[0.98]"
            title="Clear all test products, sales, and purchases"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-semibold text-rose-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: Inventory Overview */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Inventory Overview</h2>
          <span className="text-xs font-medium text-slate-500">Aggregated store metrics</span>
        </div>
        <InventoryOverviewKpis
          inventoryOverview={dashboardData?.inventory_overview}
          salesOverview={dashboardData?.sales_overview}
        />
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: Attention Required */}
      {/* ------------------------------------------------------------- */}
      <section>
        <AttentionRequiredSection
          inventoryOverview={dashboardData?.inventory_overview}
          stockoutRiskProducts={dashboardData?.stockout_risk_products}
          slowDeadSummary={dashboardData?.slow_dead_stock_summary}
          restockSummary={dashboardData?.restock_summary}
        />
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: Sales & Demand */}
      {/* ------------------------------------------------------------- */}
      <section>
        <SalesAndDemandChart data={dashboardData?.sales_trends} />
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: Action Required */}
      {/* ------------------------------------------------------------- */}
      <section>
        <ActionRequiredRestocks
          recommendations={dashboardData?.restock_summary?.top_recommendations || []}
          totalPendingCount={dashboardData?.restock_summary?.pending_count || 0}
          onShowWhy={(rec) => setWhyRecommendation(rec)}
          onOrderNow={(rec) => setConfirmOrderTarget(rec)}
          isProcessingAction={isProcessingAction}
        />
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Modals & Dialogs */}
      {/* ------------------------------------------------------------- */}
      <WhyExplanationModal
        isOpen={Boolean(whyRecommendation)}
        onClose={() => setWhyRecommendation(null)}
        recommendation={whyRecommendation}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmOrderTarget)}
        onClose={() => setConfirmOrderTarget(null)}
        onConfirm={handleConfirmOrder}
        title="Confirm Restock Purchase Order"
        message={`Generate formal Purchase Order for ${confirmOrderTarget?.suggested_order_quantity} units of ${confirmOrderTarget?.product_name}? Estimated cost is $${confirmOrderTarget?.estimated_cost?.toFixed(2)}.`}
        confirmText="Generate Purchase Order"
        isDanger={false}
      />

      <ConfirmDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleResetData}
        title="Clear All Operational Data?"
        message="This will permanently delete all test products, categories, suppliers, sales transactions, purchases, stock movements, forecasts, and recommendations from MongoDB. Your user login account will remain active. Are you sure you want to proceed?"
        confirmText="Yes, Wipe Test Data"
        isDanger={true}
        isLoading={isResetting}
      />
    </div>
  );
}
