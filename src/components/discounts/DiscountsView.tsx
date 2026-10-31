import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Search,
  Filter,
  Plus,
  Percent,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Pencil,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { DiscountCode, DiscountFormData, DiscountStatus } from '../../types/discount';
import { INITIAL_DISCOUNTS } from '../../data/mockDiscounts';
import { DiscountModal } from './DiscountModal';
import { DeleteDiscountDialog } from './DeleteDiscountDialog';
import { getDiscountStatus, validateDiscount } from '../../utils/discountValidator';

interface DiscountsViewProps {
  onShowToast: (msg: string) => void;
}

export const DiscountsView: React.FC<DiscountsViewProps> = ({ onShowToast }) => {
  // Load discounts from localStorage
  const [discounts, setDiscounts] = useState<DiscountCode[]>(() => {
    try {
      const stored = localStorage.getItem('subscriptnova_discounts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load discounts from storage', e);
    }
    return INITIAL_DISCOUNTS;
  });

  // Save discounts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('subscriptnova_discounts', JSON.stringify(discounts));
    } catch (e) {
      console.error('Failed to persist discounts', e);
    }
  }, [discounts]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discountToEdit, setDiscountToEdit] = useState<DiscountCode | null>(null);
  const [discountToDelete, setDiscountToDelete] = useState<DiscountCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Live Playground Validator State
  const [testCodeInput, setTestCodeInput] = useState('WELCOME20');
  const [testSubtotalInput, setTestSubtotalInput] = useState<number>(349.0);
  const [testValidationResult, setTestValidationResult] = useState<{
    tested: boolean;
    valid?: boolean;
    message?: string;
    amount?: number;
  }>({ tested: false });

  // Calculate statistics
  const stats = useMemo(() => {
    let activeCount = 0;
    let expiredCount = 0;
    let inactiveCount = 0;
    let totalRedemptions = 0;

    discounts.forEach((d) => {
      const st = getDiscountStatus(d);
      if (st === 'active') activeCount++;
      else if (st === 'expired') expiredCount++;
      else inactiveCount++;

      totalRedemptions += d.usedCount;
    });

    return {
      total: discounts.length,
      activeCount,
      expiredCount,
      inactiveCount,
      totalRedemptions,
    };
  }, [discounts]);

  // Filtered discounts
  const filteredDiscounts = useMemo(() => {
    return discounts.filter((d) => {
      const status = getDiscountStatus(d);
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = d.code.toLowerCase().includes(q);
        const matchDesc = d.description.toLowerCase().includes(q);
        if (!matchCode && !matchDesc) return false;
      }
      return true;
    });
  }, [discounts, statusFilter, typeFilter, searchQuery]);

  // Create or Update Discount
  const handleSaveDiscount = (formData: DiscountFormData, discountId?: string) => {
    if (discountId) {
      // Edit
      const updated = discounts.map((d) => {
        if (d.id === discountId) {
          return {
            ...d,
            ...formData,
          };
        }
        return d;
      });
      setDiscounts(updated);
      onShowToast(`Discount code ${formData.code} updated successfully.`);
    } else {
      // Create new
      const newDiscount: DiscountCode = {
        id: `disc-${Date.now()}`,
        ...formData,
        usedCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setDiscounts([newDiscount, ...discounts]);
      onShowToast(`Discount code ${newDiscount.code} created successfully.`);
    }
    setDiscountToEdit(null);
  };

  // Toggle Active/Inactive
  const handleToggleActive = (discount: DiscountCode) => {
    const updated = discounts.map((d) => {
      if (d.id === discount.id) {
        return {
          ...d,
          isActive: !d.isActive,
        };
      }
      return d;
    });
    setDiscounts(updated);
    onShowToast(`Discount ${discount.code} is now ${!discount.isActive ? 'Active' : 'Disabled'}.`);
  };

  // Delete Discount
  const handleDeleteDiscount = (discountId: string) => {
    const target = discounts.find((d) => d.id === discountId);
    setDiscounts(discounts.filter((d) => d.id !== discountId));
    onShowToast(`Discount ${target?.code || ''} removed.`);
  };

  // Copy Code to Clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    onShowToast(`Code "${code}" copied to clipboard.`);
  };

  // Run Test Validation
  const handleRunValidationTest = () => {
    const result = validateDiscount(testCodeInput, testSubtotalInput, discounts);
    if (result.isValid && result.discount) {
      setTestValidationResult({
        tested: true,
        valid: true,
        amount: result.discountAmount,
        message: `Valid coupon! Applies ${
          result.discount.type === 'percentage'
            ? `${result.discount.value}%`
            : `$${result.discount.value.toFixed(2)}`
        } reduction (-$${result.discountAmount?.toFixed(2)} savings).`,
      });
    } else {
      setTestValidationResult({
        tested: true,
        valid: false,
        message: result.error || 'Invalid discount code.',
      });
    }
  };

  const getStatusBadge = (discount: DiscountCode) => {
    const status = getDiscountStatus(discount);
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E2F4F0] text-[#0A3D4A] border border-[#98D8D0]">
            <CheckCircle2 className="w-3 h-3 text-[#1D8B94]" />
            <span>Active</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Expired / Max</span>
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <span>Disabled</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1D8B94]">
            <span className="w-2 h-2 rounded-full bg-[#1D8B94]" />
            <span>Promotional Engine & Pricing Rules</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#04222B] mt-1 tracking-tight">
            Discounts & Coupons
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Configure percentage-based and fixed rate coupons, set validity ranges, restrict usage limits, and apply reductions to invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setDiscountToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#E2F4F0]" />
            <span>Create Discount</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Codes */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Discount Codes
            </span>
            <span className="p-2 rounded-xl bg-[#E2F4F0] text-[#1D8B94]">
              <Tag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#04222B] tracking-tight">
            {stats.total}
          </div>
          <div className="mt-1 text-xs text-slate-500">Across all campaigns</div>
        </div>

        {/* Active Codes */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active & Valid
            </span>
            <span className="p-2 rounded-xl bg-[#E2F4F0] text-[#1D8B94]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1D8B94] tracking-tight">
            {stats.activeCount}
          </div>
          <div className="mt-1 text-xs text-[#1D8B94] font-medium">
            Available at checkout
          </div>
        </div>

        {/* Total Times Redeemed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Redemptions
            </span>
            <span className="p-2 rounded-xl bg-[#E2F4F0] text-[#10606F]">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#04222B] tracking-tight">
            {stats.totalRedemptions}
          </div>
          <div className="mt-1 text-xs text-slate-500">Applied across invoices</div>
        </div>

        {/* Expired / Disabled */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inactive / Expired
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 tracking-tight">
            {stats.expiredCount + stats.inactiveCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {stats.expiredCount} expired · {stats.inactiveCount} disabled
          </div>
        </div>
      </div>

      {/* Live Coupon Validation Playground Bar */}
      <div className="bg-[#04222B] rounded-2xl p-4.5 sm:p-5 text-white border border-[#0A3D4A] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-md">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4FB8B4]">
              <Sparkles className="w-4 h-4" />
              <span>Discount Code Verification Playground</span>
            </div>
            <p className="text-xs text-[#98D8D0]/80 mt-1">
              Test how discount rules evaluate customer orders before applying them to billing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <input
                type="text"
                value={testCodeInput}
                onChange={(e) => setTestCodeInput(e.target.value.toUpperCase())}
                placeholder="Code (e.g. WELCOME20)"
                className="w-36 text-xs font-mono font-bold px-3 py-2 rounded-xl bg-[#0A3D4A] border border-[#10606F] text-white placeholder-[#98D8D0]/40 focus:outline-none focus:border-[#4FB8B4]"
              />
            </div>

            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#98D8D0]/60 text-xs">
                $
              </span>
              <input
                type="number"
                step="1"
                min="1"
                value={testSubtotalInput}
                onChange={(e) => setTestSubtotalInput(parseFloat(e.target.value) || 0)}
                placeholder="Order Subtotal"
                className="w-32 text-xs font-semibold pl-6 pr-3 py-2 rounded-xl bg-[#0A3D4A] border border-[#10606F] text-white placeholder-[#98D8D0]/40 focus:outline-none focus:border-[#4FB8B4]"
              />
            </div>

            <button
              onClick={handleRunValidationTest}
              className="px-4 py-2 text-xs font-semibold text-[#04222B] bg-[#4FB8B4] hover:bg-[#98D8D0] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Verify Code
            </button>
          </div>
        </div>

        {/* Validation Result Display */}
        {testValidationResult.tested && (
          <div
            className={`mt-3.5 p-3 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in duration-150 ${
              testValidationResult.valid
                ? 'bg-[#1D8B94]/30 border border-[#4FB8B4]/50 text-[#E2F4F0]'
                : 'bg-red-500/20 border border-red-500/40 text-red-200'
            }`}
          >
            {testValidationResult.valid ? (
              <CheckCircle2 className="w-4 h-4 text-[#4FB8B4] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{testValidationResult.message}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by coupon code, description..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#1D8B94] focus:ring-1 focus:ring-[#1D8B94] text-[#04222B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#04222B] focus:outline-none focus:border-[#1D8B94] cursor-pointer"
          >
            <option value="all">All Statuses ({discounts.length})</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired</option>
            <option value="inactive">Disabled</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#04222B] focus:outline-none focus:border-[#1D8B94] cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Reduction Value</th>
                <th className="py-3 px-4">Eligibility / Min Spend</th>
                <th className="py-3 px-4">Validity Window</th>
                <th className="py-3 px-4">Usage Count</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">No discount codes match your criteria</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Create a new discount code or clear active filters
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((d) => (
                  <tr key={d.id} className="hover:bg-[#E2F4F0]/20 transition-colors">
                    {/* Code */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs bg-[#E2F4F0] text-[#0A3D4A] px-2 py-0.5 rounded-lg border border-[#98D8D0]/60 tracking-wider">
                          {d.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(d.code)}
                          className="p-1 text-slate-400 hover:text-[#1D8B94] rounded transition-colors cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedCode === d.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-[#04222B] truncate">{d.description}</div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        Applies to: {d.applicableTo}
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1D8B94] flex items-center gap-1">
                        {d.type === 'percentage' ? (
                          <>
                            <span>{d.value}% OFF</span>
                            {d.maxDiscountAmount && (
                              <span className="text-[10px] text-slate-500 font-normal">
                                (Cap: ${d.maxDiscountAmount})
                              </span>
                            )}
                          </>
                        ) : (
                          <span>${d.value.toFixed(2)} OFF</span>
                        )}
                      </div>
                    </td>

                    {/* Eligibility / Min Spend */}
                    <td className="py-3 px-4">
                      {d.minOrderAmount ? (
                        <span className="text-slate-700 font-medium">
                          Min ${d.minOrderAmount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">No minimum</span>
                      )}
                    </td>

                    {/* Validity Window */}
                    <td className="py-3 px-4">
                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{d.startDate} to {d.expiryDate}</span>
                      </div>
                    </td>

                    {/* Usage Count */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#1D8B94] h-1.5 rounded-full"
                            style={{
                              width: d.maxUses
                                ? `${Math.min(100, (d.usedCount / d.maxUses) * 100)}%`
                                : '30%',
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-slate-600">
                          {d.usedCount}
                          {d.maxUses ? ` / ${d.maxUses}` : ''}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">{getStatusBadge(d)}</td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle active switch */}
                        <button
                          onClick={() => handleToggleActive(d)}
                          className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                            d.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Toggle active status"
                        >
                          {d.isActive ? 'Active' : 'Disabled'}
                        </button>

                        <button
                          onClick={() => {
                            setDiscountToEdit(d);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#1D8B94] hover:bg-[#E2F4F0] rounded-lg transition-colors cursor-pointer"
                          title="Edit Discount"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDiscountToDelete(d)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Discount"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <DiscountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDiscountToEdit(null);
        }}
        onSave={handleSaveDiscount}
        discountToEdit={discountToEdit}
        existingDiscounts={discounts}
      />

      {/* Delete Dialog */}
      <DeleteDiscountDialog
        discount={discountToDelete}
        isOpen={!!discountToDelete}
        onClose={() => setDiscountToDelete(null)}
        onConfirm={handleDeleteDiscount}
      />
    </div>
  );
};
