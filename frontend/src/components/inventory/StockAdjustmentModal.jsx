import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { inventoryService } from '../../services/inventoryService';
import { AlertCircle, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

const MOVEMENT_TYPES = [
  { value: 'PURCHASE', label: 'PURCHASE (Restock / Supplier Delivery)', defaultAction: 'ADD' },
  { value: 'SALE', label: 'SALE (Order Fulfillment / Walk-in)', defaultAction: 'DEDUCT' },
  { value: 'ADJUSTMENT', label: 'ADJUSTMENT (Cycle Count / Correction)', defaultAction: 'SET' },
  { value: 'RETURN', label: 'RETURN (Restocked Customer Return)', defaultAction: 'ADD' },
  { value: 'DAMAGE', label: 'DAMAGE (Expired / Damaged Write-off)', defaultAction: 'DEDUCT' },
];

export function StockAdjustmentModal({
  isOpen,
  onClose,
  products = [],
  initialProduct = null,
  onSuccess,
}) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState('PURCHASE');
  const [action, setAction] = useState('ADD');
  const [quantity, setQuantity] = useState(1);
  const [referenceId, setReferenceId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialProduct) {
      setSelectedProductId(initialProduct.id);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [initialProduct, products]);

  const activeProduct = products.find((p) => p.id === selectedProductId) || initialProduct;
  const currentStock = activeProduct ? activeProduct.current_stock : 0;

  // Compute preview new stock
  const numQty = parseInt(quantity, 10) || 0;
  let previewStock = currentStock;
  let isInsufficient = false;

  if (action === 'ADD') {
    previewStock = currentStock + numQty;
  } else if (action === 'DEDUCT') {
    previewStock = currentStock - numQty;
    if (previewStock < 0) isInsufficient = true;
  } else if (action === 'SET') {
    previewStock = numQty;
  }

  const handleMovementTypeChange = (typeVal) => {
    setMovementType(typeVal);
    const found = MOVEMENT_TYPES.find((m) => m.value === typeVal);
    if (found) {
      setAction(found.defaultAction);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedProductId) {
      setError('Please select a product.');
      return;
    }

    if (numQty <= 0 && action !== 'SET') {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (isInsufficient) {
      setError(`Insufficient stock: Cannot deduct ${numQty} units. Only ${currentStock} available.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await inventoryService.adjustStock({
        product_id: selectedProductId,
        movement_type: movementType,
        action,
        quantity: numQty,
        reference_id: referenceId.trim() || null,
        notes: notes.trim() || null,
      });

      onSuccess();
      onClose();
      // Reset form
      setQuantity(1);
      setReferenceId('');
      setNotes('');
    } catch (err) {
      setError(err.message || 'Stock adjustment failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Stock Movement" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Product Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="prodSelect">
            Product Item *
          </label>
          <select
            id="prodSelect"
            required
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            disabled={!!initialProduct}
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none bg-white disabled:bg-slate-50 disabled:text-slate-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.name} ({p.current_stock} {p.unit} in stock)
              </option>
            ))}
          </select>
        </div>

        {/* Movement Type & Action Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="movementType">
              Movement Reason *
            </label>
            <select
              id="movementType"
              value={movementType}
              onChange={(e) => handleMovementTypeChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none bg-white font-medium"
            >
              {MOVEMENT_TYPES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="actionType">
              Stock Operation *
            </label>
            <select
              id="actionType"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none bg-white font-semibold"
            >
              <option value="ADD">ADD (+ Increase)</option>
              <option value="DEDUCT">DEDUCT (- Decrease)</option>
              <option value="SET">SET (= Absolute Count)</option>
            </select>
          </div>
        </div>

        {/* Quantity & Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="stockQty">
              {action === 'SET' ? 'Target Stock Count *' : 'Quantity Units *'}
            </label>
            <input
              id="stockQty"
              type="number"
              min={action === 'SET' ? '0' : '1'}
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="refId">
              External Reference ID
            </label>
            <input
              id="refId"
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. PO-8921, INV-1044"
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Reason / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="movementNotes">
            Audit Reason / Notes
          </label>
          <textarea
            id="movementNotes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Audit notes or transaction description..."
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-sky-500 focus:outline-none"
          />
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Stock Balance Audit Preview
          </div>
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Current on hand: </span>
              <span className="font-bold text-slate-800">{currentStock}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <div>
              <span className="text-slate-500">Adjustment: </span>
              <span
                className={`font-bold ${
                  action === 'ADD'
                    ? 'text-emerald-600'
                    : action === 'DEDUCT'
                    ? 'text-rose-600'
                    : 'text-sky-600'
                }`}
              >
                {action === 'ADD' ? `+${numQty}` : action === 'DEDUCT' ? `-${numQty}` : `=${numQty}`}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <div>
              <span className="text-slate-500">New Balance: </span>
              <span className={`font-bold ${isInsufficient ? 'text-rose-600' : 'text-slate-900'}`}>
                {previewStock} {activeProduct?.unit || 'units'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isInsufficient}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 transition-colors"
          >
            {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            Confirm Stock Movement
          </button>
        </div>
      </form>
    </Modal>
  );
}
