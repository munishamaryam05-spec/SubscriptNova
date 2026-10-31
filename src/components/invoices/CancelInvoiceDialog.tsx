import React from 'react';
import { AlertTriangle, X, Ban } from 'lucide-react';
import { Invoice } from '../../types/invoice';

interface CancelInvoiceDialogProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onConfirmCancel: (invoiceId: string) => void;
}

export const CancelInvoiceDialog: React.FC<CancelInvoiceDialogProps> = ({
  isOpen,
  invoice,
  onClose,
  onConfirmCancel,
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cancel Invoice</h3>
              <p className="text-[11px] text-slate-500 font-mono">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs text-slate-600">
          <p>
            Are you sure you want to cancel invoice{' '}
            <strong className="text-slate-900 font-mono">{invoice.invoiceNumber}</strong> issued to{' '}
            <strong className="text-slate-900">{invoice.customerName}</strong> for $
            {invoice.totalAmount.toFixed(2)}?
          </p>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Status:</span>
              <span className="uppercase font-semibold text-slate-700">{invoice.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Outstanding Balance:</span>
              <span className="font-semibold text-slate-900">${invoice.balance.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-slate-500 text-[11px]">
            Cancelling will mark this invoice as cancelled, remove it from active receivables, and
            prevent collection.
          </p>
        </div>

        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Keep Invoice
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmCancel(invoice.id);
              onClose();
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Cancel Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
