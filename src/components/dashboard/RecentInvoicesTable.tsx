import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCode2,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { SAMPLE_INVOICES } from '../../data/mockData';
import { InvoiceItem } from '../../types/navigation';

interface RecentInvoicesTableProps {
  onSelectInvoice: (invoice: InvoiceItem) => void;
  onNavigateToInvoices?: () => void;
}

export const RecentInvoicesTable: React.FC<RecentInvoicesTableProps> = ({
  onSelectInvoice,
  onNavigateToInvoices,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState<string>('');

  const invoicesList: InvoiceItem[] = useMemo(() => {
    try {
      const stored = localStorage.getItem('subscriptnova_invoices');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 10).map((inv: any) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customerName,
            customerEmail: inv.customerEmail,
            planName: inv.planName || inv.items?.[0]?.description || 'Recurring Subscription',
            amount: inv.totalAmount,
            currency: 'USD',
            billingCycle: inv.billingFrequency === 'Yearly' ? 'Annual' : 'Monthly',
            status:
              inv.status === 'paid'
                ? 'paid'
                : inv.status === 'draft'
                ? 'draft'
                : inv.balance > 0 && new Date(inv.dueDate) < new Date('2026-10-31')
                ? 'past_due'
                : 'processing',
            issueDate: inv.issueDate,
            dueDate: inv.dueDate,
          }));
        }
      }
    } catch (e) {
      // fallback
    }
    return SAMPLE_INVOICES;
  }, []);

  const filteredInvoices = invoicesList.filter((inv) => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(tableSearch.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(tableSearch.toLowerCase()) ||
      inv.planName.toLowerCase().includes(tableSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: InvoiceItem['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Paid</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
            <Clock className="w-3.5 h-3.5" />
            <span>Processing</span>
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#EF4444]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Past Due</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#102B4E]/10 flex items-center justify-center text-[#102B4E]">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#102B4E]">Recent Billing Runs & Invoices</h3>
            <p className="text-[11px] text-slate-400">
              Automated invoice generation and payment status tracking
            </p>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter invoices..."
              className="pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E] w-36 sm:w-44"
            />
          </div>

          <div className="flex items-center bg-slate-100/80 p-0.5 rounded-lg text-xs">
            {['all', 'paid', 'processing', 'past_due', 'draft'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 rounded-md font-medium capitalize text-[11px] transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-white text-[#102B4E] shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Viewport */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-4">Invoice #</th>
              <th className="py-2.5 px-4">Customer</th>
              <th className="py-2.5 px-4">Plan & Cadence</th>
              <th className="py-2.5 px-4 text-right">Amount</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Issue Date</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No invoices matched your filter query.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => onSelectInvoice(inv)}
                >
                  <td className="py-3 px-4 font-mono font-medium text-[#102B4E] whitespace-nowrap">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 truncate max-w-[180px]">
                      {inv.customerName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                      {inv.customerEmail}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-slate-800 font-medium">{inv.planName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Billed {inv.billingCycle}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#102B4E] tabular-nums whitespace-nowrap">
                    ${inv.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(inv.status)}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                    {inv.issueDate}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectInvoice(inv);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#102B4E] hover:bg-[#102B4E]/10 rounded-md transition-colors cursor-pointer"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Strip */}
      <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-4">
        <span className="font-mono text-[11px]">
          Showing {filteredInvoices.length} of {SAMPLE_INVOICES.length} invoices
        </span>
        <button
          onClick={onNavigateToInvoices}
          className="text-xs font-semibold text-[#102B4E] hover:underline cursor-pointer"
        >
          View Full Invoicing Ledger →
        </button>
      </div>
    </div>
  );
};
