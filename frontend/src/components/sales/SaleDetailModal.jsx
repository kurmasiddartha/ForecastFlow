import React from 'react';
import { Modal } from '../common/Modal';
import { Calendar, Hash, FileText, DollarSign, Package } from 'lucide-react';

export function SaleDetailModal({ isOpen, onClose, sale }) {
  if (!sale) return null;

  const totalUnits = sale.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sale Transaction Details" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Header Info Banner */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Hash className="h-3.5 w-3.5 text-slate-400" />
              Sale ID
            </span>
            <span className="font-mono text-xs font-bold text-slate-800 break-all mt-0.5 block">
              {sale.id}
            </span>
          </div>

          <div>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Sale Date
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {new Date(sale.sale_date).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              Total Amount
            </span>
            <span className="text-base font-black text-emerald-600 mt-0.5 block">
              ${(sale.total_amount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {sale.notes && (
          <div className="flex items-start gap-2 rounded-xl bg-sky-50/60 p-3.5 border border-sky-100 text-xs text-sky-900">
            <FileText className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
            <div>
              <p className="font-semibold text-sky-800">Notes & Reference</p>
              <p className="mt-0.5 text-sky-700">{sale.notes}</p>
            </div>
          </div>
        )}

        {/* Line Items Table */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
            Items Breakdown ({sale.items?.length || 0})
          </h4>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/90 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Product</th>
                  <th className="py-3 px-3.5">SKU</th>
                  <th className="py-3 px-3.5 text-center">Qty</th>
                  <th className="py-3 px-3.5 text-right">Unit Price</th>
                  <th className="py-3 px-3.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {sale.items?.map((item, idx) => (
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
                      ${(item.unit_price || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900 font-mono">
                      ${(item.total_price || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200 text-slate-800 text-sm">
                <tr>
                  <td colSpan="2" className="py-3 px-3.5">
                    Total
                  </td>
                  <td className="py-3 px-3.5 text-center text-slate-900 font-bold">
                    {totalUnits}
                  </td>
                  <td></td>
                  <td className="py-3 px-3.5 text-right text-emerald-600 font-black font-mono">
                    ${(sale.total_amount || 0).toFixed(2)}
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
