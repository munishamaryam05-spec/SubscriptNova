import React, { useState, useMemo } from 'react';
import {
  X,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Ban,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SubscriptionRecord } from '../../types/subscription';
import { Invoice, InvoiceStatus, BillingRunResult } from '../../types/invoice';
import { Customer } from '../../types/customer';
import {
  calculateBillingPeriod,
  formatDateDisplay,
  formatPeriodRange,
  addDays,
} from '../../utils/dateCalculations';

interface BillingCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: SubscriptionRecord[];
  customers: Customer[];
  existingInvoices: Invoice[];
  onExecuteBillingRun: (result: BillingRunResult, updatedSubscriptions: SubscriptionRecord[]) => void;
}

export const BillingCycleModal: React.FC<BillingCycleModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  customers,
  existingInvoices,
  onExecuteBillingRun,
}) => {
  if (!isOpen) return null;

  // Simulation execution date (defaults to current app date: 2026-10-31)
  const [cutoffDate, setCutoffDate] = useState<string>('2026-10-31');
  const [initialStatus, setInitialStatus] = useState<InvoiceStatus>('confirmed');
  const [paymentTermDays, setPaymentTermDays] = useState<number>(14);
  const [runResult, setRunResult] = useState<BillingRunResult | null>(null);

  // Analyze subscriptions against cutoff date and duplicate prevention
  const evaluation = useMemo(() => {
    const eligible: {
      subscription: SubscriptionRecord;
      period: { periodStart: string; periodEnd: string; nextBillingDate: string };
      periodKey: string;
    }[] = [];

    const skipped: {
      subscription: SubscriptionRecord;
      reason: string;
      category: 'paused' | 'closed' | 'not_active' | 'future' | 'already_billed';
    }[] = [];

    subscriptions.forEach((sub) => {
      // 1. Exclude paused
      if (sub.status === 'paused') {
        skipped.push({
          subscription: sub,
          reason: 'Subscription is paused per plan governance',
          category: 'paused',
        });
        return;
      }

      // 2. Exclude closed
      if (sub.status === 'closed') {
        skipped.push({
          subscription: sub,
          reason: 'Subscription is closed/cancelled',
          category: 'closed',
        });
        return;
      }

      // 3. Exclude non-active statuses (draft, quotation, confirmed)
      if (sub.status !== 'active') {
        skipped.push({
          subscription: sub,
          reason: `Subscription is in "${sub.status}" lifecycle state (must be Active)`,
          category: 'not_active',
        });
        return;
      }

      // 4. Check due date
      const billingDue = sub.nextBillingDate || sub.startDate;
      if (billingDue > cutoffDate) {
        skipped.push({
          subscription: sub,
          reason: `Not due yet (next cycle scheduled for ${formatDateDisplay(billingDue)})`,
          category: 'future',
        });
        return;
      }

      // 5. Calculate billing period
      const period = calculateBillingPeriod(billingDue, sub.billingFrequency);
      const periodKey = `${sub.id}_${period.periodStart}_${period.periodEnd}`;

      // 6. Strict duplicate prevention check
      const isAlreadyInvoiced = existingInvoices.some(
        (inv) =>
          inv.status !== 'cancelled' &&
          (inv.billingPeriodKey === periodKey ||
            (inv.subscriptionId === sub.id &&
              inv.billingPeriodStart === period.periodStart &&
              inv.billingPeriodEnd === period.periodEnd))
      );

      if (isAlreadyInvoiced) {
        skipped.push({
          subscription: sub,
          reason: `Already billed for cycle ${formatPeriodRange(period.periodStart, period.periodEnd)}`,
          category: 'already_billed',
        });
        return;
      }

      // Passed all checks!
      eligible.push({
        subscription: sub,
        period,
        periodKey,
      });
    });

    return { eligible, skipped };
  }, [subscriptions, cutoffDate, existingInvoices]);

  // Execute Billing Run
  const handleRunExecution = () => {
    if (evaluation.eligible.length === 0) return;

    // Find highest invoice number in existing invoices to guarantee sequential uniqueness
    let maxInvNum = 1082;
    existingInvoices.forEach((inv) => {
      const match = inv.invoiceNumber.match(/INV-\d{4}-(\d+)/);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxInvNum) maxInvNum = num;
      }
    });

    const generatedInvoices: Invoice[] = [];
    const updatedSubscriptionsMap = new Map<string, SubscriptionRecord>();

    // Copy subscriptions so we can safely advance nextBillingDate
    subscriptions.forEach((s) => updatedSubscriptionsMap.set(s.id, { ...s }));

    evaluation.eligible.forEach((item, index) => {
      const nextNum = maxInvNum + 1 + index;
      const invoiceNumber = `INV-2026-${String(nextNum).padStart(4, '0')}`;
      const sub = item.subscription;
      const period = item.period;

      const cust = customers.find((c) => c.id === sub.customerId);
      const subtotal = sub.totalAmount;
      const taxRate = 10;
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount;

      const newInvoice: Invoice = {
        id: `inv-${nextNum}`,
        invoiceNumber,
        customerId: sub.customerId,
        customerName: sub.customerName,
        customerCompany: sub.customerCompany,
        customerEmail: sub.customerEmail,
        customerBillingAddress: cust?.billingAddress,
        customerTaxId: cust?.taxId,

        subscriptionId: sub.id,
        subscriptionNumber: sub.subscriptionNumber,
        planName: sub.planName,
        billingFrequency: sub.billingFrequency,

        billingPeriodStart: period.periodStart,
        billingPeriodEnd: period.periodEnd,
        billingPeriodKey: item.periodKey,

        issueDate: cutoffDate,
        dueDate: addDays(cutoffDate, paymentTermDays),

        items: [
          {
            id: `item-${Date.now()}-${index}`,
            description: `${sub.productName}${sub.variantName ? ` - ${sub.variantName}` : ''} (${sub.billingFrequency} Billing)`,
            productId: sub.productId,
            productName: sub.productName,
            variantId: sub.variantId,
            variantName: sub.variantName,
            planId: sub.planId,
            planName: sub.planName,
            quantity: sub.quantity,
            unitPrice: sub.unitPrice,
            amount: sub.totalAmount,
          },
        ],

        subtotal,
        discountType: 'fixed',
        discountValue: 0,
        discountAmount: 0,
        taxRate,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        status: initialStatus,
        notes: `Automated cycle billing generated on ${cutoffDate} for ${sub.billingFrequency} plan.`,
        terms: `Payment due Net ${paymentTermDays} days.`,
        createdAt: cutoffDate,
        confirmedAt: initialStatus === 'confirmed' ? cutoffDate : undefined,
      };

      generatedInvoices.push(newInvoice);

      // Advance subscription's next billing date ONLY after invoice creation
      const existingSub = updatedSubscriptionsMap.get(sub.id);
      if (existingSub) {
        const updatedTimeline = [
          ...(existingSub.timeline || []),
          {
            id: `evt-${Date.now()}-${index}`,
            fromStatus: existingSub.status,
            toStatus: existingSub.status,
            timestamp: `${cutoffDate} 00:00`,
            note: `Invoiced for period ${period.periodStart} to ${period.periodEnd} (${invoiceNumber}). Next billing advanced to ${period.nextBillingDate}.`,
            actor: 'SubscriptNova Billing Engine',
          },
        ];

        updatedSubscriptionsMap.set(sub.id, {
          ...existingSub,
          nextBillingDate: period.nextBillingDate,
          timeline: updatedTimeline,
        });
      }
    });

    const result: BillingRunResult = {
      runDate: cutoffDate,
      totalEvaluated: subscriptions.length,
      invoicesGeneratedCount: generatedInvoices.length,
      totalInvoicedAmount: generatedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      generatedInvoices,
      skippedSubscriptions: evaluation.skipped.map((s) => ({
        subscriptionId: s.subscription.id,
        subscriptionNumber: s.subscription.subscriptionNumber,
        customerName: s.subscription.customerName,
        reason: s.reason,
      })),
      errors: [],
    };

    const finalUpdatedSubscriptions = Array.from(updatedSubscriptionsMap.values());
    setRunResult(result);
    onExecuteBillingRun(result, finalUpdatedSubscriptions);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#04222B] text-white border border-[#0A3D4A] flex items-center justify-center font-bold shadow-xs">
              <RotateCw className="w-4 h-4 text-[#4FB8B4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#04222B]">Run Billing Cycle</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E2F4F0] text-[#0A3D4A] font-semibold border border-[#98D8D0]">
                  Recurring Orchestrator
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Evaluate active subscriptions, prevent duplicate cycles, and advance billing dates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Notice */}
        <div className="px-6 py-2.5 bg-[#E2F4F0]/60 border-b border-[#98D8D0]/40 flex items-center gap-2 text-xs text-[#0A3D4A]">
          <Info className="w-4 h-4 text-[#1D8B94] shrink-0" />
          <span>
            <strong>Manual Trigger Engine:</strong> This is a manually triggered demo billing cycle
            for testing recurring invoicing. Background automatic cron scheduling is not configured
            in this client-side preview.
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto text-xs">
          {runResult ? (
            /* Post-Run Execution Summary */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-[#E2F4F0] border border-[#98D8D0] text-[#0A3D4A] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1D8B94] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">
                    Billing Cycle Run Completed Successfully!
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Generated {runResult.invoicesGeneratedCount} invoice(s) totaling $
                    {runResult.totalInvoicedAmount.toFixed(2)} with strict duplicate prevention.
                    Next billing dates have been securely advanced.
                  </p>
                </div>
              </div>

              {/* Invoices Generated List */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Generated Invoices ({runResult.generatedInvoices.length})
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {runResult.generatedInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#04222B]">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-slate-500 font-semibold">•</span>
                          <span className="font-semibold text-slate-800">{inv.customerName}</span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            ({inv.subscriptionNumber})
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Period: {formatPeriodRange(inv.billingPeriodStart, inv.billingPeriodEnd)} •
                          Due: {formatDateDisplay(inv.dueDate)}
                        </div>
                      </div>
                      <div className="text-right sm:shrink-0 font-mono">
                        <span className="font-bold text-[#04222B] text-sm">
                          ${inv.totalAmount.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-[#1D8B94] font-sans font-semibold">
                          Confirmed & Recorded
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skipped Details */}
              {runResult.skippedSubscriptions.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-600 text-xs uppercase tracking-wider mb-2">
                    Skipped Subscriptions ({runResult.skippedSubscriptions.length})
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {runResult.skippedSubscriptions.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-600 font-medium">
                            {item.subscriptionNumber}
                          </span>
                          <span className="text-slate-700">{item.customerName}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 italic">{item.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Pre-Flight Inspection & Settings */
            <>
              {/* Parameters Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cycle Cutoff Date
                  </label>
                  <input
                    type="date"
                    value={cutoffDate}
                    onChange={(e) => setCutoffDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#1D8B94]"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setCutoffDate('2026-10-31')}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 cursor-pointer"
                    >
                      Oct 31 (Today)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCutoffDate('2026-11-05')}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 cursor-pointer"
                    >
                      Nov 05
                    </button>
                    <button
                      type="button"
                      onClick={() => setCutoffDate('2026-11-18')}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 cursor-pointer"
                    >
                      Nov 18
                    </button>
                    <button
                      type="button"
                      onClick={() => setCutoffDate('2026-11-30')}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 cursor-pointer"
                    >
                      Nov 30
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Generated Invoices Status
                  </label>
                  <select
                    value={initialStatus}
                    onChange={(e) => setInitialStatus(e.target.value as InvoiceStatus)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="confirmed">Confirmed (Standard Billing)</option>
                    <option value="draft">Draft (Requires Review)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Confirmed invoices are immediately due for payment.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Term</label>
                  <select
                    value={paymentTermDays}
                    onChange={(e) => setPaymentTermDays(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none"
                  >
                    <option value={7}>Net 7 Days</option>
                    <option value={14}>Net 14 Days (Standard)</option>
                    <option value={30}>Net 30 Days</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Calculates due date as {cutoffDate} + {paymentTermDays} days.
                  </p>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Total Subscriptions
                  </span>
                  <div className="text-lg font-bold text-slate-800 mt-0.5">
                    {subscriptions.length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#E2F4F0] border border-[#98D8D0]">
                  <span className="text-[10px] font-bold text-[#0A3D4A] uppercase">
                    Eligible to Bill
                  </span>
                  <div className="text-lg font-bold text-[#1D8B94] mt-0.5">
                    {evaluation.eligible.length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-700 uppercase">
                    Excluded / Not Due
                  </span>
                  <div className="text-lg font-bold text-[#F59E0B] mt-0.5">
                    {evaluation.skipped.length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Estimated Billing
                  </span>
                  <div className="text-lg font-bold text-[#04222B] mt-0.5 font-mono">
                    $
                    {evaluation.eligible
                      .reduce((sum, item) => sum + item.subscription.totalAmount * 1.1, 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Eligible Subscriptions Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1D8B94]" />
                    <span>Eligible for Billing Run ({evaluation.eligible.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Cutoff: {formatDateDisplay(cutoffDate)}
                  </span>
                </div>

                {evaluation.eligible.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    <Clock className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                    <p className="font-medium">No subscriptions are due on or before {cutoffDate}.</p>
                    <p className="text-[11px] mt-1 text-slate-400">
                      Try advancing the cutoff date to <strong>Nov 05</strong> or{' '}
                      <strong>Nov 18</strong> using the quick chips above.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {evaluation.eligible.map((item) => (
                      <div
                        key={item.subscription.id}
                        className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#04222B]">
                              {item.subscription.subscriptionNumber}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {item.subscription.customerName}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E2F4F0] text-[#0A3D4A] font-semibold border border-[#98D8D0]">
                              {item.subscription.billingFrequency}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {item.subscription.planName} • Cycle:{' '}
                            <span className="font-medium text-slate-700">
                              {formatPeriodRange(item.period.periodStart, item.period.periodEnd)}
                            </span>
                          </div>
                        </div>

                        <div className="sm:text-right font-mono">
                          <div className="font-bold text-[#04222B]">
                            ${(item.subscription.totalAmount * 1.1).toFixed(2)}
                            <span className="text-[10px] text-slate-400 font-sans ml-1">incl. tax</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Next date advances to: {item.period.nextBillingDate}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Excluded Breakdown */}
              <div>
                <h4 className="font-bold text-slate-600 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Ban className="w-3.5 h-3.5 text-slate-400" />
                  <span>Excluded Subscriptions ({evaluation.skipped.length})</span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-44 overflow-y-auto">
                  {evaluation.skipped.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 font-semibold">
                          {item.subscription.subscriptionNumber}
                        </span>
                        <span className="text-slate-700 truncate max-w-[150px]">
                          {item.subscription.customerName}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                            item.category === 'paused'
                              ? 'bg-amber-100 text-amber-800'
                              : item.category === 'closed'
                              ? 'bg-red-100 text-red-800'
                              : item.category === 'already_billed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 italic truncate max-w-[240px]">
                        {item.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {runResult ? 'Close' : 'Cancel'}
          </button>

          {!runResult && (
            <button
              type="button"
              disabled={evaluation.eligible.length === 0}
              onClick={handleRunExecution}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Billing Run ({evaluation.eligible.length} Subscriptions)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
