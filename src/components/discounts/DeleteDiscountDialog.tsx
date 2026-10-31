import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { DiscountCode } from '../../types/discount';

interface DeleteDiscountDialogProps {
  discount: DiscountCode | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (discountId: string) => void;
}

export const DeleteDiscountDialog: React.FC<DeleteDiscountDialogProps> = ({
  discount,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !discount) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04222B]/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-red-50 p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Delete Discount Code</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-sm">
            Are you sure you want to permanently delete{' '}
            <span className="font-mono font-bold text-slate-900">{discount.code}</span>? Existing
            invoices with this code applied will keep their historical totals.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(discount.id);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
          >
            Delete Discount
          </button>
        </div>
      </div>
    </div>
  );
};
