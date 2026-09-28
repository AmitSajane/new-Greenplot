import type { FarmListing } from '../context/FarmListingsContext';

/** Owner-facing Farm Management status. Prefers the real Admin-driven
 *  `verificationStatus`/`managementStatus` pipeline (see
 *  supabase/add_farm_management_verification.sql) once a land has been
 *  through it; falls back to the legacy `status`/`verified` fields for
 *  every land that hasn't (nothing in the new pipeline is set for those,
 *  so this stays exactly as it always was for them). */
export type ManagementStatus = 'pending_verification' | 'verified' | 'managed';

type ListingForStatus = Pick<
  FarmListing,
  'status' | 'verified' | 'verificationStatus' | 'managementStatus'
>;

export function getManagementStatus(listing: ListingForStatus): ManagementStatus {
  if (
    listing.managementStatus === 'FARMER_ASSIGNED' ||
    listing.managementStatus === 'ACTIVE_MANAGEMENT' ||
    listing.managementStatus === 'COMPLETED'
  ) {
    return 'managed';
  }
  if (listing.verificationStatus === 'APPROVED') return 'verified';
  if (listing.verificationStatus && listing.verificationStatus !== 'DRAFT') return 'pending_verification';

  // Legacy fallback — no new-pipeline data on this land yet.
  if (listing.status === 'leased') return 'managed';
  if (listing.verified) return 'verified';
  return 'pending_verification';
}

export const MANAGEMENT_STATUS_LABEL: Record<ManagementStatus, string> = {
  pending_verification: 'Under Verification',
  verified: 'Verified',
  managed: 'Managed Farm',
};

/** The three post-assignment `lands.management_status` stages, farmer/owner-facing. */
export type FarmManagementStage = 'FARMER_ASSIGNED' | 'ACTIVE_MANAGEMENT' | 'COMPLETED';

export const FARM_MANAGEMENT_STAGE_LABEL: Record<FarmManagementStage, string> = {
  FARMER_ASSIGNED: 'Farm Assigned',
  ACTIVE_MANAGEMENT: 'Active Management',
  COMPLETED: 'Management Completed',
};

export function isFarmManagementStage(value: string | undefined): value is FarmManagementStage {
  return value === 'FARMER_ASSIGNED' || value === 'ACTIVE_MANAGEMENT' || value === 'COMPLETED';
}
