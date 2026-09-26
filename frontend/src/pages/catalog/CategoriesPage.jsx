import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  FolderPlus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setError('');
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    setError('');
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        setSuccess(`Category '${formData.name}' updated successfully.`);
      } else {
        await categoryService.create(formData);
        setSuccess(`Category '${formData.name}' created successfully.`);
      }
      setIsFormOpen(false);
      await fetchCategories();
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
      await categoryService.delete(deleteTarget.id);
      setSuccess(`Category '${deleteTarget.name}' deleted.`);
      setDeleteTarget(null);
      await fetchCategories();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not delete category.');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Category Management</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Organize products into hierarchical departments and product categories.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors"
        >
          <FolderPlus className="h-4 w-4" />
          Add Category
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
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
          />
        </div>
        <button
          onClick={fetchCategories}
          disabled={isLoading}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[550px]">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-sky-600" />
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-slate-500">
                    <Layers className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">No categories found</p>
                    <p className="text-slate-400 mt-1">Get started by creating your first product category.</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-semibold text-base text-slate-900">{category.name}</td>
                    <td className="py-4 px-4 text-slate-600 max-w-md truncate text-sm">
                      {category.description || '—'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(category)}
                          className="rounded-lg p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(category)}
                          className="rounded-lg p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="catName">
              Category Name *
            </label>
            <input
              id="catName"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Beverages, Electronics, Apparel"
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="catDesc">
              Description (Optional)
            </label>
            <textarea
              id="catDesc"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what items belong in this category..."
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
              {editingCategory ? 'Save Changes' : 'Create Category'}
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
        title="Delete Category"
        message={`Are you sure you want to delete '${deleteTarget?.name}'? This action cannot be undone if products are assigned to this category.`}
        confirmText="Delete Category"
        isDanger={true}
      />
    </div>
  );
}
