/**
 * Lease data layer (Supabase).
 *
 * Maps DB rows (snake_case) ↔ app types (camelCase) and exposes the lease
 * lifecycle as async functions, plus `subscribe()` which streams changes from
 * Postgres → all connected phones via Supabase Realtime.
 *
 * The LeaseContext uses this when Supabase is configured; otherwise it falls
 * back to in-memory mock so the app still runs with no backend.
 */
import { supabase } from './supabase';
import {
  LeaseOffer,
  LEASE_TYPE_MAP,
  buildAgreementTerms,
  summarizeOffer,
} from '../constants/leaseTypes';
import { ActiveLease, Agreement, LeaseRequest } from '../types/lease';

function db() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

// ── mappers ─────────────────────────────────────────────────────────────────
const offerToApp = (r: any): LeaseOffer => ({
  id: r.id, landId: r.land_id, typeId: r.type_id, terms: r.terms || {}, tenure: r.tenure || '', availableFrom: r.available_from || '', createdAt: r.created_at,
});
const requestToApp = (r: any): LeaseRequest => ({
  id: r.id, landId: r.land_id, landTitle: r.land_title || '', offerId: r.offer_id, typeId: r.type_id, termsSummary: r.terms_summary || '',
  farmerId: r.farmer_id, farmerName: r.farmer_name || '', ownerId: r.owner_id, ownerName: r.owner_name || '', message: r.message || undefined,
  status: r.status, createdAt: r.created_at,
});
const agreementToApp = (r: any): Agreement => ({
  id: r.id, requestId: r.request_id, landId: r.land_id, landTitle: r.land_title || '', offerId: r.offer_id, typeId: r.type_id,
  typeName: r.type_name || '', termsSummary: r.terms_summary || '', fullTerms: r.full_terms || [], tenure: r.tenure || '', availableFrom: r.available_from || '',
  farmerId: r.farmer_id, farmerName: r.farmer_name || '', ownerId: r.owner_id, ownerName: r.owner_name || '',
  ownerSigned: !!r.owner_signed, farmerSigned: !!r.farmer_signed, status: r.status, startDate: r.start_date || undefined, createdAt: r.created_at,
});
const leaseToApp = (r: any): ActiveLease => ({
  id: r.id, landId: r.land_id, landTitle: r.land_title || '', offerId: r.offer_id, typeId: r.type_id, typeName: r.type_name || '',
  termsSummary: r.terms_summary || '', farmerId: r.farmer_id, farmerName: r.farmer_name || '', ownerId: r.owner_id, ownerName: r.owner_name || '',
  startDate: r.start_date || '', rent: r.rent || undefined, nextPayment: r.next_payment || undefined,
  status: 'active', createdAt: r.created_at,
});

const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export interface LeaseSnapshot {
  offers: LeaseOffer[];
  requests: LeaseRequest[];
  agreements: Agreement[];
  activeLeases: ActiveLease[];
}

