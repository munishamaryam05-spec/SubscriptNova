import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  CreditCard,
  FileText,
  RotateCw,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Building,
  Sparkles,
} from 'lucide-react';
import { LeakageIssue, LeakageSeverity, LeakageIssueType, LeakageCategory } from '../../types/leakage';
import { Invoice, InvoiceStatus } from '../../types/invoice';
import { SubscriptionRecord } from '../../types/subscription';
import { PaymentRecord, PaymentFormData } from '../../types/payment';
import { INITIAL_INVOICES } from '../../data/mockInvoices';
import { INITIAL_SUBSCRIPTIONS } from '../../data/mockSubscriptions';
import { INITIAL_PAYMENTS } from '../../data/mockPayments';
import { detectRevenueLeakage } from '../../utils/revenueLeakageDetector';
import { PaymentModal } from '../payments/PaymentModal';

interface LeakageViewProps {
  onShowToast: (msg: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const LeakageView: React.FC<LeakageViewProps> = ({ onShowToast, onNavigateToTab }) => {
  // Load state from localStorage
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const stored = localStorage.getItem('subscriptnova_invoices');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_INVOICES;
  });

  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>(() => {
    try {
      const stored = localStorage.getItem('subscriptnova_subscriptions');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const stored = localStorage.getItem('subscriptnova_payments');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PAYMENTS;
  });

  // Calculate Real Revenue Leakage
  const { issues, summary } = useMemo(() => {
    return detectRevenueLeakage(invoices, subscriptions, payments);
  }, [invoices, subscriptions, payments]);

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryTab, setCategoryTab] = useState<'all' | 'hard_overdue' | 'potential_loss'>('all');

