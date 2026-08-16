/** Dashboard data helpers for the redesigned Owner Home screen. */
import type { FarmListing } from '../../../context/FarmListingsContext';

// pendingDues* kept for reference — the Pending dues tile is hidden until a
// real payments-tracking flow exists (leases.next_payment is never populated
// today). avgRentDisplay was removed here since it's now computed for real
// from ownerListings' pricePerYear/acres instead of being a mock constant.
export const OWNER_METRICS = {
  pendingDuesDisplay: '₹18,000',
  pendingDuesSub: '2 tenants overdue',
};

export type PropertyStatus = 'leased' | 'vacant';

/** Per-listing demo lease info, keyed by FarmListing id. */
export const PROPERTY_AUGMENT: Record<
  string,
  { status: PropertyStatus; tenant?: string; emoji: string; nextPayment?: string; views?: number }
> = {
  'initial-1': { status: 'leased', tenant: 'Suresh M.', emoji: '🌾', nextPayment: 'Jun 15' },
  'initial-3': { status: 'leased', tenant: 'Anil K.', emoji: '🌱', nextPayment: 'Jul 02' },
  'initial-2': { status: 'vacant', emoji: '🟫', views: 12 },
};

const DEFAULT_AUGMENT = { status: 'vacant' as PropertyStatus, emoji: '🟩', views: 5 };

export interface PropertySnapshot {
  id: string;
  name: string;
  emoji: string;
  status: PropertyStatus;
  meta: string;
  rentDisplay?: string;
  nextPayment?: string;
  ctaLabel?: string;
}

/** Build property cards from real listings so taps resolve in PropertyDetails. */
export function buildPropertySnapshots(listings: FarmListing[]): PropertySnapshot[] {
  return listings.map(l => {
    const aug = PROPERTY_AUGMENT[l.id] ?? DEFAULT_AUGMENT;
    const acres = l.acresLabel || `${l.acres} acres`;
    if (aug.status === 'leased') {
      return {
        id: l.id,
        name: l.title,
        emoji: aug.emoji,
        status: 'leased',
        meta: `${acres} · ${l.lastYearCrop ?? l.currentCrop ?? 'Crop'} · Tenant: ${aug.tenant}`,
        rentDisplay: `${l.pricePerYear}/yr`,
        nextPayment: aug.nextPayment,
      };
    }
    return {
      id: l.id,
      name: l.title,
      emoji: aug.emoji,
      status: 'vacant',
      meta: `${acres} · ${aug.views ?? 0} views this week`,
      ctaLabel: 'List now',
    };
  });
}

/** Parse "5" / "2.5 Acres" style strings to a number. */
export function parseAcres(value: string): number {
  const n = parseFloat(String(value).replace(/[^\d.]/g, ''));
  return isNaN(n) ? 0 : n;
}

/** Parse "₹10,000" / "10000" style strings to a number. */
export function parsePrice(value?: string): number {
  const normalized = String(value ?? '').trim().toLowerCase().replace(/,/g, '');
  const n = parseFloat(normalized.replace(/[^\d.]/g, ''));
  if (isNaN(n)) return 0;
  if (/\b(?:crore|cr)\b/.test(normalized)) return n * 10_000_000;
  if (/\b(?:lakh|lac|l)\b/.test(normalized)) return n * 100_000;
  if (/\b(?:thousand|k)\b/.test(normalized)) return n * 1_000;
  return n;
}

export function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function formatCompactRupees(value: number): string {
  if (value >= 10_000_000) return `₹${Number((value / 10_000_000).toFixed(1))} Cr`;
  if (value >= 100_000) return `₹${Number((value / 100_000).toFixed(1))} L`;
  return formatRupees(value);
}
