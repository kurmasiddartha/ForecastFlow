import React, { useState, useEffect } from 'react';
import { forecastingService } from '../../services/forecastingService';
import { productService } from '../../services/productService';
import { ForecastChart } from '../../components/forecasting/ForecastChart';
import { ModelComparisonCard } from '../../components/forecasting/ModelComparisonCard';
import { ForecastScheduleTable } from '../../components/forecasting/ForecastScheduleTable';
import {
  TrendingUp,
  Cpu,
  Calendar,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Play,
  Layers,
  Search,
  Database,
  Sliders,
  ChevronDown,
} from 'lucide-react';

const HORIZON_OPTIONS = [
  { label: '7 Days (Weekly)', value: 7 },
  { label: '14 Days (Bi-Weekly)', value: 14 },
  { label: '30 Days (Monthly)', value: 30 },
];

const MODEL_PREFERENCES = [
  { label: 'Auto (Champion Selection)', value: 'auto' },
  { label: 'Ridge Regression (L2)', value: 'ridge' },
  { label: 'Exponential Smoothing', value: 'exponential_smoothing' },
  { label: 'Moving Average', value: 'moving_average' },
  { label: 'Baseline', value: 'baseline' },
];

export function ForecastPage() {
  // Products and Selection
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Forecast Configurations
  const [horizon, setHorizon] = useState(7);
  const [modelPreference, setModelPreference] = useState('auto');
  const [forceRetrain, setForceRetrain] = useState(false);

  // Forecast State
  const [forecast, setForecast] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Batch Job State
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  // 1. Fetch available products with forecasting status
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await forecastingService.getProductsOverview();
      setProducts(data || []);
      // Auto-select first product if none selected
      if (!selectedProductId && data && data.length > 0) {
        setSelectedProductId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load products for forecasting:', err);
      setErrorMessage('Could not load products catalogue.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Fetch or load forecast when selected product changes
  const loadProductForecast = async (productId, retrain = false) => {
    if (!productId) return;
    setIsGenerating(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      let res = null;
      if (!retrain) {
        // First try to fetch latest persisted forecast without retraining
        res = await forecastingService.getLatestForecast(productId);
      }

      // If no cached forecast or retrain requested or cache doesn't match horizon
      if (!res || retrain || res.forecast_horizon < horizon) {
        res = await forecastingService.generateForecast({
          productId,
          horizon,
          modelPreference,
          forceRetrain: retrain,
          save: true,
        });
        if (res.is_cached) {
          setSuccessMessage('Loaded fresh cached forecast (generated within last 24h).');
        } else {
          setSuccessMessage('Forecasting pipeline executed and models evaluated successfully.');
        }
      } else {
        setSuccessMessage('Loaded latest persisted forecast without retraining.');
      }

      setForecast(res);
    } catch (err) {
      console.error('Forecast generation failed:', err);
      setErrorMessage(err.message || 'Failed to generate demand forecast.');
      setForecast(null);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      loadProductForecast(selectedProductId, false);
    }
  }, [selectedProductId, horizon]);

  // Handle manual forecast trigger
  const handleGenerate = (e) => {
    e?.preventDefault();
    if (selectedProductId) {
      loadProductForecast(selectedProductId, forceRetrain);
    }
  };

  // Handle batch scheduled job trigger
  const handleRunBatch = async () => {
    setIsBatchRunning(true);
    setErrorMessage('');
    setBatchResult(null);
    try {
      const res = await forecastingService.runBatchForecast({
        horizon,
        forceRetrain,
        maxProducts: 30,
      });
      setBatchResult(res);
      setSuccessMessage(
        `Batch job finished: ${res.successful} processed (${res.cached_used} reused cache, ${res.failed} errors).`
      );
      // Refresh products overview to reflect latest forecast times
      fetchProducts();
    } catch (err) {
      setErrorMessage(err.message || 'Scheduled batch forecasting job failed.');
    } finally {
      setIsBatchRunning(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Demand Forecast
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Historical sales demand patterns and multi-model horizon predictions.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRunBatch}
            disabled={isBatchRunning}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
            title="Triggers scheduled batch pipeline across all active products"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isBatchRunning ? 'animate-spin' : ''}`} />
            <span>{isBatchRunning ? 'Running Batch...' : 'Run Scheduled Batch'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isGenerating || !selectedProductId}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Calculating...' : 'Run Forecast'}</span>
          </button>
        </div>
      </div>

      {/* Notification Banners */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-500 hover:text-rose-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-emerald-500 hover:text-emerald-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Control Panel: Product & Horizon Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          {/* 1. Product Selector */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Select Inventory Product
            </label>
            <div className="relative">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={isLoadingProducts}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-10 text-xs font-medium text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Stock: {p.current_stock} units {p.has_forecast ? '✓' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* 2. Forecast Horizon */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Forecast Horizon
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {HORIZON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHorizon(opt.value)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    horizon === opt.value
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.value}d
                </button>
              ))}
            </div>
          </div>

          {/* 3. Retrain Toggle */}
          <div className="flex items-center gap-2 pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={forceRetrain}
                onChange={(e) => setForceRetrain(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Force Retrain (Bypass Cache)</span>
            </label>
          </div>
        </div>

        {/* Advanced Model Preference Dropdown */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Model Strategy:</span>
            <select
              value={modelPreference}
              onChange={(e) => setModelPreference(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-1 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {MODEL_PREFERENCES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>
                Current Stock: <strong className="text-slate-800">{selectedProduct.current_stock}</strong>
              </span>
              <span>
                Reorder Level: <strong className="text-slate-800">{selectedProduct.reorder_level}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      {forecast && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">Total Projected Demand</span>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              {(Array.isArray(forecast.predictions) ? forecast.predictions : [])
                .reduce((sum, p) => sum + (p.predicted_demand || 0), 0)
                .toFixed(1)}{' '}
              <span className="text-sm font-medium text-slate-400">units</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">Across next {forecast.forecast_horizon || 7} days</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">Selected Model</span>
              <Cpu className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-base font-bold text-slate-900 mt-2 truncate" title={forecast.model_used || 'Champion Model'}>
              {forecast.model_used || 'Champion Model'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {forecast.is_cached ? (
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                  Cached
                </span>
              ) : (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
                  Calculated
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">Validation Error (MAE)</span>
              <CheckCircle2 className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              {forecast.evaluation_metrics?.mae !== undefined
                ? Number(forecast.evaluation_metrics.mae).toFixed(2)
                : '0.00'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              RMSE: {Number(forecast.evaluation_metrics?.rmse || 0).toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">Historical Observations</span>
              <Database className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              {Array.isArray(forecast.historical_data) ? forecast.historical_data.length : 0}{' '}
              <span className="text-sm font-medium text-slate-400">periods</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {forecast.insufficient_data ? 'Limited history (< 4 periods)' : 'Sufficient history'}
            </p>
          </div>
        </div>
      )}

      {/* Main Interactive Forecast Chart */}
      <ForecastChart forecast={forecast} product={selectedProduct} />

      {/* Model Backtesting Comparison Table & Day-by-Day Forecast Schedule */}
      {forecast && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ModelComparisonCard
            modelComparison={forecast.model_comparison}
            championModel={forecast.model_used}
            evaluationMetrics={forecast.evaluation_metrics}
          />

          <ForecastScheduleTable
            predictions={forecast.predictions}
            currentStock={selectedProduct?.current_stock || 0}
            reorderLevel={selectedProduct?.reorder_level || 10}
          />
        </div>
      )}
    </div>
  );
}
