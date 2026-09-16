/**
 * Financial Calculation Engine for Rental Management SaaS (V1)
 * Follows strict financial rules defined in PRD Section 19 & 20
 */

export interface SubtotalItem {
  unit_price: number;
  quantity: number;
}

export interface PaymentItem {
  amount: number;
  status: string;
}

export function calculateItemSubtotal(unitPrice: number, quantity: number): number {
  if (unitPrice < 0 || quantity <= 0) return 0;
  return Number((unitPrice * quantity).toFixed(4));
}

export function calculateRentalTotal(items: SubtotalItem[]): number {
  if (!items || items.length === 0) return 0;
  const total = items.reduce((acc, item) => {
    return acc + calculateItemSubtotal(item.unit_price, item.quantity);
  }, 0);
  return Number(total.toFixed(4));
}

export function calculateAmountPaid(payments: PaymentItem[]): number {
  if (!payments || payments.length === 0) return 0;
  const paid = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);
  return Number(paid.toFixed(4));
}

export function calculateAmountDue(rentalTotal: number, amountPaid: number): number {
  const due = Math.max(0, rentalTotal - amountPaid);
  return Number(due.toFixed(4));
}

export function validateNoOverpayment(amountDue: number, newPaymentAmount: number): {
  valid: boolean;
  message?: string;
} {
  if (newPaymentAmount <= 0) {
    return { valid: false, message: 'Payment amount must be greater than 0.' };
  }
  if (newPaymentAmount > amountDue) {
    return {
      valid: false,
      message: `Payment amount (${newPaymentAmount}) exceeds the amount due (${amountDue}). Overpayment is not allowed in V1.`,
    };
  }
  return { valid: true };
}
