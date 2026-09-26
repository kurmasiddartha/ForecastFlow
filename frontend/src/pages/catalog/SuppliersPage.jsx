import React, { useState, useEffect } from 'react';
import { supplierService } from '../../services/supplierService';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Truck,
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
} from 'lucide-react';

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    lead_time_days: 7,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await supplierService.list();
      setSuppliers(data);
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      lead_time_days: 7,
    });
    setError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_name: supplier.contact_name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      lead_time_days: supplier.lead_time_days || 7,
    });
    setError('');
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        lead_time_days: Number(formData.lead_time_days),
        email: formData.email.trim() || null,
        contact_name: formData.contact_name.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
      };

      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, payload);
        setSuccess(`Supplier '${formData.name}' updated.`);
      } else {
        await supplierService.create(payload);
        setSuccess(`Supplier '${formData.name}' created.`);
      }
      setIsFormOpen(false);
      await fetchSuppliers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError('');
    try {
      await supplierService.delete(deleteTarget.id);
      setSuccess(`Supplier '${deleteTarget.name}' deleted.`);
      setDeleteTarget(null);
      await fetchSuppliers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not delete supplier.');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contact_name && s.contact_name.toLowerCase().includes(search.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-500 mt-1">
            Vendor profiles, contact details, and fulfillment lead times for restock planning.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Supplier</span>
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

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
          />
        </div>
        <button
          onClick={fetchSuppliers}
          disabled={isLoading}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Lead Time</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-500" />
                    Loading suppliers...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    <Truck className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-base font-semibold text-slate-700">No suppliers found</p>
                    <p className="text-xs text-slate-400 mt-1">Add your suppliers to calculate replenishment lead times.</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900 text-base">{supplier.name}</td>
                    <td className="py-4 px-4 text-slate-700">
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm text-slate-900">{supplier.contact_name || '—'}</div>
                        {supplier.email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{supplier.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>{supplier.lead_time_days} days</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-sm max-w-xs truncate">
                      {supplier.address || '—'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(supplier)}
                          className="rounded-lg p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(supplier)}
                          className="rounded-lg p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="suppName">
              Supplier Name *
            </label>
            <input
              id="suppName"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Apex Wholesale Logistics"
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="suppContact">
                Contact Person
              </label>
              <input
                id="suppContact"
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="Sarah Chen"
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="suppLead">
                Lead Time (Days) *
              </label>
              <input
                id="suppLead"
                type="number"
                min="0"
                required
                value={formData.lead_time_days}
                onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="suppEmail">
                Email Address
              </label>
              <input
                id="suppEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sales@apex.com"
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="suppPhone">
                Phone Number
              </label>
              <input
                id="suppPhone"
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-0100"
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="suppAddress">
              Address
            </label>
            <input
              id="suppAddress"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Warehouse Blvd, Suite 400"
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
              {editingSupplier ? 'Save Changes' : 'Create Supplier'}
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
        title="Delete Supplier"
        message={`Are you sure you want to delete '${deleteTarget?.name}'? This cannot be deleted if products depend on this supplier.`}
        confirmText="Delete Supplier"
        isDanger={true}
      />
    </div>
  );
}
