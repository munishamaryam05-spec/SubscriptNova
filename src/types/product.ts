export type ProductType =
  | 'Software'
  | 'Digital Service'
  | 'Add-on Component'
  | 'Usage Meter'
  | 'Physical Device'
  | 'Consulting';

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Standard", "Premium", "Enterprise"
  additionalPrice: number; // e.g., 0, 560, 1000
  sku: string; // e.g., "SN-ODOO-STD"
  availabilityStatus: 'available' | 'out_of_stock' | 'discontinued';
}

export interface Product {
  id: string;
  name: string;
  productType: ProductType;
  salesPrice: number; // Base sales price
  costPrice: number; // Cost to produce/deliver
  description: string;
  internalNotes: string;
  status: 'active' | 'inactive';
  variants: ProductVariant[];
  dateCreated: string;
  linkedSubscriptionsCount: number; // Used to guard deletion if linked to active subscriptions
}

export interface ProductFormData {
  name: string;
  productType: ProductType;
  salesPrice: number;
  costPrice: number;
  description: string;
  internalNotes: string;
  status: 'active' | 'inactive';
  variants: ProductVariant[];
}
