import { BillingFrequency } from './plan';

export type SubscriptionLifecycleStatus =
  | 'draft'
  | 'quotation'
  | 'confirmed'
  | 'active'
  | 'paused'
  | 'closed';

export interface SubscriptionStatusEvent {
  id: string;
  fromStatus?: SubscriptionLifecycleStatus;
  toStatus: SubscriptionLifecycleStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface SubscriptionRecord {
  id: string;
  subscriptionNumber: string; // e.g. SUB-2026-0481
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  planId: string;
  planName: string;
  billingFrequency: BillingFrequency;
  unitPrice: number;
  quantity: number;
  totalAmount: number; // unitPrice * quantity
  startDate: string; // YYYY-MM-DD
  nextBillingDate: string; // YYYY-MM-DD
  status: SubscriptionLifecycleStatus;
  linkedQuotationId?: string;
  linkedQuotationNumber?: string;
  timeline: SubscriptionStatusEvent[];
  notes?: string;
  dateCreated: string;
}

export interface SubscriptionFormData {
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  planId: string;
  planName: string;
  billingFrequency: BillingFrequency;
  unitPrice: number;
  quantity: number;
  startDate: string;
  status: SubscriptionLifecycleStatus;
  linkedQuotationId?: string;
  linkedQuotationNumber?: string;
  notes?: string;
}
