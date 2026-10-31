export type NavigationTab =
  | 'dashboard'
  | 'customers'
  | 'products'
  | 'plans'
  | 'quotations'
  | 'subscriptions'
  | 'invoices'
  | 'payments'
  | 'discounts'
  | 'leakage'
  | 'analytics';

export interface NavItemConfig {
  id: NavigationTab;
  label: string;
  category: 'core' | 'catalog' | 'billing' | 'insights';
  badge?: string;
  description: string;
}

export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  benchmark: string;
  period: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: 'Monthly' | 'Annual' | 'Quarterly';
  status: 'paid' | 'processing' | 'past_due' | 'draft';
  issueDate: string;
  dueDate: string;
}

export interface ActivityEvent {
  id: string;
  type: 'new_sub' | 'upgrade' | 'renewal' | 'churn' | 'payment_failed';
  title: string;
  description: string;
  amount?: string;
  timeAgo: string;
  account: string;
}

export interface PlanTier {
  id: string;
  name: string;
  pricePerMonth: number;
  subscribers: number;
  mrr: number;
  color: string;
  percentage: number;
}
