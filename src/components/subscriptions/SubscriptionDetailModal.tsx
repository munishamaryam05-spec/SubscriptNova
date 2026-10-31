import React from 'react';
import {
  X,
  Repeat,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  Building,
  Mail,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileText,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Edit3,
} from 'lucide-react';
import {
  SubscriptionLifecycleStatus,
  SubscriptionRecord,
} from '../../types/subscription';
import { SubscriptionPlan } from '../../types/plan';
import { INITIAL_PLANS } from '../../data/mockPlans';
import { calculateNextBillingDate, calculateMRRFromSubscription } from '../../utils/dateCalculations';

interface SubscriptionDetailModalProps {
  subscription: SubscriptionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    subscriptionId: string,
    newStatus: SubscriptionLifecycleStatus,
    note: string,
    newNextBillingDate?: string
  ) => void;
  onEdit: (subscription: SubscriptionRecord) => void;
}

export const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onUpdateStatus,
  onEdit,
}) => {
  if (!isOpen || !subscription) return null;

  // Retrieve plan to inspect governance rules
  const plans: SubscriptionPlan[] = (() => {
    try {
      const saved = localStorage.getItem('subscriptnova_plans');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PLANS;
  })();

  const plan = plans.find((p) => p.id === subscription.planId);
  const allowPause = plan ? plan.settings.allowPause : true;
  const allowRenewal = plan ? plan.settings.allowRenewal : true;
  const allowEarlyClose = plan ? plan.settings.allowEarlyClose : true;

  const mrr = calculateMRRFromSubscription(
    subscription.unitPrice,
    subscription.quantity,
    subscription.billingFrequency
  );

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-emerald-50 text-[#10B981] border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ACTIVE (BILLABLE)</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONFIRMED</span>
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-amber-50 text-[#F59E0B] border border-amber-200">
            <Pause className="w-3.5 h-3.5" />
            <span>PAUSED</span>
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-red-50 text-[#EF4444] border border-red-200">
            <X className="w-3.5 h-3.5" />
            <span>CLOSED</span>
          </span>
        );
      case 'quotation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>QUOTATION</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span>DRAFT</span>
          </span>
        );
    }
  };

  // Lifecycle Action Handlers
  const handleActivate = () => {
    onUpdateStatus(
      subscription.id,
      'active',
      'Subscription activated for recurring billing.',
      subscription.nextBillingDate || calculateNextBillingDate(new Date().toISOString().split('T')[0], subscription.billingFrequency)
    );
  };

  const handleConfirm = () => {
    onUpdateStatus(subscription.id, 'confirmed', 'Order confirmed by customer operations.');
  };

  const handlePause = () => {
    if (!allowPause) {
      alert('Plan governance rule violation: This subscription tier explicitly prohibits cycle pauses.');
      return;
    }
    onUpdateStatus(subscription.id, 'paused', 'Subscription temporarily paused per user request.');
  };

  const handleResume = () => {
    const today = new Date().toISOString().split('T')[0];
    const newNextBilling = calculateNextBillingDate(today, subscription.billingFrequency);
    onUpdateStatus(
      subscription.id,
      'active',
      `Subscription resumed from pause. Next billing set to ${newNextBilling}.`,
      newNextBilling
    );
  };

  const handleRenew = () => {
    if (!allowRenewal) {
      alert('Plan governance rule violation: This plan tier prohibits manual or automatic renewal.');
      return;
    }
    const currentBase = subscription.nextBillingDate || new Date().toISOString().split('T')[0];
    const advancedDate = calculateNextBillingDate(currentBase, subscription.billingFrequency);
    onUpdateStatus(
      subscription.id,
      'active',
      `Manual renewal processed. Billing period extended to ${advancedDate}.`,
      advancedDate
    );
  };

  const handleClose = () => {
    if (!allowEarlyClose) {
      const confirmed = window.confirm(
        'Warning: Plan governance settings specify that early close is contracted. Are you sure you wish to override and close this subscription?'
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(
        'Are you sure you want to close this subscription? Future billing will be permanently stopped.'
      );
      if (!confirmed) return;
    }
    onUpdateStatus(subscription.id, 'closed', 'Subscription closed. Future billing terminated.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#102B4E] text-[#10B981] flex items-center justify-center shadow-xs">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold font-mono text-[#102B4E]">
                  {subscription.subscriptionNumber}
                </h2>
                {getStatusBadge()}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {subscription.billingFrequency} Cadence
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                <span>{subscription.customerCompany}</span>
                <span> · </span>
                <span>{subscription.customerName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(subscription)}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white border-b border-slate-100 shrink-0">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Total Recurring Amount
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#102B4E] tabular-nums mt-0.5">
              ${subscription.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
              ${subscription.unitPrice} × {subscription.quantity} unit(s)
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              MRR Contribution
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#10B981] tabular-nums mt-0.5">
              ${mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Normalized monthly revenue</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Contract Start Date
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-800 tabular-nums mt-0.5">
              {subscription.startDate}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Initial activation</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Next Billing Event
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-[#102B4E] tabular-nums mt-0.5">
              {subscription.status === 'closed' ? 'Terminated' : subscription.nextBillingDate}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {subscription.status === 'active'
                ? 'Scheduled automated run'
                : subscription.status === 'paused'
                ? 'On hold'
                : 'Pending activation'}
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* LIFECYCLE ACTION CONTROLS */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#102B4E] block">
                Lifecycle Orchestration Actions
              </span>
              <span className="text-[10px] text-slate-400">
                Execute automated contract workflows adhering to plan policies
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Draft -> Confirmed */}
              {(subscription.status === 'draft' || subscription.status === 'quotation') && (
                <button
                  onClick={handleConfirm}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Confirm Contract
                </button>
              )}

              {/* Confirmed/Draft -> Active */}
              {(subscription.status === 'confirmed' || subscription.status === 'draft') && (
                <button
                  onClick={handleActivate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#10B981] hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Activate Subscription</span>
                </button>
              )}

              {/* Active -> Pause */}
              {subscription.status === 'active' && (
                <button
                  onClick={handlePause}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
                  title={!allowPause ? 'Pause option is disabled by plan governance' : 'Pause billing'}
                >
                  <Pause className="w-3.5 h-3.5 text-amber-700" />
                  <span>Pause</span>
                </button>
              )}

              {/* Paused -> Resume */}
              {subscription.status === 'paused' && (
                <button
                  onClick={handleResume}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#10B981] hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Subscription</span>
                </button>
              )}

              {/* Active -> Renew */}
              {subscription.status === 'active' && (
                <button
                  onClick={handleRenew}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title={!allowRenewal ? 'Renewal prohibited by plan' : 'Advance billing cycle'}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Renew Cycle</span>
                </button>
              )}

              {/* Close Subscription */}
              {subscription.status !== 'closed' && (
                <button
                  onClick={handleClose}
                  className="px-3 py-1.5 text-xs font-semibold text-[#EF4444] bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                  title={!allowEarlyClose ? 'Early closure restricted by plan' : 'Terminate subscription'}
                >
                  Close Subscription
                </button>
              )}
            </div>
          </div>

          {/* Linked Product & Plan Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Catalog & Plan Specifications
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Product:</span>
                  <span className="font-semibold text-slate-900">{subscription.productName}</span>
                </div>
                {subscription.variantName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Variant:</span>
                    <span className="font-medium text-slate-800">{subscription.variantName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Subscription Plan:</span>
                  <span className="font-semibold text-[#102B4E]">{subscription.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Frequency:</span>
                  <span className="font-mono">{subscription.billingFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantity:</span>
                  <span className="font-mono font-bold">{subscription.quantity} unit(s)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Account & Lineage References
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Client:</span>
                  <span className="font-semibold text-slate-900">{subscription.customerCompany}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="text-slate-800">{subscription.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono text-slate-600">{subscription.customerEmail}</span>
                </div>
                {subscription.linkedQuotationNumber && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Source Quotation:</span>
                    <span className="font-mono font-bold text-[#102B4E] bg-white px-2 py-0.5 rounded border border-slate-200">
                      {subscription.linkedQuotationNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Plan Governance Summary */}
          {plan && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Enforced Plan Governance Policy
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block">Pause Permitted</span>
                  <span className={`font-semibold ${allowPause ? 'text-[#10B981]' : 'text-slate-400'}`}>
                    {allowPause ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block">Auto Renewal</span>
                  <span className={`font-semibold ${allowRenewal ? 'text-[#10B981]' : 'text-slate-400'}`}>
                    {allowRenewal ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block">Early Close</span>
                  <span className={`font-semibold ${allowEarlyClose ? 'text-[#10B981]' : 'text-amber-700'}`}>
                    {allowEarlyClose ? 'Allowed' : 'Contracted'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block">Auto-Close Expire</span>
                  <span className="font-semibold text-slate-700">
                    {plan.settings.autoClose ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TIMELINE OF SUBSCRIPTION STATUS CHANGES */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-[11px] font-bold text-[#102B4E] uppercase tracking-wider block">
              Audit & Status Change Timeline ({subscription.timeline.length})
            </span>

            <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 ml-1">
              {subscription.timeline.map((evt) => (
                <div key={evt.id} className="relative group">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#102B4E] border-2 border-white absolute -left-[21px] top-1" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-700">
                      {evt.toStatus}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{evt.timestamp}</span>
                    <span className="text-[10px] text-slate-400">by {evt.actor}</span>
                  </div>
                  <p className="text-slate-700 text-xs mt-0.5">{evt.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            ID: {subscription.id} · Created {subscription.dateCreated}
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
