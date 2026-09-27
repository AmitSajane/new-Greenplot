import type { FarmListing } from '../context/FarmListingsContext';

/** Owner-facing Farm Management status, derived from data that already
 *  exists on a listing — no new backend field. `leased` means AgriArambh
 *  has assigned a farmer to manage it; `verified` means the land record
 *  check has passed; otherwise it's still waiting on that check. */
export type ManagementStatus = 'pending_verification' | 'verified' | 'managed';

export function getManagementStatus(listing: Pick<FarmListing, 'status' | 'verified'>): ManagementStatus {
  if (listing.status === 'leased') return 'managed';
  if (listing.verified) return 'verified';
  return 'pending_verification';
}

export const MANAGEMENT_STATUS_LABEL: Record<ManagementStatus, string> = {
  pending_verification: 'Under Verification',
  verified: 'Verified',
  managed: 'Managed Farm',
};
