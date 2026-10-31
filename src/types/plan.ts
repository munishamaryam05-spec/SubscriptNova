export type BillingFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface PlanSubscriptionSettings {
  autoClose: boolean; // Auto-close plan on availability end date
  allowEarlyClose: boolean; // Allow subscriber early cancellation
  allowPause: boolean; // Allow subscriber to pause cycle
  allowRenewal: boolean; // Allow automated cycle renewal
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  billingFrequency: BillingFrequency;
  price: number;
  minQuantity: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD or empty for ongoing
  settings: PlanSubscriptionSettings;
  status: 'active' | 'inactive';
  linkedSubscriptionsCount: number; // Subscriptions actively using this plan
  dateCreated: string;
  description?: string;
}

export interface PlanFormData {
  name: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  billingFrequency: BillingFrequency;
  price: number;
  minQuantity: number;
  startDate: string;
  endDate?: string;
  settings: PlanSubscriptionSettings;
  status: 'active' | 'inactive';
  description?: string;
}
