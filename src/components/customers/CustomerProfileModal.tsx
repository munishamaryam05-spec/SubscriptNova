import React, { useState } from 'react';
import {
  X,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Repeat,
  CreditCard,
  Edit3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCode2,
  DollarSign,
  TrendingUp,
  Receipt,
  ExternalLink,
} from 'lucide-react';
import { Customer } from '../../types/customer';

interface CustomerProfileModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'subscriptions' | 'invoices' | 'payments'>('overview');

  if (!isOpen || !customer) return null;

  const totalPaid = customer.payments
    .filter((p) => p.status === 'succeeded')
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Strip */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#102B4E] text-[#10B981] flex items-center justify-center text-sm font-bold shadow-xs">
              {customer.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[#102B4E] tracking-tight">
                  {customer.company}
                </h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    customer.status === 'active'
                      ? 'bg-emerald-50 text-[#10B981] border border-emerald-200/60'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {customer.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{customer.name}</span>
                <span>·</span>
                <span className="font-mono text-[11px] text-slate-400">{customer.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(customer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              aria-label="Close profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white border-b border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Total Revenue / Paid
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#102B4E] tabular-nums mt-0.5">
              ${(totalPaid || customer.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-[#10B981] font-medium mt-0.5">Lifetime collected</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Active Subscriptions
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#102B4E] tabular-nums mt-0.5">
              {customer.subscriptionCount}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              {customer.subscriptions.length > 0 ? customer.subscriptions[0].planName : 'No active tiers'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Invoices Issued
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#102B4E] tabular-nums mt-0.5">
              {customer.invoices.length}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              {customer.invoices.some((i) => i.status === 'past_due') ? (
                <span className="text-[#EF4444]">1 Past Due</span>
              ) : (
                'All settled'
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Customer Since
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-800 tabular-nums mt-0.5">
              {customer.joinedDate}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Verified account</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-5 border-b border-slate-200 flex items-center gap-4 bg-slate-50/40 text-xs">
          <button
            onClick={() => setActiveProfileTab('overview')}
            className={`py-3 font-semibold border-b-2 transition-all cursor-pointer ${
              activeProfileTab === 'overview'
                ? 'border-[#102B4E] text-[#102B4E]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveProfileTab('subscriptions')}
            className={`py-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeProfileTab === 'subscriptions'
                ? 'border-[#102B4E] text-[#102B4E]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Subscriptions</span>
            <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
              {customer.subscriptions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveProfileTab('invoices')}
            className={`py-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeProfileTab === 'invoices'
                ? 'border-[#102B4E] text-[#102B4E]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Invoices</span>
            <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
              {customer.invoices.length}
            </span>
          </button>
          <button
            onClick={() => setActiveProfileTab('payments')}
            className={`py-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeProfileTab === 'payments'
                ? 'border-[#102B4E] text-[#102B4E]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Payment History</span>
            <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
              {customer.payments.length}
            </span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeProfileTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-[#102B4E] uppercase tracking-wider">
                    Contact & Account Information
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-500">Email:</span>
                      <span className="font-mono font-medium text-slate-900">{customer.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-mono text-slate-900">{customer.phoneNumber}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-500">Company:</span>
                      <span className="font-semibold text-slate-900">{customer.company}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-500">Registered:</span>
                      <span className="text-slate-900">{customer.joinedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-[#102B4E] uppercase tracking-wider">
                    Billing & Tax Details
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 block">Billing Address:</span>
                        <span className="text-slate-900 leading-snug">
                          {customer.billingAddress || 'No billing address on file.'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-slate-500">Tax Identification / VAT:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {customer.taxId || 'Exempt / Not provided'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Currency Default:</span>
                      <span className="font-mono font-semibold text-[#102B4E]">USD ($)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Status Highlight */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                  <div>
                    <div className="font-bold text-[#102B4E]">Automated Billing Active</div>
                    <div className="text-[11px] text-emerald-800 mt-0.5">
                      Customer is enrolled in automated renewal cycles with synchronized invoice settlement.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE SUBSCRIPTIONS */}
          {activeProfileTab === 'subscriptions' && (
            <div className="space-y-3">
              {customer.subscriptions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Repeat className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">No subscriptions on record</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    This customer currently has no active or pending subscription tiers.
                  </p>
                </div>
              ) : (
                customer.subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#102B4E]/10 flex items-center justify-center text-[#102B4E]">
                        <Repeat className="w-4 h-4 text-[#10B981]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{sub.planName}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                              sub.status === 'active'
                                ? 'bg-emerald-50 text-[#10B981]'
                                : sub.status === 'past_due'
                                ? 'bg-red-50 text-[#EF4444]'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {sub.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Started: {sub.startDate} · Next Renewal: {sub.renewalDate}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-[#102B4E] text-sm tabular-nums">
                        ${sub.amount.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Billed {sub.cadence}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: INVOICES */}
          {activeProfileTab === 'invoices' && (
            <div className="space-y-3">
              {customer.invoices.length === 0 ? (
                <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">No invoices generated</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No billing cycles or manual invoices exist for this account yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase">
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Plan / Description</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Issue Date</th>
                        <th className="py-2.5 px-3">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customer.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-mono font-medium text-[#102B4E]">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{inv.planName}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#102B4E] tabular-nums">
                            ${inv.amount.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                inv.status === 'paid'
                                  ? 'bg-emerald-50 text-[#10B981]'
                                  : inv.status === 'past_due'
                                  ? 'bg-red-50 text-[#EF4444]'
                                  : 'bg-blue-50 text-blue-600'
                              }`}
                            >
                              {inv.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{inv.issueDate}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">{inv.dueDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENT HISTORY */}
          {activeProfileTab === 'payments' && (
            <div className="space-y-3">
              {customer.payments.length === 0 ? (
                <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">No payment transactions recorded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customer.payments.map((pmt) => (
                    <div
                      key={pmt.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            pmt.status === 'succeeded'
                              ? 'bg-emerald-50 text-[#10B981]'
                              : pmt.status === 'failed'
                              ? 'bg-red-50 text-[#EF4444]'
                              : 'bg-amber-50 text-[#F59E0B]'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{pmt.paymentMethod}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Ref: {pmt.transactionRef} · {pmt.date}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-[#102B4E] tabular-nums text-sm">
                          ${pmt.amount.toFixed(2)}
                        </div>
                        <div
                          className={`text-[10px] font-mono font-semibold ${
                            pmt.status === 'succeeded'
                              ? 'text-[#10B981]'
                              : pmt.status === 'failed'
                              ? 'text-[#EF4444]'
                              : 'text-[#F59E0B]'
                          }`}
                        >
                          {pmt.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            ID: {customer.id} · SubscriptNova Master Account
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] rounded-lg transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
