import React, { useState, useEffect } from 'react';
import { X, Percent, DollarSign, Calendar, AlertCircle, Tag, CheckCircle2 } from 'lucide-react';
import { DiscountCode, DiscountFormData, DiscountType } from '../../types/discount';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: DiscountFormData, discountId?: string) => void;
  discountToEdit: DiscountCode | null;
  existingDiscounts: DiscountCode[];
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  discountToEdit,
  existingDiscounts,
}) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DiscountType>('percentage');
  const [value, setValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number | undefined>(undefined);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [maxUses, setMaxUses] = useState<number | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);
  const [applicableTo, setApplicableTo] = useState<'all' | 'plans' | 'products'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (discountToEdit) {
      setCode(discountToEdit.code);
      setDescription(discountToEdit.description);
      setType(discountToEdit.type);
      setValue(discountToEdit.value);
      setMinOrderAmount(discountToEdit.minOrderAmount);
      setMaxDiscountAmount(discountToEdit.maxDiscountAmount);
      setStartDate(discountToEdit.startDate);
      setExpiryDate(discountToEdit.expiryDate);
      setMaxUses(discountToEdit.maxUses);
      setIsActive(discountToEdit.isActive);
      setApplicableTo(discountToEdit.applicableTo);
    } else {
      setCode('');
      setDescription('');
      setType('percentage');
      setValue(10);
      setMinOrderAmount(undefined);
      setMaxDiscountAmount(undefined);
      setStartDate(new Date().toISOString().split('T')[0]);
      setExpiryDate('2026-12-31');
      setMaxUses(undefined);
      setIsActive(true);
      setApplicableTo('all');
    }
    setError(null);
  }, [discountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '_');

    if (!cleanCode) {
      setError('Please provide a coupon / discount code.');
      return;
    }

    // Check for duplicate code
    const isDuplicate = existingDiscounts.some(
      (d) => d.code === cleanCode && (!discountToEdit || d.id !== discountToEdit.id)
    );
    if (isDuplicate) {
      setError(`A discount code "${cleanCode}" already exists.`);
      return;
    }

    if (value <= 0) {
      setError('Discount value must be greater than 0.');
      return;
    }

    if (type === 'percentage' && value > 100) {
      setError('Percentage discount cannot exceed 100%.');
      return;
    }

    if (startDate && expiryDate && startDate > expiryDate) {
      setError('Start date cannot be later than expiry date.');
      return;
    }

    onSave(
      {
        code: cleanCode,
        description: description.trim(),
        type,
        value: Number(value),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        startDate,
        expiryDate,
        maxUses: maxUses ? Number(maxUses) : undefined,
        isActive,
        applicableTo,
      },
      discountToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04222B]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#04222B] px-6 py-4.5 flex items-center justify-between text-white border-b border-[#0A3D4A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0A3D4A] border border-[#10606F] flex items-center justify-center text-[#4FB8B4]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {discountToEdit ? 'Edit Discount Code' : 'Create New Discount Code'}
              </h2>
              <p className="text-xs text-[#98D8D0]/70">
                Configure promotional coupons and contract rate reductions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#0A3D4A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Code & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
                Discount Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME20"
                className="w-full text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] focus:ring-1 focus:ring-[#1D8B94] text-[#04222B] tracking-wider"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('percentage')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    type === 'percentage'
                      ? 'bg-[#E2F4F0] border-[#1D8B94] text-[#0A3D4A]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Percentage</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('fixed')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    type === 'fixed'
                      ? 'bg-[#E2F4F0] border-[#1D8B94] text-[#0A3D4A]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Fixed Amount</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
              Description / Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 20% off for first-time customer onboarding"
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] focus:ring-1 focus:ring-[#1D8B94] text-[#04222B]"
              required
            />
          </div>

          {/* Value & Min Order Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
                {type === 'percentage' ? 'Percentage Value (%)' : 'Fixed Amount ($)'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  {type === 'percentage' ? '%' : '$'}
                </span>
                <input
                  type="number"
                  step={type === 'percentage' ? '1' : '0.01'}
                  min="0.01"
                  max={type === 'percentage' ? '100' : undefined}
                  value={value || ''}
                  onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] focus:ring-1 focus:ring-[#1D8B94] text-[#04222B]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
                Minimum Spend ($) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minOrderAmount ?? ''}
                  onChange={(e) =>
                    setMinOrderAmount(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="0.00 (No minimum)"
                  className="w-full text-xs font-semibold pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] focus:ring-1 focus:ring-[#1D8B94] text-[#04222B]"
                />
              </div>
            </div>
          </div>

          {/* Dates: Start & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] text-[#04222B]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] text-[#04222B]"
                required
              />
            </div>
          </div>

          {/* Usage Limit & Applicable To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
                Usage Limit <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={maxUses ?? ''}
                onChange={(e) =>
                  setMaxUses(e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                placeholder="Unlimited uses"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] text-[#04222B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
                Applicable Scope
              </label>
              <select
                value={applicableTo}
                onChange={(e) => setApplicableTo(e.target.value as 'all' | 'plans' | 'products')}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] bg-white text-[#04222B]"
              >
                <option value="all">All Subscriptions & Products</option>
                <option value="plans">Subscription Plans Only</option>
                <option value="products">One-Time Products / Add-ons</option>
              </select>
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#04222B]">Enable Discount Code</div>
              <div className="text-[11px] text-slate-500">
                When enabled, eligible customers can apply this code at checkout
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1D8B94]" />
            </label>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-[#04222B] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#E2F4F0]" />
              <span>{discountToEdit ? 'Save Changes' : 'Create Discount'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
