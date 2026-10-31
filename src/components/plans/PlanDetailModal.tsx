import React from 'react';
import {
  X,
  Layers,
  Package,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit3,
  Lock,
  RotateCcw,
  PauseCircle,
  Clock,
  Sparkles,
  Users2,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { SubscriptionPlan } from '../../types/plan';

interface PlanDetailModalProps {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (plan: SubscriptionPlan) => void;
}

export const PlanDetailModal: React.FC<PlanDetailModalProps> = ({
  plan,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#102B4E] text-[#10B981] flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[#102B4E] tracking-tight">
                  {plan.name}
                </h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    plan.status === 'active'
                      ? 'bg-emerald-50 text-[#10B981] border border-emerald-200/60'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {plan.status.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                  {plan.billingFrequency} Cadence
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Created {plan.dateCreated}</span>
                <span>·</span>
                <span className="font-mono text-[11px] text-slate-400">ID: {plan.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(plan)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Metric Strip */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-white border-b border-slate-100 shrink-0">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Plan Rate
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#102B4E] tabular-nums mt-0.5">
              ${plan.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Billed per {plan.billingFrequency.toLowerCase()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Active Subscriptions
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#10B981] tabular-nums mt-0.5">
              {plan.linkedSubscriptionsCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Enrolled subscribers</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Min Commitment
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#102B4E] tabular-nums mt-0.5">
              {plan.minQuantity} unit{plan.minQuantity > 1 ? 's' : ''}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Minimum seat / item order</div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Linked Catalog Information */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <h4 className="text-[11px] font-bold text-[#102B4E] uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Linked Catalog Specification</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Linked Product
                </span>
                <span className="font-semibold text-slate-800 text-sm">{plan.productName}</span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  ID: {plan.productId}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Product Variant
                </span>
                <span className="font-semibold text-slate-800 text-sm">
                  {plan.variantName || 'Base Product Configuration'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {plan.variantId ? `Variant ID: ${plan.variantId}` : 'No variant surcharge'}
                </span>
              </div>
            </div>
          </div>

          {/* Availability Period */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="text-[11px] font-bold text-[#102B4E] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Availability Period & Validity</span>
            </h4>

            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200/70 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Activation Window
                </span>
                <span className="font-mono font-medium text-slate-800">
                  {plan.startDate} {plan.endDate ? `to ${plan.endDate}` : '(Ongoing / No Expiration)'}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  !plan.endDate || new Date(plan.endDate) >= new Date()
                    ? 'bg-emerald-50 text-[#10B981]'
                    : 'bg-red-50 text-[#EF4444]'
                }`}
              >
                {!plan.endDate || new Date(plan.endDate) >= new Date()
                  ? 'ACTIVE WINDOW'
                  : 'EXPIRED WINDOW'}
              </span>
            </div>
          </div>

          {/* Configured Subscription Settings Matrix */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-[11px] font-bold text-[#102B4E] uppercase tracking-wider">
              Configured Subscription Governance Rules
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">
                  Auto Renewal
                </span>
                {plan.settings.allowRenewal ? (
                  <span className="text-[11px] font-bold text-[#10B981] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Enabled</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 inline-flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Disabled</span>
                  </span>
                )}
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">
                  Pause Option
                </span>
                {plan.settings.allowPause ? (
                  <span className="text-[11px] font-bold text-[#10B981] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Allowed</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 inline-flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">
                  Early Close
                </span>
                {plan.settings.allowEarlyClose ? (
                  <span className="text-[11px] font-bold text-[#10B981] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Allowed</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 inline-flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Contracted</span>
                  </span>
                )}
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">
                  Auto Close
                </span>
                {plan.settings.autoClose ? (
                  <span className="text-[11px] font-bold text-[#F59E0B] inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Auto-Expire</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Manual</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {plan.description && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Description & Terms
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">{plan.description}</p>
            </div>
          )}

          {/* Subscriptions Linked Protection */}
          {plan.linkedSubscriptionsCount > 0 ? (
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70 flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#102B4E] shrink-0" />
              <div>
                <div className="font-bold text-[#102B4E]">Subscription Protection Active</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Currently utilized by{' '}
                  <span className="font-semibold text-[#102B4E]">
                    {plan.linkedSubscriptionsCount} active recurring subscriptions
                  </span>
                  . Plan deletion is locked to prevent billing orphaned contracts.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
              <div>
                <div className="font-semibold text-slate-800">No Active Subscriptions Attached</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  This plan tier currently has 0 active subscribers and can be removed or restructured safely.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            {plan.linkedSubscriptionsCount} subscribers · ${plan.price}/{plan.billingFrequency.toLowerCase()}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] rounded-lg transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
