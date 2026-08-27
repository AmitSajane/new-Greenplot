/**
 * Shared "DD Mon YYYY" date-label convention used across the app (e.g. the
 * `today()` helpers in LeaseContext/leaseApi, MyCropsScreen's sown date).
 * Lets a real Date (from a calendar picker) round-trip through the plain
 * text fields (`availableFrom`, `startDate`, …) that carry it today.
 */
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Parses a "DD Mon YYYY" label back into a Date, or undefined if it isn't
 *  one (e.g. free text like "Immediately" written before the calendar
 *  picker existed, or a plain "Jun 2026" month/year label). */
export function parseDateLabel(label?: string): Date | undefined {
  const match = label?.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!match) return undefined;
  const monthIndex = MONTH_ABBR.findIndex(m => m.toLowerCase() === match[2].toLowerCase());
  if (monthIndex === -1) return undefined;
  const date = new Date(Number(match[3]), monthIndex, Number(match[1]));
  return Number.isNaN(date.getTime()) ? undefined : date;
}
