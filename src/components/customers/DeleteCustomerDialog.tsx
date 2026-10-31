import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Customer } from '../../types/customer';

interface DeleteCustomerDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerId: string) => void;
}

export const DeleteCustomerDialog: React.FC<DeleteCustomerDialogProps> = ({
  customer,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#EF4444] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">Delete Customer Account</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-800">{customer.company}</span> ({customer.name})?
              </p>

              {customer.subscriptionCount > 0 && (
                <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200/70 text-[11px] text-amber-800">
                  <span className="font-semibold">Notice:</span> This account currently has{' '}
                  <span className="font-bold">{customer.subscriptionCount} active subscription(s)</span> and{' '}
                  <span className="font-mono font-semibold">${customer.totalRevenue.toLocaleString()}</span> in recorded revenue. Deleting this account will detach linked subscription lines.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(customer.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#EF4444] hover:bg-red-600 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Customer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
