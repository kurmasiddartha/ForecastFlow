import React, { useState, useEffect } from 'react';
import { saleService } from '../../services/saleService';
import { productService } from '../../services/productService';
import { CreateSaleModal } from '../../components/sales/CreateSaleModal';
import { SaleDetailModal } from '../../components/sales/SaleDetailModal';
import { Pagination } from '../../components/common/Pagination';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';

export function SalesPage() {
  const [sales, setSales] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSalesCount, setTotalSalesCount] = useState(0);

  // Filters
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSaleDetail, setSelectedSaleDetail] = useState(null);

  // Notifications
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProducts = async () => {
    try {
      const data = await productService.list({ page: 1, pageSize: 500 });
      setProductsList(data.items || []);
    } catch (err) {
      console.error('Failed to load products for sales modal:', err);
    }
  };

  const fetchSales = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await saleService.list({
        page,
        pageSize: 15,
        productId: selectedProductId,
      });
      setSales(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalSalesCount(data.total || 0);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load sales history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [page, selectedProductId]);

  const handleSaleSuccess = (msg) => {
    setSuccessMessage(msg);
    fetchSales();
    fetchProducts(); // refresh products stock count
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Client-side search for notes / reference / item names
  const filteredSales = sales.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const idMatch = s.id.toLowerCase().includes(term);
    const notesMatch = s.notes && s.notes.toLowerCase().includes(term);
    const itemMatch = s.items?.some(
      (it) =>
        it.product_name?.toLowerCase().includes(term) ||
        it.product_sku?.toLowerCase().includes(term)
    );
    return idMatch || notesMatch || itemMatch;
  });

  // Calculate summary metrics from current sales view
  const currentTotalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const currentTotalUnits = sales.reduce(
    (sum, s) => sum + (s.items?.reduce((isum, it) => isum + (it.quantity || 0), 0) || 0),
    0
  );
  const avgOrderValue = sales.length > 0 ? currentTotalRevenue / sales.length : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sales Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Customer sales orders, fulfillment tracking, and historical revenue ledger.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors shrink-0"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 border border-rose-200 text-rose-800 text-xs font-medium">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            ${currentTotalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-500 truncate">Current page view</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Transactions</span>
            <ShoppingCart className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {totalSalesCount}
          </p>
          <p className="mt-1 text-xs text-slate-500 truncate">Total recorded sales orders</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Units Sold</span>
            <Package className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {currentTotalUnits.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 truncate">Products sold on current page</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Avg Order Value</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            ${avgOrderValue.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-slate-500 truncate">Per sales order average</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, notes, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-60">
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-slate-50/50 focus:border-sky-500 focus:outline-none"
            >
              <option value="">All Products</option>
              {productsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedProductId('');
              setPage(1);
              fetchSales();
            }}
            title="Reset Filters & Refresh"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Sales History Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold text-xs">
              <tr>
                <th className="py-3.5 px-4">Sale ID</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4 text-center">Total Units</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4">Notes / Reference</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-5 w-5 animate-spin text-slate-500 mb-2" />
                    Loading sales records...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <ShoppingCart className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-base font-semibold text-slate-700">No sales transactions found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm || selectedProductId
                        ? 'Try clearing your filters to see more results.'
                        : 'Record your first sale to start tracking orders and inventory movements.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const saleUnits = sale.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) || 0;
                  const itemSummary =
                    sale.items && sale.items.length > 0
                      ? sale.items
                          .map((it) => `${it.product_name || 'Product'} (${it.quantity})`)
                          .join(', ')
                      : 'No items';

                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 text-sm">
                        {sale.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 text-slate-700 whitespace-nowrap text-sm">
                        {new Date(sale.sale_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        <span className="text-xs text-slate-400 ml-1">
                          {new Date(sale.sale_date).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-4 max-w-xs truncate text-slate-700 text-sm" title={itemSummary}>
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Package className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate">{itemSummary}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-900 text-base">
                        {saleUnits}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-900 text-base">
                        ${(sale.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-slate-600 max-w-xs truncate text-sm">
                        {sale.notes || <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSaleDetail(sale)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-100 p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateSaleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        products={productsList}
        onSuccess={handleSaleSuccess}
      />

      <SaleDetailModal
        isOpen={Boolean(selectedSaleDetail)}
        onClose={() => setSelectedSaleDetail(null)}
        sale={selectedSaleDetail}
      />
    </div>
  );
}
