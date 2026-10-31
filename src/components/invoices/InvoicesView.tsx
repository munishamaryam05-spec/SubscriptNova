import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  RotateCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCode2,
  Ban,
  Eye,
  Pencil,
  FileCheck2,
  Printer,
  ChevronDown,
  ArrowUpDown,
  Building,
  Calendar,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import {
  Invoice,
  InvoiceDisplayStatus,
  InvoiceFormData,
  BillingRunResult,
  InvoiceStatus,
} from '../../types/invoice';
import { Customer } from '../../types/customer';
import { SubscriptionRecord } from '../../types/subscription';
import { PaymentFormData } from '../../types/payment';
import { INITIAL_INVOICES } from '../../data/mockInvoices';
import { INITIAL_CUSTOMERS } from '../../data/mockCustomers';
import { INITIAL_SUBSCRIPTIONS } from '../../data/mockSubscriptions';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { InvoiceModal } from './InvoiceModal';
import { BillingCycleModal } from './BillingCycleModal';
import { CancelInvoiceDialog } from './CancelInvoiceDialog';
import { PaymentModal } from '../payments/PaymentModal';
import { formatDateDisplay, formatPeriodRange } from '../../utils/dateCalculations';

interface InvoicesViewProps {
  onShowToast: (msg: string) => void;
}

type SortField = 'issueDate' | 'dueDate' | 'totalAmount' | 'balance' | 'invoiceNumber';
type SortOrder = 'asc' | 'desc';

