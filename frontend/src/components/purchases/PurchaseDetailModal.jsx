import React from 'react';
import { Modal } from '../common/Modal';
import { Calendar, Hash, Truck, DollarSign, CheckCircle2, Clock, XCircle } from 'lucide-react';

export function PurchaseDetailModal({ isOpen, onClose, purchase }) {
  if (!purchase) return null;

  const totalUnits = purchase.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) || 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Received (In Stock)
          </span>
        );
      case 'ordered':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" />
            Ordered (Pending)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Purchase Order Details" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Header Info Banner */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Hash className="h-3.5 w-3.5 text-slate-400" />
              PO ID
            </span>
            <span className="font-mono text-xs font-bold text-slate-800 break-all mt-0.5 block">
              {purchase.id}
            </span>
          </div>

          <div>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Truck className="h-3.5 w-3.5 text-slate-400" />
              Supplier
            </span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
              {purchase.supplier_name || 'Supplier'}
            </span>
          </div>

          <div>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Order Date
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {new Date(purchase.order_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 font-medium block mb-1">
              Status
            </span>
            <div>{getStatusBadge(purchase.status)}</div>
          </div>
        </div>

        {purchase.expected_delivery_date && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200/80 text-xs text-slate-600">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>
              Expected Delivery:{' '}
              <strong className="text-slate-800">
                {new Date(purchase.expected_delivery_date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </strong>
            </span>
          </div>
        )}

        {/* Line Items Table */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
            Procured Line Items ({purchase.items?.length || 0})
          </h4>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/90 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Product</th>
                  <th className="py-3 px-3.5">SKU</th>
                  <th className="py-3 px-3.5 text-center">Qty</th>
                  <th className="py-3 px-3.5 text-right">Unit Cost</th>
                  <th className="py-3 px-3.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {purchase.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3.5 font-semibold text-slate-900">
                      {item.product_name || 'Product'}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-xs text-slate-500">
                      {item.product_sku || '—'}
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3.5 text-right text-slate-600 font-mono">
                      ${(item.unit_cost || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900 font-mono">
                      ${(item.total_cost || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200 text-slate-800 text-sm">
                <tr>
                  <td colSpan="2" className="py-3 px-3.5">
                    Total Procurement
                  </td>
                  <td className="py-3 px-3.5 text-center text-slate-900 font-bold">
                    {totalUnits}
                  </td>
                  <td></td>
                  <td className="py-3 px-3.5 text-right text-slate-900 font-black font-mono">
                    ${(purchase.total_amount || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
