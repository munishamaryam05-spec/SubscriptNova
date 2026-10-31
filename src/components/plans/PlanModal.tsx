import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Edit3,
  AlertCircle,
  Calendar,
  CheckCircle2,
  DollarSign,
  Package,
  HelpCircle,
  Shield,
  RotateCcw,
  PauseCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { BillingFrequency, PlanFormData, SubscriptionPlan } from '../../types/plan';
import { Product } from '../../types/product';
import { INITIAL_PRODUCTS } from '../../data/mockProducts';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlanFormData) => void;
  planToEdit?: SubscriptionPlan | null;
}

const FREQUENCIES: BillingFrequency[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

export const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  planToEdit,
}) => {
  // Load products from localStorage or mock
  const [products] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('subscriptnova_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  const [name, setName] = useState('');
  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('Monthly');
  const [price, setPrice] = useState<string>('49');
  const [minQuantity, setMinQuantity] = useState<string>('1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [description, setDescription] = useState('');

  // Subscription Settings Toggles
  const [autoClose, setAutoClose] = useState(false);
  const [allowEarlyClose, setAllowEarlyClose] = useState(true);
  const [allowPause, setAllowPause] = useState(true);
  const [allowRenewal, setAllowRenewal] = useState(true);

  // Errors & Touched
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const selectedProduct = products.find((p) => p.id === productId);

  useEffect(() => {
    if (planToEdit) {
      setName(planToEdit.name);
      setProductId(planToEdit.productId);
      setVariantId(planToEdit.variantId || '');
      setBillingFrequency(planToEdit.billingFrequency);
      setPrice(planToEdit.price.toString());
      setMinQuantity(planToEdit.minQuantity.toString());
      setStartDate(planToEdit.startDate);
      setEndDate(planToEdit.endDate || '');
      setStatus(planToEdit.status);
      setDescription(planToEdit.description || '');
      setAutoClose(planToEdit.settings.autoClose);
      setAllowEarlyClose(planToEdit.settings.allowEarlyClose);
      setAllowPause(planToEdit.settings.allowPause);
      setAllowRenewal(planToEdit.settings.allowRenewal);
    } else {
      const defaultProd = products[0];
      setName('');
      setProductId(defaultProd ? defaultProd.id : '');
      setVariantId(defaultProd?.variants[0]?.id || '');
      setBillingFrequency('Monthly');
      setPrice(defaultProd ? defaultProd.salesPrice.toString() : '49');
      setMinQuantity('1');
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setEndDate('');
      setStatus('active');
      setDescription('');
      setAutoClose(false);
      setAllowEarlyClose(true);
      setAllowPause(true);
      setAllowRenewal(true);
    }
    setErrors({});
    setTouched({});
  }, [planToEdit, isOpen, products]);

  // When product or variant selection changes in "create" mode, suggest price
  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    const prod = products.find((p) => p.id === newProductId);
    if (prod) {
      const firstVar = prod.variants[0];
      const newVarId = firstVar ? firstVar.id : '';
      setVariantId(newVarId);
      const suggestedPrice = firstVar
        ? prod.salesPrice + firstVar.additionalPrice
        : prod.salesPrice;
      setPrice(suggestedPrice.toString());
    } else {
      setVariantId('');
    }
  };

  const handleVariantChange = (newVariantId: string) => {
    setVariantId(newVariantId);
    if (selectedProduct) {
      if (!newVariantId) {
        setPrice(selectedProduct.salesPrice.toString());
      } else {
        const v = selectedProduct.variants.find((item) => item.id === newVariantId);
        if (v) {
          const suggestedPrice = selectedProduct.salesPrice + v.additionalPrice;
          setPrice(suggestedPrice.toString());
        }
      }
    }
  };

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Plan name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Plan name must be at least 2 characters.';
    }

    if (!productId) {
      newErrors.productId = 'Please select a linked product.';
    }

    if (!price.trim()) {
      newErrors.price = 'Plan price is required.';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Price must be a valid positive number.';
    }

    if (!minQuantity.trim()) {
      newErrors.minQuantity = 'Minimum quantity is required.';
    } else if (isNaN(Number(minQuantity)) || Number(minQuantity) < 1 || !Number.isInteger(Number(minQuantity))) {
      newErrors.minQuantity = 'Minimum quantity must be an integer >= 1.';
    }

    if (!startDate) {
      newErrors.startDate = 'Availability start date is required.';
    }

    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        newErrors.endDate = 'End date cannot be earlier than start date.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      productId: true,
      price: true,
      minQuantity: true,
      startDate: true,
      endDate: true,
    });

    if (validate()) {
      const prod = products.find((p) => p.id === productId);
      const variant = prod?.variants.find((v) => v.id === variantId);

      onSubmit({
        name: name.trim(),
        productId,
        productName: prod ? prod.name : 'Unknown Product',
        variantId: variantId || undefined,
        variantName: variant ? variant.name : undefined,
        billingFrequency,
        price: Number(price),
        minQuantity: parseInt(minQuantity, 10),
        startDate,
        endDate: endDate || undefined,
        settings: {
          autoClose,
          allowEarlyClose,
          allowPause,
          allowRenewal,
        },
        status,
        description: description.trim(),
      });
    }
  };

  const isEditing = !!planToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#04222B] text-[#4FB8B4] flex items-center justify-center">
              {isEditing ? <Edit3 className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#04222B]">
                {isEditing ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEditing
                  ? `Update terms, renewal schedules, and pricing for ${planToEdit.name}`
                  : 'Define a recurring billing tier linked to your product catalog'}
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
          {/* Plan Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Plan Name <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. Odoo ERP - Enterprise Yearly"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E] ${
                  touched.name && errors.name
                    ? 'border-[#EF4444] bg-red-50/20'
                    : 'border-slate-200'
                }`}
              />
              {touched.name && errors.name && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Plan Status
              </label>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    status === 'active'
                      ? 'bg-white text-[#10B981] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('inactive')}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    status === 'inactive'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Product & Variant Selection */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-[#102B4E] uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Catalog Linking</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Linked Product <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  onBlur={() => handleBlur('productId')}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.salesPrice.toFixed(2)})
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
                  onChange={(e) => handleVariantChange(e.target.value)}
                  disabled={!selectedProduct || selectedProduct.variants.length === 0}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#102B4E] disabled:opacity-50"
                >
                  <option value="">Base Product (No variant addition)</option>
                  {selectedProduct?.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (+${v.additionalPrice.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedProduct && (
              <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200/60 flex items-center justify-between font-mono">
                <span>
                  Catalog Reference: {selectedProduct.name}
                  {variantId
                    ? ` · ${selectedProduct.variants.find((v) => v.id === variantId)?.name}`
                    : ''}
                </span>
                <span className="text-[#102B4E] font-bold">
                  Suggested Base: $
                  {(
                    selectedProduct.salesPrice +
                    (selectedProduct.variants.find((v) => v.id === variantId)?.additionalPrice || 0)
                  ).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Billing Frequency, Price & Min Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Billing Frequency <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Plan Price ($) <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onBlur={() => handleBlur('price')}
                  placeholder="49.00"
                  className={`w-full pl-7 pr-3 py-2 bg-slate-50 border rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#102B4E] ${
                    touched.price && errors.price
                      ? 'border-[#EF4444] bg-red-50/20'
                      : 'border-slate-200'
                  }`}
                />
              </div>
              {touched.price && errors.price && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.price}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Minimum Quantity <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                onBlur={() => handleBlur('minQuantity')}
                placeholder="1"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#102B4E] ${
                  touched.minQuantity && errors.minQuantity
                    ? 'border-[#EF4444] bg-red-50/20'
                    : 'border-slate-200'
                }`}
              />
              {touched.minQuantity && errors.minQuantity && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.minQuantity}</span>
                </div>
              )}
            </div>
          </div>

          {/* Availability Dates: Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Availability Start Date <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onBlur={() => handleBlur('startDate')}
                className={`w-full px-3 py-2 bg-white border rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#102B4E] ${
                  touched.startDate && errors.startDate
                    ? 'border-[#EF4444] bg-red-50/20'
                    : 'border-slate-200'
                }`}
              />
              {touched.startDate && errors.startDate && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.startDate}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Availability End Date <span className="text-slate-400 font-normal">(Leave blank if ongoing)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onBlur={() => handleBlur('endDate')}
                className={`w-full px-3 py-2 bg-white border rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#102B4E] ${
                  touched.endDate && errors.endDate
                    ? 'border-[#EF4444] bg-red-50/20'
                    : 'border-slate-200'
                }`}
              />
              {touched.endDate && errors.endDate && (
                <div className="flex items-center gap-1 text-[#EF4444] text-[10px] mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.endDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Configured Subscription Settings Toggles (4 requested options) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="text-[11px] font-bold text-[#102B4E] uppercase tracking-wider">
              Subscription Lifecycle Settings
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Allow Renewal */}
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200/70 cursor-pointer hover:bg-slate-50/50">
                <input
                  type="checkbox"
                  checked={allowRenewal}
                  onChange={(e) => setAllowRenewal(e.target.checked)}
                  className="rounded text-[#102B4E] focus:ring-[#102B4E] w-4 h-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Allow Renewal</span>
                  <span className="text-[10px] text-slate-400">Automated cycle billing</span>
                </div>
              </label>

              {/* Allow Pause */}
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200/70 cursor-pointer hover:bg-slate-50/50">
                <input
                  type="checkbox"
                  checked={allowPause}
                  onChange={(e) => setAllowPause(e.target.checked)}
                  className="rounded text-[#102B4E] focus:ring-[#102B4E] w-4 h-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Allow Pause</span>
                  <span className="text-[10px] text-slate-400">Customer can pause term</span>
                </div>
              </label>

              {/* Allow Early Close */}
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200/70 cursor-pointer hover:bg-slate-50/50">
                <input
                  type="checkbox"
                  checked={allowEarlyClose}
                  onChange={(e) => setAllowEarlyClose(e.target.checked)}
                  className="rounded text-[#102B4E] focus:ring-[#102B4E] w-4 h-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Allow Early Close</span>
                  <span className="text-[10px] text-slate-400">Permit cancellation mid-cycle</span>
                </div>
              </label>

              {/* Auto-close Option */}
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200/70 cursor-pointer hover:bg-slate-50/50">
                <input
                  type="checkbox"
                  checked={autoClose}
                  onChange={(e) => setAutoClose(e.target.checked)}
                  className="rounded text-[#1D8B94] focus:ring-[#1D8B94] w-4 h-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Auto-close Option</span>
                  <span className="text-[10px] text-slate-400">Expire upon End Date</span>
                </div>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Internal Description & Terms
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of entitlements, seat allowances, and SLA inclusions for this plan tier..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1D8B94] resize-none"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {isEditing ? 'Save Plan Changes' : 'Create Subscription Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
