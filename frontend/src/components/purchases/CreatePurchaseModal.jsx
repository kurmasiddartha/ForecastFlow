import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { purchaseService } from '../../services/purchaseService';
import { Plus, Trash2, AlertCircle, Truck, Loader2, PackagePlus } from 'lucide-react';

export function CreatePurchaseModal({
  isOpen,
  onClose,
  products = [],
  suppliers = [],
  onSuccess,
}) {
  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState('received');
  const [orderDate, setOrderDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [items, setItems] = useState([
    { product_id: '', quantity: 1, unit_cost: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiError('');
      const now = new Date();
      setOrderDate(now.toISOString().slice(0, 16));
      setExpectedDeliveryDate('');
      setStatus('received');

      if (suppliers.length > 0 && !supplierId) {
        setSupplierId(suppliers[0].id);
      }

      if (products.length > 0) {
        const first = products[0];
        setItems([
          {
            product_id: first.id,
            quantity: 1,
            unit_cost: Number(first.cost_price || 0),
          },
        ]);
      } else {
        setItems([{ product_id: '', quantity: 1, unit_cost: 0 }]);
      }
    }
  }, [isOpen, suppliers, products]);

  const handleProductChange = (index, productId) => {
    const selected = products.find((p) => p.id === productId);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      product_id: productId,
      unit_cost: Number(selected?.cost_price || 0),
    };
    setItems(updated);
  };

  const handleQuantityChange = (index, val) => {
    const qty = parseInt(val, 10) || 0;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      quantity: qty,
    };
    setItems(updated);
  };

  const handleCostChange = (index, val) => {
    const cost = parseFloat(val) || 0;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      unit_cost: cost >= 0 ? cost : 0,
    };
    setItems(updated);
  };

  const addItemRow = () => {
    const usedIds = new Set(items.map((it) => it.product_id));
    const nextProd = products.find((p) => !usedIds.has(p.id)) || products[0];

    setItems([
      ...items,
      {
        product_id: nextProd ? nextProd.id : '',
        quantity: 1,
        unit_cost: nextProd ? Number(nextProd.cost_price || 0) : 0,
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const cost = Number(item.unit_cost) || 0;
    return sum + qty * cost;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!supplierId) {
      setApiError('Please select a supplier.');
      return;
    }

    if (items.length === 0) {
      setApiError('Please add at least one line item.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.product_id) {
        setApiError(`Line ${i + 1}: Please select a product.`);
        return;
      }
      if (it.quantity <= 0) {
        setApiError(`Line ${i + 1}: Quantity must be greater than zero.`);
        return;
      }
      if (it.unit_cost < 0) {
        setApiError(`Line ${i + 1}: Unit cost cannot be negative.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplier_id: supplierId,
        status,
        order_date: orderDate ? new Date(orderDate).toISOString() : undefined,
        expected_delivery_date: expectedDeliveryDate
          ? new Date(expectedDeliveryDate).toISOString()
          : undefined,
        items: items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          unit_cost: Number(it.unit_cost),
        })),
      };

      await purchaseService.create(payload);
      const successNotice =
        status === 'received'
          ? 'Purchase order received and inventory stock increased!'
          : 'Purchase order placed successfully!';
      if (onSuccess) onSuccess(successNotice);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to create purchase order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Purchase Order" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-4 border border-rose-200 text-rose-700 text-sm animate-in fade-in duration-150">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <p className="font-semibold">Unable to create purchase</p>
              <p className="text-xs mt-0.5 text-rose-600">{apiError}</p>
            </div>
          </div>
        )}

        {/* Top Controls: Supplier & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Supplier <span className="text-rose-500">*</span>
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:border-sky-500 focus:outline-none"
              required
            >
              <option value="" disabled>
                Select supplier...
              </option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Fulfillment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:border-sky-500 focus:outline-none"
            >
              <option value="received">Received (Increases Inventory Now)</option>
              <option value="ordered">Ordered (Pending Delivery)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Purchase / Order Date
            </label>
            <input
              type="datetime-local"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50/50 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Line Items List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Procurement Items ({items.length})
            </label>
            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Product Line
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const selectedProd = products.find((p) => p.id === item.product_id);
              const lineTotal = (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0);

              return (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all"
                >
                  <div className="grid grid-cols-12 gap-3 items-start">
                    {/* Product Selection */}
                    <div className="col-span-12 sm:col-span-5">
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Product
                      </label>
                      <select
                        value={item.product_id}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-800 focus:border-sky-500 focus:outline-none bg-slate-50/50"
                      >
                        <option value="" disabled>
                          Select product...
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) — In Stock: {p.current_stock}
                          </option>
                        ))}
                      </select>
                      {selectedProd && (
                        <p className="mt-1 text-[11px] text-slate-400">
                          Current Stock: <strong className="text-slate-700">{selectedProd.current_stock}</strong> units
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-800 text-center focus:border-sky-500 focus:outline-none"
                      />
                    </div>

                    {/* Unit Cost */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Cost ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_cost}
                        onChange={(e) => handleCostChange(index, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-800 text-right focus:border-sky-500 focus:outline-none"
                      />
                    </div>

                    {/* Line Total */}
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Total
                      </label>
                      <div className="py-2 text-xs font-bold text-slate-900">
                        ${lineTotal.toFixed(2)}
                      </div>
                    </div>

                    {/* Remove Action */}
                    <div className="col-span-1 text-center pt-6">
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        disabled={items.length <= 1}
                        title="Remove Line"
                        className={`rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ${
                          items.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Grand Total Procurement Cost</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
              ${totalAmount.toFixed(2)}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-700">
              {items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)} Units to Procure
            </p>
            <p className="text-sky-600 font-medium">
              {status === 'received' ? '✓ Will increment inventory immediately' : '⏳ Pending delivery'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || totalAmount <= 0}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting Purchase...
              </>
            ) : (
              <>
                <PackagePlus className="h-4 w-4" />
                Submit Order (${totalAmount.toFixed(2)})
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
