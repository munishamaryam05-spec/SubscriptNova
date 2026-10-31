import React from 'react';
import {
  X,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Printer,
  Receipt,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { PaymentRecord, PaymentMethod, PaymentStatus } from '../../types/payment';

interface PaymentDetailModalProps {
  payment: PaymentRecord | null;
  onClose: () => void;
  onOpenRefund?: (payment: PaymentRecord) => void;
  onRetryPayment?: (payment: PaymentRecord) => void;
  onViewInvoice?: (invoiceId: string) => void;
}

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  payment,
  onClose,
  onOpenRefund,
  onRetryPayment,
  onViewInvoice,
}) => {
  if (!payment) return null;

  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'card':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#E2F4F0] text-[#0A3D4A] border border-[#98D8D0]/60">
            <CreditCard className="w-3.5 h-3.5 text-[#1D8B94]" />
            <span>Credit / Debit Card</span>
          </span>
        );
      case 'upi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#E2F4F0] text-[#0A3D4A] border border-[#98D8D0]/60">
            <Smartphone className="w-3.5 h-3.5 text-[#4FB8B4]" />
            <span>UPI Instant Pay</span>
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#E2F4F0] text-[#0A3D4A] border border-[#98D8D0]/60">
            <Building className="w-3.5 h-3.5 text-[#10606F]" />
            <span>Bank Transfer / ACH</span>
          </span>
        );
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
            <Banknote className="w-3.5 h-3.5 text-slate-600" />
            <span>Cash / Counter</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'successful':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E2F4F0] text-[#0A3D4A] border border-[#98D8D0]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1D8B94]" />
            <span>SUCCESSFUL</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>PENDING SETTLEMENT</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>PAYMENT FAILED</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
            <span>REFUNDED</span>
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04222B]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#04222B] px-6 py-5 flex items-center justify-between text-white border-b border-[#0A3D4A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A3D4A] border border-[#10606F] flex items-center justify-center text-[#4FB8B4]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Transaction {payment.transactionId}
                </h2>
                {getStatusBadge(payment.status)}
              </div>
              <p className="text-xs text-[#98D8D0]/70 mt-0.5">
                Processed on {payment.paymentDate} · Verified in SubscriptNova Ledger
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

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Amount Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#04222B] to-[#0A3D4A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#98D8D0] font-medium uppercase tracking-wider">
                Settlement Amount
              </div>
              <div className="text-3xl font-extrabold tracking-tight mt-1">
                ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                <span className="text-sm font-normal text-[#98D8D0] ml-1.5 font-mono">
                  {payment.currency}
                </span>
              </div>
              {payment.refundedAmount && payment.refundedAmount > 0 && (
                <div className="text-xs text-purple-200 mt-1 font-medium flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    Refunded: ${payment.refundedAmount.toFixed(2)} on {payment.refundedAt || 'record'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-xs font-semibold text-[#04222B] bg-[#E2F4F0] hover:bg-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>

              {payment.status === 'successful' && onOpenRefund && (
                <button
                  onClick={() => onOpenRefund(payment)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refund</span>
                </button>
              )}

              {payment.status === 'failed' && onRetryPayment && (
                <button
                  onClick={() => onRetryPayment(payment)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Charge</span>
                </button>
              )}
            </div>
          </div>

          {/* Failure Alert (if failed) */}
          {payment.status === 'failed' && payment.failureReason && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <div className="font-bold">Gateway Decline Reason:</div>
                <div className="mt-0.5 text-red-700">{payment.failureReason}</div>
              </div>
            </div>
          )}

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Instrument */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment Instrument
              </h3>
              <div>
                <div className="text-[11px] text-slate-400">Method</div>
                <div className="mt-1">{getMethodBadge(payment.paymentMethod)}</div>
              </div>
              {payment.referenceNumber && (
                <div>
                  <div className="text-[11px] text-slate-400">Instrument Reference</div>
                  <div className="text-xs font-mono font-semibold text-[#04222B] mt-0.5">
                    {payment.referenceNumber}
                  </div>
                </div>
              )}
              <div>
                <div className="text-[11px] text-slate-400">Ledger Timestamp</div>
                <div className="text-xs text-[#04222B] font-mono mt-0.5">
                  {payment.createdAt || payment.paymentDate}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Account Information
              </h3>
              <div>
                <div className="text-[11px] text-slate-400">Customer</div>
                <div className="text-xs font-bold text-[#04222B] mt-0.5">
                  {payment.customerName}
                </div>
                {payment.customerCompany && (
                  <div className="text-xs text-slate-600">{payment.customerCompany}</div>
                )}
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Billing Email</div>
                <div className="text-xs text-[#1D8B94] font-medium mt-0.5">
                  {payment.customerEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Linked Invoice & Subscription */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Billing Associations
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#E2F4F0]/30 border border-[#98D8D0]/40">
              <div>
                <div className="text-[11px] text-slate-500">Linked Invoice:</div>
                <div className="text-xs font-mono font-bold text-[#04222B] flex items-center gap-1.5 mt-0.5">
                  <span>{payment.invoiceNumber}</span>
                </div>
              </div>
              {onViewInvoice && (
                <button
                  onClick={() => onViewInvoice(payment.invoiceId)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D8B94] hover:text-[#10606F] cursor-pointer"
                >
                  <span>View Full Invoice</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {payment.subscriptionNumber && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">Subscription: </span>
                  <span className="font-mono font-bold text-[#0A3D4A]">
                    {payment.subscriptionNumber}
                  </span>
                </div>
                {payment.planName && (
                  <span className="text-xs font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {payment.planName}
                  </span>
                )}
              </div>
            )}

            {payment.notes && (
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-semibold text-[#04222B]">Notes: </span>
                {payment.notes}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#1D8B94]" />
            <span>PCI-DSS Validated Audit Trail</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#04222B] bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
