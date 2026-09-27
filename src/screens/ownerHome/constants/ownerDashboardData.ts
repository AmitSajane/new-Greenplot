/** Dashboard data helpers for the redesigned Owner Home screen. */
import type { FarmListing } from '../../../context/FarmListingsContext';
import type { ActiveLease } from '../../../types/lease';
import { getManagementStatus, MANAGEMENT_STATUS_LABEL, type ManagementStatus } from '../../../utils/farmManagementStatus';

// pendingDues* kept for reference — the Pending dues tile is hidden until a
// real payments-tracking flow exists (leases.next_payment is never populated
// today).
export const OWNER_METRICS = {
  pendingDuesDisplay: '₹18,000',
  pendingDuesSub: '2 tenants overdue',
};

export type PropertyStatus = ManagementStatus;

export interface PropertySnapshot {
  id: string;
  name: string;
  emoji: string;
  status: PropertyStatus;
  statusLabel: string;
  meta: string;
  /** Real assigned-farmer name (from the matching ActiveLease) — only set once managed. */
  assignedFarmerName?: string;
}

/** Build property cards from real listings + real active leases, so taps resolve
 *  in PropertyDetails AND the status/assigned-farmer shown actually matches the
 *  listing's real Farm Management status. */
export function buildPropertySnapshots(listings: FarmListing[], activeLeases: ActiveLease[]): PropertySnapshot[] {
  return listings.map(l => {
    const acres = l.acresLabel || `${l.acres} acres`;
    const status = getManagementStatus(l);
    const lease = status === 'managed' ? activeLeases.find(al => al.landId === l.id) : undefined;
    return {
      id: l.id,
      name: l.title,
      emoji: status === 'managed' ? '🌾' : '🟩',
      status,
      statusLabel: MANAGEMENT_STATUS_LABEL[status],
      meta: `${acres} · ${l.currentCrop ?? 'No crop set'}`,
      assignedFarmerName: lease?.farmerName,
    };
  });
}

/** Parse "5" / "2.5 Acres" style strings to a number. */
export function parseAcres(value: string): number {
  const n = parseFloat(String(value).replace(/[^\d.]/g, ''));
  return isNaN(n) ? 0 : n;
}

