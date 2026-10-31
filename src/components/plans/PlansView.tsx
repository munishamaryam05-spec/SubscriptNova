import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  Trash2,
  Lock,
  Download,
  DollarSign,
  Calendar,
  Clock,
  Package,
  Sparkles,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { BillingFrequency, PlanFormData, SubscriptionPlan } from '../../types/plan';
import { INITIAL_PLANS } from '../../data/mockPlans';
import { PlanModal } from './PlanModal';
import { PlanDetailModal } from './PlanDetailModal';
import { DeletePlanDialog } from './DeletePlanDialog';

interface PlansViewProps {
  onShowToast: (message: string) => void;
}

export const PlansView: React.FC<PlansViewProps> = ({ onShowToast }) => {
  // Plans state with localStorage persistence
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      const saved = localStorage.getItem('subscriptnova_plans');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading plans from localStorage', e);
    }
    return INITIAL_PLANS;
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal management states
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<SubscriptionPlan | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<SubscriptionPlan | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

  // Sync to localStorage
  const savePlans = (newPlans: SubscriptionPlan[]) => {
    setPlans(newPlans);
    try {
      localStorage.setItem('subscriptnova_plans', JSON.stringify(newPlans));
    } catch (e) {
      console.error('Error saving plans to localStorage', e);
    }
  };

  // Filter logic
  const filteredPlans = plans.filter((p) => {
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesFrequency = frequencyFilter === 'all' ? true : p.billingFrequency === frequencyFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      p.name.toLowerCase().includes(query) ||
      p.productName.toLowerCase().includes(query) ||
      (p.variantName && p.variantName.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query));

    return matchesStatus && matchesFrequency && matchesSearch;
  });

  // Calculate dynamic metrics
  const totalPlans = plans.length;
  const activePlans = plans.filter((p) => p.status === 'active').length;
  const inactivePlans = plans.filter((p) => p.status === 'inactive').length;

  // Calculate Most Popular Billing Frequency
  const frequencyCounts: Record<BillingFrequency, number> = {
    Monthly: 0,
    Yearly: 0,
    Weekly: 0,
    Daily: 0,
  };
  plans.forEach((p) => {
    if (frequencyCounts[p.billingFrequency] !== undefined) {
      frequencyCounts[p.billingFrequency] += 1;
    }
  });

  let mostPopularFreq: BillingFrequency = 'Monthly';
  let maxCount = 0;
  (Object.keys(frequencyCounts) as BillingFrequency[]).forEach((freq) => {
    if (frequencyCounts[freq] > maxCount) {
      maxCount = frequencyCounts[freq];
      mostPopularFreq = freq;
    }
  });
  const popularPercent = totalPlans > 0 ? Math.round((maxCount / totalPlans) * 100) : 0;

  // Handlers
  const handleOpenAdd = () => {
    setPlanToEdit(null);
    setIsPlanModalOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setPlanToEdit(plan);
    setIsPlanModalOpen(true);
  };

  const handleOpenDetail = (plan: SubscriptionPlan) => {
    setSelectedPlanForDetail(plan);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleSavePlan = (formData: PlanFormData) => {
    if (planToEdit) {
      // Edit existing plan
      const updated = plans.map((p) => {
        if (p.id === planToEdit.id) {
          return {
            ...p,
            ...formData,
          };
        }
        return p;
      });
      savePlans(updated);
      onShowToast(`Updated subscription plan ${formData.name}`);
      if (selectedPlanForDetail && selectedPlanForDetail.id === planToEdit.id) {
        setSelectedPlanForDetail({
          ...selectedPlanForDetail,
          ...formData,
        });
      }
    } else {
      // Add new plan
      const newPlan: SubscriptionPlan = {
        id: `plan-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        productId: formData.productId,
        productName: formData.productName,
        variantId: formData.variantId,
        variantName: formData.variantName,
        billingFrequency: formData.billingFrequency,
        price: formData.price,
        minQuantity: formData.minQuantity,
        startDate: formData.startDate,
        endDate: formData.endDate,
        settings: formData.settings,
        status: formData.status,
        description: formData.description,
        linkedSubscriptionsCount: 0,
        dateCreated: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
      };
      savePlans([newPlan, ...plans]);
      onShowToast(`Created new plan ${formData.name} (${formData.billingFrequency})`);
    }

    setIsPlanModalOpen(false);
    setPlanToEdit(null);
  };

  const handleConfirmDelete = (planId: string) => {
    const target = plans.find((p) => p.id === planId);
    const updated = plans.filter((p) => p.id !== planId);
    savePlans(updated);
    if (selectedPlanForDetail?.id === planId) {
      setIsDetailModalOpen(false);
      setSelectedPlanForDetail(null);
    }
    onShowToast(`Deleted plan ${target ? target.name : 'tier'}`);
  };

  const handleMarkInactive = (planId: string) => {
    const updated = plans.map((p) => {
      if (p.id === planId) {
        return { ...p, status: 'inactive' as const };
      }
      return p;
    });
    savePlans(updated);
    onShowToast(`Plan marked as inactive to preserve active subscriptions`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Pricing Architecture & Cadences</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#102B4E] mt-1 tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define recurring pricing tiers, renewal intervals, minimum commitments, and governance rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                [
                  'ID,Plan Name,Linked Product,Variant,Frequency,Price,Min Qty,Start Date,End Date,Status,Subscribers',
                  ...plans.map(
                    (p) =>
                      `"${p.id}","${p.name}","${p.productName}","${p.variantName || 'Base'}","${
                        p.billingFrequency
                      }","${p.price}","${p.minQuantity}","${p.startDate}","${
                        p.endDate || 'Ongoing'
                      }","${p.status}","${p.linkedSubscriptionsCount}"`
                  ),
                ].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `subscriptnova_plans_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              onShowToast('Exported plans catalog to CSV');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Plans</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] active:bg-[#0A1C33] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Metrics Cards (4 required metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Plans */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Plans
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#102B4E]/5 flex items-center justify-center text-[#102B4E]">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#102B4E] tabular-nums mt-1">
            {totalPlans}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Configured billing tiers</div>
        </div>

        {/* Active Plans */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Plans
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#10B981] tabular-nums mt-1">
            {activePlans}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Available for new subscriptions</div>
        </div>

        {/* Inactive Plans */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Inactive Plans
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-700 tabular-nums mt-1">
            {inactivePlans}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Grandfathered or closed tiers</div>
        </div>

        {/* Most Popular Billing Frequency */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Popular Cadence
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#102B4E]/5 flex items-center justify-center text-[#102B4E]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#102B4E] tracking-tight mt-1 truncate">
            {mostPopularFreq}
          </div>
          <div className="text-[11px] text-[#10B981] font-semibold font-mono mt-1">
            {popularPercent}% of configured plans
          </div>
        </div>
      </div>

      {/* 3. Plans Table & Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/40">
          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plans by name, product, variant..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Filters: Billing Frequency + Status */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Frequency Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Frequency:</span>
              <select
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#102B4E] cursor-pointer"
              >
                <option value="all">All Frequencies</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            {/* Status Segmented Buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200/60">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-[#102B4E] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All ({totalPlans})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-white text-[#10B981] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Active ({activePlans})
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                  statusFilter === 'inactive'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Inactive ({inactivePlans})
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Linked Product & Variant</th>
                <th className="py-3 px-4">Cadence</th>
                <th className="py-3 px-4 text-right">Plan Price</th>
                <th className="py-3 px-4 text-center">Min Qty</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No subscription plans found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery || frequencyFilter !== 'all' || statusFilter !== 'all'
                        ? 'Try clearing active filters to see all plan tiers.'
                        : 'No subscription plans configured yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(plan)}
                  >
                    {/* Plan Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#102B4E] text-[#10B981] flex items-center justify-center shrink-0">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {plan.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {plan.linkedSubscriptionsCount} active subscribers
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Linked Product & Variant */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 truncate max-w-[180px]">
                        {plan.productName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {plan.variantName || 'Base Configuration'}
                      </div>
                    </td>

                    {/* Billing Frequency */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {plan.billingFrequency}
                      </span>
                    </td>

                    {/* Plan Price */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-[#102B4E] tabular-nums text-xs">
                      ${plan.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Minimum Quantity */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono text-slate-700">
                      {plan.minQuantity}
                    </td>

                    {/* Start Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {plan.startDate}
                    </td>

                    {/* End Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {plan.endDate || (
                        <span className="text-slate-400 font-sans italic text-[10px]">Ongoing</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {plan.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleOpenDetail(plan)}
                          title="View Plan Details"
                          className="p-1.5 text-slate-500 hover:text-[#102B4E] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(plan)}
                          title="Edit Plan"
                          className="p-1.5 text-slate-500 hover:text-[#102B4E] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenDelete(plan)}
                          title={
                            plan.linkedSubscriptionsCount > 0
                              ? `Locked: Used by ${plan.linkedSubscriptionsCount} active subscriptions`
                              : 'Delete Plan'
                          }
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            plan.linkedSubscriptionsCount > 0
                              ? 'text-slate-300 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-400 hover:text-[#EF4444] hover:bg-red-50'
                          }`}
                        >
                          {plan.linkedSubscriptionsCount > 0 ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-4">
          <span className="font-mono text-[11px]">
            Showing {filteredPlans.length} of {plans.length} configured plans
          </span>
          <span className="text-[11px] text-slate-400">
            Click any row to view lifecycle settings, renewal governance, and linked subscriptions
          </span>
        </div>
      </div>

      {/* Create / Edit Plan Modal */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setPlanToEdit(null);
        }}
        onSubmit={handleSavePlan}
        planToEdit={planToEdit}
      />

      {/* Plan Detail Modal */}
      <PlanDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPlanForDetail(null);
        }}
        plan={selectedPlanForDetail}
        onEdit={(p) => {
          setIsDetailModalOpen(false);
          handleOpenEdit(p);
        }}
      />

      {/* Delete / Protected Guard Dialog */}
      <DeletePlanDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPlanToDelete(null);
        }}
        plan={planToDelete}
        onConfirm={handleConfirmDelete}
        onMarkInactive={handleMarkInactive}
      />
    </div>
  );
};