  // Modals
  const [activePaymentInvoiceId, setActivePaymentInvoiceId] = useState<string | null>(null);

  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      if (categoryTab !== 'all' && iss.category !== categoryTab) return false;
      if (severityFilter !== 'all' && iss.severity !== severityFilter) return false;
      if (typeFilter !== 'all' && iss.issueType !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCust = iss.customerName.toLowerCase().includes(q);
        const matchComp = (iss.customerCompany || '').toLowerCase().includes(q);
        const matchInv = (iss.invoiceNumber || '').toLowerCase().includes(q);
        const matchSub = (iss.subscriptionNumber || '').toLowerCase().includes(q);
        const matchTxn = (iss.transactionId || '').toLowerCase().includes(q);
        const matchReason = iss.reason.toLowerCase().includes(q);
        if (!matchCust && !matchComp && !matchInv && !matchSub && !matchTxn && !matchReason) {
          return false;
        }
      }
      return true;
    });
  }, [issues, categoryTab, severityFilter, typeFilter, searchQuery]);

  // Quick Action Handler
  const handleQuickAction = (issue: LeakageIssue) => {
    if (issue.actionType === 'record_payment') {
      if (issue.invoiceId) {
        setActivePaymentInvoiceId(issue.invoiceId);
      }
    } else if (issue.actionType === 'retry_payment') {
      // Retry failed payment
      const updatedPayments = payments.map((p) => {
        if (p.id === issue.paymentId) {
          return {
            ...p,
            status: 'successful' as const,
            failureReason: undefined,
            notes: `${p.notes ? p.notes + ' | ' : ''}Resolved via Revenue Leakage Detector smart retry.`,
            paymentDate: new Date().toISOString().split('T')[0],
          };
        }
        return p;
      });

      // Update associated invoice
      const updatedInvoices = invoices.map((inv) => {
        if (inv.id === issue.invoiceId) {
          const newPaidAmount = inv.paidAmount + issue.amountAtRisk;
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
        localStorage.setItem('subscriptnova_payments', JSON.stringify(updatedPayments));
        localStorage.setItem('subscriptnova_invoices', JSON.stringify(updatedInvoices));
      } catch (e) {
        console.error(e);
      }
      onShowToast(`Smart retry successful! Recovered $${issue.amountAtRisk.toFixed(2)} for ${issue.customerName}.`);
    } else if (issue.actionType === 'confirm_invoice') {
      // Confirm draft invoice
      const updatedInvoices = invoices.map((inv) => {
        if (inv.id === issue.invoiceId) {
          return {
            ...inv,
            status: 'confirmed' as InvoiceStatus,
            confirmedAt: new Date().toISOString().split('T')[0],
          };
        }
        return inv;
      });
      setInvoices(updatedInvoices);
      try {
        localStorage.setItem('subscriptnova_invoices', JSON.stringify(updatedInvoices));
      } catch (e) {
        console.error(e);
      }
      onShowToast(`Invoice ${issue.invoiceNumber} confirmed and queued for automated collection.`);
    } else if (issue.actionType === 'generate_invoice') {
      // Generate invoice for subscription
      const sub = subscriptions.find((s) => s.id === issue.subscriptionId);
      if (sub) {
        const nextInvNum = `INV-2026-${Math.floor(1100 + Math.random() * 8000)}`;
        const newInv: Invoice = {
          id: `inv-${Date.now()}`,
          invoiceNumber: nextInvNum,
          customerId: sub.customerId,
          customerName: sub.customerName,
          customerCompany: sub.customerCompany,
          customerEmail: sub.customerEmail,
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          planName: sub.planName,
          billingFrequency: sub.billingFrequency,
          billingPeriodStart: sub.startDate,
          billingPeriodEnd: sub.nextBillingDate,
          billingPeriodKey: `${sub.id}_${sub.startDate}_${sub.nextBillingDate}`,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          items: [
            {
              id: `item-${Date.now()}`,
              description: `${sub.productName} - ${sub.planName} (${sub.billingFrequency} Billing)`,
              productId: sub.productId,
              productName: sub.productName,
              variantId: sub.variantId,
              variantName: sub.variantName,
              planId: sub.planId,
              planName: sub.planName,
              quantity: sub.quantity,
              unitPrice: sub.unitPrice,
              amount: sub.totalAmount,
            },
          ],
          subtotal: sub.totalAmount,
          discountType: 'fixed',
          discountValue: 0,
          discountAmount: 0,
          taxRate: 10,
          taxAmount: sub.totalAmount * 0.1,
          totalAmount: sub.totalAmount * 1.1,
          paidAmount: 0,
          balance: sub.totalAmount * 1.1,
          status: 'confirmed',
          notes: 'Generated via Revenue Leakage Detector resolution action.',
          terms: 'Payment due Net 14 days.',
          createdAt: new Date().toISOString().split('T')[0],
          confirmedAt: new Date().toISOString().split('T')[0],
        };

        const updatedInvoices = [newInv, ...invoices];
        setInvoices(updatedInvoices);
        try {
          localStorage.setItem('subscriptnova_invoices', JSON.stringify(updatedInvoices));
        } catch (e) {
          console.error(e);
        }
        onShowToast(`Invoice ${newInv.invoiceNumber} generated for ${sub.customerName} ($${newInv.totalAmount.toFixed(2)}).`);
      }
    }
  };

  const handleSavePayment = (formData: PaymentFormData) => {
    const nextTxnNum = `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      transactionId: nextTxnNum,
      ...formData,
      createdAt: new Date().toISOString(),
    };

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
        console.error(e);
      }
    }

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    try {
      localStorage.setItem('subscriptnova_payments', JSON.stringify(updatedPayments));
    } catch (e) {
      console.error(e);
    }
    setActivePaymentInvoiceId(null);
    onShowToast(`Payment of $${newPayment.amount.toFixed(2)} recorded. Leakage issue resolved.`);
  };

  // Export CSV Audit Report
  const handleExportCSV = () => {
    const headers = [
      'Issue ID',
      'Severity',
      'Category',
      'Type',
      'Customer',
      'Company',
      'Reference',
      'Amount At Risk ($)',
      'Reason',
      'Recommended Action',
      'Detected Date',
    ];

    const rows = filteredIssues.map((iss) => [
      iss.id,
      iss.severity,
      iss.category,
      iss.issueType,
      `"${iss.customerName}"`,
      `"${iss.customerCompany || ''}"`,
      `"${iss.invoiceNumber || iss.subscriptionNumber || iss.transactionId || ''}"`,
      iss.amountAtRisk,
      `"${iss.reason.replace(/"/g, '""')}"`,
      `"${iss.recommendedAction.replace(/"/g, '""')}"`,
      iss.detectedDate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `revenue_leakage_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Exported Revenue Leakage audit report to CSV.');
  };

  const getSeverityBadge = (severity: LeakageSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>CRITICAL</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span>HIGH</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <span>MEDIUM</span>
          </span>
        );
    }
  };

  const getTypeLabel = (type: LeakageIssueType) => {
    switch (type) {
      case 'overdue_invoice':
        return 'Overdue Invoice';
      case 'failed_payment':
        return 'Failed Payment';
      case 'missed_cycle':
        return 'Missed Billing Cycle';
      case 'missing_invoice':
        return 'Missing Active Invoice';
      case 'draft_blocked':
        return 'Draft Blocked';
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>Automated Revenue Loss Prevention & Dunning Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#04222B] mt-1 tracking-tight">
            Revenue Leakage Detector
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Audit unbilled subscriptions, overdue receivables, failed charges, and blocked cashflows computed from live ledger data.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#0A3D4A] bg-[#E2F4F0]/60 hover:bg-[#E2F4F0] border border-[#98D8D0]/60 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#1D8B94]" />
            <span>Export Audit Report</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total At Risk */}
        <div className="bg-white rounded-2xl border border-red-200/80 p-5 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-red-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Revenue At Risk
            </span>
            <span className="p-2 rounded-xl bg-red-100 text-red-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-red-600 tracking-tight">
            ${summary.totalAtRisk.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Across {summary.totalIssues} detected billing issues
          </div>
        </div>

        {/* Hard Overdue Receivables */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hard Overdue Receivables
            </span>
            <span className="p-2 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#04222B] tracking-tight">
            ${summary.hardOverdueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-red-600 font-semibold">
            Due & uncollected from customers
          </div>
        </div>

        {/* Potential / Unbilled Loss */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Potential Unbilled Loss
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#04222B] tracking-tight">
            ${summary.potentialLossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-amber-600 font-semibold">
            Missed cycles & draft holds
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Severity Distribution
            </span>
            <span className="p-2 rounded-xl bg-[#E2F4F0] text-[#1D8B94]">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div>
              <span className="text-lg font-bold text-red-600">{summary.criticalCount}</span>
              <span className="text-[10px] text-slate-400 block font-semibold">Critical</span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-lg font-bold text-amber-600">{summary.highCount}</span>
              <span className="text-[10px] text-slate-400 block font-semibold">High</span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-lg font-bold text-sky-600">{summary.mediumCount}</span>
              <span className="text-[10px] text-slate-400 block font-semibold">Medium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs Strip */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-2xl shadow-xs">
        <button
          onClick={() => setCategoryTab('all')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            categoryTab === 'all'
              ? 'border-[#1D8B94] text-[#1D8B94]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Detected Issues ({issues.length})
        </button>
        <button
          onClick={() => setCategoryTab('hard_overdue')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            categoryTab === 'hard_overdue'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hard Overdue Receivables (${summary.hardOverdueTotal.toFixed(0)})
        </button>
        <button
          onClick={() => setCategoryTab('potential_loss')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            categoryTab === 'potential_loss'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Potential / Unbilled Loss (${summary.potentialLossTotal.toFixed(0)})
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, invoice #, subscription #, reason..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#1D8B94] focus:ring-1 focus:ring-[#1D8B94] text-[#04222B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#04222B] focus:outline-none focus:border-[#1D8B94] cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>

          {/* Issue Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#04222B] focus:outline-none focus:border-[#1D8B94] cursor-pointer"
          >
            <option value="all">All Issue Types</option>
            <option value="overdue_invoice">Overdue Invoices</option>
            <option value="failed_payment">Failed Payments</option>
            <option value="missed_cycle">Missed Billing Cycles</option>
            <option value="missing_invoice">Missing Active Invoices</option>
            <option value="draft_blocked">Draft Blocked</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Issue Type</th>
                <th className="py-3 px-4">Customer & Reference</th>
                <th className="py-3 px-4 text-right">Amount At Risk</th>
                <th className="py-3 px-4">Reason & Analysis</th>
                <th className="py-3 px-4">Recommended Action</th>
                <th className="py-3 px-4 text-right">Quick Resolve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    <p className="font-semibold text-slate-700">No revenue leaks detected!</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      All subscriptions and invoices are in healthy standing under these filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredIssues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-[#E2F4F0]/20 transition-colors">
                    {/* Severity */}
                    <td className="py-3.5 px-4">{getSeverityBadge(iss.severity)}</td>

                    {/* Issue Type */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#04222B]">
                        {getTypeLabel(iss.issueType)}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                        {iss.category === 'hard_overdue' ? 'Hard Overdue' : 'Potential Loss'}
                      </div>
                    </td>

                    {/* Customer & Ref */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#04222B]">{iss.customerName}</div>
                      {iss.customerCompany && (
                        <div className="text-[11px] text-slate-500">{iss.customerCompany}</div>
                      )}
                      <div className="text-[10px] font-mono text-[#1D8B94] mt-0.5">
                        {iss.invoiceNumber || iss.subscriptionNumber || iss.transactionId}
                      </div>
                    </td>

                    {/* Amount At Risk */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-extrabold text-[#04222B] text-sm">
                        ${iss.amountAtRisk.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {iss.daysOverdue !== undefined && iss.daysOverdue > 0 && (
                        <div className="text-[10px] text-red-600 font-semibold">
                          {iss.daysOverdue}d overdue
                        </div>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="text-slate-700 text-xs leading-relaxed">{iss.reason}</div>
                    </td>

                    {/* Recommended Action */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-[11px] font-medium text-[#10606F] bg-[#E2F4F0]/60 p-2 rounded-lg border border-[#98D8D0]/60">
                        {iss.recommendedAction}
                      </div>
                    </td>

                    {/* Quick Resolve Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleQuickAction(iss)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {iss.actionType === 'record_payment' && (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Record Pay</span>
                          </>
                        )}
                        {iss.actionType === 'retry_payment' && (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Charge</span>
                          </>
                        )}
                        {iss.actionType === 'confirm_invoice' && (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </>
                        )}
                        {iss.actionType === 'generate_invoice' && (
                          <>
                            <FileText className="w-3.5 h-3.5" />
                            <span>Generate</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal for recording settlement from leakage detector */}
      {activePaymentInvoiceId && (
        <PaymentModal
          isOpen={!!activePaymentInvoiceId}
          onClose={() => setActivePaymentInvoiceId(null)}
          onSave={handleSavePayment}
          invoices={invoices}
          initialInvoiceId={activePaymentInvoiceId}
        />
      )}
    </div>
  );
};
