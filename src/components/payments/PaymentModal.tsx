import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Banknote,
  Receipt,
} from 'lucide-react';
import { PaymentFormData, PaymentMethod, PaymentStatus } from '../../types/payment';
import { Invoice } from '../../types/invoice';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentData: PaymentFormData) => void;
  invoices: Invoice[];
  initialInvoiceId?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  invoices,
  initialInvoiceId,
}) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(initialInvoiceId || '');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [status, setStatus] = useState<PaymentStatus>('successful');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Filter invoices to eligible ones (confirmed, draft, or any with balance > 0)
  const selectableInvoices = invoices.filter((i) => i.status !== 'cancelled');

  useEffect(() => {
    if (initialInvoiceId) {
      setSelectedInvoiceId(initialInvoiceId);
    } else if (selectableInvoices.length > 0 && !selectedInvoiceId) {
      setSelectedInvoiceId(selectableInvoices[0].id);
    }
  }, [initialInvoiceId, selectableInvoices]);

  useEffect(() => {
    const inv = invoices.find((i) => i.id === selectedInvoiceId);
    if (inv) {
      // Auto-fill amount with balance or total amount
      setAmount(inv.balance > 0 ? inv.balance : inv.totalAmount);
    }
  }, [selectedInvoiceId, invoices]);

  if (!isOpen) return null;

  const currentInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInvoice) {
      setError('Please select an invoice for this payment.');
      return;
    }

    if (amount <= 0) {
      setError('Payment amount must be greater than $0.00.');
      return;
    }

    setError(null);
    onSave({
      invoiceId: currentInvoice.id,
      invoiceNumber: currentInvoice.invoiceNumber,
      customerId: currentInvoice.customerId,
      customerName: currentInvoice.customerName,
      customerCompany: currentInvoice.customerCompany,
      customerEmail: currentInvoice.customerEmail,
      subscriptionId: currentInvoice.subscriptionId,
      subscriptionNumber: currentInvoice.subscriptionNumber,
      planName: currentInvoice.planName,
      amount: Number(amount),
      currency: 'USD',
      status,
      paymentMethod,
      paymentDate,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04222B]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#04222B] px-6 py-4.5 flex items-center justify-between text-white border-b border-[#0A3D4A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0A3D4A] border border-[#10606F] flex items-center justify-center text-[#4FB8B4]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Record Payment</h2>
              <p className="text-xs text-[#98D8D0]/70">
                Log an incoming settlement against an invoice
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Invoice Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
              Select Invoice to Settle <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] focus:ring-1 focus:ring-[#1D8B94] bg-white text-[#04222B]"
              required
            >
              <option value="" disabled>
                Select an invoice...
              </option>
              {selectableInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.customerCompany || inv.customerName} (Bal: $
                  {inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}) [
                  {inv.status.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Information Preview */}
          {currentInvoice && (
            <div className="p-3.5 bg-[#E2F4F0]/40 rounded-xl border border-[#98D8D0]/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-semibold text-[#04222B]">
                  {currentInvoice.customerName}{' '}
                  {currentInvoice.customerCompany && `(${currentInvoice.customerCompany})`}
                </span>
              </div>
              {currentInvoice.subscriptionNumber && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Subscription:</span>
                  <span className="font-mono text-[#10606F]">
                    {currentInvoice.subscriptionNumber} · {currentInvoice.planName}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#98D8D0]/40">
                <span className="text-slate-500 font-medium">Invoice Total & Remaining:</span>
                <div className="text-right">
                  <span className="font-bold text-[#0A3D4A]">
                    ${currentInvoice.totalAmount.toFixed(2)} Total
                  </span>
                  <span className="text-[11px] text-[#1D8B94] ml-2 font-semibold">
                    (${currentInvoice.balance.toFixed(2)} balance)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
                Payment Amount (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] focus:ring-1 focus:ring-[#1D8B94] text-[#04222B]"
                  placeholder="0.00"
                  required
                />
              </div>
              {currentInvoice && amount > currentInvoice.balance && currentInvoice.balance > 0 && (
                <p className="text-[11px] text-amber-600 mt-1">
                  Note: Amount exceeds remaining invoice balance (${currentInvoice.balance.toFixed(2)}).
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] focus:ring-1 focus:ring-[#1D8B94] text-[#04222B]"
                required
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-[#1D8B94] bg-[#E2F4F0] text-[#0A3D4A] shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1 text-[#1D8B94]" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-[#1D8B94] bg-[#E2F4F0] text-[#0A3D4A] shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Smartphone className="w-4 h-4 mb-1 text-[#4FB8B4]" />
                <span>UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-[#1D8B94] bg-[#E2F4F0] text-[#0A3D4A] shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Building className="w-4 h-4 mb-1 text-[#10606F]" />
                <span>Bank Wire</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-[#1D8B94] bg-[#E2F4F0] text-[#0A3D4A] shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Banknote className="w-4 h-4 mb-1 text-[#04222B]" />
                <span>Cash</span>
              </button>
            </div>
          </div>

          {/* Status & Reference ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
                Payment Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] focus:ring-1 focus:ring-[#1D8B94] bg-white text-[#04222B]"
              >
                <option value="successful">Successful (Funds Cleared)</option>
                <option value="pending">Pending (Processing)</option>
                <option value="failed">Failed (Declined/Error)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
                Reference / Transaction ID
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. UPI/981293 or VISA-4921"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] focus:ring-1 focus:ring-[#1D8B94] text-[#04222B]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#0A3D4A] mb-1.5">
              Internal Notes / Reconcile Memo
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via customer portal self-checkout"
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#1D8B94] focus:ring-1 focus:ring-[#1D8B94] text-[#04222B]"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-[#04222B] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#E2F4F0]" />
              <span>Record Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
