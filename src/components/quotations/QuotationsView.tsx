import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Download,
  DollarSign,
  Calendar,
  Building,
  Printer,
  ChevronDown,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Quotation, QuotationFormData, QuotationStatus } from '../../types/quotation';
import { INITIAL_QUOTATIONS } from '../../data/mockQuotations';
import { QuotationModal } from './QuotationModal';
import { QuotationDetailModal } from './QuotationDetailModal';
import { DeleteQuotationDialog } from './DeleteQuotationDialog';

interface QuotationsViewProps {
  onShowToast: (message: string) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({ onShowToast }) => {
  // Quotations state with localStorage persistence
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const saved = localStorage.getItem('subscriptnova_quotations');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading quotations from localStorage', e);
    }
    return INITIAL_QUOTATIONS;
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Modals state
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [quotationToEdit, setQuotationToEdit] = useState<Quotation | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedQuotationForDetail, setSelectedQuotationForDetail] = useState<Quotation | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);

  // Sync to localStorage
  const saveQuotations = (newQuotations: Quotation[]) => {
    setQuotations(newQuotations);
    try {
      localStorage.setItem('subscriptnova_quotations', JSON.stringify(newQuotations));
    } catch (e) {
      console.error('Error saving quotations to localStorage', e);
    }
  };

  // Helper to check dynamic expiry
  const getComputedStatus = (q: Quotation): QuotationStatus => {
    if (q.status === 'accepted') return 'accepted';
    if (q.status === 'rejected') return 'rejected';
    if (q.validUntil && new Date(q.validUntil) < new Date()) {
      return 'expired';
    }
    return q.status;
  };

  // Filtered quotations list
  const filteredQuotations = quotations.filter((q) => {
    const computedStatus = getComputedStatus(q);
    const matchesStatus = statusFilter === 'all' ? true : computedStatus === statusFilter;

    // Date filter logic
    let matchesDate = true;
    const now = new Date();
    const qDate = new Date(q.quotationDate);
    const validUntilDate = new Date(q.validUntil);

    if (dateFilter === 'last30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchesDate = qDate >= thirtyDaysAgo;
    } else if (dateFilter === 'expiringSoon') {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      matchesDate = validUntilDate >= now && validUntilDate <= sevenDaysFromNow;
    }

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      q.quotationNumber.toLowerCase().includes(query) ||
      q.customerName.toLowerCase().includes(query) ||
      q.customerCompany.toLowerCase().includes(query) ||
      q.items.some((it) => it.productName.toLowerCase().includes(query));

    return matchesStatus && matchesDate && matchesSearch;
  });

  // Dynamic overview metrics
  const totalQuotations = quotations.length;
  const draftQuotations = quotations.filter((q) => getComputedStatus(q) === 'draft').length;
  const sentQuotations = quotations.filter((q) => getComputedStatus(q) === 'sent').length;
  const acceptedQuotations = quotations.filter((q) => getComputedStatus(q) === 'accepted').length;
  const totalQuotedValue = quotations.reduce((acc, q) => acc + q.totalAmount, 0);

  // Handlers
  const handleOpenAdd = () => {
    setQuotationToEdit(null);
    setIsQuotationModalOpen(true);
  };

  const handleOpenEdit = (quote: Quotation) => {
    setQuotationToEdit(quote);
    setIsQuotationModalOpen(true);
  };

  const handleOpenDetail = (quote: Quotation) => {
    setSelectedQuotationForDetail(quote);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (quote: Quotation) => {
    setQuotationToDelete(quote);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveQuotation = (formData: QuotationFormData, sendImmediately = false) => {
    // Calculate subtotal and discounts
    const subtotal = formData.items.reduce((acc, it) => acc + (it.totalPrice || 0), 0);
    const discountAmount =
      formData.discountType === 'percentage'
        ? (subtotal * Math.min(formData.discountValue, 100)) / 100
        : Math.min(formData.discountValue, subtotal);
    const netAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = (netAmount * Math.max(0, formData.taxRate)) / 100;
    const totalAmount = netAmount + taxAmount;

    if (quotationToEdit) {
      // Edit existing
      const updated = quotations.map((q) => {
        if (q.id === quotationToEdit.id) {
          return {
            ...q,
            ...formData,
            subtotal,
            discountAmount,
            taxAmount,
            totalAmount,
            status: sendImmediately ? 'sent' : formData.status,
          };
        }
        return q;
      });
      saveQuotations(updated);
      onShowToast(`Updated quotation ${quotationToEdit.quotationNumber}`);
      if (selectedQuotationForDetail && selectedQuotationForDetail.id === quotationToEdit.id) {
        setSelectedQuotationForDetail({
          ...selectedQuotationForDetail,
          ...formData,
          subtotal,
          discountAmount,
          taxAmount,
          totalAmount,
          status: sendImmediately ? 'sent' : formData.status,
        });
      }
    } else {
      // Create new
      const nextNum = (quotations.length + 92).toString().padStart(4, '0');
      const newQuote: Quotation = {
        id: `quote-${Date.now().toString().slice(-4)}`,
        quotationNumber: `QT-2026-${nextNum}`,
        ...formData,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        status: sendImmediately ? 'sent' : formData.status,
      };
      saveQuotations([newQuote, ...quotations]);
      onShowToast(`Generated quotation ${newQuote.quotationNumber} for ${formData.customerCompany}`);
    }

    setIsQuotationModalOpen(false);
    setQuotationToEdit(null);
  };

  const handleUpdateStatus = (quotationId: string, newStatus: QuotationStatus) => {
    const updated = quotations.map((q) => {
      if (q.id === quotationId) {
        return { ...q, status: newStatus };
      }
      return q;
    });
    saveQuotations(updated);
    if (selectedQuotationForDetail && selectedQuotationForDetail.id === quotationId) {
      setSelectedQuotationForDetail({
        ...selectedQuotationForDetail,
        status: newStatus,
      });
    }
    onShowToast(`Quotation status updated to ${newStatus.toUpperCase()}`);
  };

  const handleDuplicate = (quote: Quotation) => {
    const nextNum = (quotations.length + 93).toString().padStart(4, '0');
    const today = new Date().toISOString().split('T')[0];
    const validity = new Date();
    validity.setDate(validity.getDate() + 30);

    const duplicated: Quotation = {
      ...quote,
      id: `quote-${Date.now().toString().slice(-4)}`,
      quotationNumber: `QT-2026-${nextNum}`,
      quotationDate: today,
      validUntil: validity.toISOString().split('T')[0],
      status: 'draft',
      isConvertedToSubscription: false,
    };

    saveQuotations([duplicated, ...quotations]);
    onShowToast(`Duplicated quotation as new draft ${duplicated.quotationNumber}`);
    if (isDetailModalOpen) {
      setIsDetailModalOpen(false);
    }
  };

  const handleConfirmDelete = (quotationId: string) => {
    const target = quotations.find((q) => q.id === quotationId);
    const updated = quotations.filter((q) => q.id !== quotationId);
    saveQuotations(updated);
    if (selectedQuotationForDetail?.id === quotationId) {
      setIsDetailModalOpen(false);
      setSelectedQuotationForDetail(null);
    }
    onShowToast(`Deleted quotation ${target ? target.quotationNumber : ''}`);
  };

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Accepted</span>
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
            <Send className="w-3.5 h-3.5" />
            <span>Sent</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#EF4444]">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F59E0B]">
            <Clock className="w-3.5 h-3.5" />
            <span>Expired</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <FileSpreadsheet className="w-3.5 h-3.5" />
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
            <span>B2B Contract & Deal Structuring</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#102B4E] mt-1 tracking-tight">
            Commercial Quotations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build customized client proposals, ramp contracts, line-item discounts, and auto-convert to active subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                [
                  'Quotation #,Customer,Company,Date,Valid Until,Items Count,Subtotal,Discount,Tax,Total Amount,Status',
                  ...quotations.map(
                    (q) =>
                      `"${q.quotationNumber}","${q.customerName}","${q.customerCompany}","${
                        q.quotationDate
                      }","${q.validUntil}","${q.items.length}","${q.subtotal}","${
                        q.discountAmount
                      }","${q.taxAmount}","${q.totalAmount}","${getComputedStatus(q)}"`
                  ),
                ].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `subscriptnova_quotations_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              onShowToast('Exported quotations to CSV');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] active:bg-[#0A1C33] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Metrics Cards (5 required metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Quotations */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Proposals
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#102B4E]/5 flex items-center justify-center text-[#102B4E]">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#102B4E] tabular-nums mt-1">
            {totalQuotations}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Generated deals</div>
        </div>

        {/* Draft Quotations */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Draft Deals
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-700 tabular-nums mt-1">
            {draftQuotations}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Under sales prep</div>
        </div>

        {/* Sent Quotations */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Sent to Clients
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 tabular-nums mt-1">
            {sentQuotations}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting client decision</div>
        </div>

        {/* Accepted Quotations */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Accepted Deals
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#10B981] tabular-nums mt-1">
            {acceptedQuotations}
          </div>
          <div className="text-[10px] text-[#10B981] font-semibold mt-1">Ready for subscription</div>
        </div>

        {/* Total Quoted Value */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Quoted Pipeline
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#102B4E]/5 flex items-center justify-center text-[#102B4E]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#102B4E] tabular-nums mt-1">
            ${totalQuotedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Cumulative quoted value</div>
        </div>
      </div>

      {/* 3. Quotations Table & Filters */}
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
              placeholder="Search by quote #, client, product..."
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

          {/* Date Filter & Status Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Range Selector */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[11px]">Period:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#102B4E] cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="last30">Last 30 Days</option>
                <option value="expiringSoon">Expiring in 7 Days</option>
              </select>
            </div>

            {/* Status Segmented Buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200/60 overflow-x-auto">
              {['all', 'draft', 'sent', 'accepted', 'rejected', 'expired'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] capitalize transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === s
                      ? s === 'accepted'
                        ? 'bg-white text-[#10B981] shadow-xs'
                        : s === 'rejected'
                        ? 'bg-white text-[#EF4444] shadow-xs'
                        : s === 'expired'
                        ? 'bg-white text-[#F59E0B] shadow-xs'
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
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Customer & Account</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Tax</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No quotations found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                        ? 'Try clearing active filters to view all commercial proposals.'
                        : 'No quotations drafted yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quote) => {
                  const computedStatus = getComputedStatus(quote);
                  return (
                    <tr
                      key={quote.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(quote)}
                    >
                      {/* Quotation Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#102B4E] whitespace-nowrap">
                        {quote.quotationNumber}
                      </td>

                      {/* Customer Name & Company */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 truncate max-w-[160px]">
                          {quote.customerCompany}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                          {quote.customerName}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {quote.quotationDate}
                      </td>

                      {/* Valid Until */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                        <span
                          className={
                            computedStatus === 'expired'
                              ? 'text-[#EF4444] font-semibold'
                              : 'text-slate-600'
                          }
                        >
                          {quote.validUntil}
                        </span>
                      </td>

                      {/* Items Count */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {quote.items.length}
                        </span>
                      </td>

                      {/* Subtotal */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-slate-600 tabular-nums">
                        ${quote.subtotal.toFixed(2)}
                      </td>

                      {/* Discount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-slate-500 tabular-nums">
                        {quote.discountAmount > 0 ? (
                          <span className="text-[#10B981]">-${quote.discountAmount.toFixed(2)}</span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Tax */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-slate-500 tabular-nums">
                        +${quote.taxAmount.toFixed(2)}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-[#102B4E] tabular-nums text-xs">
                        ${quote.totalAmount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(computedStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className="inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleOpenDetail(quote)}
                            title="View / Print Proposal"
                            className="p-1.5 text-slate-500 hover:text-[#102B4E] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDuplicate(quote)}
                            title="Duplicate Quote"
                            className="p-1.5 text-slate-500 hover:text-[#102B4E] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(quote)}
                            title="Edit Quote"
                            className="p-1.5 text-slate-500 hover:text-[#102B4E] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenDelete(quote)}
                            title="Delete Quote"
                            className="p-1.5 text-slate-400 hover:text-[#EF4444] hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-4">
          <span className="font-mono text-[11px]">
            Showing {filteredQuotations.length} of {quotations.length} quotations
          </span>
          <span className="text-[11px] text-slate-400">
            Click any row to view printable document, change workflow state, or duplicate
          </span>
        </div>
      </div>

      {/* Create / Edit Quotation Modal */}
      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => {
          setIsQuotationModalOpen(false);
          setQuotationToEdit(null);
        }}
        onSubmit={handleSaveQuotation}
        quotationToEdit={quotationToEdit}
      />

      {/* Quotation Detail Modal */}
      <QuotationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedQuotationForDetail(null);
        }}
        quotation={selectedQuotationForDetail}
        onUpdateStatus={handleUpdateStatus}
        onDuplicate={handleDuplicate}
      />

      {/* Delete Quotation Dialog */}
      <DeleteQuotationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setQuotationToDelete(null);
        }}
        quotation={quotationToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
