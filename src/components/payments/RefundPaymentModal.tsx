import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PaymentRecord } from '../../types/payment';

interface RefundPaymentModalProps {
  payment: PaymentRecord | null;
  onClose: () => void;
  onConfirmRefund: (paymentId: string, refundAmount: number, reason: string) => void;
}

export const RefundPaymentModal: React.FC<RefundPaymentModalProps> = ({
  payment,
  onClose,
  onConfirmRefund,
}) => {
  if (!payment) return null;

  const maxRefundable = payment.amount - (payment.refundedAmount || 0);
  const [refundAmount, setRefundAmount] = useState<number>(maxRefundable);
  const [reason, setReason] = useState<string>('Customer requested refund / service credit');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refundAmount <= 0) {
      setError('Refund amount must be greater than $0.00.');
      return;
    }
    if (refundAmount > maxRefundable) {
      setError(`Refund amount cannot exceed max refundable balance of $${maxRefundable.toFixed(2)}.`);
      return;
    }

    onConfirmRefund(payment.id, refundAmount, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04222B]/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-purple-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-800 flex items-center justify-center text-purple-200">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Process Refund</h2>
              <p className="text-[11px] text-purple-200">Transaction {payment.transactionId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-purple-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Original Payment:</span>
              <span className="font-bold">${payment.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Customer:</span>
              <span className="font-medium">{payment.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Max Refundable:</span>
              <span className="font-bold text-purple-700">${maxRefundable.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0A3D4A] mb-1">
              Refund Amount ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={maxRefundable}
              value={refundAmount}
              onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 text-[#04222B]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0A3D4A] mb-1">
              Refund Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white text-[#04222B]"
            >
              <option value="Customer requested refund / service credit">
                Customer requested refund / service credit
              </option>
              <option value="Duplicate payment received">Duplicate payment received</option>
              <option value="Dissatisfaction with service / SLA breach">
                Dissatisfaction with service / SLA breach
              </option>
              <option value="Subscription cancelled prior to cycle start">
                Subscription cancelled prior to cycle start
              </option>
              <option value="Administrative correction">Administrative correction</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-[#04222B] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Confirm Refund</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
