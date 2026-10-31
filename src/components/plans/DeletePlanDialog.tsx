import React from 'react';
import { AlertTriangle, Lock, X, Trash2 } from 'lucide-react';
import { SubscriptionPlan } from '../../types/plan';

interface DeletePlanDialogProps {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (planId: string) => void;
  onMarkInactive?: (planId: string) => void;
}

export const DeletePlanDialog: React.FC<DeletePlanDialogProps> = ({
  plan,
  isOpen,
  onClose,
  onConfirm,
  onMarkInactive,
}) => {
  if (!isOpen || !plan) return null;

  const isProtected = plan.linkedSubscriptionsCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5">
          {isProtected ? (
            /* PROTECTED STATE */
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Plan Deletion Blocked</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                    Protected
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  <span className="font-semibold text-slate-800">{plan.name}</span> cannot be deleted
                  because it is actively linked to{' '}
                  <span className="font-bold text-[#102B4E]">
                    {plan.linkedSubscriptionsCount} active customer subscription(s)
                  </span>
                  .
                </p>
                <div className="mt-3 p-3 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900 leading-snug">
                  Deleting this tier would orphan ongoing billing schedules. To prevent new accounts from selecting this plan while honoring existing contracts, set this plan to <strong>Inactive</strong>.
                </div>
              </div>
            </div>
          ) : (
            /* UNPROTECTED STATE */
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#EF4444] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">Delete Subscription Plan</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <span className="font-semibold text-slate-800">{plan.name}</span>?
                </p>
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600">
                  This plan tier currently has 0 active subscribers. This operation cannot be undone.
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
                  onMarkInactive(plan.id);
                  onClose();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Set Plan to Inactive
              </button>
            )
          ) : (
            <button
              onClick={() => {
                onConfirm(plan.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#EF4444] hover:bg-red-600 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
