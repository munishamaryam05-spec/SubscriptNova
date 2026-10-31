import { InvoiceItem } from './navigation';

export interface CustomerSubscription {
  id: string;
  planName: string;
  amount: number;
  cadence: 'Monthly' | 'Annual' | 'Quarterly';
  status: 'active' | 'paused' | 'past_due' | 'canceled';
  startDate: string;
  renewalDate: string;
}

export interface CustomerPayment {
  id: string;
  paymentMethod: string; // e.g. "Visa •••• 4242", "ACH Transfer •••• 9102"
  amount: number;
  status: 'succeeded' | 'failed' | 'pending';
  date: string;
  transactionRef: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phoneNumber: string;
  status: 'active' | 'inactive';
  subscriptionCount: number;
  totalRevenue: number;
  joinedDate: string;
  billingAddress: string;
  taxId?: string;
  subscriptions: CustomerSubscription[];
  invoices: InvoiceItem[];
  payments: CustomerPayment[];
}

export interface CustomerFormData {
  name: string;
  email: string;
  company: string;
  phoneNumber: string;
  status: 'active' | 'inactive';
  billingAddress: string;
  taxId?: string;
}
