import React, { useState, useEffect, useCallback } from 'react';
import { recommendationService } from '../../services/recommendationService';
import { categoryService } from '../../services/categoryService';
import { supplierService } from '../../services/supplierService';
import { RecommendationKpis } from '../../components/recommendations/RecommendationKpis';
import { RecommendationTable } from '../../components/recommendations/RecommendationTable';
import { WhyExplanationModal } from '../../components/recommendations/WhyExplanationModal';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'pending', label: 'Pending Action' },
  { id: 'approved', label: 'Approved' },
  { id: 'ordered', label: 'Ordered / In Pipeline' },
  { id: 'dismissed', label: 'Dismissed' },
  { id: 'ALL', label: 'All Records' },
];

const URGENCY_OPTIONS = [
  { value: 'ALL', label: 'All Urgencies' },
  { value: 'critical', label: 'Critical Only' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function RecommendationsPage() {
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [activeStatus, setActiveStatus] = useState('pending');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [planningHorizonDays, setPlanningHorizonDays] = useState(14);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [whyRecommendation, setWhyRecommendation] = useState(null);
  const [confirmOrderTarget, setConfirmOrderTarget] = useState(null);

  const fetchDropdownData = async () => {
    try {
      const [cats, supps] = await Promise.all([
        categoryService.list(),
        supplierService.list(),
      ]);
      setCategories(cats || []);
      setSuppliers(supps || []);
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await recommendationService.getRecommendations({
        status: activeStatus,
        urgency: selectedUrgency,
        categoryId: selectedCategoryId || null,
        supplierId: selectedSupplierId || null,
        search: searchQuery || null,
        page,
        limit: 20,
      });

      setSummary(res.summary);
      setRecommendations(res.items || []);
      setTotalPages(res.total_pages || 1);
      setTotalCount(res.total_count || 0);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError(err?.response?.data?.detail || err.message || 'Failed to load restock recommendations.');
    } finally {
      setIsLoading(false);
    }
  }, [activeStatus, selectedUrgency, selectedCategoryId, selectedSupplierId, searchQuery, page]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await recommendationService.generateRecommendations({
        planningHorizonDays: Number(planningHorizonDays),
        save: true,
      });
      setSuccessMessage(
        `Generated ${res.summary?.total_recommendations || 0} restock recommendations across a ${planningHorizonDays}-day review window.`
      );
      await fetchRecommendations();
    } catch (err) {
      console.error('Failed to generate recommendations:', err);
      setError(err?.response?.data?.detail || err.message || 'Recommendation generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = async (rec, newStatus) => {
    setIsProcessingAction(true);
    setError('');
    try {
      await recommendationService.updateStatus(rec.id, newStatus);
      setSuccessMessage(`Recommendation for "${rec.product_name}" updated to ${newStatus}.`);
      await fetchRecommendations();
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err?.response?.data?.detail || err.message || 'Failed to update recommendation status.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!confirmOrderTarget) return;
    setIsProcessingAction(true);
    setError('');
    try {
      const res = await recommendationService.convertToPurchase(confirmOrderTarget.id);
      setSuccessMessage(
        `Purchase Order #${res.purchase_order_id} created successfully for ${res.ordered_quantity} units of ${confirmOrderTarget.product_name}!`
      );
      setConfirmOrderTarget(null);
      await fetchRecommendations();
    } catch (err) {
      console.error('Failed to convert recommendation to purchase order:', err);
      setError(
        err?.response?.data?.detail || err.message || 'Failed to generate purchase order.'
      );
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId('');
    setSelectedSupplierId('');
    setSelectedUrgency('ALL');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Restock Recommendations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Replenishment orders calculated from forecast demand, inventory on hand, incoming stock, and safety buffers.
          </p>
        </div>

        {/* Engine Generation Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-xs text-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
            <span className="text-slate-500 mr-2">Horizon:</span>
            <select
              value={planningHorizonDays}
              onChange={(e) => setPlanningHorizonDays(Number(e.target.value))}
              disabled={isGenerating}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days (Standard)</option>
              <option value={30}>30 Days (Monthly)</option>
              <option value={60}>60 Days (Quarterly)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Calculating...' : 'Run Engine'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="text-rose-500 hover:text-rose-700 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-emerald-500 hover:text-emerald-700 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <RecommendationKpis summary={summary} />

      {/* Status Filter Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-4 overflow-x-auto pb-1" aria-label="Tabs">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveStatus(tab.id);
                  setPage(1);
                }}
                className={`whitespace-nowrap pb-3 px-1 text-xs font-bold border-b-2 transition-colors ${
                  isActive
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search & Dimensional Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Urgency */}
          <select
            value={selectedUrgency}
            onChange={(e) => {
              setSelectedUrgency(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-700 font-medium focus:border-sky-500 focus:bg-white focus:outline-none"
          >
            {URGENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-700 font-medium focus:border-sky-500 focus:bg-white focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Supplier */}
          <select
            value={selectedSupplierId}
            onChange={(e) => {
              setSelectedSupplierId(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-700 font-medium focus:border-sky-500 focus:bg-white focus:outline-none"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {(searchQuery || selectedUrgency !== 'ALL' || selectedCategoryId || selectedSupplierId) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Table */}
      <RecommendationTable
        recommendations={recommendations}
        isLoading={isLoading}
        onShowWhy={(rec) => setWhyRecommendation(rec)}
        onStatusChange={handleStatusChange}
        onConvertToPurchase={(rec) => setConfirmOrderTarget(rec)}
        isProcessingAction={isProcessingAction}
      />

      {/* Pagination */}
      {!isLoading && recommendations.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Why Explanation Modal */}
      <WhyExplanationModal
        isOpen={Boolean(whyRecommendation)}
        onClose={() => setWhyRecommendation(null)}
        recommendation={whyRecommendation}
      />

      {/* Purchase Order Conversion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmOrderTarget)}
        onClose={() => setConfirmOrderTarget(null)}
        onConfirm={handleConfirmOrder}
        title="Confirm Restock Purchase Order"
        message={`Are you sure you want to generate a formal Purchase Order for ${confirmOrderTarget?.suggested_order_quantity} units of ${confirmOrderTarget?.product_name}? Total estimated commitment is $${confirmOrderTarget?.estimated_cost?.toFixed(2)}.`}
        confirmText="Generate Purchase Order"
        confirmVariant="primary"
      />
    </div>
  );
}
