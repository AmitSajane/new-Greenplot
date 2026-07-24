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
import { ActiveLease, Agreement, LeaseRequest } from '../types/lease';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { leaseApi } from '../services/leaseApi';
import { useAuth } from './AuthContext';
import { useFarmListings } from './FarmListingsContext';

export type { RequestStatus, LeaseRequest, Agreement, ActiveLease } from '../types/lease';

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
  approveRequest: (requestId: string) => string | undefined;
  rejectRequest: (requestId: string) => void;

  agreements: Agreement[];
  getAgreementById: (id: string) => Agreement | undefined;
  signAgreementAsFarmer: (agreementId: string) => void;

  activeLeases: ActiveLease[];
  /** True when backed by Supabase (live, multi-device). */
  realtime: boolean;
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

  // ── Supabase: hydrate once, then live-refetch on any realtime change ────────
  const refetch = useCallback(async () => {
    if (!supabase) return;
    try {
      const snap = await leaseApi.fetchAll();
      setOffers(snap.offers);
      setRequests(snap.requests);
      setAgreements(snap.agreements);
      setActiveLeases(snap.activeLeases);
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
    if (!isSupabaseConfigured || !authReady) return;
    refetch();
    const unsubscribe = leaseApi.subscribe(refetch); // any change on any phone → refetch
    return unsubscribe;
  }, [refetch, authReady, user?.id]);

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
    (requestId: string) => {
      if (supabase) {
        leaseApi.approveRequest(requestId).then(refetch).catch(() => {});
        return undefined;
      }
      const req = requests.find(r => r.id === requestId);
      if (!req) return undefined;
      const offer = offers.find(o => o.id === req.offerId);
      const agId = uid('agr');
      const agreement: Agreement = {
        id: agId, requestId, landId: req.landId, landTitle: req.landTitle, offerId: req.offerId, typeId: req.typeId,
        typeName: LEASE_TYPE_MAP[req.typeId].name, termsSummary: req.termsSummary, fullTerms: offer ? buildAgreementTerms(offer) : [],
        tenure: offer?.tenure || '—', availableFrom: offer?.availableFrom || '—',
        farmerId: req.farmerId, farmerName: req.farmerName, ownerId: req.ownerId, ownerName: req.ownerName,
        ownerSigned: true, farmerSigned: false, status: 'awaiting', createdAt: nowIso(),
      };
      setRequests(prev => prev.map(r => (r.id === requestId ? { ...r, status: 'accepted' } : r)));
      setAgreements(prev => [agreement, ...prev]);
      return agId;
    },
    [requests, offers, refetch],
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
    (agreementId: string) => {
      if (supabase) {
        leaseApi.signAgreementAsFarmer(agreementId).then(refetch).catch(() => {});
        return;
      }
      setAgreements(prev =>
        prev.map(a => {
          if (a.id !== agreementId || a.farmerSigned) return a;
          const signed = { ...a, farmerSigned: true };
          if (signed.ownerSigned && signed.farmerSigned) {
            signed.status = 'active';
            signed.startDate = today();
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

  const value = useMemo<LeaseContextType>(
    () => ({
      offers, addOffer, removeOffer, getOffersByLand,
      requests, applyForLease, getRequestsForFarmer, approveRequest, rejectRequest,
      agreements, getAgreementById, signAgreementAsFarmer,
      activeLeases, realtime: isSupabaseConfigured,
    }),
    [offers, addOffer, removeOffer, getOffersByLand, requests, applyForLease, getRequestsForFarmer, approveRequest, rejectRequest, agreements, getAgreementById, signAgreementAsFarmer, activeLeases],
  );

  return <LeaseContext.Provider value={value}>{children}</LeaseContext.Provider>;
}

export function useLeases() {
  const ctx = useContext(LeaseContext);
  if (!ctx) throw new Error('useLeases must be used within a LeaseProvider');
  return ctx;
}
