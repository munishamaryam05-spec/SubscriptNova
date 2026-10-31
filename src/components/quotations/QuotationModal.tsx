import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Plus,
  Trash2,
  AlertCircle,
  Building,
  Calendar,
  CheckCircle2,
  DollarSign,
  Percent,
  Layers,
  Package,
  FileText,
  Send,
  Save,
} from 'lucide-react';
import {
  DiscountType,
  Quotation,
  QuotationFormData,
  QuotationLineItem,
  QuotationStatus,
} from '../../types/quotation';
import { Customer } from '../../types/customer';
import { Product } from '../../types/product';
import { SubscriptionPlan } from '../../types/plan';
import { INITIAL_CUSTOMERS } from '../../data/mockCustomers';
import { INITIAL_PRODUCTS } from '../../data/mockProducts';
import { INITIAL_PLANS } from '../../data/mockPlans';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuotationFormData, sendImmediately?: boolean) => void;
  quotationToEdit?: Quotation | null;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  quotationToEdit,
}) => {
  // Load master data (active only for new selections)
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

  // Only active products and active plans can be selected for new line items
  const activeProducts = products.filter((p) => p.status === 'active');
  const activePlans = plans.filter((p) => p.status === 'active');

  const [customerId, setCustomerId] = useState('');
  const [quotationDate, setQuotationDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<QuotationLineItem[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('0');
  const [taxRate, setTaxRate] = useState<string>('10');
  const [status, setStatus] = useState<QuotationStatus>('draft');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (quotationToEdit) {
      setCustomerId(quotationToEdit.customerId);
      setQuotationDate(quotationToEdit.quotationDate);
      setValidUntil(quotationToEdit.validUntil);
      setItems([...quotationToEdit.items]);
      setDiscountType(quotationToEdit.discountType);
      setDiscountValue(quotationToEdit.discountValue.toString());
      setTaxRate(quotationToEdit.taxRate.toString());
      setStatus(quotationToEdit.status);
      setNotes(quotationToEdit.notes || '');
      setTerms(quotationToEdit.terms || '');
    } else {
      const defaultCust = customers[0];
      setCustomerId(defaultCust ? defaultCust.id : '');

      const today = new Date().toISOString().split('T')[0];
      setQuotationDate(today);

      const validity = new Date();
      validity.setDate(validity.getDate() + 30);
      setValidUntil(validity.toISOString().split('T')[0]);

      // Initialize with one default line item
      const defaultProd = activeProducts[0];
      const initialItem: QuotationLineItem = {
        id: `item-${Date.now()}-1`,
        productId: defaultProd ? defaultProd.id : '',
        productName: defaultProd ? defaultProd.name : '',
        variantId: defaultProd?.variants[0]?.id || undefined,
        variantName: defaultProd?.variants[0]?.name || undefined,
        quantity: 1,
        unitPrice: defaultProd ? defaultProd.salesPrice : 0,
        totalPrice: defaultProd ? defaultProd.salesPrice : 0,
      };
      setItems([initialItem]);
      setDiscountType('percentage');
      setDiscountValue('0');
      setTaxRate('10');
      setStatus('draft');
      setNotes('Thank you for considering SubscriptNova for your revenue automation operations.');
      setTerms('Payment due within 30 days of acceptance. Master Services Agreement terms apply.');
    }
    setErrors({});
    setTouched({});
  }, [quotationToEdit, isOpen, customers, activeProducts]);

  if (!isOpen) return null;

  // Real-time calculations
  const subtotal = items.reduce((acc, it) => acc + (it.totalPrice || 0), 0);
  const parsedDiscountVal = parseFloat(discountValue) || 0;
  const discountAmount =
    discountType === 'percentage'
      ? (subtotal * Math.min(parsedDiscountVal, 100)) / 100
      : Math.min(parsedDiscountVal, subtotal);
  const netAmount = Math.max(0, subtotal - discountAmount);
  const parsedTaxRate = parseFloat(taxRate) || 0;
  const taxAmount = (netAmount * Math.max(0, parsedTaxRate)) / 100;
  const finalTotal = netAmount + taxAmount;

  const handleAddItem = () => {
    const defaultProd = activeProducts[0];
    const newItem: QuotationLineItem = {
      id: `item-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
      productId: defaultProd ? defaultProd.id : '',
      productName: defaultProd ? defaultProd.name : '',
      variantId: defaultProd?.variants[0]?.id || undefined,
      variantName: defaultProd?.variants[0]?.name || undefined,
      quantity: 1,
      unitPrice: defaultProd ? defaultProd.salesPrice : 0,
      totalPrice: defaultProd ? defaultProd.salesPrice : 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      alert('A quotation must contain at least one line item.');
      return;
    }
    setItems(items.filter((it) => it.id !== id));
  };

  const handleItemProductChange = (itemId: string, newProdId: string) => {
    const prod = products.find((p) => p.id === newProdId);
    setItems(
      items.map((it) => {
        if (it.id === itemId) {
          const firstVar = prod?.variants[0];
          const newPrice = prod
            ? prod.salesPrice + (firstVar ? firstVar.additionalPrice : 0)
            : 0;
          return {
            ...it,
            productId: newProdId,
            productName: prod ? prod.name : '',
            variantId: firstVar ? firstVar.id : undefined,
            variantName: firstVar ? firstVar.name : undefined,
            planId: undefined,
            planName: undefined,
            planFrequency: undefined,
            unitPrice: newPrice,
            totalPrice: newPrice * it.quantity,
          };
        }
        return it;
      })
    );
  };

  const handleItemVariantChange = (itemId: string, newVarId: string) => {
    setItems(
      items.map((it) => {
        if (it.id === itemId) {
          const prod = products.find((p) => p.id === it.productId);
          const v = prod?.variants.find((variant) => variant.id === newVarId);
          const basePrice = prod ? prod.salesPrice : 0;
          const varPrice = v ? v.additionalPrice : 0;
          const newPrice = basePrice + varPrice;
          return {
            ...it,
            variantId: newVarId || undefined,
            variantName: v ? v.name : undefined,
            unitPrice: newPrice,
            totalPrice: newPrice * it.quantity,
          };
        }
        return it;
      })
    );
  };

  const handleItemPlanChange = (itemId: string, newPlanId: string) => {
    setItems(
      items.map((it) => {
        if (it.id === itemId) {
          const plan = plans.find((pl) => pl.id === newPlanId);
          if (plan) {
            return {
              ...it,
              planId: plan.id,
              planName: plan.name,
              planFrequency: plan.billingFrequency,
              unitPrice: plan.price,
              totalPrice: plan.price * it.quantity,
            };
          } else {
            return {
              ...it,
              planId: undefined,
              planName: undefined,
              planFrequency: undefined,
            };
          }
        }
        return it;
      })
    );
  };

  const handleItemQuantityChange = (itemId: string, qtyStr: string) => {
    const qty = Math.max(1, parseInt(qtyStr, 10) || 1);
    setItems(
      items.map((it) => {
        if (it.id === itemId) {
          return {
            ...it,
            quantity: qty,
            totalPrice: it.unitPrice * qty,
          };
        }
        return it;
      })
    );
  };

  const handleItemPriceChange = (itemId: string, priceStr: string) => {
    const price = Math.max(0, parseFloat(priceStr) || 0);
    setItems(
      items.map((it) => {
        if (it.id === itemId) {
          return {
            ...it,
            unitPrice: price,
            totalPrice: price * it.quantity,
          };
        }
        return it;
      })
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customerId = 'Customer selection is required.';
    }

    if (!quotationDate) {
      newErrors.quotationDate = 'Quotation date is required.';
    }

    if (!validUntil) {
      newErrors.validUntil = 'Validity expiration date is required.';
    } else if (quotationDate && new Date(validUntil) < new Date(quotationDate)) {
      newErrors.validUntil = 'Valid until date cannot be earlier than quotation date.';
    }

    if (items.length === 0) {
      newErrors.items = 'At least one line item is required.';
    } else {
      const hasInvalidItem = items.some((it) => !it.productId || it.quantity < 1 || it.unitPrice < 0);
      if (hasInvalidItem) {
        newErrors.items = 'All line items must have a product, quantity >= 1, and non-negative price.';
      }
    }

    if (discountType === 'percentage') {
      if (parsedDiscountVal < 0 || parsedDiscountVal > 100) {
        newErrors.discount = 'Discount percentage must be between 0 and 100%.';
      }
    } else {
      if (parsedDiscountVal < 0) {
        newErrors.discount = 'Fixed discount cannot be negative.';
      }
    }

    if (parsedTaxRate < 0) {
      newErrors.taxRate = 'Tax rate cannot be negative.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (sendImmediately = false) => {
    setTouched({
      customerId: true,
      quotationDate: true,
      validUntil: true,
      items: true,
    });

    if (validate()) {
      const selectedCustomer = customers.find((c) => c.id === customerId);
      const nextStatus: QuotationStatus = sendImmediately
        ? 'sent'
        : quotationToEdit
        ? status
        : 'draft';

      onSubmit(
        {
          customerId,
          customerName: selectedCustomer ? selectedCustomer.name : 'Unknown Customer',
          customerCompany: selectedCustomer ? selectedCustomer.company : 'Unknown Company',
          customerEmail: selectedCustomer ? selectedCustomer.email : '',
          quotationDate,
          validUntil,
          items,
          discountType,
          discountValue: parsedDiscountVal,
          taxRate: parsedTaxRate,
          status: nextStatus,
          notes: notes.trim(),
          terms: terms.trim(),
        },
        sendImmediately
      );
    }
  };

  const isEditing = !!quotationToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#102B4E] text-[#10B981] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#102B4E]">
                {isEditing ? `Edit Quotation ${quotationToEdit.quotationNumber}` : 'Create Commercial Quotation'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEditing
                  ? 'Update line items, negotiated discounts, and validity schedules'
                  : 'Draft customized enterprise proposals with automated tax & line pricing'}
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
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Top Row: Customer & Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Select Customer <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
              >
                <option value="">Select a customer...</option>
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
                Quotation Date <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Valid Until <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className={`w-full px-3 py-2 bg-white border rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#102B4E] ${
                  touched.validUntil && errors.validUntil ? 'border-[#EF4444]' : 'border-slate-200'
                }`}
              />
              {touched.validUntil && errors.validUntil && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.validUntil}</span>
                </div>
              )}
            </div>
          </div>

          {/* LINE ITEMS TABLE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#102B4E] uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Quotation Line Items ({items.length})</span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  Select active products, optional variants, or associated recurring subscription plans.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-[#102B4E] bg-[#102B4E]/10 hover:bg-[#102B4E]/15 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Add Item</span>
              </button>
            </div>

            {errors.items && (
              <div className="flex items-center gap-1 text-[#EF4444] text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.items}</span>
              </div>
            )}

            {/* Line Items List */}
            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                const hasVariants = prod && prod.variants.length > 0;
                // Matching plans for this product
                const relatedPlans = activePlans.filter((pl) => pl.productId === item.productId);

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        ITEM #{idx + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-[#EF4444] p-1 rounded hover:bg-red-50 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      {/* Product Selector */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Product *
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemProductChange(item.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
                        >
                          <option value="">Select product...</option>
                          {activeProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.salesPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Variant Selector */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Variant (Optional)
                        </label>
                        <select
                          value={item.variantId || ''}
                          onChange={(e) => handleItemVariantChange(item.id, e.target.value)}
                          disabled={!hasVariants}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#102B4E] disabled:opacity-50"
                        >
                          <option value="">Base Product</option>
                          {prod?.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name} (+${v.additionalPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Associated Plan Selector */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Plan Tier (Optional)
                        </label>
                        <select
                          value={item.planId || ''}
                          onChange={(e) => handleItemPlanChange(item.id, e.target.value)}
                          disabled={relatedPlans.length === 0}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#102B4E] disabled:opacity-50"
                        >
                          <option value="">No Plan Tier</option>
                          {relatedPlans.map((pl) => (
                            <option key={pl.id} value={pl.id}>
                              {pl.name} (${pl.price}/{pl.billingFrequency})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quantity & Unit Price & Line Total */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemQuantityChange(item.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Unit Price ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemPriceChange(item.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Line Total
                        </label>
                        <div className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold text-[#102B4E] tabular-nums">
                          ${(item.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DISCOUNTS & TAX CONFIGURATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Discount Inputs */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-[#102B4E] uppercase tracking-wider block">
                Commercial Discount
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[11px]">
                    {discountType === 'percentage' ? '%' : '$'}
                  </span>
                </div>
              </div>
              {errors.discount && (
                <div className="text-[10px] text-[#EF4444]">{errors.discount}</div>
              )}
            </div>

            {/* Tax Rate */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-[#102B4E] uppercase tracking-wider block">
                Applicable Tax / VAT (%)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono font-bold"
                />
                <span className="font-mono text-slate-500 font-semibold">%</span>
              </div>
              {errors.taxRate && (
                <div className="text-[10px] text-[#EF4444]">{errors.taxRate}</div>
              )}
            </div>
          </div>

          {/* NOTES & TERMS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Proposal Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Custom introductory notes or scope inclusions..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E] resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Terms & Commercial Conditions
              </label>
              <textarea
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Payment terms, cancellation window, SLAs..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E] resize-none"
              />
            </div>
          </div>

          {/* LIVE SUMMARY TOTALS BOX */}
          <div className="p-4 rounded-xl bg-[#102B4E]/5 border border-[#102B4E]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <span className="font-semibold text-[#102B4E]">SubscriptNova Commercial Engine</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Line Items: {items.length} · Pricing snapshotted on quotation generation
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-1 text-right font-mono text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#10B981] font-semibold">
                  <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : '$'}):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Tax / VAT ({taxRate}%):</span>
                <span>+${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#102B4E] pt-1.5 border-t border-slate-300">
                <span>Total Amount:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>Save as Draft</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{isEditing ? 'Save Quotation Changes' : 'Create & Mark Sent'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
