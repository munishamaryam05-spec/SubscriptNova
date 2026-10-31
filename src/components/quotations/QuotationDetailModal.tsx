import React from 'react';
import {
  X,
  FileSpreadsheet,
  Printer,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Building,
  Mail,
  Calendar,
  Layers,
  Repeat,
  Download,
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../../types/quotation';

interface QuotationDetailModalProps {
  quotation: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (quotationId: string, newStatus: QuotationStatus) => void;
  onDuplicate: (quotation: Quotation) => void;
  onConvertToSubscription?: (quotation: Quotation) => void;
}

export const QuotationDetailModal: React.FC<QuotationDetailModalProps> = ({
  quotation,
  isOpen,
  onClose,
  onUpdateStatus,
  onDuplicate,
  onConvertToSubscription,
}) => {
  if (!isOpen || !quotation) return null;

  const isExpired =
    quotation.status === 'expired' ||
    (quotation.validUntil &&
      new Date(quotation.validUntil) < new Date() &&
      quotation.status !== 'accepted');

  const displayStatus: QuotationStatus = isExpired && quotation.status !== 'accepted' ? 'expired' : quotation.status;

  const getStatusBadge = () => {
    switch (displayStatus) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-emerald-50 text-[#10B981] border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ACCEPTED</span>
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Send className="w-3.5 h-3.5" />
            <span>SENT TO CLIENT</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-red-50 text-[#EF4444] border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>REJECTED</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-amber-50 text-[#F59E0B] border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>EXPIRED</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span>DRAFT</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#102B4E] text-[#10B981] flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold font-mono text-[#102B4E]">
                  {quotation.quotationNumber}
                </h2>
                {getStatusBadge()}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                <span>{quotation.customerCompany}</span>
                <span> · </span>
                <span>Contact: {quotation.customerName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDuplicate(quotation)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              title="Duplicate as new draft quotation"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Duplicate</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              title="Print quotation document"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Quotation Sheet Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Status Transitions Bar */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600">Workflow Transitions:</span>
              <span className="text-[10px] text-slate-400">Click to update quotation state</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {displayStatus === 'draft' && (
                <button
                  onClick={() => onUpdateStatus(quotation.id, 'sent')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Mark as Sent</span>
                </button>
              )}

              {displayStatus !== 'accepted' && (
                <button
                  onClick={() => onUpdateStatus(quotation.id, 'accepted')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#10B981] hover:bg-emerald-600 rounded-md transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Accept Proposal</span>
                </button>
              )}

              {displayStatus !== 'rejected' && displayStatus !== 'accepted' && (
                <button
                  onClick={() => onUpdateStatus(quotation.id, 'rejected')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-red-50 hover:text-[#EF4444] rounded-md transition-colors cursor-pointer"
                >
                  <XCircle className="w-3 h-3" />
                  <span>Mark Rejected</span>
                </button>
              )}

              {displayStatus === 'accepted' && (
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Proposal Contract Executed</span>
                </div>
              )}
            </div>
          </div>

          {/* Parties Header */}
          <div className="grid grid-cols-2 gap-6 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Client Organization
              </span>
              <div className="text-sm font-bold text-slate-900">{quotation.customerCompany}</div>
              <div className="text-slate-600 mt-0.5">{quotation.customerName}</div>
              <div className="text-slate-500 font-mono text-[11px]">{quotation.customerEmail}</div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Issuer / Vendor
              </span>
              <div className="text-sm font-bold text-[#102B4E]">Acme Cloud Technologies</div>
              <div className="text-slate-600">SubscriptNova Revenue Platform</div>
              <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                Date: {quotation.quotationDate}
              </div>
              <div className="text-slate-400 text-[11px] font-mono">
                Valid Until: {quotation.validUntil}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Cadence / Tier</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotation.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{item.productName}</div>
                      {item.variantName && (
                        <div className="text-[11px] text-slate-400">{item.variantName}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {item.planFrequency ? `Billed ${item.planFrequency}` : 'One-off / Recurring'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono font-medium tabular-nums">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#102B4E] tabular-nums">
                      ${item.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="pt-2 flex justify-end">
            <div className="w-64 space-y-1.5 text-right font-mono text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>${quotation.subtotal.toFixed(2)}</span>
              </div>
              {quotation.discountAmount > 0 && (
                <div className="flex justify-between text-[#10B981] font-semibold">
                  <span>
                    Discount ({quotation.discountType === 'percentage' ? `${quotation.discountValue}%` : '$'}):
                  </span>
                  <span>-${quotation.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Tax / VAT ({quotation.taxRate}%):</span>
                <span>+${quotation.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#102B4E] pt-2 border-t border-slate-300">
                <span>Total Amount:</span>
                <span>${quotation.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms Box */}
          {(quotation.notes || quotation.terms) && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              {quotation.notes && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Notes
                  </span>
                  <p className="text-slate-700 mt-0.5">{quotation.notes}</p>
                </div>
              )}
              {quotation.terms && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Terms & Commercial Conditions
                  </span>
                  <p className="text-slate-600 mt-0.5">{quotation.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Accepted Conversion Notice */}
          {displayStatus === 'accepted' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                <div>
                  <div className="font-bold text-[#102B4E]">Ready for Subscription Conversion</div>
                  <div className="text-[11px] text-emerald-800">
                    This accepted proposal is validated to create live recurring subscriptions for {quotation.customerCompany}.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            {quotation.items.length} item(s) · Valid until {quotation.validUntil}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] rounded-lg transition-colors cursor-pointer"
          >
            Close Proposal
          </button>
        </div>
      </div>
    </div>
  );
};