export const leaseApi = {
  /** Load everything once (initial hydrate).
   *
   * `lease_offers` is the one publicly-readable table here (RLS: select
   * using (true)) — every farmer browsing needs to see every owner's
   * offers, so it grows with the whole app's total offers, not just one
   * user's own, and is capped for the same reason `landsApi.fetchLands`
   * is. The other three (requests/agreements/leases) are already RLS-scoped
   * to `auth.uid() in (farmer_id, owner_id)`, so the database only ever
   * returns rows the current user is a party to — their size scales with
   * one person's own activity, not total app growth, so no cap is needed
   * there. */
  async fetchAll(): Promise<LeaseSnapshot> {
    const c = db();
    const [offers, requests, agreements, leases] = await Promise.all([
      c.from('lease_offers').select('*').order('created_at', { ascending: false }).limit(500),
      c.from('lease_requests').select('*').order('created_at', { ascending: false }),
      c.from('lease_agreements').select('*').order('created_at', { ascending: false }),
      c.from('leases').select('*').order('created_at', { ascending: false }),
    ]);
    return {
      offers: (offers.data || []).map(offerToApp),
      requests: (requests.data || []).map(requestToApp),
      agreements: (agreements.data || []).map(agreementToApp),
      activeLeases: (leases.data || []).map(leaseToApp),
    };
  },

  async addOffer(offer: Omit<LeaseOffer, 'id' | 'createdAt'>, ownerId: string): Promise<void> {
    await db().from('lease_offers').insert({
      land_id: offer.landId, owner_id: ownerId, type_id: offer.typeId, terms: offer.terms, tenure: offer.tenure, available_from: offer.availableFrom,
    });
  },

  async removeOffer(id: string): Promise<void> {
    await db().from('lease_offers').delete().eq('id', id);
  },

  async applyForLease(input: {
    offer: LeaseOffer; landTitle: string; farmerId: string; farmerName: string; ownerId: string; ownerName: string; message?: string;
  }): Promise<void> {
    await db().from('lease_requests').insert({
      land_id: input.offer.landId, offer_id: input.offer.id, type_id: input.offer.typeId, land_title: input.landTitle,
      terms_summary: summarizeOffer(input.offer), farmer_id: input.farmerId, farmer_name: input.farmerName,
      owner_id: input.ownerId, owner_name: input.ownerName, message: input.message, status: 'pending',
    });
  },

  async rejectRequest(requestId: string): Promise<void> {
    await db().from('lease_requests').update({ status: 'rejected' }).eq('id', requestId);
  },

  /** Owner approves → request accepted + an owner-signed agreement is created. */
  async approveRequest(requestId: string): Promise<void> {
    const c = db();
    const { data: req } = await c.from('lease_requests').select('*').eq('id', requestId).single();
    if (!req) return;
    const { data: offerRow } = await c.from('lease_offers').select('*').eq('id', req.offer_id).single();
    const offer = offerRow ? offerToApp(offerRow) : null;
    await c.from('lease_requests').update({ status: 'accepted' }).eq('id', requestId);
    await c.from('lease_agreements').insert({
      request_id: requestId, land_id: req.land_id, offer_id: req.offer_id, type_id: req.type_id,
      land_title: req.land_title, type_name: LEASE_TYPE_MAP[req.type_id as keyof typeof LEASE_TYPE_MAP].name,
      terms_summary: req.terms_summary, full_terms: offer ? buildAgreementTerms(offer) : [],
      tenure: offer?.tenure || '', available_from: offer?.availableFrom || '',
      farmer_id: req.farmer_id, farmer_name: req.farmer_name, owner_id: req.owner_id, owner_name: req.owner_name,
      owner_signed: true, farmer_signed: false, status: 'awaiting',
    });
  },

  /** Farmer signs → if both signed, the agreement goes active + a lease row is created. */
  async signAgreementAsFarmer(agreementId: string): Promise<void> {
    const c = db();
    const { data: ag } = await c.from('lease_agreements').select('*').eq('id', agreementId).single();
    if (!ag || ag.farmer_signed) return;
    const bothSigned = ag.owner_signed === true;
    const startDate = today();
    await c.from('lease_agreements').update({
      farmer_signed: true,
      status: bothSigned ? 'active' : 'awaiting',
      start_date: bothSigned ? startDate : null,
    }).eq('id', agreementId);
    if (bothSigned) {
      await c.from('leases').insert({
        land_id: ag.land_id, offer_id: ag.offer_id, type_id: ag.type_id, type_name: ag.type_name, land_title: ag.land_title,
        terms_summary: ag.terms_summary, farmer_id: ag.farmer_id, farmer_name: ag.farmer_name, owner_id: ag.owner_id, owner_name: ag.owner_name,
        start_date: startDate, status: 'active',
      });
      await c.from('lands').update({ status: 'leased' }).eq('id', ag.land_id);
    }
  },

  /** Subscribe to all lease tables; `onChange` fires on any insert/update/delete. */
  subscribe(onChange: () => void): () => void {
    const c = db();
    const channel = c
      .channel('lease-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lease_offers' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lease_requests' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lease_agreements' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leases' }, onChange)
      .subscribe();
    return () => {
      c.removeChannel(channel);
    };
  },
};
