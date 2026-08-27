/**
 * Lease Closure / Early Termination data layer (Supabase).
 *
 * Same shape as leaseApi.ts: snake_case ↔ camelCase mappers + async
 * functions + subscribe(). LeaseContext calls into this when Supabase is
 * configured; otherwise it mutates its own in-memory mock state, exactly
 * like every other part of the lease domain already does.
 */
import { supabase } from './supabase';
import { computeEligibleClosureDate } from '../constants/leaseClosure';
import {
  ClosureHistoryEntry,
  LeaseClosure,
  OwnerClosureResponse,
  SettlementDeduction,
  SettlementLineItem,
  StandingCropOption,
} from '../types/lease';

function db() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

const closureToApp = (r: any): LeaseClosure => ({
  id: r.id,
  leaseId: r.lease_id,
  landId: r.land_id,
  landTitle: r.land_title || '',
  farmerId: r.farmer_id,
  farmerName: r.farmer_name || '',
  ownerId: r.owner_id,
  ownerName: r.owner_name || '',
  status: r.status,
  reason: r.reason,
  comments: r.comments || undefined,
  proposedHandoverDate: r.proposed_handover_date,
  requestedAt: r.requested_at,
  noticePeriodDays: r.notice_period_days,
  noticeWaived: !!r.notice_waived,
  eligibleClosureDate: r.eligible_closure_date || undefined,
  ownerResponse: r.owner_response || undefined,
  ownerResponseComments: r.owner_response_comments || undefined,
  ownerProposedDate: r.owner_proposed_date || undefined,
  ownerRespondedAt: r.owner_responded_at || undefined,
  pendingRent: r.pending_rent ?? undefined,
  pendingWater: r.pending_water ?? undefined,
  pendingElectricity: r.pending_electricity ?? undefined,
  otherExpenses: r.other_expenses || [],
  securityDeposit: r.security_deposit ?? undefined,
  deductions: r.deductions || [],
  settlementConfirmed: !!r.settlement_confirmed,
  standingCropOption: r.standing_crop_option || undefined,
  standingCropDeadline: r.standing_crop_deadline || undefined,
  standingCropNotes: r.standing_crop_notes || undefined,
  standingCropResolved: !!r.standing_crop_resolved,
  farmerPhotos: r.farmer_photos || [],
  ownerPhotos: r.owner_photos || [],
  farmerHandoverNotes: r.farmer_handover_notes || undefined,
  ownerHandoverNotes: r.owner_handover_notes || undefined,
  farmerConfirmedAt: r.farmer_confirmed_at || undefined,
  ownerConfirmedAt: r.owner_confirmed_at || undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const historyToApp = (r: any): ClosureHistoryEntry => ({
  id: r.id,
  closureId: r.closure_id,
  action: r.action,
  performedBy: r.performed_by,
  userRole: r.user_role,
  details: r.details || undefined,
  createdAt: r.created_at,
});

export interface ClosureSnapshot {
  closures: LeaseClosure[];
  history: ClosureHistoryEntry[];
}

async function logHistory(closureId: string, action: string, userId: string, role: 'farmer' | 'owner', details?: string) {
  await db().from('lease_closure_history').insert({
    closure_id: closureId, action, performed_by: userId, user_role: role, details,
  });
}

export const leaseClosureApi = {
  /** RLS already scopes both tables to the two parties, so no extra filter needed. */
  async fetchAll(): Promise<ClosureSnapshot> {
    const c = db();
    const [closures, history] = await Promise.all([
      c.from('lease_closures').select('*').order('created_at', { ascending: false }),
      c.from('lease_closure_history').select('*').order('created_at', { ascending: true }),
    ]);
    return {
      closures: (closures.data || []).map(closureToApp),
      history: (history.data || []).map(historyToApp),
    };
  },

  async requestClosure(input: {
    leaseId: string; landId: string; landTitle: string;
    farmerId: string; farmerName: string; ownerId: string; ownerName: string;
    reason: string; comments?: string; proposedHandoverDate: string;
    noticePeriodDays: number; securityDeposit?: number;
  }): Promise<string> {
    const c = db();
    const requestedAt = new Date().toISOString();
    const { data, error } = await c
      .from('lease_closures')
      .insert({
        lease_id: input.leaseId, land_id: input.landId, land_title: input.landTitle,
        farmer_id: input.farmerId, farmer_name: input.farmerName, owner_id: input.ownerId, owner_name: input.ownerName,
        status: 'requested', reason: input.reason, comments: input.comments,
        proposed_handover_date: input.proposedHandoverDate, requested_at: requestedAt,
        notice_period_days: input.noticePeriodDays,
        eligible_closure_date: computeEligibleClosureDate(requestedAt, input.noticePeriodDays),
        security_deposit: input.securityDeposit,
      })
      .select('id')
      .single();
    if (error || !data) throw error || new Error('Failed to create closure request');
    await logHistory(data.id, 'closure_requested', input.farmerId, 'farmer', input.reason);
    await c.from('notifications').insert({
      user_id: input.ownerId, type: 'lease', title: 'Lease closure requested',
      body: `${input.farmerName} requested to close the lease on ${input.landTitle}.`,
    });
    return data.id;
  },

  async respondToClosure(
    closureId: string,
    response: OwnerClosureResponse,
    by: { ownerId: string; farmerId: string; landTitle: string },
    opts?: { comments?: string; proposedDate?: string },
  ): Promise<void> {
    const c = db();
    const nextStatus =
      response === 'rejected' ? 'rejected'
      : response === 'accepted_with_settlement' ? 'settlement_pending'
      : response === 'proposed_new_date' ? 'under_review'
      : 'under_review'; // 'accepted'
    await c.from('lease_closures').update({
      owner_response: response, owner_response_comments: opts?.comments,
      owner_proposed_date: opts?.proposedDate, owner_responded_at: new Date().toISOString(),
      status: nextStatus,
    }).eq('id', closureId);
    await logHistory(closureId, `owner_${response}`, by.ownerId, 'owner', opts?.comments);
    await c.from('notifications').insert({
      user_id: by.farmerId, type: 'lease', title: 'Land owner responded to your closure request',
      body: `${by.landTitle}: the owner ${response.replace(/_/g, ' ')}.`,
    });
  },

  async waiveNoticePeriod(closureId: string, ownerId: string): Promise<void> {
    await db().from('lease_closures').update({ notice_waived: true }).eq('id', closureId);
    await logHistory(closureId, 'notice_waived', ownerId, 'owner');
  },

  async updateSettlement(
    closureId: string,
    fields: Partial<{
      pendingRent: number; pendingWater: number; pendingElectricity: number;
      otherExpenses: SettlementLineItem[]; deductions: SettlementDeduction[];
    }>,
    by: { userId: string; role: 'farmer' | 'owner' },
  ): Promise<void> {
    const row: Record<string, unknown> = {};
    if (fields.pendingRent !== undefined) row.pending_rent = fields.pendingRent;
    if (fields.pendingWater !== undefined) row.pending_water = fields.pendingWater;
    if (fields.pendingElectricity !== undefined) row.pending_electricity = fields.pendingElectricity;
    if (fields.otherExpenses !== undefined) row.other_expenses = fields.otherExpenses;
    if (fields.deductions !== undefined) row.deductions = fields.deductions;
    await db().from('lease_closures').update(row).eq('id', closureId);
    await logHistory(closureId, 'settlement_updated', by.userId, by.role);
  },

  async confirmSettlement(closureId: string, standingCropResolved: boolean, by: { userId: string; role: 'farmer' | 'owner' }): Promise<void> {
    await db().from('lease_closures').update({
      settlement_confirmed: true,
      status: standingCropResolved ? 'handover_pending' : 'settlement_pending',
    }).eq('id', closureId);
    await logHistory(closureId, 'settlement_confirmed', by.userId, by.role);
  },

  async resolveStandingCrop(
    closureId: string,
    option: StandingCropOption,
    settlementConfirmed: boolean,
    opts: { deadline?: string; notes?: string; userId: string; role: 'farmer' | 'owner' },
  ): Promise<void> {
    await db().from('lease_closures').update({
      standing_crop_option: option, standing_crop_deadline: opts.deadline, standing_crop_notes: opts.notes,
      standing_crop_resolved: true,
      status: settlementConfirmed ? 'handover_pending' : 'settlement_pending',
    }).eq('id', closureId);
    await logHistory(closureId, 'standing_crop_resolved', opts.userId, opts.role, option);
  },

  async addHandoverPhotos(closureId: string, role: 'farmer' | 'owner', urls: string[], userId: string, existing: string[]): Promise<void> {
    const column = role === 'farmer' ? 'farmer_photos' : 'owner_photos';
    await db().from('lease_closures').update({ [column]: [...existing, ...urls] }).eq('id', closureId);
    await logHistory(closureId, 'handover_photos_added', userId, role, `${urls.length} photo(s)`);
  },

  async setHandoverNotes(closureId: string, role: 'farmer' | 'owner', notes: string, userId: string): Promise<void> {
    const column = role === 'farmer' ? 'farmer_handover_notes' : 'owner_handover_notes';
    await db().from('lease_closures').update({ [column]: notes }).eq('id', closureId);
    await logHistory(closureId, 'handover_notes_added', userId, role, notes);
  },

  async confirmHandover(
    closureId: string,
    role: 'farmer' | 'owner',
    userId: string,
    otherAlreadyConfirmed: boolean,
  ): Promise<void> {
    const column = role === 'farmer' ? 'farmer_confirmed_at' : 'owner_confirmed_at';
    await db().from('lease_closures').update({
      [column]: new Date().toISOString(),
      status: otherAlreadyConfirmed ? 'ready_for_closure' : 'handover_pending',
    }).eq('id', closureId);
    await logHistory(
      closureId,
      role === 'farmer' ? 'farmer_confirmed_handover' : 'owner_confirmed_receipt',
      userId,
      role,
    );
  },

  /** Marks the closure + its lease closed, and frees up the land for re-listing. */
  async finalizeClosure(closureId: string, leaseId: string, landId: string, by: { userId: string; role: 'farmer' | 'owner' }): Promise<void> {
    const c = db();
    await c.from('lease_closures').update({ status: 'closed' }).eq('id', closureId);
    await c.from('leases').update({ status: 'closed' }).eq('id', leaseId);
    await c.from('lands').update({ status: 'active' }).eq('id', landId);
    await logHistory(closureId, 'lease_closed', by.userId, by.role);
  },

  async cancelClosure(closureId: string, by: { userId: string; role: 'farmer' | 'owner' }): Promise<void> {
    await db().from('lease_closures').update({ status: 'cancelled' }).eq('id', closureId);
    await logHistory(closureId, 'closure_cancelled', by.userId, by.role);
  },

  subscribe(onChange: () => void): () => void {
    const c = db();
    const channel = c
      .channel('lease-closure-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lease_closures' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lease_closure_history' }, onChange)
      .subscribe();
    return () => {
      c.removeChannel(channel);
    };
  },
};
