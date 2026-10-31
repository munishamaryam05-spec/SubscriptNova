import React from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, Printer, Download, Building } from 'lucide-react';
import { InvoiceItem } from '../../types/navigation';

interface InvoiceDetailModalProps {
  invoice: InvoiceItem | null;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const subtotal = invoice.amount * 0.9;
  const tax = invoice.amount * 0.1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#102B4E] text-white flex items-center justify-center text-xs font-bold">
              SN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#102B4E] font-mono">
                  {invoice.invoiceNumber}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    invoice.status === 'paid'
                      ? 'bg-emerald-50 text-[#10B981]'
                      : invoice.status === 'past_due'
                      ? 'bg-red-50 text-[#EF4444]'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {invoice.status.toUpperCase()}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">SubscriptNova Billing Engine</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer"
            aria-label="Close invoice preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Body */}
        <div className="p-6 space-y-5 text-xs text-slate-600">
          {/* Parties Info */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Billed To
              </div>
              <div className="font-bold text-slate-800 text-sm">{invoice.customerName}</div>
              <div className="text-slate-500 font-mono text-[11px]">{invoice.customerEmail}</div>
              <div className="text-slate-400 text-[11px] mt-1">Tax ID: US-92817482-B</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Issuer
              </div>
              <div className="font-bold text-[#102B4E] text-sm">Acme Cloud Technologies</div>
              <div className="text-slate-500 text-[11px]">SubscriptNova Merchant Portal</div>
              <div className="text-slate-400 text-[11px] mt-1">Issued: {invoice.issueDate}</div>
              <div className="text-slate-400 text-[11px]">Due: {invoice.dueDate}</div>
            </div>
          </div>

          {/* Line items table */}
          <div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="py-2">Description</th>
                  <th className="py-2">Cadence</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5">
                    <div className="font-semibold text-slate-800">{invoice.planName}</div>
                    <div className="text-[11px] text-slate-400">
                      Standard SaaS recurring license subscription
                    </div>
                  </td>
                  <td className="py-2.5 font-mono">{invoice.billingCycle}</td>
                  <td className="py-2.5 text-right font-mono">1</td>
                  <td className="py-2.5 text-right font-mono font-semibold text-slate-800">
                    ${subtotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <div className="w-48 space-y-1.5 text-right font-mono text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>VAT / Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#102B4E] pt-2 border-t border-slate-200">
                <span>Total Due:</span>
                <span>${invoice.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Alert */}
          {invoice.status === 'paid' && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-[#10B981]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-medium text-[11px]">
                Paid in full via automated payment gateway on {invoice.issueDate}.
              </span>
            </div>
          )}
          {invoice.status === 'past_due' && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-[#EF4444]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="font-medium text-[11px]">
                Overdue since {invoice.dueDate}. Automated dunning retry #1 scheduled.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] rounded-lg transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
