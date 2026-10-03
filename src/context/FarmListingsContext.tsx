import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { landsApi } from '../services/landsApi';
import { useAuth } from './AuthContext';

export interface FarmListing {
  id: string;
  title: string;
  soilType: string;
  acres: string;
  location: string;
  district: string;
  state: string;
  tenure: string;
  pricePerYear: string;
  leaseType?: string;
  description?: string;
  imageUrl: string;
  ownerId: string;
  ownerName: string;
  createdAt: Date;
  status: 'active' | 'leased' | 'inactive';
  /** True when the owner farms this land themselves — never shown in the lease marketplace. */
  selfFarmed?: boolean;
  // For farmer home featured listings compatibility
  acresLabel?: string;
  locationLabel?: string;
  image?: ImageSourcePropType;
  // Property details / history (for owner property details screen)
  lastYearCrop?: string;
  lastYearEarnings?: string;
  lastYearYield?: string;
  // Geo / monitoring metadata
  plotGeoJSON?: any;
  areaAcres?: number;
  currentCrop?: string;
  /** "Best crops to grow" — the owner's multi-select from Add New Farm Listing. */
  crops?: string[];
  waterSource?: string;
  irrigationSchedule?: string;
  pesticideSchedule?: string;
  expectedHarvest?: string;
  // Land ownership verification (from uploaded govt record, AI-read)
  surveyNumber?: string;
  verified?: boolean;
  verifiedOwnerName?: string;
  // Uploaded photo/video URLs (Supabase Storage). imageUrl is the cover (first).
  mediaUrls?: string[];
  // Raw Operations-Admin-driven Farm Management status ('DRAFT'/'PENDING_VERIFICATION'/
  // 'APPROVED'/... and 'NOT_AVAILABLE'/'AVAILABLE_FOR_MANAGEMENT'/...) — set only by the
  // separate admin portal's backend, never written from this app. Distinct from the
  // client-derived ManagementStatus in src/utils/farmManagementStatus.ts.
  verificationStatus?: string;
  managementStatus?: string;
  /** Set only by the separate Admin backend once a farmer is assigned — mirrors `verifiedBy`. */
  assignedFarmerId?: string;
}

interface FarmListingsContextType {
  listings: FarmListing[];
  ownerListings: FarmListing[];
  /** Farms Available for Management — DB-scoped (see landsApi.fetchAvailableForManagement), not client-filtered. */
  availableForManagement: FarmListing[];
  /** Farms the signed-in farmer has actually been assigned to manage (Step 5) — client-filtered from `listings`, same pattern as `ownerListings`. */
  myManagedFarms: FarmListing[];
  /** This owner's lands that have moved into Farm Management — client-filtered from `ownerListings`. */
  myManagedLands: FarmListing[];
  addListing: (listing: Omit<FarmListing, 'id' | 'createdAt'>) => Promise<string>;
  updateListing: (id: string, updates: Partial<FarmListing>) => void;
  deleteListing: (id: string) => void;
  getListingById: (id: string) => FarmListing | undefined;
  getListingsByLocation: (location: string) => FarmListing[];
}

const FarmListingsContext = createContext<FarmListingsContextType | undefined>(undefined);

