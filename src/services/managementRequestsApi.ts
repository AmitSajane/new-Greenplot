/**
 * Farmer → "Request Management" for an admin-approved farm. See
 * supabase/add_farm_management_requests.sql and
 * supabase/add_management_request_details.sql. This app only ever creates a
 * request, reads the requesting farmer's own, and lets them withdraw it —
 * reviewing/assigning is the separate Admin portal's job, done from its own
 * backend (service role). A farmer's client can never set status to anything
 * but PENDING_REVIEW (on create) or WITHDRAWN (via the RPC below).
 */
import { supabase } from './supabase';

function db() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

export type ManagementRequestStatus =
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CANCELLED';

/** Every status a request can be in while still "active" (blocks a duplicate). */
export const ACTIVE_REQUEST_STATUSES: ManagementRequestStatus[] = ['PENDING_REVIEW', 'UNDER_REVIEW', 'SHORTLISTED'];

export const MANAGEMENT_REQUEST_STATUS_LABEL: Record<ManagementRequestStatus, string> = {
  PENDING_REVIEW: 'Request Submitted',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  APPROVED: 'Management Approved',
  REJECTED: 'Request Not Approved',
  WITHDRAWN: 'Withdrawn',
  CANCELLED: 'Cancelled',
};

export interface ManagementRequest {
  id: string;
  landId: string;
  farmerId: string;
  ownerId: string;
  status: ManagementRequestStatus;
  preferredCrop?: string;
  farmingExperience?: string;
  previousCrops?: string;
  preferredStartDate?: string;
  expectedDuration?: string;
  farmerNotes?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
}

export interface SubmitManagementRequestInput {
  landId: string;
  farmerId: string;
  ownerId: string;
  preferredCrop?: string;
  farmingExperience?: string;
  previousCrops?: string;
  preferredStartDate?: string;
  expectedDuration?: string;
  farmerNotes?: string;
}

/** Thrown by submitRequest() for the two cases the spec calls out explicitly. */
export class ManagementRequestError extends Error {
  code: 'UNAVAILABLE' | 'DUPLICATE';
  existingRequestId?: string;
  constructor(code: 'UNAVAILABLE' | 'DUPLICATE', message: string, existingRequestId?: string) {
    super(message);
    this.code = code;
    this.existingRequestId = existingRequestId;
  }
}

const rowToApp = (r: any): ManagementRequest => ({
  id: r.id,
  landId: r.land_id,
  farmerId: r.farmer_id,
  ownerId: r.owner_id,
  status: r.status,
  preferredCrop: r.preferred_crop || undefined,
  farmingExperience: r.farming_experience || undefined,
  previousCrops: r.previous_crops || undefined,
  preferredStartDate: r.preferred_start_date || undefined,
  expectedDuration: r.expected_duration || undefined,
  farmerNotes: r.farmer_notes || undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  reviewedAt: r.reviewed_at || undefined,
  reviewedBy: r.reviewed_by || undefined,
  adminNotes: r.admin_notes || undefined,
});

export const managementRequestsApi = {
  /** This farmer's own requests, across every farm. */
  async fetchMine(farmerId: string): Promise<ManagementRequest[]> {
    const { data } = await db()
      .from('management_requests')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    return (data || []).map(rowToApp);
  },

  async fetchById(requestId: string): Promise<ManagementRequest | undefined> {
    const { data } = await db().from('management_requests').select('*').eq('id', requestId).maybeSingle();
    return data ? rowToApp(data) : undefined;
  },

  async submitRequest(input: SubmitManagementRequestInput): Promise<string> {
    const client = db();

    // Section 10 — re-verify the farm is still approved+available right
    // before submitting (the farmer may have had this form open a while).
    // Reuses the same lands_available_for_management view Step 3 built —
    // no separate availability logic to keep in sync.
    const { data: available } = await client
      .from('lands_available_for_management')
      .select('id')
      .eq('id', input.landId)
      .maybeSingle();
    if (!available) {
      throw new ManagementRequestError('UNAVAILABLE', 'This farm is no longer available for management.');
    }

    // Section 9 — a farmer can't have two active requests for the same farm.
    const { data: existing } = await client
      .from('management_requests')
      .select('id')
      .eq('land_id', input.landId)
      .eq('farmer_id', input.farmerId)
      .in('status', ACTIVE_REQUEST_STATUSES)
      .maybeSingle();
    if (existing) {
      throw new ManagementRequestError(
        'DUPLICATE',
        'You already have an active management request for this farm.',
        existing.id,
      );
    }

    const { data, error } = await client
      .from('management_requests')
      .insert({
        land_id: input.landId,
        farmer_id: input.farmerId,
        owner_id: input.ownerId,
        preferred_crop: input.preferredCrop || null,
        farming_experience: input.farmingExperience || null,
        previous_crops: input.previousCrops || null,
        preferred_start_date: input.preferredStartDate || null,
        expected_duration: input.expectedDuration || null,
        farmer_notes: input.farmerNotes || null,
        status: 'PENDING_REVIEW',
      })
      .select('id')
      .single();

    if (error) {
      // Fallback if two submits raced past the check above — the partial
      // unique index in add_management_request_details.sql rejects it.
      if (error.code === '23505') {
        throw new ManagementRequestError('DUPLICATE', 'You already have an active management request for this farm.');
      }
      throw error;
    }
    return data.id as string;
  },

  async withdrawRequest(requestId: string): Promise<void> {
    const { error } = await db().rpc('withdraw_own_management_request', { p_request_id: requestId });
    if (error) throw error;
  },
};
