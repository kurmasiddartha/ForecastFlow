import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { supplierService } from '../../services/supplierService';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import {
  Box,
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';

const INITIAL_PRODUCT_FORM = {
  sku: '',
  name: '',
  description: '',
  category_id: '',
  supplier_id: '',
  unit: 'pcs',
  cost_price: '',
  selling_price: '',
  current_stock: 0,
  reorder_point: 10,
  target_stock_level: 50,
  safety_stock: 10,
  is_active: true,
};

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Notifications
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(INITIAL_PRODUCT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDropdownData = async () => {
    try {
      const [cats, supps] = await Promise.all([
        categoryService.list(),
        supplierService.list(),
      ]);
      setCategories(cats);
      setSuppliers(supps);
    } catch (err) {
      console.error('Failed to load categories/suppliers:', err);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await productService.list({
        page,
        pageSize,
        search,
        categoryId: selectedCategory,
        isActive: activeFilter,
      });
      setProducts(data.items);
      setTotalPages(data.total_pages);
      setTotalItems(data.total);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategory, activeFilter]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...INITIAL_PRODUCT_FORM,
      category_id: categories[0]?.id || '',
      supplier_id: suppliers[0]?.id || '',
    });
    setError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      category_id: product.category_id,
      supplier_id: product.supplier_id || '',
      unit: product.unit || 'pcs',
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      current_stock: product.current_stock,
      reorder_point: product.reorder_point,
      target_stock_level: product.target_stock_level,
      safety_stock: product.safety_stock,
      is_active: product.is_active,
    });
    setError('');
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim() || !formData.category_id) {
      setError('Please provide SKU, Product Name, and Category.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        sku: formData.sku.trim().toUpperCase(),
        name: formData.name.trim(),
        unit: formData.unit.trim(),
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        current_stock: parseInt(formData.current_stock, 10),
        reorder_point: parseInt(formData.reorder_point, 10),
        target_stock_level: parseInt(formData.target_stock_level, 10),
        safety_stock: parseInt(formData.safety_stock, 10),
        supplier_id: formData.supplier_id || null,
        description: formData.description.trim() || null,
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
        setSuccess(`Product '${payload.name}' updated.`);
      } else {
        await productService.create(payload);
        setSuccess(`Product '${payload.name}' created.`);
      }
      setIsFormOpen(false);
      await fetchProducts();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Product save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError('');
    try {
      await productService.delete(deleteTarget.id);
      setSuccess(`Product '${deleteTarget.name}' deleted.`);
      setDeleteTarget(null);
      await fetchProducts();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not delete product.');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            Product catalog, stock levels, safety stock, and reorder thresholds.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-3 text-xs text-slate-700 focus:border-sky-500 focus:outline-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-3 text-xs text-slate-700 focus:border-sky-500 focus:outline-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <button
            onClick={fetchProducts}
            disabled={isLoading}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
            title="Refresh Products"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500">
              <tr>
                <th className="py-3.5 px-4">SKU / Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Stock on Hand</th>
                <th className="py-3.5 px-4">Pricing</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-500" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <Box className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-base font-semibold text-slate-700">No products match your criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting filters or create a new product item.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isStockCritical = product.current_stock <= product.reorder_point;
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="text-base font-semibold text-slate-900">{product.name}</div>
                        <div className="font-mono text-xs text-slate-500 mt-0.5">
                          {product.sku}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {product.category_name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-700 text-sm font-medium">
                        {product.supplier_name || '—'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-base font-bold ${
                              product.current_stock === 0
                                ? 'text-rose-600'
                                : isStockCritical
                                ? 'text-amber-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {product.current_stock} {product.unit}
                          </span>
                          {isStockCritical && (
                            <span
                              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                              title={`Low stock: Reorder point is ${product.reorder_point}`}
                            >
                              <AlertTriangle className="h-3 w-3" />
                              Reorder
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Min: {product.reorder_point} | Target: {product.target_stock_level}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-base font-semibold text-slate-900">${product.selling_price.toFixed(2)}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Cost: ${product.cost_price.toFixed(2)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                            product.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="rounded-lg p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="rounded-lg p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={totalItems}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="prodSku">
                SKU *
              </label>
              <input
                id="prodSku"
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="SKU-100"
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none uppercase font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="prodName">
                Product Name *
              </label>
              <input
                id="prodName"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Organic Dark Roast Coffee"
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="prodCategory">
                Category *
              </label>
              <select
                id="prodCategory"
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="prodSupplier">
                Supplier (Optional)
              </label>
              <select
                id="prodSupplier"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none bg-white"
              >
                <option value="">None / Direct</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.lead_time_days}d lead)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="prodUnit">
                Unit of Measure *
              </label>
              <input
                id="prodUnit"
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="pcs, kg, box"
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="costPrice">
                Cost Price ($) *
              </label>
              <input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="sellingPrice">
                Selling Price ($) *
              </label>
              <input
                id="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="currStock">
                Current Stock *
              </label>
              <input
                id="currStock"
                type="number"
                min="0"
                required
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="reorderPt">
                Reorder Point *
              </label>
              <input
                id="reorderPt"
                type="number"
                min="0"
                required
                value={formData.reorder_point}
                onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="targetStock">
                Target Stock Level
              </label>
              <input
                id="targetStock"
                type="number"
                min="0"
                value={formData.target_stock_level}
                onChange={(e) => setFormData({ ...formData, target_stock_level: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="safetyStock">
                Safety Stock Buffer
              </label>
              <input
                id="safetyStock"
                type="number"
                min="0"
                value={formData.safety_stock}
                onChange={(e) => setFormData({ ...formData, safety_stock: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4"
                />
                Catalog Item Active
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="prodDesc">
              Description (Optional)
            </label>
            <textarea
              id="prodDesc"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed product information..."
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 transition-colors"
            >
              {isSaving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Product"
        message={`Are you sure you want to delete '${deleteTarget?.name}' (${deleteTarget?.sku})? This product will be permanently removed from catalog.`}
        confirmText="Delete Product"
        isDanger={true}
      />
    </div>
  );
}
