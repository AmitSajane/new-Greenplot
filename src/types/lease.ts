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
  status: 'active';
  createdAt: string;
}