export const InvoicesView: React.FC<InvoicesViewProps> = ({ onShowToast }) => {
  // Load Invoices from localStorage
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const stored = localStorage.getItem('subscriptnova_invoices');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse invoices from storage', e);
    }
    return INITIAL_INVOICES;
  });

  // Load Customers for linking
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem('subscriptnova_customers');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load customers', e);
    }
    return INITIAL_CUSTOMERS;
  });

  // Load Subscriptions for billing runs & linking
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>(() => {
    try {
      const stored = localStorage.getItem('subscriptnova_subscriptions');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load subscriptions', e);
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  // Save Invoices to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('subscriptnova_invoices', JSON.stringify(invoices));
    } catch (e) {
      console.error('Failed to persist invoices', e);
    }
  }, [invoices]);

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('issueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isBillingCycleOpen, setIsBillingCycleOpen] = useState(false);
  const [cancelingInvoice, setCancelingInvoice] = useState<Invoice | null>(null);
  const [payingInvoiceTarget, setPayingInvoiceTarget] = useState<string | null>(null);

  const handleRecordInvoicePayment = (formData: PaymentFormData) => {
    const nextTxnNum = `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment = {
      id: `pay-${Date.now()}`,
      transactionId: nextTxnNum,
      ...formData,
      createdAt: new Date().toISOString(),
    };

    try {
      const storedPayments = localStorage.getItem('subscriptnova_payments');
      const existingPayments = storedPayments ? JSON.parse(storedPayments) : [];
      localStorage.setItem('subscriptnova_payments', JSON.stringify([newPayment, ...existingPayments]));
    } catch (e) {
      console.error(e);
    }

    if (formData.status === 'successful') {
      const updated = invoices.map((inv) => {
        if (inv.id === formData.invoiceId) {
          const newPaidAmount = inv.paidAmount + formData.amount;
          const newBalance = Math.max(0, inv.totalAmount - newPaidAmount);
          const isFullyPaid = newBalance === 0;
          return {
            ...inv,
            paidAmount: newPaidAmount,
            balance: newBalance,
            status: isFullyPaid ? ('paid' as const) : inv.status,
            paidAt: isFullyPaid ? formData.paymentDate : inv.paidAt,
          };
        }
        return inv;
      });
      setInvoices(updated);
    }
    setPayingInvoiceTarget(null);
    onShowToast(`Payment of $${formData.amount.toFixed(2)} recorded for ${formData.invoiceNumber}.`);
  };

  // Helper to determine computed display status
  const getComputedStatus = (inv: Invoice): InvoiceDisplayStatus => {
    if (inv.status === 'cancelled') return 'cancelled';
    if (inv.status === 'draft') return 'draft';
    if (inv.status === 'paid' || inv.paidAmount >= inv.totalAmount) return 'paid';
    if (inv.status === 'confirmed') {
      if (inv.balance > 0 && new Date(inv.dueDate) < new Date('2026-10-31')) {
        return 'overdue';
      }
      if (inv.paidAmount > 0 && inv.paidAmount < inv.totalAmount) {
        return 'partially_paid';
      }
      return 'confirmed';
    }
    return inv.status;
  };

  // 1. KPI Summaries Calculation (dynamically calculated)
  const metrics = useMemo(() => {
    const totalInvoices = invoices.length;
    const totalSum = invoices
      .filter((inv) => inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const confirmedInvoices = invoices.filter(
      (inv) => inv.status === 'confirmed' || inv.status === 'paid'
    );
    const confirmedCount = confirmedInvoices.length;

    const paidInvoices = invoices.filter((inv) => inv.status === 'paid' || inv.paidAmount >= inv.totalAmount);
    const paidCount = paidInvoices.length;
    const paidTotal = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

    const overdueInvoices = invoices.filter(
      (inv) =>
        inv.status === 'confirmed' &&
        inv.balance > 0 &&
        new Date(inv.dueDate) < new Date('2026-10-31')
    );
    const overdueCount = overdueInvoices.length;
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.balance, 0);

    const outstandingAmount = invoices
      .filter((inv) => inv.status === 'confirmed')
      .reduce((sum, inv) => sum + inv.balance, 0);

    return {
      totalInvoices,
      totalSum,
      confirmedCount,
      paidCount,
      paidTotal,
      overdueCount,
      overdueAmount,
      outstandingAmount,
    };
  }, [invoices]);

  // Next available invoice number for manual creation
  const nextInvoiceNumber = useMemo(() => {
    let maxNum = 1082;
    invoices.forEach((inv) => {
      const match = inv.invoiceNumber.match(/INV-\d{4}-(\d+)/);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `INV-2026-${String(maxNum + 1).padStart(4, '0')}`;
  }, [invoices]);

  // Filter & Sort Logic
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        const computedStatus = getComputedStatus(inv);

        // Status Filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'overdue' && computedStatus !== 'overdue') return false;
          if (statusFilter === 'paid' && computedStatus !== 'paid') return false;
          if (statusFilter === 'confirmed' && inv.status !== 'confirmed') return false;
          if (statusFilter === 'draft' && inv.status !== 'draft') return false;
          if (statusFilter === 'cancelled' && inv.status !== 'cancelled') return false;
        }

        // Date Filter
        if (dateFilter !== 'all') {
          const invDate = inv.issueDate;
          if (dateFilter === 'this_month' && !invDate.startsWith('2026-10')) {
            return false;
          }
          if (dateFilter === 'last_30_days') {
            const d = new Date(invDate);
            const cutoff = new Date('2026-10-01');
            if (d < cutoff) return false;
          }
          if (dateFilter === 'year_2026' && !invDate.startsWith('2026')) {
            return false;
          }
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNumber = inv.invoiceNumber.toLowerCase().includes(q);
          const matchCustomer = inv.customerName.toLowerCase().includes(q);
          const matchCompany = (inv.customerCompany || '').toLowerCase().includes(q);
          const matchEmail = inv.customerEmail.toLowerCase().includes(q);
          const matchSub = (inv.subscriptionNumber || '').toLowerCase().includes(q);
          const matchPlan = (inv.planName || '').toLowerCase().includes(q);
          if (!matchNumber && !matchCustomer && !matchCompany && !matchEmail && !matchSub && !matchPlan) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'issueDate') {
          diff = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        } else if (sortField === 'dueDate') {
          diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (sortField === 'totalAmount') {
          diff = a.totalAmount - b.totalAmount;
        } else if (sortField === 'balance') {
          diff = a.balance - b.balance;
        } else if (sortField === 'invoiceNumber') {
          diff = a.invoiceNumber.localeCompare(b.invoiceNumber);
        }
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [invoices, statusFilter, dateFilter, searchQuery, sortField, sortOrder]);

  // Handle Save Manual Invoice
  const handleSaveInvoice = (formData: InvoiceFormData, invoiceId?: string) => {
    if (invoiceId) {
      // Editing existing invoice
      const updated = invoices.map((inv) => {
        if (inv.id === invoiceId) {
          const subtotal = formData.items.reduce((s, it) => s + (it.amount || 0), 0);
          const discountAmount =
            formData.discountType === 'percentage'
              ? (subtotal * formData.discountValue) / 100
              : formData.discountValue;
          const taxable = Math.max(0, subtotal - discountAmount);
          const taxAmount = (taxable * formData.taxRate) / 100;
          const totalAmount = taxable + taxAmount;
          const balance = totalAmount - inv.paidAmount;

          return {
            ...inv,
            ...formData,
            subtotal,
            discountAmount,
            taxAmount,
            totalAmount,
            balance,
            confirmedAt:
              formData.status === 'confirmed' && !inv.confirmedAt
                ? new Date().toISOString().split('T')[0]
                : inv.confirmedAt,
          };
        }
        return inv;
      });
      setInvoices(updated);
      onShowToast(`Invoice ${editingInvoice?.invoiceNumber} updated successfully.`);
    } else {
      // Create new manual invoice
      const subtotal = formData.items.reduce((s, it) => s + (it.amount || 0), 0);
      const discountAmount =
        formData.discountType === 'percentage'
          ? (subtotal * formData.discountValue) / 100
          : formData.discountValue;
      const taxable = Math.max(0, subtotal - discountAmount);
      const taxAmount = (taxable * formData.taxRate) / 100;
      const totalAmount = taxable + taxAmount;

      const newInv: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: nextInvoiceNumber,
        ...formData,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        billingPeriodKey: `${formData.subscriptionId || 'manual'}_${formData.billingPeriodStart}_${formData.billingPeriodEnd}`,
        createdAt: new Date().toISOString().split('T')[0],
        confirmedAt:
          formData.status === 'confirmed' ? new Date().toISOString().split('T')[0] : undefined,
      };

      setInvoices([newInv, ...invoices]);
      onShowToast(
        `Invoice ${newInv.invoiceNumber} created as ${formData.status === 'confirmed' ? 'Confirmed' : 'Draft'}.`
      );
    }
    setEditingInvoice(null);
  };

  // Confirm a Draft Invoice
  const handleConfirmInvoice = (invoiceId: string) => {
    const updated = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'confirmed' as InvoiceStatus,
          confirmedAt: new Date().toISOString().split('T')[0],
        };
      }
      return inv;
    });
    setInvoices(updated);
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice({
        ...selectedInvoice,
        status: 'confirmed',
        confirmedAt: new Date().toISOString().split('T')[0],
      });
    }
    onShowToast(`Invoice confirmed and queued for collection.`);
  };

  // Cancel an Invoice
  const handleCancelInvoice = (invoiceId: string) => {
    const updated = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'cancelled' as InvoiceStatus,
          balance: 0,
        };
      }
      return inv;
    });
    setInvoices(updated);
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice({
        ...selectedInvoice,
        status: 'cancelled',
        balance: 0,
      });
    }
    onShowToast(`Invoice cancelled.`);
  };

  // Handle Billing Cycle Execution Results
  const handleBillingRunFinished = (
    result: BillingRunResult,
    updatedSubscriptions: SubscriptionRecord[]
  ) => {
    // 1. Prepend generated invoices
    const newInvoicesList = [...result.generatedInvoices, ...invoices];
    setInvoices(newInvoicesList);

    // 2. Persist updated subscriptions (with advanced nextBillingDate and timeline audit events)
    setSubscriptions(updatedSubscriptions);
    try {
      localStorage.setItem('subscriptnova_subscriptions', JSON.stringify(updatedSubscriptions));
    } catch (e) {
      console.error('Failed to persist subscriptions from billing run', e);
    }

    onShowToast(
      `Billing Run Completed: ${result.invoicesGeneratedCount} invoices created ($${result.totalInvoicedAmount.toFixed(2)}).`
    );
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Invoice Number',
      'Customer',
      'Company',
      'Email',
      'Subscription',
      'Issue Date',
      'Due Date',
      'Period Start',
      'Period End',
      'Subtotal',
      'Discount',
      'Tax',
      'Total Amount',
      'Paid Amount',
      'Balance',
      'Status',
    ];

    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      `"${inv.customerName}"`,
      `"${inv.customerCompany || ''}"`,
      inv.customerEmail,
      inv.subscriptionNumber || 'N/A',
      inv.issueDate,
      inv.dueDate,
      inv.billingPeriodStart,
      inv.billingPeriodEnd,
      inv.subtotal.toFixed(2),
      inv.discountAmount.toFixed(2),
      inv.taxAmount.toFixed(2),
      inv.totalAmount.toFixed(2),
      inv.paidAmount.toFixed(2),
      inv.balance.toFixed(2),
      getComputedStatus(inv),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SubscriptNova_Invoices_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`Exported ${filteredInvoices.length} invoices to CSV.`);
  };

  // Status Badge Rendering
  const renderStatusBadge = (inv: Invoice) => {
    const status = getComputedStatus(inv);
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1D8B94]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Paid</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#EF4444]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Overdue</span>
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F59E0B]">
            <Clock className="w-3.5 h-3.5" />
            <span>Partial</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10606F]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 line-through">
            <Ban className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1D8B94]">
            <span className="w-2 h-2 rounded-full bg-[#1D8B94]" />
            <span>Revenue Invoicing Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#04222B] mt-1 tracking-tight">
            Invoices & Automated Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Generate recurring billing runs, prevent duplicate cycles, issue itemized statements, and
            track receivables.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setIsBillingCycleOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#E2F4F0]" />
            <span>Run Billing Cycle</span>
          </button>

          <button
            onClick={() => {
              setEditingInvoice(null);
              setIsInvoiceModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0A3D4A] hover:bg-[#04222B] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#4FB8B4]" />
            <span>Create Invoice</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2 text-slate-500 hover:text-[#04222B] hover:bg-[#E2F4F0]/60 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Export filtered invoices to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Invoices */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Invoices</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#04222B] mt-2 font-mono">
            {metrics.totalInvoices}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            ${metrics.totalSum.toLocaleString('en-US', { minimumFractionDigits: 0 })} invoiced
          </div>
        </div>

        {/* Confirmed Invoices */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-[#10606F]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#04222B] mt-2 font-mono">
            {metrics.confirmedCount}
          </div>
          <div className="text-[11px] text-[#10606F] mt-1 font-medium">Ready for collection</div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Paid Invoices</span>
            <CheckCircle2 className="w-4 h-4 text-[#1D8B94]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1D8B94] mt-2 font-mono">
            {metrics.paidCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            ${metrics.paidTotal.toLocaleString('en-US', { minimumFractionDigits: 0 })} settled
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Overdue</span>
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#EF4444] mt-2 font-mono">
            {metrics.overdueCount}
          </div>
          <div className="text-[11px] text-[#EF4444] mt-1 font-mono">
            ${metrics.overdueAmount.toFixed(0)} overdue
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Outstanding Balance</span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#04222B] mt-2 font-mono">
            ${metrics.outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">Active pending receivables</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, customer, plan, or email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1D8B94]"
            />
          </div>

          {/* Filter Pills & Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Pills */}
            <div className="flex items-center bg-slate-100/80 p-0.5 rounded-lg text-xs">
              {['all', 'confirmed', 'paid', 'overdue', 'draft', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-[#04222B] shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Date Range Selector */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="all">All Dates</option>
              <option value="this_month">This Month (Oct 2026)</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="year_2026">Year 2026</option>
            </select>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="issueDate">Sort: Issue Date</option>
                <option value="dueDate">Sort: Due Date</option>
                <option value="totalAmount">Sort: Total Amount</option>
                <option value="balance">Sort: Balance</option>
                <option value="invoiceNumber">Sort: Invoice #</option>
              </select>

              <button
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title={`Toggle sort order (currently ${sortOrder.toUpperCase()})`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Subscription</th>
                <th className="py-2.5 px-3">Billing Period</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
                <th className="py-2.5 px-3 text-right">Tax</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-right">Paid</th>
                <th className="py-2.5 px-3 text-right">Balance</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No invoices match your filters.</p>
                    <p className="text-[11px] mt-0.5">
                      Adjust your search criteria or run a billing cycle to generate new invoices.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-[#04222B] whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 truncate max-w-[150px]">
                        {inv.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {inv.customerCompany || inv.customerEmail}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {inv.subscriptionNumber ? (
                        <div>
                          <div className="font-mono text-[#10606F] font-medium text-[11px]">
                            {inv.subscriptionNumber}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {inv.billingFrequency || 'Monthly'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Direct / Manual</span>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                      {formatPeriodRange(inv.billingPeriodStart, inv.billingPeriodEnd)}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {inv.issueDate}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {inv.dueDate}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                      ${inv.subtotal.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-500 whitespace-nowrap">
                      ${inv.taxAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-[#04222B] tabular-nums whitespace-nowrap">
                      ${inv.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[#1D8B94] font-medium whitespace-nowrap">
                      ${inv.paidAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={inv.balance > 0 ? 'text-[#EF4444]' : 'text-slate-400'}>
                        ${inv.balance.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">{renderStatusBadge(inv)}</td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1 text-slate-400 hover:text-[#1D8B94] hover:bg-[#E2F4F0]/60 rounded cursor-pointer"
                          title="View Invoice Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {inv.status === 'draft' && (
                          <>
                            <button
                              onClick={() => {
                                setEditingInvoice(inv);
                                setIsInvoiceModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-[#04222B] hover:bg-slate-100 rounded cursor-pointer"
                              title="Edit Draft"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleConfirmInvoice(inv.id)}
                              className="p-1 text-slate-400 hover:text-[#1D8B94] hover:bg-[#E2F4F0] rounded cursor-pointer"
                              title="Confirm Invoice"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setCancelingInvoice(inv)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Cancel Invoice"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {inv.balance > 0 && inv.status !== 'cancelled' && (
                          <button
                            onClick={() => setPayingInvoiceTarget(inv.id)}
                            className="p-1 text-slate-400 hover:text-[#1D8B94] hover:bg-[#E2F4F0] rounded cursor-pointer"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setTimeout(() => window.print(), 100);
                          }}
                          className="p-1 text-slate-400 hover:text-[#04222B] hover:bg-slate-100 rounded cursor-pointer"
                          title="Print Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td> 
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-4">
          <span className="font-mono text-[11px]">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              Outstanding Receivables:{' '}
              <strong className="text-[#04222B] font-mono">
                ${metrics.outstandingAmount.toFixed(2)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Invoice Details Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onConfirmInvoice={handleConfirmInvoice}
        onEditInvoice={(inv) => {
          setEditingInvoice(inv);
          setIsInvoiceModalOpen(true);
        }}
        onCancelInvoice={(id) => {
          const inv = invoices.find((i) => i.id === id);
          if (inv) setCancelingInvoice(inv);
        }}
        onRecordPayment={(inv) => setPayingInvoiceTarget(inv.id)}
      />

      {/* Manual / Edit Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setEditingInvoice(null);
        }}
        onSave={handleSaveInvoice}
        existingInvoice={editingInvoice}
        customers={customers}
        subscriptions={subscriptions}
        nextInvoiceNumber={nextInvoiceNumber}
      />

      {/* Billing Cycle Orchestrator Modal */}
      <BillingCycleModal
        isOpen={isBillingCycleOpen}
        onClose={() => setIsBillingCycleOpen(false)}
        subscriptions={subscriptions}
        customers={customers}
        existingInvoices={invoices}
        onExecuteBillingRun={handleBillingRunFinished}
      />

      {/* Cancel Confirmation Dialog */}
      <CancelInvoiceDialog
        isOpen={Boolean(cancelingInvoice)}
        invoice={cancelingInvoice}
        onClose={() => setCancelingInvoice(null)}
        onConfirmCancel={handleCancelInvoice}
      />

      {/* Record Payment Modal */}
      <PaymentModal
        isOpen={Boolean(payingInvoiceTarget)}
        onClose={() => setPayingInvoiceTarget(null)}
        onSave={handleRecordInvoicePayment}
        invoices={invoices}
        initialInvoiceId={payingInvoiceTarget || undefined}
      />
    </div>
  );
};