// Initial mock data - some pre-existing listings
const INITIAL_LISTINGS: FarmListing[] = [
  {
    id: 'initial-1',
    title: 'Fertile Wheat Land',
    soilType: 'Alluvial Soil',
    acres: '5',
    acresLabel: '5 Acres',
    location: 'Kasba',
    district: 'Purnea',
    state: 'Bihar',
    locationLabel: 'Kasba, Purnea (2km away)',
    tenure: '3 years',
    pricePerYear: '₹12k',
    leaseType: 'Fixed Rent',
    description: 'Well-irrigated fertile land suitable for wheat and paddy cultivation.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
    ownerId: 'owner-1',
    ownerName: 'Suresh Yadav',
    createdAt: new Date('2024-01-15'),
    status: 'active',
    lastYearCrop: 'Wheat',
    lastYearYield: '22 quintals',
    lastYearEarnings: '₹1,32,000',
    // Owner-drawn field boundary (Purnea, Bihar area)
    plotGeoJSON: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [87.4648, 25.7777],
                [87.4700, 25.7777],
                [87.4700, 25.7820],
                [87.4648, 25.7820],
                [87.4648, 25.7777],
              ],
            ],
          },
          properties: { name: 'Fertile Wheat Land', area: '5 acres' },
        },
      ],
    },
  },
  {
    id: 'initial-2',
    title: 'Paddy Land',
    soilType: 'Clay Soil',
    acres: '2.5',
    acresLabel: '2.5 Acres',
    location: 'Banmankhi',
    district: 'Purnea',
    state: 'Bihar',
    locationLabel: 'Banmankhi, Purnea (6km away)',
    tenure: '5 years',
    pricePerYear: '₹9k',
    leaseType: 'Share Cropping',
    description: 'Perfect for paddy cultivation with water supply.',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
    ownerId: 'owner-2',
    ownerName: 'Ramesh Kumar',
    createdAt: new Date('2024-02-10'),
    status: 'active',
    lastYearCrop: 'Paddy',
    lastYearYield: '18 quintals',
    lastYearEarnings: '₹98,000',
    // Owner-drawn field boundary (Banmankhi area)
    plotGeoJSON: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [87.1900, 25.5300],
                [87.1940, 25.5300],
                [87.1940, 25.5330],
                [87.1900, 25.5330],
                [87.1900, 25.5300],
              ],
            ],
          },
          properties: { name: 'Paddy Land', area: '2.5 acres' },
        },
      ],
    },
  },
  {
    id: 'initial-3',
    title: 'Black Soil Land',
    soilType: 'Black Soil',
    acres: '10',
    acresLabel: '10 Acres',
    location: 'Jategaon',
    district: 'Maharashtra',
    state: 'Maharashtra',
    locationLabel: 'Jategaon, Maharashtra',
    tenure: '5 years',
    pricePerYear: '₹25k',
    leaseType: 'Revenue Share',
    description: 'Premium black soil land for cotton and soybean cultivation.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
    ownerId: 'owner-3',
    ownerName: 'Prakash Patil',
    createdAt: new Date('2024-03-05'),
    status: 'active',
    lastYearCrop: 'Cotton',
    lastYearYield: '12 quintals',
    lastYearEarnings: '₹2,10,000',
  },
];

interface FarmListingsProviderProps {
  children: ReactNode;
}

