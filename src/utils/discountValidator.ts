import { DiscountCode, DiscountStatus, DiscountValidationResult } from '../types/discount';

const CURRENT_SYSTEM_DATE = '2026-10-31';

export function getDiscountStatus(discount: DiscountCode, currentDate = CURRENT_SYSTEM_DATE): DiscountStatus {
  if (!discount.isActive) {
    return 'inactive';
  }
  if (discount.expiryDate && discount.expiryDate < currentDate) {
    return 'expired';
  }
  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return 'expired';
  }
  return 'active';
}

export function computeDiscountAmount(discount: DiscountCode, subtotal: number): number {
  if (subtotal <= 0) return 0;

  let amount = 0;
  if (discount.type === 'percentage') {
    amount = (subtotal * discount.value) / 100;
    if (discount.maxDiscountAmount && amount > discount.maxDiscountAmount) {
      amount = discount.maxDiscountAmount;
    }
  } else {
    // Fixed amount
    amount = Math.min(discount.value, subtotal);
  }

  return Math.round(amount * 100) / 100;
}

export function validateDiscount(
  code: string,
  subtotal: number,
  discountsList: DiscountCode[],
  currentDate = CURRENT_SYSTEM_DATE
): DiscountValidationResult {
  const normalized = (code || '').trim().toUpperCase();
  if (!normalized) {
    return { isValid: false, error: 'Discount code cannot be empty.' };
  }

  const discount = discountsList.find(
    (d) => d.code.trim().toUpperCase() === normalized
  );

  if (!discount) {
    return { isValid: false, error: `Discount code "${normalized}" was not found.` };
  }

  if (!discount.isActive) {
    return {
      isValid: false,
      discount,
      error: `Discount code "${discount.code}" has been disabled by administrators.`,
    };
  }

  if (discount.startDate && discount.startDate > currentDate) {
    return {
      isValid: false,
      discount,
      error: `Discount code "${discount.code}" is not yet active (starts on ${discount.startDate}).`,
    };
  }

  if (discount.expiryDate && discount.expiryDate < currentDate) {
    return {
      isValid: false,
      discount,
      error: `Discount code "${discount.code}" expired on ${discount.expiryDate}.`,
    };
  }

  if (discount.maxUses !== undefined && discount.maxUses !== null && discount.maxUses > 0) {
    if (discount.usedCount >= discount.maxUses) {
      return {
        isValid: false,
        discount,
        error: `Discount code "${discount.code}" has reached its maximum usage limit of ${discount.maxUses}.`,
      };
    }
  }

  if (discount.minOrderAmount && subtotal < discount.minOrderAmount) {
    return {
      isValid: false,
      discount,
      error: `Minimum order amount for "${discount.code}" is $${discount.minOrderAmount.toFixed(2)} (current subtotal is $${subtotal.toFixed(2)}).`,
    };
  }

  const discountAmount = computeDiscountAmount(discount, subtotal);

  return {
    isValid: true,
    discount,
    discountAmount,
  };
}
