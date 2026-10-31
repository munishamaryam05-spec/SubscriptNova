import React, { useState } from 'react';
import {
  Repeat,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Pause,
  Eye,
  Edit3,
  Trash2,
  Download,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';
import {
  SubscriptionFormData,
  SubscriptionLifecycleStatus,
  SubscriptionRecord,
} from '../../types/subscription';
import { INITIAL_SUBSCRIPTIONS } from '../../data/mockSubscriptions';
import { SubscriptionModal } from './SubscriptionModal';
import { SubscriptionDetailModal } from './SubscriptionDetailModal';
import { DeleteSubscriptionDialog } from './DeleteSubscriptionDialog';
import {
  calculateMRRFromSubscription,
  calculateNextBillingDate,
} from '../../utils/dateCalculations';

interface SubscriptionsViewProps {
  onShowToast: (message: string) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({ onShowToast }) => {
  // Subscriptions state with localStorage persistence
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('subscriptnova_subscriptions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading subscriptions from localStorage', e);
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subToEdit, setSubToEdit] = useState<SubscriptionRecord | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSubForDetail, setSelectedSubForDetail] = useState<SubscriptionRecord | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState<SubscriptionRecord | null>(null);

  // Sync to localStorage
  const saveSubscriptions = (newSubs: SubscriptionRecord[]) => {
    setSubscriptions(newSubs);
    try {
      localStorage.setItem('subscriptnova_subscriptions', JSON.stringify(newSubs));
    } catch (e) {
      console.error('Error saving subscriptions to localStorage', e);
    }
  };

  // Filter and sort subscriptions
  const filteredSubscriptions = subscriptions
    .filter((sub) => {
      const matchesStatus = statusFilter === 'all' ? true : sub.status === statusFilter;
      const matchesFrequency =
        frequencyFilter === 'all' ? true : sub.billingFrequency === frequencyFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        sub.subscriptionNumber.toLowerCase().includes(q) ||
        sub.customerName.toLowerCase().includes(q) ||
        sub.customerCompany.toLowerCase().includes(q) ||
        sub.productName.toLowerCase().includes(q) ||
        sub.planName.toLowerCase().includes(q);

      return matchesStatus && matchesFrequency && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.nextBillingDate).getTime();
      const dateB = new Date(b.nextBillingDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Dynamic overview metrics calculated from actual records
  const totalCount = subscriptions.length;
  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'paused').length;
  const pendingCount = subscriptions.filter(
    (s) => s.status === 'draft' || s.status === 'quotation' || s.status === 'confirmed'
  ).length;

  // Calculate MRR from active subscriptions only
  const activeMRR = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((acc, s) => acc + calculateMRRFromSubscription(s.unitPrice, s.quantity, s.billingFrequency), 0);

  // Handlers
  const handleOpenAdd = () => {
    setSubToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: SubscriptionRecord) => {
    setSubToEdit(sub);
    setIsModalOpen(true);
  };

  const handleOpenDetail = (sub: SubscriptionRecord) => {
    setSelectedSubForDetail(sub);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (sub: SubscriptionRecord) => {
    setSubToDelete(sub);
    setIsDeleteOpen(true);
  };

  const handleSaveSubscription = (formData: SubscriptionFormData) => {
    const totalAmount = formData.unitPrice * formData.quantity;
    const computedNextBilling = calculateNextBillingDate(formData.startDate, formData.billingFrequency);
    const nowTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    if (subToEdit) {
      // Edit existing
      const updated = subscriptions.map((s) => {
        if (s.id === subToEdit.id) {
          const statusChanged = s.status !== formData.status;
          const newTimeline = statusChanged
            ? [
                ...s.timeline,
                {
                  id: `evt-${Date.now()}`,
                  fromStatus: s.status,
                  toStatus: formData.status,
                  timestamp: nowTimestamp,
                  note: `Subscription parameters and status updated.`,
                  actor: 'Elena Rostova',
                },
              ]
            : s.timeline;

          return {
            ...s,
            ...formData,
            totalAmount,
            nextBillingDate: s.status === 'active' ? s.nextBillingDate || computedNextBilling : computedNextBilling,
            timeline: newTimeline,
          };
        }
        return s;
      });
      saveSubscriptions(updated);
      onShowToast(`Updated subscription ${subToEdit.subscriptionNumber}`);
      if (selectedSubForDetail && selectedSubForDetail.id === subToEdit.id) {
        setSelectedSubForDetail({
          ...selectedSubForDetail,
          ...formData,
          totalAmount,
        });
      }
    } else {
      // Create new
      const nextNum = (subscriptions.length + 482).toString().padStart(4, '0');
      const newSub: SubscriptionRecord = {
        id: `sub-${Date.now().toString().slice(-4)}`,
        subscriptionNumber: `SUB-2026-${nextNum}`,
        ...formData,
        totalAmount,
        nextBillingDate: computedNextBilling,
        dateCreated: formData.startDate,
        timeline: [
          {
            id: `evt-${Date.now()}`,
            toStatus: formData.status,
            timestamp: nowTimestamp,
            note: formData.linkedQuotationNumber
              ? `Created from accepted quotation ${formData.linkedQuotationNumber}.`
              : 'Direct subscription initiated via merchant console.',
            actor: 'Elena Rostova',
          },
        ],
      };
      saveSubscriptions([newSub, ...subscriptions]);
      onShowToast(`Created subscription ${newSub.subscriptionNumber} for ${formData.customerCompany}`);
    }

    setIsModalOpen(false);
    setSubToEdit(null);
  };

  const handleUpdateStatus = (
    subId: string,
    newStatus: SubscriptionLifecycleStatus,
    note: string,
    newNextBillingDate?: string
  ) => {
    const nowTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const updated = subscriptions.map((s) => {
      if (s.id === subId) {
        const nextBilling = newNextBillingDate || s.nextBillingDate;
        return {
          ...s,
          status: newStatus,
          nextBillingDate: nextBilling,
          timeline: [
            ...s.timeline,
            {
              id: `evt-${Date.now()}`,
              fromStatus: s.status,
              toStatus: newStatus,
              timestamp: nowTimestamp,
              note,
              actor: 'Elena Rostova',
            },
          ],
        };
      }
      return s;
    });

    saveSubscriptions(updated);
    if (selectedSubForDetail && selectedSubForDetail.id === subId) {
      const refreshed = updated.find((s) => s.id === subId);
      if (refreshed) setSelectedSubForDetail(refreshed);
    }
    onShowToast(`Subscription status updated to ${newStatus.toUpperCase()}`);
  };

  const handleConfirmDelete = (subId: string) => {
    const target = subscriptions.find((s) => s.id === subId);
    const updated = subscriptions.filter((s) => s.id !== subId);
    saveSubscriptions(updated);
    if (selectedSubForDetail?.id === subId) {
      setIsDetailOpen(false);
      setSelectedSubForDetail(null);
    }
    onShowToast(`Deleted subscription record ${target ? target.subscriptionNumber : ''}`);
  };

  const getStatusBadge = (status: SubscriptionLifecycleStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F59E0B]">
            <Pause className="w-3.5 h-3.5" />
            <span>Paused</span>
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#EF4444]">
            <XCircle className="w-3.5 h-3.5" />
            <span>Closed</span>
          </span>
        );
      case 'quotation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Quotation</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Recurring Contract Lifecycle Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#102B4E] mt-1 tracking-tight">
            Subscriptions Orchestrator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automate recurring billing cadences, cycle renewals, mid-term pauses, and contract extensions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                [
                  'Subscription #,Customer,Company,Product,Plan,Frequency,Quantity,Amount,Start Date,Next Billing,Status',
                  ...subscriptions.map(
                    (s) =>
                      `"${s.subscriptionNumber}","${s.customerName}","${s.customerCompany}","${
                        s.productName
                      }","${s.planName}","${s.billingFrequency}","${s.quantity}","${s.totalAmount}","${
                        s.startDate
                      }","${s.nextBillingDate}","${s.status}"`
                  ),
                ].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `subscriptnova_subscriptions_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              onShowToast('Exported subscriptions ledger to CSV');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Ledger</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] active:bg-[#0A1C33] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#10B981]" />
            <span>New Subscription</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Metrics Cards (5 required dynamic metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Subscriptions */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Subscriptions
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#102B4E]/5 flex items-center justify-center text-[#102B4E]">
              <Repeat className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#102B4E] tabular-nums mt-1">
            {totalCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Contract instances</div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active (Billable)
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#10B981] tabular-nums mt-1">
            {activeCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {Math.round((activeCount / (totalCount || 1)) * 100)}% active subscription ratio
          </div>
        </div>

        {/* Paused Subscriptions */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Paused Cycles
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-[#F59E0B]">
              <Pause className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#F59E0B] tabular-nums mt-1">
            {pausedCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Billing temporarily on hold</div>
        </div>

        {/* Pending Subscriptions */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Pending Activation
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-700 tabular-nums mt-1">
            {pendingCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Draft & confirmed tiers</div>
        </div>

        {/* Monthly Recurring Revenue (MRR) - Dynamically calculated */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Calculated MRR
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#102B4E]/5 flex items-center justify-center text-[#102B4E]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#102B4E] tabular-nums mt-1">
            ${activeMRR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-[#10B981] font-semibold mt-1">
            Active run rate / mo
          </div>
        </div>
      </div>

      {/* 3. Subscriptions Table & Filters */}
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
              placeholder="Search by ID, customer, product, plan..."
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

          {/* Filters: Status + Frequency + Date Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Frequency Selector */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[11px]">Cadence:</span>
              <select
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#102B4E] cursor-pointer"
              >
                <option value="all">All Cadences</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            {/* Sort by Next Billing Date */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Sort by Next Billing Date"
            >
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <span>Due: {sortOrder === 'asc' ? 'Earliest' : 'Latest'}</span>
            </button>

            {/* Status Segmented Buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200/60 overflow-x-auto">
              {['all', 'active', 'paused', 'confirmed', 'draft', 'closed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] capitalize transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === s
                      ? s === 'active'
                        ? 'bg-white text-[#10B981] shadow-xs'
                        : s === 'paused'
                        ? 'bg-white text-[#F59E0B] shadow-xs'
                        : s === 'closed'
                        ? 'bg-white text-[#EF4444] shadow-xs'
                        : 'bg-white text-[#102B4E] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Subscription ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product & Variant</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">Next Billing Date</th>
                <th className="py-3 px-4 text-right">Recurring Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Repeat className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No subscriptions found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery || statusFilter !== 'all' || frequencyFilter !== 'all'
                        ? 'Try clearing active filters to view all recurring subscriptions.'
                        : 'No subscriptions recorded in the system yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(sub)}
                  >
                    {/* Subscription ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#102B4E] whitespace-nowrap">
                      {sub.subscriptionNumber}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[150px]">
                        {sub.customerCompany}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {sub.customerName}
                      </div>
                    </td>

                    {/* Product */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 truncate max-w-[150px]">
                        {sub.productName}
                      </div>
                      {sub.variantName && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {sub.variantName}
                        </div>
                      )}
                    </td>

                    {/* Subscription Plan */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-[#102B4E]">{sub.planName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {sub.quantity} unit{sub.quantity > 1 ? 's' : ''}
                      </div>
                    </td>

                    {/* Billing Frequency */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {sub.billingFrequency}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {sub.startDate}
                    </td>

                    {/* Next Billing Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                      {sub.status === 'closed' ? (
                        <span className="text-slate-400 italic font-sans text-[10px]">Terminated</span>
                      ) : sub.status === 'paused' ? (
                        <span className="text-[#F59E0B] font-semibold">{sub.nextBillingDate} (On hold)</span>
                      ) : (
                        <span className="font-medium text-slate-800">{sub.nextBillingDate}</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-[#102B4E] tabular-nums text-xs">
                      ${sub.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(sub.status)}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleOpenDetail(sub)}
                          title="View Subscription Profile"
                          className="p-1.5 text-slate-500 hover:text-[#102B4E] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(sub)}
                          title="Edit Subscription"
                          className="p-1.5 text-slate-500 hover:text-[#102B4E] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenDelete(sub)}
                          title="Delete Subscription Record"
                          className="p-1.5 text-slate-400 hover:text-[#EF4444] hover:bg-red-50 rounded-md transition-colors cursor-pointer"
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

        {/* Footer Summary */}
        <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-4">
          <span className="font-mono text-[11px]">
            Showing {filteredSubscriptions.length} of {subscriptions.length} subscription contracts
          </span>
          <span className="text-[11px] text-slate-400">
            Click any row to execute lifecycle workflows, inspect audits, or manage billing dates
          </span>
        </div>
      </div>

      {/* Subscription Creation / Edit Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSubToEdit(null);
        }}
        onSubmit={handleSaveSubscription}
        subscriptionToEdit={subToEdit}
      />

      {/* Subscription Detail Modal */}
      <SubscriptionDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedSubForDetail(null);
        }}
        subscription={selectedSubForDetail}
        onUpdateStatus={handleUpdateStatus}
        onEdit={(sub) => {
          setIsDetailOpen(false);
          handleOpenEdit(sub);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteSubscriptionDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSubToDelete(null);
        }}
        subscription={subToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