export function FarmListingsProvider({ children }: FarmListingsProviderProps) {
  const { user, authReady } = useAuth();
  const [listings, setListings] = useState<FarmListing[]>(isSupabaseConfigured ? [] : INITIAL_LISTINGS);
  // No real "approved for management" concept exists in mock mode's seed data,
  // so this starts (and stays, off Supabase) empty rather than fabricating it.
  const [availableForManagement, setAvailableForManagement] = useState<FarmListing[]>([]);

  // Supabase: hydrate lands once, then live-refetch on any realtime change.
  const refetchLands = useCallback(async () => {
    if (!supabase) return;
    try {
      setListings(await landsApi.fetchLands());
    } catch {
      /* keep last good state */
    }
  }, []);

  const refetchAvailableForManagement = useCallback(async () => {
    if (!supabase) return;
    try {
      setAvailableForManagement(await landsApi.fetchAvailableForManagement());
    } catch {
      /* keep last good state */
    }
  }, []);

  useEffect(() => {
    // Wait for the session restore to finish before the first fetch, and
    // re-fetch on `user?.id` so switching accounts inside the same running
    // app also gets fresh data instead of reusing the previous account's.
    // Skip the fetch specifically on logout (id → undefined, `authReady`
    // already true) — nothing renders this data once signed out, and the
    // next login re-fetches it anyway, so it was just a wasted round-trip
    // fired at the exact moment logout speed matters.
    if (!isSupabaseConfigured || !authReady) return;
    if (user?.id) {
      refetchLands();
      refetchAvailableForManagement();
    }
    // `lands_available_for_management` is a view over `lands`, so the same
    // realtime channel (watching the base table) covers both refetches —
    // no separate subscription needed.
    return landsApi.subscribe(() => {
      refetchLands();
      refetchAvailableForManagement();
    });
  }, [refetchLands, refetchAvailableForManagement, authReady, user?.id]);

  const addListing = useCallback(
    async (listing: Omit<FarmListing, 'id' | 'createdAt'>) => {
      if (supabase) {
        const id = await landsApi.insertLand(listing, user?.id || '', user?.name || 'Owner');
        refetchLands();
        return id;
      }
      const id = `listing-${Date.now()}`;
      const newListing: FarmListing = {
        ...listing,
        id,
        createdAt: new Date(),
        acresLabel: `${listing.acres} Acres`,
        locationLabel: `${listing.location}, ${listing.district}`,
      };
      setListings((prev) => [newListing, ...prev]);
      return id;
    },
    [user?.id, user?.name, refetchLands],
  );

  const updateListing = useCallback(
    (id: string, updates: Partial<FarmListing>) => {
      if (supabase) {
        landsApi.updateLand(id, updates).then(refetchLands).catch(() => {});
        return;
      }
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id
            ? {
                ...listing,
                ...updates,
                acresLabel: updates.acres ? `${updates.acres} Acres` : listing.acresLabel,
                locationLabel:
                  updates.location || updates.district
                    ? `${updates.location || listing.location}, ${updates.district || listing.district}`
                    : listing.locationLabel,
              }
            : listing
        )
      );
    },
    [refetchLands],
  );

  const deleteListing = useCallback(
    (id: string) => {
      if (supabase) {
        landsApi.deleteLand(id).then(refetchLands).catch(() => {});
        return;
      }
      setListings((prev) => prev.filter((listing) => listing.id !== id));
    },
    [refetchLands],
  );

  const getListingById = useCallback(
    (id: string) => {
      return listings.find((listing) => listing.id === id);
    },
    [listings]
  );

  const getListingsByLocation = useCallback(
    (location: string) => {
      const searchTerm = location.toLowerCase();
      return listings.filter(
        (listing) =>
          listing.status === 'active' &&
          !listing.selfFarmed &&
          (listing.location.toLowerCase().includes(searchTerm) ||
            listing.district.toLowerCase().includes(searchTerm) ||
            listing.state.toLowerCase().includes(searchTerm))
      );
    },
    [listings]
  );

  // Owner's own lands: by user in live mode, all active in mock mode.
  const ownerListings = isSupabaseConfigured
    ? listings.filter((listing) => listing.ownerId === user?.id)
    : listings.filter((listing) => listing.status === 'active');

  // Farms this farmer has actually been assigned (Step 5) — Admin-set
  // `assignedFarmerId` + `managementStatus`, not the legacy lease model.
  // No real backing concept exists in mock mode, so this stays empty there
  // rather than fabricating an assignment.
  const myManagedFarms = isSupabaseConfigured
    ? listings.filter(
        (listing) =>
          !!user?.id &&
          listing.assignedFarmerId === user.id &&
          (listing.managementStatus === 'FARMER_ASSIGNED' || listing.managementStatus === 'ACTIVE_MANAGEMENT'),
      )
    : [];

  // Owner-side analog of myManagedFarms: this owner's lands that have moved
  // into Farm Management (farmer assigned/managing/done), for the "monitor
  // my managed farms" view. Also empty in mock mode for the same reason.
  const myManagedLands = isSupabaseConfigured
    ? ownerListings.filter(
        (listing) =>
          listing.managementStatus === 'FARMER_ASSIGNED' ||
          listing.managementStatus === 'ACTIVE_MANAGEMENT' ||
          listing.managementStatus === 'COMPLETED',
      )
    : [];

  return (
    <FarmListingsContext.Provider
      value={{
        listings,
        ownerListings,
        availableForManagement,
        myManagedFarms,
        myManagedLands,
        addListing,
        updateListing,
        deleteListing,
        getListingById,
        getListingsByLocation,
      }}
    >
      {children}
    </FarmListingsContext.Provider>
  );
}

export function useFarmListings() {
  const context = useContext(FarmListingsContext);
  if (context === undefined) {
    throw new Error('useFarmListings must be used within a FarmListingsProvider');
  }
  return context;
}
