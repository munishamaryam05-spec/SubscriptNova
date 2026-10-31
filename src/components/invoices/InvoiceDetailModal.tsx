import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  FileCode2,
  Calendar,
  Building,
  Mail,
  FileCheck2,
  Ban,
  Pencil,
  ArrowRight,
  ShieldCheck,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { Invoice, InvoiceDisplayStatus } from '../../types/invoice';
import { formatDateDisplay, formatPeriodRange } from '../../utils/dateCalculations';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onConfirmInvoice?: (invoiceId: string) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onCancelInvoice?: (invoiceId: string) => void;
  onRecordPayment?: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  onClose,
  onConfirmInvoice,
  onEditInvoice,
  onCancelInvoice,
  onRecordPayment,
}) => {
  if (!invoice) return null;

  // Determine computed display status
  const isOverdue =
    invoice.status === 'confirmed' &&
    invoice.balance > 0 &&
    new Date(invoice.dueDate) < new Date('2026-10-31');

  const isPartiallyPaid =
    invoice.status === 'confirmed' &&
    invoice.paidAmount > 0 &&
    invoice.paidAmount < invoice.totalAmount;

  const displayStatus: InvoiceDisplayStatus =
    invoice.status === 'cancelled'
      ? 'cancelled'
      : invoice.status === 'draft'
      ? 'draft'
      : invoice.status === 'paid'
      ? 'paid'
      : isOverdue
      ? 'overdue'
      : isPartiallyPaid
      ? 'partially_paid'
      : 'confirmed';

  const getStatusBadge = () => {
    switch (displayStatus) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E2F4F0] text-[#0A3D4A] border border-[#98D8D0]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1D8B94]" />
            <span>PAID IN FULL</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#EF4444] border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>PAST DUE</span>
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-[#F59E0B] border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>PARTIALLY PAID</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E2F4F0]/60 text-[#10606F] border border-[#98D8D0]/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1D8B94]" />
            <span>CONFIRMED</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <Ban className="w-3.5 h-3.5" />
            <span>CANCELLED</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-[#F59E0B] border border-amber-200">
            <FileCode2 className="w-3.5 h-3.5" />
            <span>DRAFT</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:border-none print:shadow-none print:max-w-full">
        {/* Modal Toolbar (hidden in print) */}
        <div className="p-4 sm:px-6 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#04222B] text-white border border-[#0A3D4A] flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              SN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#04222B] font-mono">
                  {invoice.invoiceNumber}
                </span>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-500">
                Created on {formatDateDisplay(invoice.createdAt || invoice.issueDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {invoice.status === 'draft' && onConfirmInvoice && (
              <button
                onClick={() => onConfirmInvoice(invoice.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Confirm Invoice</span>
              </button>
            )}

            {invoice.status === 'draft' && onEditInvoice && (
              <button
                onClick={() => {
                  onClose();
                  onEditInvoice(invoice);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Draft</span>
              </button>
            )}

            {invoice.status === 'draft' && onCancelInvoice && (
              <button
                onClick={() => onCancelInvoice(invoice.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}

            {invoice.balance > 0 && invoice.status !== 'cancelled' && onRecordPayment && (
              <button
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#04222B] bg-white hover:bg-[#E2F4F0]/60 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-10 space-y-8 bg-white print:p-8">
          {/* Top Brand & Metadata Bar */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-xl sm:text-2xl text-[#04222B] tracking-tight">
                  Subscript<span className="text-[#1D8B94]">Nova</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#E2F4F0] text-[#0A3D4A] font-semibold border border-[#98D8D0]/60">
                  Billing Platform
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-xs">
                Subscription Management & Revenue Automation.
              </p>
              <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                <p>100 Innovation Parkway, Suite 700</p>
                <p>San Francisco, CA 94105, USA</p>
                <p className="font-mono text-[11px] text-slate-600">Tax ID: US-47291038-X</p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#04222B] font-mono tracking-tight">
                INVOICE
              </h2>
              <div className="font-mono text-xs font-semibold text-slate-700">
                {invoice.invoiceNumber}
              </div>
              <div className="pt-2 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between sm:justify-end gap-3">
                  <span className="text-slate-400">Issue Date:</span>
                  <span className="font-medium font-mono text-slate-800">
                    {formatDateDisplay(invoice.issueDate)}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-end gap-3">
                  <span className="text-slate-400">Due Date:</span>
                  <span className="font-medium font-mono text-slate-800">
                    {formatDateDisplay(invoice.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-end gap-3">
                  <span className="text-slate-400">Billing Period:</span>
                  <span className="font-medium font-mono text-slate-800">
                    {formatPeriodRange(invoice.billingPeriodStart, invoice.billingPeriodEnd)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Billed To & Subscription Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To
              </span>
              <div className="text-sm font-bold text-slate-900">{invoice.customerName}</div>
              <div className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{invoice.customerCompany || 'Direct Customer'}</span>
              </div>
              <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{invoice.customerEmail}</span>
              </div>
              {invoice.customerBillingAddress && (
                <div className="text-xs text-slate-500 mt-1 max-w-xs">
                  {invoice.customerBillingAddress}
                </div>
              )}
              {invoice.customerTaxId && (
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Tax / VAT ID: {invoice.customerTaxId}
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Subscription Reference
              </span>
              {invoice.subscriptionNumber ? (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      {invoice.planName || 'Recurring Subscription'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#E2F4F0] text-[#0A3D4A] border border-[#98D8D0]">
                      {invoice.billingFrequency || 'Monthly'}
                    </span>
                  </div>
                  <div className="font-mono text-slate-600 text-[11px]">
                    Subscription ID: <span className="font-semibold text-[#04222B]">{invoice.subscriptionNumber}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Period Coverage: {formatPeriodRange(invoice.billingPeriodStart, invoice.billingPeriodEnd)}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Direct / One-Off Invoice</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Manual commercial billing adjustment or ad-hoc services.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Alert Banner */}
          {displayStatus === 'overdue' && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-[#EF4444]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Payment is Past Due.</span> This invoice was due on{' '}
                {formatDateDisplay(invoice.dueDate)}. Outstanding balance: $
                {invoice.balance.toFixed(2)}.
              </div>
            </div>
          )}

          {displayStatus === 'paid' && (
            <div className="p-3.5 rounded-xl bg-[#E2F4F0] border border-[#98D8D0] flex items-center gap-3 text-[#0A3D4A]">
              <CheckCircle2 className="w-5 h-5 text-[#1D8B94] shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Invoice Paid in Full.</span> Zero outstanding balance.
                {invoice.paidAt && ` Settled on ${formatDateDisplay(invoice.paidAt)}.`}
              </div>
            </div>
          )}

          {displayStatus === 'draft' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-[#F59E0B]">
              <FileCode2 className="w-5 h-5 shrink-0" />
              <div className="text-xs text-amber-800">
                <span className="font-bold">Draft Invoice.</span> This invoice has not yet been
                confirmed. Amounts will not appear in confirmed receivables until confirmed.
              </div>
            </div>
          )}

          {/* Itemized Charges Table */}
          <div>
            <div className="text-xs font-bold text-[#04222B] uppercase tracking-wider mb-2">
              Billed Items Snapshot
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{item.description}</div>
                        {(item.productName || item.planName) && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.productName} {item.variantName ? `(${item.variantName})` : ''}
                            {item.planName ? ` • ${item.planName}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#04222B]">
                        ${item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            <div className="space-y-3 max-w-sm text-xs text-slate-500">
              {invoice.notes && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Invoice Notes:</span>
                  <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600">
                    {invoice.notes}
                  </p>
                </div>
              )}
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5">Payment Terms:</span>
                <p className="text-slate-500 text-[11px]">
                  {invoice.terms || 'Payment due within 14 calendar days via ACH, Card, or Wire.'}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">${invoice.subtotal.toFixed(2)}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-[#1D8B94]">
                  <span>
                    Discount{' '}
                    {invoice.discountType === 'percentage'
                      ? `(${invoice.discountValue}%)`
                      : '(Fixed)'}
                    :
                  </span>
                  <span>-${invoice.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Tax / VAT ({invoice.taxRate}%):</span>
                <span>${invoice.taxAmount.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-[#04222B]">
                <span>Total Amount:</span>
                <span>${invoice.totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Paid Amount:</span>
                <span className="text-[#1D8B94] font-medium">${invoice.paidAmount.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                <span className={invoice.balance > 0 ? 'text-[#EF4444]' : 'text-slate-700'}>
                  Balance Due:
                </span>
                <span className={invoice.balance > 0 ? 'text-[#EF4444]' : 'text-[#1D8B94]'}>
                  ${invoice.balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Receipt Notice */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <ShieldCheck className="w-4 h-4 text-[#4FB8B4]" />
              <span>Immutable snapshot generated by SubscriptNova Billing Engine.</span>
            </div>
            <div className="font-mono text-[11px]">
              Ref Key: {invoice.billingPeriodKey || invoice.id}
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center print:hidden">
          <span className="text-xs text-slate-400 font-mono">
            SubscriptNova • Automated SaaS Billing
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#04222B] hover:bg-[#0A3D4A] rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
