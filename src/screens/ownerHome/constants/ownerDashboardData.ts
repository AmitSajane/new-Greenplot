/** Dashboard data helpers for the redesigned Owner Home screen. */
import type { FarmListing } from '../../../context/FarmListingsContext';
import type { ActiveLease } from '../../../types/lease';

// pendingDues* kept for reference — the Pending dues tile is hidden until a
// real payments-tracking flow exists (leases.next_payment is never populated
// today). avgRentDisplay was removed here since it's now computed for real
// from ownerListings' pricePerYear/acres instead of being a mock constant.
export const OWNER_METRICS = {
  pendingDuesDisplay: '₹18,000',
  pendingDuesSub: '2 tenants overdue',
};

export type PropertyStatus = 'leased' | 'vacant';

export interface PropertySnapshot {
  id: string;
  name: string;
  emoji: string;
  status: PropertyStatus;
  meta: string;
  rentDisplay?: string;
  /** Real lease start date (from the matching ActiveLease) — only set when leased. */
  since?: string;
  ctaLabel?: string;
}

/** Build property cards from real listings + real active leases, so taps resolve
 *  in PropertyDetails AND the status/tenant/rent shown actually matches the
 *  listing's real `status` — previously this read a hardcoded demo-id lookup
 *  table that only covered 3 fake seed ids, so every real property silently
 *  showed as "vacant" with a "List now" CTA no matter its true status. */
export function buildPropertySnapshots(listings: FarmListing[], activeLeases: ActiveLease[]): PropertySnapshot[] {
  return listings.map(l => {
    const acres = l.acresLabel || `${l.acres} acres`;
    if (l.status === 'leased') {
      const lease = activeLeases.find(al => al.landId === l.id);
      return {
        id: l.id,
        name: l.title,
        emoji: '🌾',
        status: 'leased',
        meta: `${acres} · ${l.lastYearCrop ?? l.currentCrop ?? 'Crop'}${lease ? ` · Tenant: ${lease.farmerName}` : ''}`,
        rentDisplay: `${l.pricePerYear}/yr`,
        since: lease?.startDate,
      };
    }
    return {
      id: l.id,
      name: l.title,
      emoji: '🟩',
      status: 'vacant',
      meta: `${acres} · Available to lease`,
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
