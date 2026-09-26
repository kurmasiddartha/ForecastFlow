import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { StockAdjustmentModal } from '../../components/inventory/StockAdjustmentModal';
import { Pagination } from '../../components/common/Pagination';
import {
  Boxes,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  History,
  Search,
  RefreshCw,
  PlusCircle,
  SlidersHorizontal,
  DollarSign,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'history'

  // Summary Metrics
  const [summary, setSummary] = useState(null);

  // Products Stock State
  const [products, setProducts] = useState([]);
  const [allProductsList, setAllProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [stockSearch, setStockSearch] = useState('');
  const [stockCategory, setStockCategory] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [stockPage, setStockPage] = useState(1);
  const [stockTotalPages, setStockTotalPages] = useState(1);
  const [stockTotalItems, setStockTotalItems] = useState(0);

  // Movement History State
  const [movements, setMovements] = useState([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);
  const [movementTypeFilter, setMovementTypeFilter] = useState('');
  const [movementPage, setMovementPage] = useState(1);
  const [movementTotalPages, setMovementTotalPages] = useState(1);
  const [movementTotalItems, setMovementTotalItems] = useState(0);

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetProduct, setAdjustTargetProduct] = useState(null);

  // Notification banners
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSummary = async () => {
    try {
      const data = await inventoryService.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load inventory summary:', err);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [cats, prods] = await Promise.all([
        categoryService.list(),
        productService.list({ page: 1, pageSize: 500 }),
      ]);
      setCategories(cats);
      setAllProductsList(prods.items);
    } catch (err) {
      console.error('Failed to load dropdown options:', err);
    }
  };

  const fetchStockLevels = async () => {
    setIsLoadingStock(true);
    try {
      const data = await productService.list({
        page: stockPage,
        pageSize: 15,
        search: stockSearch,
        categoryId: stockCategory,
      });
      
      let items = data.items;
      if (onlyLowStock) {
        items = items.filter((p) => p.current_stock <= p.reorder_point);
      }
      setProducts(items);
      setStockTotalPages(data.total_pages);
      setStockTotalItems(data.total);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load stock levels');
    } finally {
      setIsLoadingStock(false);
    }
  };

  const fetchMovements = async () => {
    setIsLoadingMovements(true);
    try {
      const data = await inventoryService.listMovements({
        page: movementPage,
        pageSize: 15,
        movementType: movementTypeFilter,
      });
      setMovements(data.items);
      setMovementTotalPages(data.total_pages);
      setMovementTotalItems(data.total);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load movement history');
    } finally {
      setIsLoadingMovements(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchStockLevels();
    } else {
      fetchMovements();
    }
  }, [activeTab, stockPage, stockSearch, stockCategory, onlyLowStock, movementPage, movementTypeFilter]);

  const handleOpenQuickAdjust = (product) => {
    setAdjustTargetProduct(product);
    setIsAdjustModalOpen(true);
  };

  const handleOpenGlobalAdjust = () => {
    setAdjustTargetProduct(null);
    setIsAdjustModalOpen(true);
  };

  const handleAdjustmentSuccess = () => {
    setSuccessMessage('Stock movement successfully recorded and inventory updated.');
    fetchSummary();
    fetchStockLevels();
    if (activeTab === 'history') {
      fetchMovements();
    }
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock monitoring, auditable movement logs, and reorder threshold alerts.
          </p>
        </div>
        <button
          onClick={handleOpenGlobalAdjust}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Record Movement</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Executive KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Units</span>
            <Boxes className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {summary ? summary.total_units.toLocaleString() : '—'}
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate">
            Across {summary ? summary.total_products : '—'} catalog products
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Low Stock Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {summary ? summary.low_stock_count : '—'}
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate">
            At or below reorder threshold
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Out of Stock</span>
            <AlertCircle className={`h-4 w-4 ${summary?.out_of_stock_count > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className={`mt-2 text-2xl font-bold tracking-tight ${summary?.out_of_stock_count > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {summary ? summary.out_of_stock_count : '—'}
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate">
            Zero physical stock on hand
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Inventory Valuation</span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            ${summary ? summary.inventory_value_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate">
            Retail: ${summary ? summary.inventory_value_retail.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors ${
            activeTab === 'stock'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PackageCheck className="h-4 w-4" />
          Current Stock Levels
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors ${
            activeTab === 'history'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="h-4 w-4" />
          Movement Audit Ledger
        </button>
      </div>

      {/* Tab 1: Current Stock Levels */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Filters Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search stock by SKU or name..."
                value={stockSearch}
                onChange={(e) => {
                  setStockSearch(e.target.value);
                  setStockPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={stockCategory}
                onChange={(e) => {
                  setStockCategory(e.target.value);
                  setStockPage(1);
                }}
                className="rounded-lg border border-slate-200 py-1.5 px-3 text-xs text-slate-700 focus:border-sky-500 focus:outline-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyLowStock}
                  onChange={(e) => setOnlyLowStock(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                Low Stock Only
              </label>

              <button
                onClick={fetchStockLevels}
                disabled={isLoadingStock}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
                title="Refresh Stock"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingStock ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stock Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[720px]">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4">SKU / Item</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Stock on Hand</th>
                    <th className="py-3.5 px-4">Reorder Level</th>
                    <th className="py-3.5 px-4">Target Stock</th>
                    <th className="py-3.5 px-4">Stock Health</th>
                    <th className="py-3.5 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingStock ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-500" />
                        Auditing stock levels...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-500">
                        <Boxes className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-base font-semibold text-slate-700">No inventory records found</p>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const isZero = p.current_stock === 0;
                      const isLow = p.current_stock <= p.reorder_point;
                      const percentOfTarget = Math.min(
                        100,
                        Math.round((p.current_stock / (p.target_stock_level || 50)) * 100)
                      );

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-4">
                            <div className="text-base font-semibold text-slate-900">{p.name}</div>
                            <div className="font-mono text-xs text-slate-500 mt-0.5">{p.sku}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {p.category_name || 'Unassigned'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`text-base font-bold ${
                                isZero ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                              }`}
                            >
                              {p.current_stock} {p.unit}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-700 text-sm font-medium">
                            {p.reorder_point} {p.unit}
                          </td>
                          <td className="py-4 px-4 text-slate-700 text-sm">
                            <div className="font-medium">{p.target_stock_level} {p.unit}</div>
                            <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isZero ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${percentOfTarget}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {isZero ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Reorder Point
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Optimal
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleOpenQuickAdjust(p)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
                            >
                              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                              <span>Adjust</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={stockPage}
              totalPages={stockTotalPages}
              total={stockTotalItems}
              pageSize={15}
              onPageChange={(p) => setStockPage(p)}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Movement Audit Ledger */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Movement Type Filter Toolbar */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Filter Reason:</span>
              <select
                value={movementTypeFilter}
                onChange={(e) => {
                  setMovementTypeFilter(e.target.value);
                  setMovementPage(1);
                }}
                className="rounded-lg border border-slate-200 py-1.5 px-3 text-xs text-slate-700 focus:border-sky-500 focus:outline-none bg-white font-medium"
              >
                <option value="">All Movement Types</option>
                <option value="PURCHASE">PURCHASE (Restock)</option>
                <option value="SALE">SALE (Orders)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (Audits)</option>
                <option value="RETURN">RETURN (Customer Return)</option>
                <option value="DAMAGE">DAMAGE (Write-off)</option>
              </select>
            </div>

            <button
              onClick={fetchMovements}
              disabled={isLoadingMovements}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
              title="Refresh History"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingMovements ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Audit Ledger Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[740px]">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4">Date / Time</th>
                    <th className="py-3.5 px-4">Product SKU & Name</th>
                    <th className="py-3.5 px-4">Movement Reason</th>
                    <th className="py-3.5 px-4 text-center">Quantity Delta</th>
                    <th className="py-3.5 px-4">Stock Evolution</th>
                    <th className="py-3.5 px-4">Reference ID</th>
                    <th className="py-3.5 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingMovements ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-500" />
                        Loading movement history...
                      </td>
                    </tr>
                  ) : movements.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-500">
                        <History className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-base font-semibold text-slate-700">No stock movements recorded yet</p>
                        <p className="text-xs text-slate-400 mt-1">Stock changes will produce traceable records here.</p>
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => {
                      const isPositive = m.quantity > 0;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-4 text-slate-600 font-mono text-xs whitespace-nowrap">
                            {new Date(m.created_at).toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-base font-semibold text-slate-900">{m.product_name || 'Item'}</div>
                            <span className="font-mono text-xs text-slate-500 mt-0.5 block">
                              {m.product_sku || '—'}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {m.movement_type}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-base font-bold ${
                                isPositive ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight className="h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4" />
                              )}
                              {isPositive ? `+${m.quantity}` : m.quantity}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-sm text-slate-700 whitespace-nowrap">
                            {m.previous_stock} → <span className="font-bold text-slate-900">{m.new_stock}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-mono text-xs whitespace-nowrap">
                            {m.reference_id || '—'}
                          </td>
                          <td className="py-4 px-4 text-slate-600 max-w-xs truncate text-sm">
                            {m.notes || <span className="text-slate-300 italic">—</span>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={movementPage}
              totalPages={movementTotalPages}
              total={movementTotalItems}
              pageSize={15}
              onPageChange={(p) => setMovementPage(p)}
            />
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        products={allProductsList}
        initialProduct={adjustTargetProduct}
        onSuccess={handleAdjustmentSuccess}
      />
    </div>
  );
}
