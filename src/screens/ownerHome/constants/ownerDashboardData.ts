/**
 * Mock dashboard data for the redesigned Owner Home screen.
 * Headline finance numbers are mock (no backend yet); the property snapshot is
 * built from the real FarmListings so every card opens a working detail screen.
 */
import type { FarmListing } from '../../../context/FarmListingsContext';

export const OWNER_PORTFOLIO = {
  valueDisplay: '₹48.5 L',
  changePct: 8.2,
};

export const OWNER_REVENUE = {
  thisMonthDisplay: '₹1,24,500',
  changePct: 12,
  /** 6-week trend used for the sparkline (relative heights). */
  sparkline: [40, 55, 48, 70, 62, 90],
  payoutAmountDisplay: '₹45,000',
  payoutDate: 'Jun 15',
};

export const OWNER_METRICS = {
  pendingDuesDisplay: '₹18,000',
  pendingDuesSub: '2 tenants overdue',
  avgRentDisplay: '₹7,500',
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
