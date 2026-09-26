import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { saleService } from '../../services/saleService';
import { Plus, Trash2, AlertCircle, ShoppingCart, Loader2 } from 'lucide-react';

export function CreateSaleModal({ isOpen, onClose, products = [], onSuccess }) {
  const [saleDate, setSaleDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { product_id: '', quantity: 1, unit_price: 0, current_stock: 0, error: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Reset or initialize state when opening
  useEffect(() => {
    if (isOpen) {
      setApiError('');
      setNotes('');
      const now = new Date();
      setSaleDate(now.toISOString().slice(0, 16));

      if (products.length > 0) {
        const first = products[0];
        setItems([
          {
            product_id: first.id,
            quantity: 1,
            unit_price: Number(first.selling_price || 0),
            current_stock: Number(first.current_stock || 0),
            error: '',
          },
        ]);
      } else {
        setItems([
          { product_id: '', quantity: 1, unit_price: 0, current_stock: 0, error: '' },
        ]);
      }
    }
  }, [isOpen, products]);

  const handleProductChange = (index, productId) => {
    const selected = products.find((p) => p.id === productId);
    const updated = [...items];
    const stock = Number(selected?.current_stock || 0);
    const price = Number(selected?.selling_price || 0);
    const qty = updated[index].quantity || 1;

    updated[index] = {
      ...updated[index],
      product_id: productId,
      unit_price: price,
      current_stock: stock,
      error: qty > stock ? `Exceeds stock: only ${stock} available` : '',
    };
    setItems(updated);
  };

  const handleQuantityChange = (index, val) => {
    const qty = parseInt(val, 10) || 0;
    const updated = [...items];
    const stock = updated[index].current_stock;

    let err = '';
    if (qty <= 0) {
      err = 'Quantity must be ≥ 1';
    } else if (qty > stock) {
      err = `Exceeds stock: only ${stock} available`;
    }

    updated[index] = {
      ...updated[index],
      quantity: qty,
      error: err,
    };
    setItems(updated);
  };

  const handlePriceChange = (index, val) => {
    const price = parseFloat(val) || 0;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      unit_price: price >= 0 ? price : 0,
    };
    setItems(updated);
  };

  const addItemRow = () => {
    // Select first unused product if available, else first product
    const usedIds = new Set(items.map((it) => it.product_id));
    const nextProd = products.find((p) => !usedIds.has(p.id)) || products[0];

    setItems([
      ...items,
      {
        product_id: nextProd ? nextProd.id : '',
        quantity: 1,
        unit_price: nextProd ? Number(nextProd.selling_price || 0) : 0,
        current_stock: nextProd ? Number(nextProd.current_stock || 0) : 0,
        error: nextProd && 1 > (nextProd.current_stock || 0) ? `Exceeds stock: only ${nextProd.current_stock} available` : '',
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Grand total calculation
  const totalAmount = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    return sum + qty * price;
  }, 0);

  const hasItemErrors = items.some((it) => !it.product_id || it.quantity <= 0 || it.quantity > it.current_stock);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (items.length === 0) {
      setApiError('Please add at least one product item.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.product_id) {
        setApiError(`Line ${i + 1}: Please select a product.`);
        return;
      }
      if (it.quantity <= 0) {
        setApiError(`Line ${i + 1}: Quantity must be at least 1.`);
        return;
      }
      if (it.quantity > it.current_stock) {
        setApiError(`Line ${i + 1}: Cannot sell ${it.quantity} units. Only ${it.current_stock} available in stock.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          unit_price: Number(it.unit_price),
        })),
        sale_date: saleDate ? new Date(saleDate).toISOString() : undefined,
        notes: notes.trim() || undefined,
      };

      await saleService.create(payload);
      if (onSuccess) onSuccess('Sale transaction recorded successfully! Inventory has been updated.');
      onClose();
    } catch (err) {
      setApiError(err.message || 'Failed to complete sale transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record New Sale" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-4 border border-rose-200 text-rose-700 text-sm animate-in fade-in duration-150">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <p className="font-semibold">Unable to complete sale</p>
              <p className="text-xs mt-0.5 text-rose-600">{apiError}</p>
            </div>
          </div>
        )}

        {/* Metadata: Date and Customer Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Sale Date & Time
            </label>
            <input
              type="datetime-local"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Customer Reference / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Retail POS #104, Walk-in, or Order Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

        {/* Line Items List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sale Items ({items.length})
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
              const lineTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);

              return (
                <div
                  key={index}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.error
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
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
                            {p.name} ({p.sku}) — Stock: {p.current_stock}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          Stock: <strong className={item.current_stock <= 0 ? 'text-rose-600' : 'text-slate-700'}>{item.current_stock}</strong>
                        </span>
                        {item.error && (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            {item.error}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={item.current_stock || undefined}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className={`w-full rounded-lg border px-2.5 py-2 text-xs font-semibold text-slate-800 text-center focus:outline-none ${
                          item.error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'
                        }`}
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => handlePriceChange(index, e.target.value)}
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

        {/* Order Summary Footer */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Grand Total Amount</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
              ${totalAmount.toFixed(2)}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-700">
              {items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)} Units
            </p>
            <p>across {items.length} product {items.length === 1 ? 'line' : 'lines'}</p>
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
            disabled={isSubmitting || hasItemErrors || totalAmount <= 0}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Sale...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Complete Sale (${totalAmount.toFixed(2)})
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
