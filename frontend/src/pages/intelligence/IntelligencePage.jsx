import React, { useState, useEffect } from 'react';
import { intelligenceService } from '../../services/intelligenceService';
import { categoryService } from '../../services/categoryService';
import { IntelligenceKpis } from '../../components/intelligence/IntelligenceKpis';
import { ThresholdConfigBar } from '../../components/intelligence/ThresholdConfigBar';
import { IntelligenceTable } from '../../components/intelligence/IntelligenceTable';
import { Pagination } from '../../components/common/Pagination';
import {
  BrainCircuit,
  Search,
  RefreshCw,
  Filter,
  ShieldAlert,
  PackageX,
  Layers,
  TrendingUp,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
} from 'lucide-react';

const DEFAULT_CONFIG = {
  analysisWindowDays: 30,
  deadStockDays: 60,
  fastMovingVelocity: 2.0,
  slowMovingVelocity: 0.5,
  stockoutDays: 7.0,
  overstockDays: 90.0,
};

const VIEW_TABS = [
  { id: 'ALL', label: 'All Products', icon: null },
  { id: 'STOCKOUT', label: 'Stockout Risk', icon: ShieldAlert, badgeColor: 'bg-rose-100 text-rose-800' },
  { id: 'DEAD_STOCK', label: 'Dead Stock', icon: PackageX, badgeColor: 'bg-amber-100 text-amber-800' },
  { id: 'OVERSTOCK', label: 'Overstock Risk', icon: Layers, badgeColor: 'bg-blue-100 text-blue-800' },
  { id: 'FAST_MOVING', label: 'Fast-Moving', icon: TrendingUp, badgeColor: 'bg-emerald-100 text-emerald-800' },
  { id: 'SLOW_MOVING', label: 'Slow-Moving', icon: Clock, badgeColor: 'bg-slate-100 text-slate-700' },
];

export function IntelligencePage() {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & State
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.list();
      setCategories(cats || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchIntelligence = async () => {
    setIsLoading(true);
    setError('');
    try {
      let riskFilter = 'ALL';
      let velocityFilter = 'ALL';

      if (activeTab === 'STOCKOUT') riskFilter = 'STOCKOUT';
      else if (activeTab === 'DEAD_STOCK') riskFilter = 'DEAD_STOCK';
      else if (activeTab === 'OVERSTOCK') riskFilter = 'OVERSTOCK';
      else if (activeTab === 'FAST_MOVING') velocityFilter = 'FAST_MOVING';
      else if (activeTab === 'SLOW_MOVING') velocityFilter = 'SLOW_MOVING';

      const res = await intelligenceService.getProducts({
        search: searchQuery || null,
        categoryId: selectedCategoryId || null,
        riskFilter,
        velocityFilter,
        page,
        limit: 25,
        analysisWindowDays: config.analysisWindowDays,
        deadStockDays: config.deadStockDays,
        fastMovingVelocity: config.fastMovingVelocity,
        slowMovingVelocity: config.slowMovingVelocity,
        stockoutDays: config.stockoutDays,
        overstockDays: config.overstockDays,
      });

      setSummary(res.summary);
      setProducts(res.products || []);
      setTotalPages(res.total_pages || 1);
      setTotalCount(res.total_count || 0);
    } catch (err) {
      console.error('Failed to load inventory intelligence:', err);
      setError(err.message || 'Failed to evaluate inventory intelligence.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchIntelligence();
  }, [activeTab, selectedCategoryId, page, config]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchIntelligence();
  };

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sales velocity classification, dead stock detection, and stockout risk monitoring.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchIntelligence}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-slate-700' : 'text-slate-500'}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <IntelligenceKpis summary={summary} />

      {/* Configurable Thresholds Bar */}
      <ThresholdConfigBar
        config={config}
        onChange={handleConfigChange}
        onReset={handleResetConfig}
      />

      {/* Interactive Segmented View Tabs & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          {/* Segmented View Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {VIEW_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-24 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            Filter
          </button>
        </form>

        {/* Main Intelligence Products Table */}
        <IntelligenceTable products={products} isLoading={isLoading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end pt-2">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
