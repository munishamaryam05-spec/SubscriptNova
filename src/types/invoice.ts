import { BillingFrequency } from './plan';

export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'cancelled';

export type InvoiceDisplayStatus =
  | 'draft'
  | 'confirmed'
  | 'paid'
  | 'overdue'
  | 'partially_paid'
  | 'cancelled';

export type InvoiceDiscountType = 'percentage' | 'fixed';

export interface InvoiceLineItem {
  id: string;
  description: string;
  productId?: string;
  productName?: string;
  variantId?: string;
  variantName?: string;
  planId?: string;
  planName?: string;
  quantity: number;
  unitPrice: number;
  amount: number; // quantity * unitPrice
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-1083
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerBillingAddress?: string;
  customerTaxId?: string;

  // Subscription Reference & Snapshot
  subscriptionId?: string;
  subscriptionNumber?: string;
  planName?: string;
  billingFrequency?: BillingFrequency;

  // Billing Period (Start, End & Unique Duplicate Prevention Key)
  billingPeriodStart: string; // YYYY-MM-DD
  billingPeriodEnd: string; // YYYY-MM-DD
  billingPeriodKey: string; // e.g. sub-01_2026-01-01_2026-12-31

  // Dates
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD

  // Line items snapshot
  items: InvoiceLineItem[];

  // Financial Snapshot
  subtotal: number;
  discountType: InvoiceDiscountType;
  discountValue: number;
  discountAmount: number;
  taxRate: number; // e.g. 10 (%)
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number; // totalAmount - paidAmount

  // Lifecycle Status
  status: InvoiceStatus;

  notes?: string;
  terms?: string;
  createdAt: string;
  confirmedAt?: string;
  paidAt?: string;
}

export interface InvoiceFormData {
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerBillingAddress?: string;
  customerTaxId?: string;

  subscriptionId?: string;
  subscriptionNumber?: string;
  planName?: string;
  billingFrequency?: BillingFrequency;

  billingPeriodStart: string;
  billingPeriodEnd: string;

  issueDate: string;
  dueDate: string;

  items: InvoiceLineItem[];

  discountType: InvoiceDiscountType;
  discountValue: number;
  taxRate: number;

  status: InvoiceStatus;
  notes?: string;
  terms?: string;
}

export interface BillingRunResult {
  runDate: string;
  totalEvaluated: number;
  invoicesGeneratedCount: number;
  totalInvoicedAmount: number;
  generatedInvoices: Invoice[];
  skippedSubscriptions: {
    subscriptionId: string;
    subscriptionNumber: string;
    customerName: string;
    reason: string;
  }[];
  errors: string[];
}
