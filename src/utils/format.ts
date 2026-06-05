/** Currency / number display helpers. */

export function formatIndianRevenue(amount: number): string {
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}k`;
  return `₹${amount}`;
}

export function parseEarningsString(value: string | undefined): number {
  if (!value) return 0;
  return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
}
