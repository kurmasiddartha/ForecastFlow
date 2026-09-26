import React, { useState, useEffect } from 'react';
import { purchaseService } from '../../services/purchaseService';
import { productService } from '../../services/productService';
import { supplierService } from '../../services/supplierService';
import { CreatePurchaseModal } from '../../components/purchases/CreatePurchaseModal';
import { PurchaseDetailModal } from '../../components/purchases/PurchaseDetailModal';
import { Pagination } from '../../components/common/Pagination';
import {
  Truck,
  DollarSign,
  Package,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  PackagePlus,
  ArrowDownRight,
} from 'lucide-react';

export function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPurchasesCount, setTotalPurchasesCount] = useState(0);

  // Filters
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPurchaseDetail, setSelectedPurchaseDetail] = useState(null);

  // Notifications
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchDropdowns = async () => {
    try {
      const [prodsData, suppsData] = await Promise.all([
        productService.list({ page: 1, pageSize: 500 }),
        supplierService.list(),
      ]);
      setProductsList(prodsData.items || []);
      setSuppliersList(suppsData || []);
    } catch (err) {
      console.error('Failed to load products/suppliers:', err);
    }
  };

  const fetchPurchases = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await purchaseService.list({
        page,
        pageSize: 15,
        supplierId: selectedSupplierId,
        status: selectedStatus,
      });
      setPurchases(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalPurchasesCount(data.total || 0);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load purchase orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [page, selectedSupplierId, selectedStatus]);

  const handlePurchaseSuccess = (msg) => {
    setSuccessMessage(msg);
    fetchPurchases();
    fetchDropdowns(); // refresh stock numbers
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const filteredPurchases = purchases.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const idMatch = p.id.toLowerCase().includes(term);
    const suppMatch = p.supplier_name && p.supplier_name.toLowerCase().includes(term);
    const itemMatch = p.items?.some(
      (it) =>
        it.product_name?.toLowerCase().includes(term) ||
        it.product_sku?.toLowerCase().includes(term)
    );
    return idMatch || suppMatch || itemMatch;
  });

  const currentTotalSpend = purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const currentTotalUnits = purchases.reduce(
    (sum, p) => sum + (p.items?.reduce((isum, it) => isum + (it.quantity || 0), 0) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Purchases
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supplier purchase orders, inbound quantities, and inventory replenishment records.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors shrink-0"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Create Purchase Order</span>
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
            <span className="text-xs font-medium text-slate-500">Total Spend</span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            ${currentTotalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-500 truncate">Current page view</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Purchase Orders</span>
            <PackagePlus className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {totalPurchasesCount}
          </p>
          <p className="mt-1 text-xs text-slate-500 truncate">Total recorded orders</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Units Procured</span>
            <ArrowDownRight className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {currentTotalUnits.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 truncate">Items received / ordered</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Suppliers</span>
            <Truck className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {suppliersList.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 truncate">Partner vendors active</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search PO ID, supplier, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedSupplierId}
              onChange={(e) => {
                setSelectedSupplierId(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-slate-50/50 focus:border-sky-500 focus:outline-none"
            >
              <option value="">All Suppliers</option>
              {suppliersList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-slate-50/50 focus:border-sky-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="received">Received</option>
              <option value="ordered">Ordered</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSupplierId('');
              setSelectedStatus('');
              setPage(1);
              fetchPurchases();
            }}
            title="Reset Filters & Refresh"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Purchases History Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[760px]">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold text-xs">
              <tr>
                <th className="py-3.5 px-4">PO ID</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Order Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4 text-center">Total Units</th>
                <th className="py-3.5 px-4 text-right">Total Cost</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-5 w-5 animate-spin text-slate-500 mb-2" />
                    Loading purchase orders...
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <Truck className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-base font-semibold text-slate-700">No purchase orders found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm || selectedSupplierId || selectedStatus
                        ? 'Try clearing your filters to see more results.'
                        : 'Create your first purchase order to replenish stock.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => {
                  const purchaseUnits = purchase.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) || 0;
                  const itemSummary =
                    purchase.items && purchase.items.length > 0
                      ? purchase.items
                          .map((it) => `${it.product_name || 'Product'} (${it.quantity})`)
                          .join(', ')
                      : 'No items';

                  return (
                    <tr key={purchase.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 text-sm">
                        {purchase.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 text-base">
                        {purchase.supplier_name || 'Supplier'}
                      </td>
                      <td className="py-4 px-4 text-slate-600 whitespace-nowrap text-sm">
                        {new Date(purchase.order_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {purchase.status === 'received' ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Received
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                            <Clock className="h-3.5 w-3.5" />
                            Ordered
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 max-w-xs truncate text-slate-700 text-sm" title={itemSummary}>
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Package className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate">{itemSummary}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-900 text-base">
                        {purchaseUnits}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-900 text-base">
                        ${(purchase.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPurchaseDetail(purchase)}
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
      <CreatePurchaseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        products={productsList}
        suppliers={suppliersList}
        onSuccess={handlePurchaseSuccess}
      />

      <PurchaseDetailModal
        isOpen={Boolean(selectedPurchaseDetail)}
        onClose={() => setSelectedPurchaseDetail(null)}
        purchase={selectedPurchaseDetail}
      />
    </div>
  );
}
