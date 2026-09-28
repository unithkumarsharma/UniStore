/**
 * Formats a numerical amount into Indian Rupee format (e.g., ₹8,499)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates percentage discount between compare price and base price
 */
export function calculateDiscount(basePrice: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= basePrice) return 0;
  return Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100);
}
