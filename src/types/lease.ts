/** Shared lease-domain types (used by LeaseContext + the Supabase data layer). */
import { AgreementTerm, LeaseTypeId } from '../constants/leaseTypes';

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface LeaseRequest {
  id: string;
  landId: string;
  landTitle: string;
  offerId: string;
  typeId: LeaseTypeId;
  termsSummary: string;
  farmerId: string;
  farmerName: string;
  ownerId: string;
  ownerName: string;
  message?: string;
  status: RequestStatus;
  createdAt: string;
}

export interface Agreement {
  id: string;
  requestId: string;
  landId: string;
  landTitle: string;
  offerId: string;
  typeId: LeaseTypeId;
  typeName: string;
  termsSummary: string;
  fullTerms: AgreementTerm[];
  tenure: string;
  availableFrom: string;
  farmerId: string;
  farmerName: string;
  ownerId: string;
  ownerName: string;
  ownerSigned: boolean;
  farmerSigned: boolean;
  /** Public URL of the farmer's drawn signature (set when they sign). */
  farmerSignatureUrl?: string;
  farmerSignedAt?: string;
  status: 'awaiting' | 'active' | 'cancelled';
  createdAt: string;
  startDate?: string;
}

export interface ActiveLease {
  id: string;
  landId: string;
  landTitle: string;
  offerId: string;
  typeId: LeaseTypeId;
  typeName: string;
  termsSummary: string;
  farmerId: string;
  farmerName: string;
  ownerId: string;
  ownerName: string;
  startDate: string;
  /** Scheduled rent and due date from the leases table (when configured). */
  rent?: string;
  nextPayment?: string;
  /** 'closed' once a lease closure (see LeaseClosure) has fully completed. */
  status: 'active' | 'closed';
  createdAt: string;
}

// ── Lease Closure / Early Termination ───────────────────────────────────────

export type LeaseClosureStatus =
  | 'requested'
  | 'under_review'
  | 'settlement_pending'
  | 'handover_pending'
  | 'ready_for_closure'
  | 'closed'
  | 'rejected'
  | 'cancelled';

export type OwnerClosureResponse = 'accepted' | 'rejected' | 'proposed_new_date' | 'accepted_with_settlement';

export type StandingCropOption =
  | 'continue_until_harvest'
  | 'harvest_by_deadline'
  | 'owner_takes_possession'
  | 'mutual_agreement';

export interface SettlementLineItem {
  label: string;
  amount: number;
}

export interface SettlementDeduction {
  reason: string;
  amount: number;
}

export interface LeaseClosure {
  id: string;
  leaseId: string;
  landId: string;
  landTitle: string;
  farmerId: string;
  farmerName: string;
  ownerId: string;
  ownerName: string;
  status: LeaseClosureStatus;

  // Step 1: request
  reason: string;
  comments?: string;
  proposedHandoverDate: string;
  requestedAt: string;

  // Step 2: notice period
  noticePeriodDays: number;
  noticeWaived: boolean;
  eligibleClosureDate?: string;

  // Step 3: owner response
  ownerResponse?: OwnerClosureResponse;
  ownerResponseComments?: string;
  ownerProposedDate?: string;
  ownerRespondedAt?: string;

  // Step 4: settlement
  pendingRent?: number;
  pendingWater?: number;
  pendingElectricity?: number;
  otherExpenses: SettlementLineItem[];
  securityDeposit?: number;
  deductions: SettlementDeduction[];
  settlementConfirmed: boolean;

  // Step 5: standing crops
  standingCropOption?: StandingCropOption;
  standingCropDeadline?: string;
  standingCropNotes?: string;
  standingCropResolved: boolean;

  // Step 6: handover
  farmerPhotos: string[];
  ownerPhotos: string[];
  farmerHandoverNotes?: string;
  ownerHandoverNotes?: string;
  farmerConfirmedAt?: string;
  ownerConfirmedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ClosureHistoryEntry {
  id: string;
  closureId: string;
  action: string;
  performedBy: string;
  userRole: 'farmer' | 'owner';
  details?: string;
  createdAt: string;
}
