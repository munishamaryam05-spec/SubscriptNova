import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Eye,
  Building,
  Smartphone,
  Banknote,
  DollarSign,
  ArrowUpDown,
  Calendar,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { PaymentRecord, PaymentFormData, PaymentMethod, PaymentStatus } from '../../types/payment';
import { Invoice } from '../../types/invoice';
import { INITIAL_PAYMENTS } from '../../data/mockPayments';
import { INITIAL_INVOICES } from '../../data/mockInvoices';
import { PaymentModal } from './PaymentModal';
import { PaymentDetailModal } from './PaymentDetailModal';
import { RefundPaymentModal } from './RefundPaymentModal';

interface PaymentsViewProps {
  onShowToast: (msg: string) => void;
  onNavigateToInvoice?: (invoiceId: string) => void;
}

type SortField = 'paymentDate' | 'amount' | 'transactionId' | 'customerName';
type SortOrder = 'asc' | 'desc';

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onShowToast,
  onNavigateToInvoice,
}) => {
  // Load Payments from localStorage
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const stored = localStorage.getItem('subscriptnova_payments');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse payments from storage', e);
    }
    return INITIAL_PAYMENTS;
  });

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

  // Save Payments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('subscriptnova_payments', JSON.stringify(payments));
    } catch (e) {
      console.error('Failed to persist payments', e);
    }
  }, [payments]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('paymentDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [refundPaymentTarget, setRefundPaymentTarget] = useState<PaymentRecord | null>(null);

  // Financial KPI calculations
  const stats = useMemo(() => {
    let totalCollected = 0;
    let pendingAmount = 0;
    let failedAmount = 0;
    let refundedAmount = 0;

    let successCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let refundedCount = 0;

    payments.forEach((p) => {
      if (p.status === 'successful') {
        totalCollected += p.amount;
        successCount++;
      } else if (p.status === 'pending') {
        pendingAmount += p.amount;
        pendingCount++;
      } else if (p.status === 'failed') {
        failedAmount += p.amount;
        failedCount++;
      } else if (p.status === 'refunded') {
        refundedAmount += p.refundedAmount || p.amount;
        refundedCount++;
      }
    });

    return {
      totalCollected,
      pendingAmount,
      failedAmount,
      refundedAmount,
      successCount,
      pendingCount,
      failedCount,
      refundedCount,
      totalCount: payments.length,
    };
  }, [payments]);

  // Filtered and Sorted Payments
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (methodFilter !== 'all' && p.paymentMethod !== methodFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTxn = p.transactionId.toLowerCase().includes(q);
          const matchInv = p.invoiceNumber.toLowerCase().includes(q);
          const matchCust = p.customerName.toLowerCase().includes(q);
          const matchCompany = (p.customerCompany || '').toLowerCase().includes(q);
          const matchRef = (p.referenceNumber || '').toLowerCase().includes(q);
          if (!matchTxn && !matchInv && !matchCust && !matchCompany && !matchRef) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'paymentDate') {
          diff = new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
        } else if (sortField === 'amount') {
          diff = a.amount - b.amount;
        } else if (sortField === 'transactionId') {
          diff = a.transactionId.localeCompare(b.transactionId);
        } else if (sortField === 'customerName') {
          diff = a.customerName.localeCompare(b.customerName);
        }
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [payments, statusFilter, methodFilter, searchQuery, sortField, sortOrder]);

  // Handle Recording New Payment
  const handleRecordPayment = (formData: PaymentFormData) => {
    const nextTxnNum = `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      transactionId: nextTxnNum,
      ...formData,
      createdAt: new Date().toISOString(),
    };

    // If status is successful, update the target invoice
    if (formData.status === 'successful') {
      const updatedInvoices = invoices.map((inv) => {
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
      setInvoices(updatedInvoices);
      try {
        localStorage.setItem('subscriptnova_invoices', JSON.stringify(updatedInvoices));
      } catch (e) {
        console.error('Failed to sync invoice with payment', e);
      }
    }

    setPayments([newPayment, ...payments]);
    onShowToast(`Payment ${newPayment.transactionId} of $${newPayment.amount.toFixed(2)} recorded successfully.`);
  };

  // Handle Refunding a Payment
  const handleConfirmRefund = (paymentId: string, refundAmount: number, reason: string) => {
    const target = payments.find((p) => p.id === paymentId);
    if (!target) return;

    const updatedPayments = payments.map((p) => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'refunded' as PaymentStatus,
          refundedAmount: refundAmount,
          refundedAt: new Date().toISOString().split('T')[0],
          notes: `${p.notes ? p.notes + ' | ' : ''}Refunded $${refundAmount.toFixed(2)}: ${reason}`,
        };
      }
      return p;
    });

    // Also adjust invoice paidAmount & balance if needed
    const updatedInvoices = invoices.map((inv) => {
      if (inv.id === target.invoiceId) {
        const newPaidAmount = Math.max(0, inv.paidAmount - refundAmount);
        const newBalance = inv.totalAmount - newPaidAmount;
        return {
          ...inv,
          paidAmount: newPaidAmount,
          balance: newBalance,
          status: 'confirmed' as const,
        };
      }
      return inv;
    });

    setPayments(updatedPayments);
    setInvoices(updatedInvoices);
    try {
      localStorage.setItem('subscriptnova_invoices', JSON.stringify(updatedInvoices));
    } catch (e) {
      console.error(e);
    }

    if (selectedPayment && selectedPayment.id === paymentId) {
      setSelectedPayment({
        ...selectedPayment,
        status: 'refunded',
        refundedAmount: refundAmount,
        refundedAt: new Date().toISOString().split('T')[0],
      });
    }

    onShowToast(`Transaction ${target.transactionId} refunded for $${refundAmount.toFixed(2)}.`);
  };

  // Handle Retrying a Failed Payment
  const handleRetryPayment = (payment: PaymentRecord) => {
    const updatedPayments = payments.map((p) => {
      if (p.id === payment.id) {
        return {
          ...p,
          status: 'successful' as PaymentStatus,
          failureReason: undefined,
          notes: `${p.notes ? p.notes + ' | ' : ''}Payment retry succeeded via fallback network.`,
          paymentDate: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    });

    // Update target invoice
    const updatedInvoices = invoices.map((inv) => {
      if (inv.id === payment.invoiceId) {
        const newPaidAmount = inv.paidAmount + payment.amount;
        const newBalance = Math.max(0, inv.totalAmount - newPaidAmount);
        return {
          ...inv,
          paidAmount: newPaidAmount,
          balance: newBalance,
          status: newBalance === 0 ? ('paid' as const) : inv.status,
          paidAt: new Date().toISOString().split('T')[0],
        };
      }
      return inv;
    });

    setPayments(updatedPayments);
    setInvoices(updatedInvoices);
    try {
      localStorage.setItem('subscriptnova_invoices', JSON.stringify(updatedInvoices));
    } catch (e) {
      console.error(e);
    }

    if (selectedPayment && selectedPayment.id === payment.id) {
      setSelectedPayment({
        ...selectedPayment,
        status: 'successful',
        failureReason: undefined,
      });
    }

    onShowToast(`Retry charge of $${payment.amount.toFixed(2)} completed successfully!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Invoice Number',
      'Customer',
      'Company',
      'Amount',
      'Status',
      'Method',
      'Reference',
      'Date',
    ];
    const rows = filteredPayments.map((p) => [
      p.transactionId,
      p.invoiceNumber,
      `"${p.customerName}"`,
      `"${p.customerCompany || ''}"`,
      p.amount,
      p.status,
      p.paymentMethod,
      `"${p.referenceNumber || ''}"`,
      p.paymentDate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `subscriptnova_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Exported payments ledger to CSV.');
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-3.5 h-3.5 text-[#1D8B94]" />;
      case 'upi':
        return <Smartphone className="w-3.5 h-3.5 text-[#4FB8B4]" />;
      case 'bank_transfer':
        return <Building className="w-3.5 h-3.5 text-[#10606F]" />;
      case 'cash':
        return <Banknote className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'successful':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E2F4F0] text-[#0A3D4A] border border-[#98D8D0]">
            <CheckCircle2 className="w-3 h-3 text-[#1D8B94]" />
            <span>Successful</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Pending</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span>Failed</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw className="w-3 h-3 text-purple-600" />
            <span>Refunded</span>
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
            <span>Payment Gateway & Transaction Reconciliation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#04222B] mt-1 tracking-tight">
            Payments & Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Track incoming multi-channel payments, settle invoices, reconcile statements, and manage refund actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#E2F4F0]" />
            <span>Record Payment</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#0A3D4A] bg-[#E2F4F0]/60 hover:bg-[#E2F4F0] border border-[#98D8D0]/60 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#1D8B94]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Collected
            </span>
            <span className="p-2 rounded-xl bg-[#E2F4F0] text-[#1D8B94]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#04222B] tracking-tight">
              ${stats.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#1D8B94] font-medium">
            <span>{stats.successCount} successful settlements</span>
          </div>
        </div>

        {/* Pending Clearance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Settlements
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#04222B] tracking-tight">
              ${stats.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <span>{stats.pendingCount} transactions processing</span>
          </div>
        </div>

        {/* Failed Amount */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Failed Charges
            </span>
            <span className="p-2 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#EF4444] tracking-tight">
              ${stats.failedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-red-500 font-medium">
            <span>{stats.failedCount} requires retry / dunning</span>
          </div>
        </div>

        {/* Refunded Amount */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Refunded Credits
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-900 tracking-tight">
              ${stats.refundedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-purple-600 font-medium">
            <span>{stats.refundedCount} transactions returned</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by TXN ID, invoice #, customer name..."
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
            <option value="all">All Statuses ({payments.length})</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#04222B] focus:outline-none focus:border-[#1D8B94] cursor-pointer"
          >
            <option value="all">All Methods</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>

          {/* Sort Field */}
          <select
            value={`${sortField}_${sortOrder}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split('_');
              setSortField(f as SortField);
              setSortOrder(o as SortOrder);
            }}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#04222B] focus:outline-none focus:border-[#1D8B94] cursor-pointer"
          >
            <option value="paymentDate_desc">Newest Date</option>
            <option value="paymentDate_asc">Oldest Date</option>
            <option value="amount_desc">Amount (Highest)</option>
            <option value="amount_asc">Amount (Lowest)</option>
            <option value="transactionId_asc">Transaction ID</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Transaction / Date</th>
                <th className="py-3 px-4">Customer & Account</th>
                <th className="py-3 px-4">Invoice / Subscription</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">No payment records match your filters</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try clearing filters or record a new transaction
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#E2F4F0]/20 transition-colors group cursor-pointer"
                    onClick={() => setSelectedPayment(p)}
                  >
                    {/* Transaction / Date */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#04222B] group-hover:text-[#1D8B94] transition-colors">
                        {p.transactionId}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{p.paymentDate}</span>
                      </div>
                    </td>

                    {/* Customer & Account */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#04222B]">{p.customerName}</div>
                      <div className="text-[11px] text-slate-500">
                        {p.customerCompany || p.customerEmail}
                      </div>
                    </td>

                    {/* Invoice / Sub */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-medium text-[#10606F]">
                        {p.invoiceNumber}
                      </div>
                      {p.subscriptionNumber && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {p.subscriptionNumber}
                        </div>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 text-slate-700 capitalize">
                        {getMethodIcon(p.paymentMethod)}
                        <span className="font-medium">
                          {p.paymentMethod.replace('_', ' ')}
                        </span>
                      </div>
                      {p.referenceNumber && (
                        <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                          {p.referenceNumber}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-[#04222B]">
                        ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {p.refundedAmount && (
                        <div className="text-[10px] text-purple-600 font-semibold">
                          -${p.refundedAmount.toFixed(2)} refunded
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">{getStatusBadge(p.status)}</td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="p-1.5 text-slate-500 hover:text-[#1D8B94] hover:bg-[#E2F4F0] rounded-lg transition-colors cursor-pointer"
                          title="View Details & Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {p.status === 'successful' && (
                          <button
                            onClick={() => setRefundPaymentTarget(p)}
                            className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Process Refund"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        {p.status === 'failed' && (
                          <button
                            onClick={() => handleRetryPayment(p)}
                            className="p-1.5 text-[#1D8B94] hover:text-[#10606F] hover:bg-[#E2F4F0] rounded-lg transition-colors cursor-pointer"
                            title="Retry Charge"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <PaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSave={handleRecordPayment}
        invoices={invoices}
      />

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onOpenRefund={(p) => setRefundPaymentTarget(p)}
        onRetryPayment={handleRetryPayment}
        onViewInvoice={onNavigateToInvoice}
      />

      {/* Refund Payment Modal */}
      <RefundPaymentModal
        payment={refundPaymentTarget}
        onClose={() => setRefundPaymentTarget(null)}
        onConfirmRefund={handleConfirmRefund}
      />
    </div>
  );
};
