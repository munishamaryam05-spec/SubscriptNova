export type PaymentStatus = 'successful' | 'pending' | 'failed' | 'refunded';

export type PaymentMethod = 'upi' | 'card' | 'bank_transfer' | 'cash';

export interface PaymentRecord {
  id: string;
  transactionId: string; // e.g. TXN-2026-8801
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  subscriptionId?: string;
  subscriptionNumber?: string;
  planName?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDate: string; // YYYY-MM-DD
  referenceNumber?: string; // UPI Ref / Card Last 4 / Bank Wire Ref
  notes?: string;
  failureReason?: string;
  refundedAmount?: number;
  refundedAt?: string;
  createdAt: string;
}

export interface PaymentFormData {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  subscriptionId?: string;
  subscriptionNumber?: string;
  planName?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}
