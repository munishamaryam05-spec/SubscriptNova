import React, { useState, useEffect } from 'react';
import {
  X,
  Repeat,
  Package,
  Layers,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  SubscriptionFormData,
  SubscriptionLifecycleStatus,
  SubscriptionRecord,
} from '../../types/subscription';
import { Customer } from '../../types/customer';
import { Product } from '../../types/product';
import { SubscriptionPlan } from '../../types/plan';
import { Quotation } from '../../types/quotation';
import { INITIAL_CUSTOMERS } from '../../data/mockCustomers';
import { INITIAL_PRODUCTS } from '../../data/mockProducts';
import { INITIAL_PLANS } from '../../data/mockPlans';
import { INITIAL_QUOTATIONS } from '../../data/mockQuotations';
import { calculateNextBillingDate } from '../../utils/dateCalculations';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubscriptionFormData) => void;
  subscriptionToEdit?: SubscriptionRecord | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  subscriptionToEdit,
}) => {
  // Load master data
  const [customers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('subscriptnova_customers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CUSTOMERS;
  });

  const [products] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('subscriptnova_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  const [plans] = useState<SubscriptionPlan[]>(() => {
    try {
      const saved = localStorage.getItem('subscriptnova_plans');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PLANS;
  });

  const [quotations] = useState<Quotation[]>(() => {
    try {
      const saved = localStorage.getItem('subscriptnova_quotations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_QUOTATIONS;
  });

  // Active items only for new subscriptions
  const activeProducts = products.filter((p) => p.status === 'active');
  const activePlans = plans.filter((p) => p.status === 'active');
  const acceptedQuotations = quotations.filter((q) => q.status === 'accepted');

  // Form State
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [planId, setPlanId] = useState('');
  const [unitPrice, setUnitPrice] = useState<string>('49');
  const [quantity, setQuantity] = useState<string>('1');
  const [startDate, setStartDate] = useState('');
  const [status, setStatus] = useState<SubscriptionLifecycleStatus>('active');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const selectedProduct = products.find((p) => p.id === productId);
  const selectedPlan = plans.find((p) => p.id === planId);
  const selectedCustomer = customers.find((c) => c.id === customerId);

  // Available plans for currently selected product
  const availablePlansForProduct = activePlans.filter((p) => p.productId === productId);

  useEffect(() => {
    if (subscriptionToEdit) {
      setSelectedQuoteId(subscriptionToEdit.linkedQuotationId || '');
      setCustomerId(subscriptionToEdit.customerId);
      setProductId(subscriptionToEdit.productId);
      setVariantId(subscriptionToEdit.variantId || '');
      setPlanId(subscriptionToEdit.planId);
      setUnitPrice(subscriptionToEdit.unitPrice.toString());
      setQuantity(subscriptionToEdit.quantity.toString());
      setStartDate(subscriptionToEdit.startDate);
      setStatus(subscriptionToEdit.status);
      setNotes(subscriptionToEdit.notes || '');
    } else {
      setSelectedQuoteId('');
      const defaultCust = customers[0];
      setCustomerId(defaultCust ? defaultCust.id : '');

      const defaultProd = activeProducts[0];
      setProductId(defaultProd ? defaultProd.id : '');
      setVariantId(defaultProd?.variants[0]?.id || '');

      const matchingPlans = activePlans.filter((p) => p.productId === defaultProd?.id);
      const defaultPlan = matchingPlans[0] || activePlans[0];
      setPlanId(defaultPlan ? defaultPlan.id : '');
      setUnitPrice(defaultPlan ? defaultPlan.price.toString() : '49');
      setQuantity('1');

      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setStatus('active');
      setNotes('');
    }
    setErrors({});
    setTouched({});
  }, [subscriptionToEdit, isOpen, customers, activeProducts, activePlans]);

  // Handle quote selection to auto-populate fields
  const handleSelectQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    if (!quoteId) return;

    const quote = quotations.find((q) => q.id === quoteId);
    if (quote) {
      setCustomerId(quote.customerId);
      const firstItem = quote.items[0];
      if (firstItem) {
        setProductId(firstItem.productId);
        setVariantId(firstItem.variantId || '');
        if (firstItem.planId) {
          setPlanId(firstItem.planId);
        } else {
          const matchPlan = activePlans.find((pl) => pl.productId === firstItem.productId);
          if (matchPlan) setPlanId(matchPlan.id);
        }
        setQuantity(firstItem.quantity.toString());
        setUnitPrice(firstItem.unitPrice.toString());
      }
      setNotes(`Converted from accepted commercial quotation ${quote.quotationNumber}.`);
    }
  };

  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    const prod = products.find((p) => p.id === newProductId);
    const firstVar = prod?.variants[0];
    setVariantId(firstVar ? firstVar.id : '');

    const matchingPlans = activePlans.filter((p) => p.productId === newProductId);
    if (matchingPlans.length > 0) {
      setPlanId(matchingPlans[0].id);
      setUnitPrice(matchingPlans[0].price.toString());
    } else {
      setPlanId('');
      setUnitPrice(prod ? prod.salesPrice.toString() : '0');
    }
  };

  const handlePlanChange = (newPlanId: string) => {
    setPlanId(newPlanId);
    const plan = plans.find((p) => p.id === newPlanId);
    if (plan) {
      setUnitPrice(plan.price.toString());
      if (plan.variantId) {
        setVariantId(plan.variantId);
      }
    }
  };

  if (!isOpen) return null;

  const parsedQty = parseInt(quantity, 10) || 1;
  const parsedPrice = parseFloat(unitPrice) || 0;
  const totalAmount = parsedQty * parsedPrice;

  // Next billing date preview
  const frequency = selectedPlan?.billingFrequency || 'Monthly';
  const computedNextBilling = startDate
    ? calculateNextBillingDate(startDate, frequency)
    : '—';

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customerId = 'Customer is required.';
    }
    if (!productId) {
      newErrors.productId = 'Product is required.';
    }
    if (!planId) {
      newErrors.planId = 'Subscription plan is required.';
    }
    if (!quantity.trim() || parsedQty < 1) {
      newErrors.quantity = 'Quantity must be at least 1.';
    }
    if (!unitPrice.trim() || parsedPrice < 0 || isNaN(parsedPrice)) {
      newErrors.unitPrice = 'Price must be a non-negative number.';
    }
    if (!startDate) {
      newErrors.startDate = 'Start date is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      customerId: true,
      productId: true,
      planId: true,
      quantity: true,
      unitPrice: true,
      startDate: true,
    });

    if (validate()) {
      const selectedVariant = selectedProduct?.variants.find((v) => v.id === variantId);
      const linkedQuote = quotations.find((q) => q.id === selectedQuoteId);

      onSubmit({
        customerId,
        customerName: selectedCustomer ? selectedCustomer.name : 'Unknown Customer',
        customerCompany: selectedCustomer ? selectedCustomer.company : 'Unknown Company',
        customerEmail: selectedCustomer ? selectedCustomer.email : '',
        productId,
        productName: selectedProduct ? selectedProduct.name : 'Unknown Product',
        variantId: variantId || undefined,
        variantName: selectedVariant ? selectedVariant.name : undefined,
        planId,
        planName: selectedPlan ? selectedPlan.name : 'Custom Plan',
        billingFrequency: frequency,
        unitPrice: parsedPrice,
        quantity: parsedQty,
        startDate,
        status,
        linkedQuotationId: selectedQuoteId || undefined,
        linkedQuotationNumber: linkedQuote?.quotationNumber || undefined,
        notes: notes.trim(),
      });
    }
  };

  const isEditing = !!subscriptionToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#102B4E] text-[#10B981] flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#102B4E]">
                {isEditing ? `Edit Subscription ${subscriptionToEdit.subscriptionNumber}` : 'Initiate Recurring Subscription'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEditing
                  ? 'Update seat quantity, plan cadence, and billing schedules'
                  : 'Configure recurring contract terms, billing intervals, and customer seat allocations'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* OPTIONAL: Source From Accepted Quotation */}
          {!isEditing && acceptedQuotations.length > 0 && (
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#102B4E] flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Convert From Accepted Commercial Quotation (Optional)</span>
                </span>
                <span className="text-[10px] text-blue-700 font-mono">
                  {acceptedQuotations.length} available
                </span>
              </div>
              <select
                value={selectedQuoteId}
                onChange={(e) => handleSelectQuote(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
              >
                <option value="">Do not link a quotation (Custom setup)</option>
                {acceptedQuotations.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.quotationNumber} — {q.customerCompany} (${q.totalAmount.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Customer Selection & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Customer Account <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
              {touched.customerId && errors.customerId && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.customerId}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionLifecycleStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
              >
                <option value="active">Active (Billable)</option>
                <option value="confirmed">Confirmed</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Product & Variant Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Active Product <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
              >
                <option value="">Select product...</option>
                {activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {touched.productId && errors.productId && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.productId}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Product Variant <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                disabled={!selectedProduct || selectedProduct.variants.length === 0}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#102B4E] disabled:opacity-50"
              >
                <option value="">Base Product (No variant addition)</option>
                {selectedProduct?.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (+${v.additionalPrice})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subscription Plan Selection */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <label className="block text-[11px] font-semibold text-slate-700">
              Active Subscription Plan <span className="text-[#EF4444]">*</span>
            </label>
            <select
              value={planId}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
            >
              <option value="">Select subscription tier...</option>
              {availablePlansForProduct.length > 0 ? (
                availablePlansForProduct.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${p.price.toFixed(2)} / {p.billingFrequency}
                  </option>
                ))
              ) : (
                activePlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.productName}) — ${p.price.toFixed(2)} / {p.billingFrequency}
                  </option>
                ))
              )}
            </select>
            {touched.planId && errors.planId && (
              <div className="flex items-center gap-1 text-[#EF4444] text-[10px]">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.planId}</span>
              </div>
            )}
            {selectedPlan && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                <span>Cadence: {selectedPlan.billingFrequency}</span>
                <span>
                  Governance: {selectedPlan.settings.allowPause ? 'Pause allowed' : 'No pause'} ·{' '}
                  {selectedPlan.settings.allowRenewal ? 'Auto-renew on' : 'Manual'}
                </span>
              </div>
            )}
          </div>

          {/* Quantity, Unit Price & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Quantity (Seats/Units) <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
              />
              {touched.quantity && errors.quantity && (
                <div className="text-[10px] text-[#EF4444] mt-1">{errors.quantity}</div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Unit Recurring Price ($) <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
                />
              </div>
              {touched.unitPrice && errors.unitPrice && (
                <div className="text-[10px] text-[#EF4444] mt-1">{errors.unitPrice}</div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Contract Start Date <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
              />
            </div>
          </div>

          {/* CALCULATED SCHEDULE & TOTAL AMOUNT BOX */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#102B4E]">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Next Billing Scheduled: {computedNextBilling}</span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Calculated cycle interval: {frequency} ({parsedQty} unit{parsedQty > 1 ? 's' : ''} × ${parsedPrice.toFixed(2)})
              </p>
            </div>

            <div className="text-right">
              <div className="text-base font-bold font-mono text-[#102B4E] tabular-nums">
                ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Recurring charge per {frequency.toLowerCase()}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Internal Subscription Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Operational notes, custom SLA agreements, or provisioning identifiers..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
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
              {isEditing ? 'Save Subscription Changes' : 'Confirm & Create Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
