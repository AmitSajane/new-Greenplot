/**
 * LeaseContext — lease-management backbone with DUAL MODE:
 *
 *  • No backend  → in-memory mock (seeded), so the demo runs with zero setup.
 *  • Supabase on → reads/writes Supabase and subscribes to Realtime, so an
 *    action on one phone updates every other phone live.
 *
 * The mode flips automatically based on `isSupabaseConfigured` (.env). The UI
 * components never change — they just react to the context state.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  LeaseOffer,
  LEASE_TYPE_MAP,
  buildAgreementTerms,
  summarizeOffer,
} from '../constants/leaseTypes';
import {
  ActiveLease,
  Agreement,
  ClosureHistoryEntry,
  LeaseClosure,
  LeaseClosureStatus,
  LeaseRequest,
  OwnerClosureResponse,
  SettlementDeduction,
  SettlementLineItem,
  StandingCropOption,
} from '../types/lease';
import { computeEligibleClosureDate } from '../constants/leaseClosure';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { leaseApi } from '../services/leaseApi';
import { leaseClosureApi } from '../services/leaseClosureApi';
import { useAuth } from './AuthContext';
import { useFarmListings } from './FarmListingsContext';
import { parseDateLabel } from '../utils/dateLabel';

export type {
  RequestStatus, LeaseRequest, Agreement, ActiveLease,
  LeaseClosure, ClosureHistoryEntry, LeaseClosureStatus, OwnerClosureResponse, StandingCropOption,
} from '../types/lease';

interface LeaseContextType {
  offers: LeaseOffer[];
  addOffer: (o: Omit<LeaseOffer, 'id' | 'createdAt'>) => string;
  removeOffer: (id: string) => void;
  getOffersByLand: (landId: string) => LeaseOffer[];

  requests: LeaseRequest[];
  applyForLease: (input: {
    offer: LeaseOffer; landTitle: string; farmerId: string; farmerName: string; ownerId: string; ownerName: string; message?: string;
  }) => string;
  getRequestsForFarmer: (farmerId: string) => LeaseRequest[];
  /** Approves one request; every other pending request on the same land is
   *  auto-rejected and the land is locked, atomically. Rejects (throws) if
   *  the land was already taken by another approval, or this request was
   *  already decided — the caller should surface that, not assume success. */
  approveRequest: (requestId: string) => Promise<string | undefined>;
  rejectRequest: (requestId: string) => void;

  agreements: Agreement[];
  getAgreementById: (id: string) => Agreement | undefined;
  /** `signatureUrl` is the farmer's drawn signature — already uploaded (Supabase
   *  mode) or a local data URI (mock mode) — required, no signing without one. */
  signAgreementAsFarmer: (agreementId: string, signatureUrl: string) => void;

  activeLeases: ActiveLease[];
  /** True when backed by Supabase (live, multi-device). */
  realtime: boolean;

  // ── Lease Closure / Early Termination ──────────────────────────────────
  closures: LeaseClosure[];
  closureHistory: ClosureHistoryEntry[];
  getClosureForLease: (leaseId: string) => LeaseClosure | undefined;
  getHistoryForClosure: (closureId: string) => ClosureHistoryEntry[];
  /** Step 1. Returns the new closure's id (or 'pending' in Supabase mode). */
  requestClosure: (input: {
    leaseId: string; landId: string; landTitle: string;
    farmerId: string; farmerName: string; ownerId: string; ownerName: string;
    reason: string; comments?: string; proposedHandoverDate: string;
    noticePeriodDays: number; securityDeposit?: number;
  }) => string;
  /** Step 3. */
  respondToClosure: (
    closureId: string,
    response: OwnerClosureResponse,
    by: { ownerId: string; farmerId: string; landTitle: string },
    opts?: { comments?: string; proposedDate?: string },
  ) => void;
  /** Step 2 — owner waives the notice period by mutual agreement. */
  waiveNoticePeriod: (closureId: string, ownerId: string) => void;
  /** Step 4. */
  updateSettlement: (
    closureId: string,
    fields: Partial<Pick<LeaseClosure, 'pendingRent' | 'pendingWater' | 'pendingElectricity' | 'otherExpenses' | 'deductions'>>,
    by: { userId: string; role: 'farmer' | 'owner' },
  ) => void;
  confirmSettlement: (closureId: string, by: { userId: string; role: 'farmer' | 'owner' }) => void;
  /** Step 5. */
  resolveStandingCrop: (
    closureId: string,
    option: StandingCropOption,
    opts: { deadline?: string; notes?: string; userId: string; role: 'farmer' | 'owner' },
  ) => void;
  /** Step 6. */
  addHandoverPhotos: (closureId: string, role: 'farmer' | 'owner', urls: string[], userId: string) => void;
  setHandoverNotes: (closureId: string, role: 'farmer' | 'owner', notes: string, userId: string) => void;
  confirmHandover: (closureId: string, role: 'farmer' | 'owner', userId: string) => void;
  /** Step 7. */
  finalizeClosure: (closureId: string, leaseId: string, landId: string, by: { userId: string; role: 'farmer' | 'owner' }) => void;
  cancelClosure: (closureId: string, by: { userId: string; role: 'farmer' | 'owner' }) => void;
}

