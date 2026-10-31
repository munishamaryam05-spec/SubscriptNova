export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export type DiscountType = 'percentage' | 'fixed';

export interface QuotationLineItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  planId?: string;
  planName?: string;
  planFrequency?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number; // quantity * unitPrice
}

export interface Quotation {
  id: string;
  quotationNumber: string; // e.g., QT-2026-0089
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  quotationDate: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  items: QuotationLineItem[];
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  taxRate: number; // percentage, e.g. 10
  taxAmount: number;
  totalAmount: number;
  status: QuotationStatus;
  notes?: string;
  terms?: string;
  isConvertedToSubscription?: boolean;
}

export interface QuotationFormData {
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  quotationDate: string;
  validUntil: string;
  items: QuotationLineItem[];
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  status: QuotationStatus;
  notes?: string;
  terms?: string;
}
