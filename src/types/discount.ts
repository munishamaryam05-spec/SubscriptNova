export type DiscountType = 'percentage' | 'fixed';

export type DiscountStatus = 'active' | 'expired' | 'inactive';

export interface DiscountCode {
  id: string;
  code: string; // uppercase alphanumeric, e.g. WELCOME20
  description: string;
  type: DiscountType;
  value: number; // percentage (0-100) or fixed dollar amount
  minOrderAmount?: number; // minimum invoice/sub total
  maxDiscountAmount?: number; // cap for percentage discounts
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  maxUses?: number; // optional usage limit
  usedCount: number; // times applied
  isActive: boolean; // administrative toggle
  applicableTo: 'all' | 'plans' | 'products';
  createdAt: string;
}

export interface DiscountFormData {
  code: string;
  description: string;
  type: DiscountType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  expiryDate: string;
  maxUses?: number;
  isActive: boolean;
  applicableTo: 'all' | 'plans' | 'products';
}

export interface DiscountValidationResult {
  isValid: boolean;
  discount?: DiscountCode;
  discountAmount?: number;
  error?: string;
}