const LeaseContext = createContext<LeaseContextType | undefined>(undefined);

const nowIso = () => new Date().toISOString();
const uid = (p: string) => `${p}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const SEED_OFFERS: LeaseOffer[] = isSupabaseConfigured
  ? []
  : [
      { id: 'offer-1a', landId: 'initial-1', typeId: 'fixed_rent', terms: { ratePerAcre: 12000, installments: '2 splits' }, tenure: '3 years', availableFrom: 'Jun 2026', createdAt: nowIso() },
      { id: 'offer-1b', landId: 'initial-1', typeId: 'crop_share', terms: { harvestSplit: 50, inputSplit: 50, crops: 'Wheat, Paddy' }, tenure: '3 years', availableFrom: 'Jun 2026', createdAt: nowIso() },
      { id: 'offer-2a', landId: 'initial-2', typeId: 'crop_share', terms: { harvestSplit: 60, inputSplit: 50, crops: 'Paddy' }, tenure: '5 years', availableFrom: 'Jul 2026', createdAt: nowIso() },
      { id: 'offer-3a', landId: 'initial-3', typeId: 'revenue_share', terms: { ownerPercent: 25, inputSplit: 50 }, tenure: '5 years', availableFrom: 'Jun 2026', createdAt: nowIso() },
      { id: 'offer-3b', landId: 'initial-3', typeId: 'flexible_share', terms: { baseRate: 6000, bonusPercent: 20, threshold: 'price > ₹20/kg' }, tenure: '5 years', availableFrom: 'Jun 2026', createdAt: nowIso() },
    ];

export function LeaseProvider({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth();
  const { updateListing } = useFarmListings();
  const [offers, setOffers] = useState<LeaseOffer[]>(SEED_OFFERS);
  const [requests, setRequests] = useState<LeaseRequest[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [activeLeases, setActiveLeases] = useState<ActiveLease[]>([]);
  const [closures, setClosures] = useState<LeaseClosure[]>([]);
  const [closureHistory, setClosureHistory] = useState<ClosureHistoryEntry[]>([]);

  // ── Supabase: hydrate once, then live-refetch on any realtime change ────────
  const refetch = useCallback(async () => {
    if (!supabase) return;
    try {
      const [snap, closureSnap] = await Promise.all([leaseApi.fetchAll(), leaseClosureApi.fetchAll()]);
      setOffers(snap.offers);
      setRequests(snap.requests);
      setAgreements(snap.agreements);
      setActiveLeases(snap.activeLeases);
      setClosures(closureSnap.closures);
      setClosureHistory(closureSnap.history);
    } catch {
      /* network hiccup — keep last good state */
    }
  }, []);

  useEffect(() => {
    // Wait for the session restore to finish — firing this before that
    // resolves races the RLS-protected lease tables and comes back empty.
    // Also re-runs on `user?.id` so switching accounts inside the same running
    // app (no full reload) triggers a fresh fetch instead of reusing whatever
    // the previous account's session happened to load.
    // Skip the fetch specifically on logout (id → undefined, `authReady`
    // already true) — RLS would return it empty anyway with no session, and
    // nothing renders this data once signed out, so it was just a wasted
    // round-trip fired at the exact moment logout speed matters.
    if (!isSupabaseConfigured || !authReady) return;
    if (user?.id) refetch();
    const unsubLease = leaseApi.subscribe(refetch); // any change on any phone → refetch
    const unsubClosure = leaseClosureApi.subscribe(refetch);
    return () => {
      unsubLease();
      unsubClosure();
    };
  }, [refetch, authReady, user?.id]);

  // Mock-mode-only helper: appends one audit-trail entry. (Supabase mode logs
  // its own history rows server-side inside leaseClosureApi, then refetch()
  // picks them up — this local ledger is only needed when there's no backend.)
  const pushHistory = useCallback(
    (closureId: string, action: string, performedBy: string, userRole: 'farmer' | 'owner', details?: string) => {
      setClosureHistory(prev => [...prev, { id: uid('hist'), closureId, action, performedBy, userRole, details, createdAt: nowIso() }]);
    },
    [],
  );

  // ── Actions: write to Supabase (realtime refetches), else mutate mock state ──
  const addOffer = useCallback(
    (o: Omit<LeaseOffer, 'id' | 'createdAt'>) => {
      if (supabase) {
        leaseApi.addOffer(o, user?.id || '').then(refetch).catch(() => {});
        return 'pending';
      }
      const id = uid('offer');
      setOffers(prev => [{ ...o, id, createdAt: nowIso() }, ...prev]);
      return id;
    },
    [user?.id, refetch],
  );

  const removeOffer = useCallback(
    (id: string) => {
      if (supabase) {
        leaseApi.removeOffer(id).then(refetch).catch(() => {});
        return;
      }
      setOffers(prev => prev.filter(o => o.id !== id));
    },
    [refetch],
  );

  const getOffersByLand = useCallback((landId: string) => offers.filter(o => o.landId === landId), [offers]);

  const applyForLease: LeaseContextType['applyForLease'] = useCallback(
    input => {
      if (supabase) {
        leaseApi.applyForLease(input).then(refetch).catch(() => {});
        return 'pending';
      }
      const id = uid('req');
      setRequests(prev => [
        {
          id, landId: input.offer.landId, landTitle: input.landTitle, offerId: input.offer.id, typeId: input.offer.typeId,
          termsSummary: summarizeOffer(input.offer), farmerId: input.farmerId, farmerName: input.farmerName,
          ownerId: input.ownerId, ownerName: input.ownerName, message: input.message, status: 'pending', createdAt: nowIso(),
        },
        ...prev,
      ]);
      return id;
    },
    [refetch],
  );

  const getRequestsForFarmer = useCallback((farmerId: string) => requests.filter(r => r.farmerId === farmerId), [requests]);

  const approveRequest = useCallback(
    (requestId: string): Promise<string | undefined> => {
      if (supabase) {
        return leaseApi.approveRequest(requestId).then(agreementId => {
          refetch();
          return agreementId;
        });
        // Errors (e.g. "already taken", "already decided") propagate to the
        // caller instead of being swallowed — the owner needs to know their
        // approve attempt lost a race, not see a false success message.
      }
      const req = requests.find(r => r.id === requestId);
      if (!req || req.status !== 'pending') return Promise.resolve(undefined);
      const offer = offers.find(o => o.id === req.offerId);
      const agId = uid('agr');
      const agreement: Agreement = {
        id: agId, requestId, landId: req.landId, landTitle: req.landTitle, offerId: req.offerId, typeId: req.typeId,
        typeName: LEASE_TYPE_MAP[req.typeId].name, termsSummary: req.termsSummary, fullTerms: offer ? buildAgreementTerms(offer) : [],
        tenure: offer?.tenure || '—', availableFrom: offer?.availableFrom || '—',
        farmerId: req.farmerId, farmerName: req.farmerName, ownerId: req.ownerId, ownerName: req.ownerName,
        ownerSigned: true, farmerSigned: false, status: 'awaiting', createdAt: nowIso(),
      };
      // Accept this one, auto-reject every other pending request on the same
      // land, and lock the land now instead of waiting for the signature.
      setRequests(prev =>
        prev.map(r => {
          if (r.id === requestId) return { ...r, status: 'accepted' };
          if (r.landId === req.landId && r.status === 'pending') return { ...r, status: 'rejected' };
          return r;
        }),
      );
      setAgreements(prev => [agreement, ...prev]);
      updateListing(req.landId, { status: 'leased' });
      return Promise.resolve(agId);
    },
    [requests, offers, refetch, updateListing],
  );

  const rejectRequest = useCallback(
    (requestId: string) => {
      if (supabase) {
        leaseApi.rejectRequest(requestId).then(refetch).catch(() => {});
        return;
      }
      setRequests(prev => prev.map(r => (r.id === requestId ? { ...r, status: 'rejected' } : r)));
    },
    [refetch],
  );

  const getAgreementById = useCallback((id: string) => agreements.find(a => a.id === id), [agreements]);

  const signAgreementAsFarmer = useCallback(
    (agreementId: string, signatureUrl: string) => {
      if (supabase) {
        leaseApi.signAgreementAsFarmer(agreementId, signatureUrl).then(refetch).catch(() => {});
        return;
      }
      setAgreements(prev =>
        prev.map(a => {
          if (a.id !== agreementId || a.farmerSigned) return a;
          const signed = { ...a, farmerSigned: true, farmerSignatureUrl: signatureUrl, farmerSignedAt: nowIso() };
          if (signed.ownerSigned && signed.farmerSigned) {
            signed.status = 'active';
            // The owner's chosen "Available from" date is the real lease
            // start date; only fall back to today when it isn't a real
            // date (e.g. legacy free-text offers written before the
            // calendar picker existed).
            signed.startDate = parseDateLabel(signed.availableFrom) ? signed.availableFrom : today();
            setActiveLeases(al =>
              al.some(l => l.offerId === signed.offerId && l.farmerId === signed.farmerId)
                ? al
                : [
                    {
                      id: uid('lease'), landId: signed.landId, landTitle: signed.landTitle, offerId: signed.offerId, typeId: signed.typeId,
                      typeName: signed.typeName, termsSummary: signed.termsSummary, farmerId: signed.farmerId, farmerName: signed.farmerName,
                      ownerId: signed.ownerId, ownerName: signed.ownerName, startDate: signed.startDate!, status: 'active', createdAt: nowIso(),
                    },
                    ...al,
                  ],
            );
            updateListing(signed.landId, { status: 'leased' });
          }
          return signed;
        }),
      );
    },
    [refetch, updateListing],
  );

  // ── Lease Closure / Early Termination ────────────────────────────────────
  const getClosureForLease = useCallback((leaseId: string) => closures.find(c => c.leaseId === leaseId), [closures]);
  const getHistoryForClosure = useCallback(
    (closureId: string) => closureHistory.filter(h => h.closureId === closureId),
    [closureHistory],
  );

  const requestClosure = useCallback<LeaseContextType['requestClosure']>(
    input => {
      // A lease only ever has one *open* closure at a time.
      const open = closures.find(c => c.leaseId === input.leaseId && !['closed', 'rejected', 'cancelled'].includes(c.status));
      if (open) return open.id;

      if (supabase) {
        leaseClosureApi.requestClosure(input).then(refetch).catch(() => {});
        return 'pending';
      }
      const id = uid('closure');
      const requestedAt = nowIso();
      const closure: LeaseClosure = {
        id, leaseId: input.leaseId, landId: input.landId, landTitle: input.landTitle,
        farmerId: input.farmerId, farmerName: input.farmerName, ownerId: input.ownerId, ownerName: input.ownerName,
        status: 'requested', reason: input.reason, comments: input.comments, proposedHandoverDate: input.proposedHandoverDate,
        requestedAt, noticePeriodDays: input.noticePeriodDays, noticeWaived: false,
        eligibleClosureDate: computeEligibleClosureDate(requestedAt, input.noticePeriodDays),
        otherExpenses: [], securityDeposit: input.securityDeposit, deductions: [], settlementConfirmed: false,
        standingCropResolved: false, farmerPhotos: [], ownerPhotos: [], createdAt: requestedAt, updatedAt: requestedAt,
      };
      setClosures(prev => [closure, ...prev]);
      pushHistory(id, 'closure_requested', input.farmerId, 'farmer', input.reason);
      return id;
    },
    [closures, refetch, pushHistory],
  );

  const respondToClosure = useCallback<LeaseContextType['respondToClosure']>(
    (closureId, response, by, opts) => {
      if (supabase) {
        leaseClosureApi.respondToClosure(closureId, response, by, opts).then(refetch).catch(() => {});
        return;
      }
      const nextStatus: LeaseClosureStatus =
        response === 'rejected' ? 'rejected' : response === 'accepted_with_settlement' ? 'settlement_pending' : 'under_review';
      setClosures(prev =>
        prev.map(c =>
          c.id === closureId
            ? { ...c, ownerResponse: response, ownerResponseComments: opts?.comments, ownerProposedDate: opts?.proposedDate, ownerRespondedAt: nowIso(), status: nextStatus, updatedAt: nowIso() }
            : c,
        ),
      );
      pushHistory(closureId, `owner_${response}`, by.ownerId, 'owner', opts?.comments);
    },
    [refetch, pushHistory],
  );

  const waiveNoticePeriod = useCallback<LeaseContextType['waiveNoticePeriod']>(
    (closureId, ownerId) => {
      if (supabase) {
        leaseClosureApi.waiveNoticePeriod(closureId, ownerId).then(refetch).catch(() => {});
        return;
      }
      setClosures(prev => prev.map(c => (c.id === closureId ? { ...c, noticeWaived: true, updatedAt: nowIso() } : c)));
      pushHistory(closureId, 'notice_waived', ownerId, 'owner');
    },
    [refetch, pushHistory],
  );

  const updateSettlement = useCallback<LeaseContextType['updateSettlement']>(
    (closureId, fields, by) => {
      if (supabase) {
        leaseClosureApi.updateSettlement(closureId, fields, by).then(refetch).catch(() => {});
        return;
      }
      setClosures(prev => prev.map(c => (c.id === closureId ? { ...c, ...fields, updatedAt: nowIso() } : c)));
      pushHistory(closureId, 'settlement_updated', by.userId, by.role);
    },
    [refetch, pushHistory],
  );

  const confirmSettlement = useCallback<LeaseContextType['confirmSettlement']>(
    (closureId, by) => {
      const standingResolved = closures.find(c => c.id === closureId)?.standingCropResolved ?? false;
      if (supabase) {
        leaseClosureApi.confirmSettlement(closureId, standingResolved, by).then(refetch).catch(() => {});
        return;
      }
      setClosures(prev =>
        prev.map(c =>
          c.id === closureId
            ? { ...c, settlementConfirmed: true, status: standingResolved ? 'handover_pending' : 'settlement_pending', updatedAt: nowIso() }
            : c,
        ),
      );
      pushHistory(closureId, 'settlement_confirmed', by.userId, by.role);
    },
    [closures, refetch, pushHistory],
  );

  const resolveStandingCrop = useCallback<LeaseContextType['resolveStandingCrop']>(
    (closureId, option, opts) => {
      const settlementDone = closures.find(c => c.id === closureId)?.settlementConfirmed ?? false;
      if (supabase) {
        leaseClosureApi.resolveStandingCrop(closureId, option, settlementDone, opts).then(refetch).catch(() => {});
        return;
      }
      setClosures(prev =>
        prev.map(c =>
          c.id === closureId
            ? {
                ...c,
                standingCropOption: option, standingCropDeadline: opts.deadline, standingCropNotes: opts.notes, standingCropResolved: true,
                status: settlementDone ? 'handover_pending' : 'settlement_pending', updatedAt: nowIso(),
              }
            : c,
        ),
      );
      pushHistory(closureId, 'standing_crop_resolved', opts.userId, opts.role, option);
    },
    [closures, refetch, pushHistory],
  );

  const addHandoverPhotos = useCallback<LeaseContextType['addHandoverPhotos']>(
    (closureId, role, urls, userId) => {
      const existing = closures.find(c => c.id === closureId);
      const priorUrls = role === 'farmer' ? existing?.farmerPhotos ?? [] : existing?.ownerPhotos ?? [];
      if (supabase) {
        leaseClosureApi.addHandoverPhotos(closureId, role, urls, userId, priorUrls).then(refetch).catch(() => {});
        return;
      }
      setClosures(prev =>
        prev.map(c =>
          c.id === closureId
            ? { ...c, [role === 'farmer' ? 'farmerPhotos' : 'ownerPhotos']: [...priorUrls, ...urls], updatedAt: nowIso() }
            : c,
        ),
      );
      pushHistory(closureId, 'handover_photos_added', userId, role, `${urls.length} photo(s)`);
    },
    [closures, refetch, pushHistory],
  );

  const setHandoverNotes = useCallback<LeaseContextType['setHandoverNotes']>(
    (closureId, role, notes, userId) => {
      if (supabase) {
        leaseClosureApi.setHandoverNotes(closureId, role, notes, userId).then(refetch).catch(() => {});
        return;
      }
      setClosures(prev =>
        prev.map(c => (c.id === closureId ? { ...c, [role === 'farmer' ? 'farmerHandoverNotes' : 'ownerHandoverNotes']: notes, updatedAt: nowIso() } : c)),
      );
      pushHistory(closureId, 'handover_notes_added', userId, role, notes);
    },
    [refetch, pushHistory],
  );

  const confirmHandover = useCallback<LeaseContextType['confirmHandover']>(
    (closureId, role, userId) => {
      const existing = closures.find(c => c.id === closureId);
      const otherConfirmed = role === 'farmer' ? !!existing?.ownerConfirmedAt : !!existing?.farmerConfirmedAt;
      if (supabase) {
        leaseClosureApi.confirmHandover(closureId, role, userId, otherConfirmed).then(refetch).catch(() => {});
        return;
      }
      setClosures(prev =>
        prev.map(c =>
          c.id === closureId
            ? {
                ...c,
                [role === 'farmer' ? 'farmerConfirmedAt' : 'ownerConfirmedAt']: nowIso(),
                status: otherConfirmed ? 'ready_for_closure' : 'handover_pending',
                updatedAt: nowIso(),
              }
            : c,
        ),
      );
      pushHistory(closureId, role === 'farmer' ? 'farmer_confirmed_handover' : 'owner_confirmed_receipt', userId, role);
    },
    [closures, refetch, pushHistory],
  );

  const finalizeClosure = useCallback<LeaseContextType['finalizeClosure']>(
    (closureId, leaseId, landId, by) => {
      if (supabase) {
        leaseClosureApi.finalizeClosure(closureId, leaseId, landId, by).then(refetch).catch(() => {});
        return;
      }
      setClosures(prev => prev.map(c => (c.id === closureId ? { ...c, status: 'closed', updatedAt: nowIso() } : c)));
      setActiveLeases(prev => prev.map(l => (l.id === leaseId ? { ...l, status: 'closed' } : l)));
      updateListing(landId, { status: 'active' });
      pushHistory(closureId, 'lease_closed', by.userId, by.role);
    },
    [refetch, updateListing, pushHistory],
  );

  const cancelClosure = useCallback<LeaseContextType['cancelClosure']>(
    (closureId, by) => {
      if (supabase) {
        leaseClosureApi.cancelClosure(closureId, by).then(refetch).catch(() => {});
        return;
      }
      setClosures(prev => prev.map(c => (c.id === closureId ? { ...c, status: 'cancelled', updatedAt: nowIso() } : c)));
      pushHistory(closureId, 'closure_cancelled', by.userId, by.role);
    },
    [refetch, pushHistory],
  );

  const value = useMemo<LeaseContextType>(
    () => ({
      offers, addOffer, removeOffer, getOffersByLand,
      requests, applyForLease, getRequestsForFarmer, approveRequest, rejectRequest,
      agreements, getAgreementById, signAgreementAsFarmer,
      activeLeases, realtime: isSupabaseConfigured,
      closures, closureHistory, getClosureForLease, getHistoryForClosure,
      requestClosure, respondToClosure, waiveNoticePeriod, updateSettlement, confirmSettlement,
      resolveStandingCrop, addHandoverPhotos, setHandoverNotes, confirmHandover, finalizeClosure, cancelClosure,
    }),
    [
      offers, addOffer, removeOffer, getOffersByLand, requests, applyForLease, getRequestsForFarmer, approveRequest, rejectRequest,
      agreements, getAgreementById, signAgreementAsFarmer, activeLeases,
      closures, closureHistory, getClosureForLease, getHistoryForClosure,
      requestClosure, respondToClosure, waiveNoticePeriod, updateSettlement, confirmSettlement,
      resolveStandingCrop, addHandoverPhotos, setHandoverNotes, confirmHandover, finalizeClosure, cancelClosure,
    ],
  );

  return <LeaseContext.Provider value={value}>{children}</LeaseContext.Provider>;
}

export function useLeases() {
  const ctx = useContext(LeaseContext);
  if (!ctx) throw new Error('useLeases must be used within a LeaseProvider');
  return ctx;
}
