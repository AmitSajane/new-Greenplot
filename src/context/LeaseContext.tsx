/**
 * LeaseContext — the lease-management backbone.
 *
 * Full lifecycle:
 *   owner adds OFFER → farmer APPLIES (request) → owner APPROVES (creates an
 *   AGREEMENT, owner-signed) → farmer SIGNS → ACTIVE LEASE.
 *
 * Land data stays in FarmListingsContext; lease data denormalises what it needs
 * so the two are decoupled. Maps onto Supabase: lease_offers → lease_requests →
 * lease_agreements → leases.
 */
import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import {
  AgreementTerm,
  LeaseOffer,
  LeaseTypeId,
  LEASE_TYPE_MAP,
  buildAgreementTerms,
  summarizeOffer,
} from '../constants/leaseTypes';

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
  status: 'active';
  createdAt: string;
}

interface LeaseContextType {
  offers: LeaseOffer[];
  addOffer: (o: Omit<LeaseOffer, 'id' | 'createdAt'>) => string;
  removeOffer: (id: string) => void;
  getOffersByLand: (landId: string) => LeaseOffer[];

  requests: LeaseRequest[];
  applyForLease: (input: {
    offer: LeaseOffer;
    landTitle: string;
    farmerId: string;
    farmerName: string;
    ownerId: string;
    ownerName: string;
    message?: string;
  }) => string;
  getRequestsForFarmer: (farmerId: string) => LeaseRequest[];
  approveRequest: (requestId: string) => string | undefined; // returns agreementId
  rejectRequest: (requestId: string) => void;

  agreements: Agreement[];
  getAgreementById: (id: string) => Agreement | undefined;
  signAgreementAsFarmer: (agreementId: string) => void;

  activeLeases: ActiveLease[];
}

const LeaseContext = createContext<LeaseContextType | undefined>(undefined);

const now = () => new Date().toISOString();
const uid = (p: string) => `${p}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// Seed offers on the initial lands so the farmer side works out-of-the-box.
const SEED_OFFERS: LeaseOffer[] = [
  { id: 'offer-1a', landId: 'initial-1', typeId: 'fixed_rent', terms: { ratePerAcre: 12000, installments: '2 splits' }, tenure: '3 years', availableFrom: 'Jun 2026', createdAt: now() },
  { id: 'offer-1b', landId: 'initial-1', typeId: 'crop_share', terms: { harvestSplit: 50, inputSplit: 50, crops: 'Wheat, Paddy' }, tenure: '3 years', availableFrom: 'Jun 2026', createdAt: now() },
  { id: 'offer-2a', landId: 'initial-2', typeId: 'crop_share', terms: { harvestSplit: 60, inputSplit: 50, crops: 'Paddy' }, tenure: '5 years', availableFrom: 'Jul 2026', createdAt: now() },
  { id: 'offer-3a', landId: 'initial-3', typeId: 'revenue_share', terms: { ownerPercent: 25, inputSplit: 50 }, tenure: '5 years', availableFrom: 'Jun 2026', createdAt: now() },
  { id: 'offer-3b', landId: 'initial-3', typeId: 'flexible_share', terms: { baseRate: 6000, bonusPercent: 20, threshold: 'price > ₹20/kg' }, tenure: '5 years', availableFrom: 'Jun 2026', createdAt: now() },
];

export function LeaseProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<LeaseOffer[]>(SEED_OFFERS);
  const [requests, setRequests] = useState<LeaseRequest[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [activeLeases, setActiveLeases] = useState<ActiveLease[]>([]);

  const addOffer = useCallback((o: Omit<LeaseOffer, 'id' | 'createdAt'>) => {
    const id = uid('offer');
    setOffers(prev => [{ ...o, id, createdAt: now() }, ...prev]);
    return id;
  }, []);

  const removeOffer = useCallback((id: string) => setOffers(prev => prev.filter(o => o.id !== id)), []);
  const getOffersByLand = useCallback((landId: string) => offers.filter(o => o.landId === landId), [offers]);

  const applyForLease: LeaseContextType['applyForLease'] = useCallback(input => {
    const id = uid('req');
    setRequests(prev => [
      {
        id,
        landId: input.offer.landId,
        landTitle: input.landTitle,
        offerId: input.offer.id,
        typeId: input.offer.typeId,
        termsSummary: summarizeOffer(input.offer),
        farmerId: input.farmerId,
        farmerName: input.farmerName,
        ownerId: input.ownerId,
        ownerName: input.ownerName,
        message: input.message,
        status: 'pending',
        createdAt: now(),
      },
      ...prev,
    ]);
    return id;
  }, []);

  const getRequestsForFarmer = useCallback((farmerId: string) => requests.filter(r => r.farmerId === farmerId), [requests]);

  // Owner approves → request accepted + an owner-signed agreement is created.
  const approveRequest = useCallback(
    (requestId: string) => {
      const req = requests.find(r => r.id === requestId);
      if (!req) return undefined;
      const offer = offers.find(o => o.id === req.offerId);
      const agId = uid('agr');
      const agreement: Agreement = {
        id: agId,
        requestId,
        landId: req.landId,
        landTitle: req.landTitle,
        offerId: req.offerId,
        typeId: req.typeId,
        typeName: LEASE_TYPE_MAP[req.typeId].name,
        termsSummary: req.termsSummary,
        fullTerms: offer ? buildAgreementTerms(offer) : [],
        tenure: offer?.tenure || '—',
        availableFrom: offer?.availableFrom || '—',
        farmerId: req.farmerId,
        farmerName: req.farmerName,
        ownerId: req.ownerId,
        ownerName: req.ownerName,
        ownerSigned: true, // approval == owner's signature
        farmerSigned: false,
        status: 'awaiting',
        createdAt: now(),
      };
      setRequests(prev => prev.map(r => (r.id === requestId ? { ...r, status: 'accepted' } : r)));
      setAgreements(prev => [agreement, ...prev]);
      return agId;
    },
    [requests, offers],
  );

  const rejectRequest = useCallback((requestId: string) => {
    setRequests(prev => prev.map(r => (r.id === requestId ? { ...r, status: 'rejected' } : r)));
  }, []);

  const getAgreementById = useCallback((id: string) => agreements.find(a => a.id === id), [agreements]);

  // Farmer signs → if both signed, the lease goes active.
  const signAgreementAsFarmer = useCallback((agreementId: string) => {
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
                    id: uid('lease'),
                    landId: signed.landId,
                    landTitle: signed.landTitle,
                    offerId: signed.offerId,
                    typeId: signed.typeId,
                    typeName: signed.typeName,
                    termsSummary: signed.termsSummary,
                    farmerId: signed.farmerId,
                    farmerName: signed.farmerName,
                    ownerId: signed.ownerId,
                    ownerName: signed.ownerName,
                    startDate: signed.startDate!,
                    status: 'active',
                    createdAt: now(),
                  },
                  ...al,
                ],
          );
        }
        return signed;
      }),
    );
  }, []);

  const value = useMemo<LeaseContextType>(
    () => ({
      offers, addOffer, removeOffer, getOffersByLand,
      requests, applyForLease, getRequestsForFarmer, approveRequest, rejectRequest,
      agreements, getAgreementById, signAgreementAsFarmer,
      activeLeases,
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
