import React from 'react';
import { AlertTriangle, Lock, X, Trash2, ShieldAlert } from 'lucide-react';
import { Product } from '../../types/product';

interface DeleteProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productId: string) => void;
  onMarkInactive?: (productId: string) => void;
}

export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
  onMarkInactive,
}) => {
  if (!isOpen || !product) return null;

  const isProtected = product.linkedSubscriptionsCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5">
          {isProtected ? (
            /* BLOCKED / PROTECTED DELETION STATE */
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Deletion Blocked</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                    Protected
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  <span className="font-semibold text-slate-800">{product.name}</span> cannot be
                  deleted because it is actively linked to{' '}
                  <span className="font-bold text-[#04222B]">
                    {product.linkedSubscriptionsCount} active customer subscription(s)
                  </span>
                  .
                </p>
                <div className="mt-3 p-3 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900 leading-snug">
                  Deleting active catalog items would corrupt invoice reconciliation and renewal
                  cadences. We recommend switching its status to <strong>Inactive</strong> to
                  prevent new signups while preserving active subscriptions.
                </div>
              </div>
            </div>
          ) : (
            /* PERMITTED DELETION STATE */
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#EF4444] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">Delete Product from Catalog</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <span className="font-semibold text-slate-800">{product.name}</span>?
                </p>
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600">
                  This product has <span className="font-bold">{product.variants.length} variant(s)</span> and 0 active subscriptions. This action cannot be undone.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            {isProtected ? 'Close' : 'Cancel'}
          </button>

          {isProtected ? (
            onMarkInactive && (
              <button
                onClick={() => {
                  onMarkInactive(product.id);
                  onClose();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Set Product to Inactive
              </button>
            )
          ) : (
            <button
              onClick={() => {
                onConfirm(product.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#EF4444] hover:bg-red-600 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Product</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
