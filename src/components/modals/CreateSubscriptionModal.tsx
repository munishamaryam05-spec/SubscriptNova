import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { PLAN_TIERS } from '../../data/mockData';

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sub: { customer: string; plan: string; amount: number; cycle: string }) => void;
}

export const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('growth');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isAutoRenew, setIsAutoRenew] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const selectedPlan = PLAN_TIERS.find((p) => p.id === selectedPlanId) || PLAN_TIERS[1];
  const monthlyPrice = selectedPlan.pricePerMonth;
  const price = billingCycle === 'annual' ? monthlyPrice * 12 * 0.85 : monthlyPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) return;

    setIsSuccess(true);
    setTimeout(() => {
      onSuccess({
        customer: customerName,
        plan: selectedPlan.name,
        amount: Math.round(price),
        cycle: billingCycle === 'annual' ? 'Annual' : 'Monthly',
      });
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#102B4E] text-[#10B981] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#102B4E]">Initiate New Subscription</h3>
              <p className="text-[11px] text-slate-400">
                Setup recurring billing schedule and customer seat allocation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-[#10B981]/15 text-[#10B981] rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#102B4E]">Subscription Created!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Automated invoice generated and sent to {customerEmail}. Recurring billing active.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Customer Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Customer / Company Name <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Helix Robotics Inc"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Billing Email Address <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="billing@helixrobotics.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
                />
              </div>
            </div>

            {/* Plan Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Select Subscription Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLAN_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedPlanId(tier.id)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      selectedPlanId === tier.id
                        ? 'border-[#102B4E] bg-[#102B4E]/5 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">{tier.name}</span>
                      <span className="font-mono text-[11px] text-[#102B4E] font-bold">
                        ${tier.pricePerMonth}/mo
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {tier.subscribers} active accounts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Cadence */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div>
                <span className="font-semibold text-slate-800 block">Billing Cadence</span>
                <span className="text-[10px] text-slate-400">Annual billing saves 15%</span>
              </div>
              <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-[#102B4E] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                    billingCycle === 'annual'
                      ? 'bg-[#102B4E] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Annual (-15%)
                </button>
              </div>
            </div>

            {/* Price Preview */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-800 font-medium">Calculated Charge:</span>
                <div className="text-base font-bold text-[#102B4E] font-mono tabular-nums">
                  ${Math.round(price).toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    / {billingCycle === 'annual' ? 'year' : 'month'}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-emerald-700 font-mono text-right">
                ✓ Automated proration
                <br />✓ Instant activation
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Create & Activate Subscription
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
