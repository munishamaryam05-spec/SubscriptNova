import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  User,
  Calendar,
  DollarSign,
  Percent,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { Invoice, InvoiceFormData, InvoiceLineItem, InvoiceDiscountType, InvoiceStatus } from '../../types/invoice';
import { Customer } from '../../types/customer';
import { SubscriptionRecord } from '../../types/subscription';
import { addDays, calculateBillingPeriod } from '../../utils/dateCalculations';
import { INITIAL_DISCOUNTS } from '../../data/mockDiscounts';
import { DiscountCode } from '../../types/discount';
import { validateDiscount } from '../../utils/discountValidator';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InvoiceFormData, invoiceId?: string) => void;
  existingInvoice?: Invoice | null;
  customers: Customer[];
  subscriptions: SubscriptionRecord[];
  nextInvoiceNumber: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingInvoice,
  customers,
  subscriptions,
  nextInvoiceNumber,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(existingInvoice);

  // Form State
  const [customerId, setCustomerId] = useState(existingInvoice?.customerId || '');
  const [subscriptionId, setSubscriptionId] = useState(existingInvoice?.subscriptionId || '');
  const [issueDate, setIssueDate] = useState(
    existingInvoice?.issueDate || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    existingInvoice?.dueDate || addDays(new Date().toISOString().split('T')[0], 14)
  );
  const [billingPeriodStart, setBillingPeriodStart] = useState(
    existingInvoice?.billingPeriodStart || new Date().toISOString().split('T')[0]
  );
  const [billingPeriodEnd, setBillingPeriodEnd] = useState(
    existingInvoice?.billingPeriodEnd || addDays(new Date().toISOString().split('T')[0], 30)
  );

  const [items, setItems] = useState<InvoiceLineItem[]>(
    existingInvoice?.items && existingInvoice.items.length > 0
      ? existingInvoice.items
      : [
          {
            id: 'item-1',
            description: '',
            quantity: 1,
            unitPrice: 0,
            amount: 0,
          },
        ]
  );

  const [discountType, setDiscountType] = useState<InvoiceDiscountType>(
    existingInvoice?.discountType || 'fixed'
  );
  const [discountValue, setDiscountValue] = useState<number>(existingInvoice?.discountValue || 0);
  const [taxRate, setTaxRate] = useState<number>(existingInvoice?.taxRate ?? 10);
  const [notes, setNotes] = useState(existingInvoice?.notes || '');
  const [terms, setTerms] = useState(
    existingInvoice?.terms || 'Payment due within 14 calendar days.'
  );
  const [status, setStatus] = useState<InvoiceStatus>(existingInvoice?.status || 'draft');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const handleApplyCoupon = () => {
    let discounts: DiscountCode[] = INITIAL_DISCOUNTS;
    try {
      const stored = localStorage.getItem('subscriptnova_discounts');
      if (stored) discounts = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    const res = validateDiscount(couponCode, subtotal, discounts);
    if (res.isValid && res.discount) {
      setDiscountType(res.discount.type);
      setDiscountValue(res.discount.value);
      setCouponFeedback({
        valid: true,
        message: `Applied ${res.discount.code} (${res.discount.type === 'percentage' ? `${res.discount.value}%` : `$${res.discount.value.toFixed(2)}`} off)`,
      });
    } else {
      setCouponFeedback({
        valid: false,
        message: res.error || 'Invalid discount code.',
      });
    }
  };

  // Filter subscriptions for selected customer
  const availableSubscriptions = subscriptions.filter(
    (s) => s.customerId === customerId && s.status !== 'closed'
  );

  // When customer changes, clear or update subscription
  const handleCustomerChange = (newCustId: string) => {
    setCustomerId(newCustId);
    setSubscriptionId('');
    if (errors.customerId) {
      setErrors((prev) => ({ ...prev, customerId: '' }));
    }
  };

  // When subscription changes, auto-populate line items and billing period
  const handleSubscriptionChange = (subId: string) => {
    setSubscriptionId(subId);
    if (!subId) return;

    const sub = subscriptions.find((s) => s.id === subId);
    if (sub) {
      // Calculate suggested billing cycle from subscription's next billing date or start date
      const cycle = calculateBillingPeriod(sub.nextBillingDate || sub.startDate, sub.billingFrequency);
      setBillingPeriodStart(cycle.periodStart);
      setBillingPeriodEnd(cycle.periodEnd);

      // Populate default line item
      setItems([
        {
          id: `item-${Date.now()}`,
          description: `${sub.productName}${sub.variantName ? ` - ${sub.variantName}` : ''} (${sub.billingFrequency} Billing)`,
          productId: sub.productId,
          productName: sub.productName,
          variantId: sub.variantId,
          variantName: sub.variantName,
          planId: sub.planId,
          planName: sub.planName,
          quantity: sub.quantity,
          unitPrice: sub.unitPrice,
          amount: sub.unitPrice * sub.quantity,
        },
      ]);
    }
  };

  // Line Items Manipulation
  const handleItemChange = (
    index: number,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    const updated = [...items];
    const item = { ...updated[index] };

    if (field === 'quantity') {
      const q = Math.max(1, Number(value) || 1);
      item.quantity = q;
      item.amount = q * item.unitPrice;
    } else if (field === 'unitPrice') {
      const p = Math.max(0, Number(value) || 0);
      item.unitPrice = p;
      item.amount = item.quantity * p;
    } else if (field === 'description') {
      item.description = String(value);
    }

    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Financial Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const discountAmount =
    discountType === 'percentage'
      ? Math.min(subtotal, (subtotal * Math.max(0, discountValue)) / 100)
      : Math.min(subtotal, Math.max(0, discountValue));

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * Math.max(0, taxRate)) / 100;
  const totalAmount = taxableAmount + taxAmount;

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customerId = 'Please select a customer.';
    }

    if (!issueDate) {
      newErrors.issueDate = 'Issue date is required.';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required.';
    } else if (dueDate < issueDate) {
      newErrors.dueDate = 'Due date cannot be earlier than issue date.';
    }

    if (!billingPeriodStart) {
      newErrors.billingPeriodStart = 'Period start date is required.';
    }

    if (!billingPeriodEnd) {
      newErrors.billingPeriodEnd = 'Period end date is required.';
    } else if (billingPeriodEnd < billingPeriodStart) {
      newErrors.billingPeriodEnd = 'Period end date cannot be earlier than start date.';
    }

    if (items.length === 0) {
      newErrors.items = 'At least one line item is required.';
    } else {
      const hasEmptyDesc = items.some((it) => !it.description.trim());
      if (hasEmptyDesc) {
        newErrors.items = 'All line items must have a clear description.';
      }
      const hasInvalidNumbers = items.some((it) => it.quantity <= 0 || it.unitPrice < 0);
      if (hasInvalidNumbers) {
        newErrors.items = 'Line items must have positive quantity and valid unit price.';
      }
    }

    if (discountValue < 0) {
      newErrors.discount = 'Discount cannot be negative.';
    }

    if (taxRate < 0) {
      newErrors.taxRate = 'Tax rate cannot be negative.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (targetStatus: InvoiceStatus) => {
    if (!validate()) return;

    const selectedCust = customers.find((c) => c.id === customerId);
    const selectedSub = subscriptions.find((s) => s.id === subscriptionId);

    const formData: InvoiceFormData = {
      customerId,
      customerName: selectedCust?.name || '',
      customerCompany: selectedCust?.company || '',
      customerEmail: selectedCust?.email || '',
      customerBillingAddress: selectedCust?.billingAddress,
      customerTaxId: selectedCust?.taxId,

      subscriptionId: selectedSub?.id,
      subscriptionNumber: selectedSub?.subscriptionNumber,
      planName: selectedSub?.planName,
      billingFrequency: selectedSub?.billingFrequency,

      billingPeriodStart,
      billingPeriodEnd,

      issueDate,
      dueDate,

      items,
      discountType,
      discountValue,
      taxRate,

      status: targetStatus,
      notes,
      terms,
    };

    onSave(formData, existingInvoice?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#04222B] text-white border border-[#0A3D4A] flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#4FB8B4]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#04222B]">
                {isEditing ? `Edit Draft Invoice (${existingInvoice?.invoiceNumber})` : 'Create Manual Invoice'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Update invoice line items, discounts, or terms'
                  : `Assign to account • Auto-assigned: ${nextInvoiceNumber}`}
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

        {/* Form Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* General Errors Banner */}
          {errors.items && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.items}</span>
            </div>
          )}

          {/* Customer & Subscription Linking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1D8B94] ${
                  errors.customerId ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                }`}
              >
                <option value="">-- Choose Account --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''} - {c.email}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="text-[11px] text-red-600 mt-1">{errors.customerId}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Linked Subscription (Optional)
              </label>
              <select
                value={subscriptionId}
                onChange={(e) => handleSubscriptionChange(e.target.value)}
                disabled={!customerId}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1D8B94] disabled:opacity-50"
              >
                <option value="">-- One-Off / No Subscription --</option>
                {availableSubscriptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subscriptionNumber} • {s.planName} (${s.totalAmount}/{s.billingFrequency})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Auto-fills plan pricing, quantity, and suggested billing period.
              </p>
            </div>
          </div>

          {/* Dates & Billing Period */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#1D8B94]"
              />
              {errors.issueDate && (
                <p className="text-[10px] text-red-600 mt-1">{errors.issueDate}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#1D8B94]"
              />
              {errors.dueDate && <p className="text-[10px] text-red-600 mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Period Start <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={billingPeriodStart}
                onChange={(e) => setBillingPeriodStart(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#1D8B94]"
              />
              {errors.billingPeriodStart && (
                <p className="text-[10px] text-red-600 mt-1">{errors.billingPeriodStart}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Period End <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={billingPeriodEnd}
                onChange={(e) => setBillingPeriodEnd(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#1D8B94]"
              />
              {errors.billingPeriodEnd && (
                <p className="text-[10px] text-red-600 mt-1">{errors.billingPeriodEnd}</p>
              )}
            </div>
          </div>

          {/* Line Items Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Invoice Line Items
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1D8B94] hover:bg-[#E2F4F0]/60 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#1D8B94]" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-2 w-20 text-center">Qty</th>
                    <th className="py-2 px-2 w-28 text-right">Unit Price</th>
                    <th className="py-2 px-3 w-28 text-right">Amount</th>
                    <th className="py-2 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="e.g. Standard SaaS Tier Monthly License"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1D8B94]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-center focus:outline-none focus:ring-1 focus:ring-[#1D8B94]"
                        />
                      </td>
                      <td className="p-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            className="w-full pl-5 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-right focus:outline-none focus:ring-1 focus:ring-[#1D8B94]"
                          />
                        </div>
                      </td>
                      <td className="p-2 text-right font-mono font-semibold text-[#04222B] whitespace-nowrap">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length <= 1}
                          className="p-1 rounded text-slate-400 hover:text-red-600 disabled:opacity-20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Discounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Promotional Discount
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as InvoiceDiscountType)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="fixed">Fixed ($)</option>
                    <option value="percentage">Percent (%)</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    step={discountType === 'percentage' ? '1' : '0.01'}
                    max={discountType === 'percentage' ? '100' : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                    placeholder="Discount value"
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:outline-none"
                  />
                </div>

                {/* Coupon Code Quick Validation */}
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon (e.g. WELCOME20)"
                      className="w-full pl-7 pr-2 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-slate-200 focus:outline-none focus:border-[#1D8B94]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponFeedback && (
                  <div
                    className={`mt-1.5 text-[11px] font-medium flex items-center gap-1 ${
                      couponFeedback.valid ? 'text-[#1D8B94]' : 'text-red-500'
                    }`}
                  >
                    {couponFeedback.valid ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3 h-3 shrink-0" />
                    )}
                    <span>{couponFeedback.message}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes or billing remarks..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#1D8B94]">
                  <span>
                    Discount{' '}
                    {discountType === 'percentage' ? `(${discountValue}%)` : '($)'}:
                  </span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax ({taxRate}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-[#04222B]">
                <span>Total Amount:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="pt-1 text-[11px] text-slate-400 font-sans">
                Initial status: {status === 'draft' ? 'Draft' : 'Confirmed'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('confirmed')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Save & Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
