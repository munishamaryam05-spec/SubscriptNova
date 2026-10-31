import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Plus, Sparkles, Tag, AlertCircle } from 'lucide-react';
import { PLAN_TIERS } from '../../data/mockData';
import { DiscountCode } from '../../types/discount';
import { INITIAL_DISCOUNTS } from '../../data/mockDiscounts';
import { validateDiscount } from '../../utils/discountValidator';

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

  // Discount code state
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
    description: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPlan = PLAN_TIERS.find((p) => p.id === selectedPlanId) || PLAN_TIERS[1];
  const monthlyPrice = selectedPlan.pricePerMonth;
  const basePrice = billingCycle === 'annual' ? monthlyPrice * 12 * 0.85 : monthlyPrice;

  // Final price after coupon discount
  const finalPrice = appliedDiscount
    ? Math.max(0, basePrice - appliedDiscount.amount)
    : basePrice;

  const handleApplyCoupon = () => {
    setCouponError(null);
    let discounts: DiscountCode[] = INITIAL_DISCOUNTS;
    try {
      const stored = localStorage.getItem('subscriptnova_discounts');
      if (stored) {
        discounts = JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }

    const res = validateDiscount(couponCode, basePrice, discounts);
    if (res.isValid && res.discount && res.discountAmount !== undefined) {
      setAppliedDiscount({
        code: res.discount.code,
        amount: res.discountAmount,
        description: res.discount.description,
      });
      setCouponError(null);
    } else {
      setAppliedDiscount(null);
      setCouponError(res.error || 'Invalid discount code.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) return;

    // Increment coupon usage count if applied
    if (appliedDiscount) {
      try {
        const stored = localStorage.getItem('subscriptnova_discounts');
        let discounts: DiscountCode[] = stored ? JSON.parse(stored) : INITIAL_DISCOUNTS;
        discounts = discounts.map((d) =>
          d.code.toUpperCase() === appliedDiscount.code.toUpperCase()
            ? { ...d, usedCount: d.usedCount + 1 }
            : d
        );
        localStorage.setItem('subscriptnova_discounts', JSON.stringify(discounts));
      } catch (err) {
        console.error('Failed to update discount usage count', err);
      }
    }

    setIsSuccess(true);
    setTimeout(() => {
      onSuccess({
        customer: customerName,
        plan: selectedPlan.name,
        amount: Math.round(finalPrice),
        cycle: billingCycle === 'annual' ? 'Annual' : 'Monthly',
      });
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04222B]/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#0A3D4A] flex items-center justify-between bg-[#04222B] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0A3D4A] border border-[#10606F] text-[#4FB8B4] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Initiate New Subscription</h3>
              <p className="text-[11px] text-[#98D8D0]/70">
                Setup recurring billing schedule and customer seat allocation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0A3D4A] cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-[#E2F4F0] text-[#1D8B94] rounded-full mx-auto flex items-center justify-center border border-[#98D8D0]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#04222B]">Subscription Created!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Automated invoice generated and sent to {customerEmail}. Recurring billing active.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Customer Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#0A3D4A] mb-1">
                  Customer / Company Name <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Helix Robotics Inc"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1D8B94]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0A3D4A] mb-1">
                  Billing Email Address <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="billing@helixrobotics.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1D8B94]"
                />
              </div>
            </div>

            {/* Plan Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-[#0A3D4A] mb-1.5">
                Select Subscription Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLAN_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedPlanId(tier.id)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      selectedPlanId === tier.id
                        ? 'border-[#1D8B94] bg-[#E2F4F0]/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">{tier.name}</span>
                      <span className="font-mono text-[11px] text-[#0A3D4A] font-bold">
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
                      ? 'bg-[#1D8B94] text-white'
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
                      ? 'bg-[#1D8B94] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Annual (-15%)
                </button>
              </div>
            </div>

            {/* Discount Code Input */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-[11px] font-semibold text-[#0A3D4A]">
                Promotional Coupon / Discount Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME20"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-[#04222B] uppercase tracking-wider focus:outline-none focus:border-[#1D8B94]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-lg transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {couponError && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}

              {appliedDiscount && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#E2F4F0] border border-[#98D8D0] text-[11px] text-[#0A3D4A]">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1D8B94]" />
                    <span>Coupon {appliedDiscount.code} applied (-${appliedDiscount.amount.toFixed(2)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedDiscount(null);
                      setCouponCode('');
                    }}
                    className="text-red-500 hover:text-red-700 cursor-pointer font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Price Preview */}
            <div className="p-3 bg-[#E2F4F0]/60 border border-[#98D8D0]/60 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#0A3D4A] font-medium">Calculated Charge:</span>
                <div className="text-[10px] text-slate-500">
                  {billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
                  {appliedDiscount && ' with discount applied'}
                </div>
              </div>
              <div className="text-right">
                {appliedDiscount && (
                  <span className="text-xs line-through text-slate-400 mr-2 font-mono">
                    ${Math.round(basePrice)}
                  </span>
                )}
                <span className="text-base font-bold text-[#04222B] font-mono">
                  ${Math.round(finalPrice)}
                  <span className="text-[10px] font-normal text-slate-500">
                    /{billingCycle === 'annual' ? 'yr' : 'mo'}
                  </span>
                </span>
              </div>
            </div>

            {/* Auto Renew Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoRenew"
                checked={isAutoRenew}
                onChange={(e) => setIsAutoRenew(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#1D8B94] focus:ring-[#1D8B94] border-slate-300"
              />
              <label htmlFor="autoRenew" className="text-[11px] text-slate-600 cursor-pointer">
                Enable automated credit card billing and renewal notifications
              </label>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1D8B94] hover:bg-[#10606F] text-white font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E2F4F0]" />
                <span>Confirm Subscription</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
