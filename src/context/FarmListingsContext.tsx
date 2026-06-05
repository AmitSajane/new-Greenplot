import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';

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
  irrigationSchedule?: string;
  pesticideSchedule?: string;
  expectedHarvest?: string;
}

interface FarmListingsContextType {
  listings: FarmListing[];
  ownerListings: FarmListing[];
  addListing: (listing: Omit<FarmListing, 'id' | 'createdAt'>) => void;
  updateListing: (id: string, updates: Partial<FarmListing>) => void;
  deleteListing: (id: string) => void;
  getListingById: (id: string) => FarmListing | undefined;
  getFeaturedListings: () => FarmListing[];
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
  const [listings, setListings] = useState<FarmListing[]>(INITIAL_LISTINGS);

  const addListing = useCallback((listing: Omit<FarmListing, 'id' | 'createdAt'>) => {
    const newListing: FarmListing = {
      ...listing,
      id: `listing-${Date.now()}`,
      createdAt: new Date(),
      acresLabel: `${listing.acres} Acres`,
      locationLabel: `${listing.location}, ${listing.district}`,
    };
    setListings((prev) => [newListing, ...prev]);
  }, []);

  const updateListing = useCallback((id: string, updates: Partial<FarmListing>) => {
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
  }, []);

  const deleteListing = useCallback((id: string) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id));
  }, []);

  const getListingById = useCallback(
    (id: string) => {
      return listings.find((listing) => listing.id === id);
    },
    [listings]
  );

  const getFeaturedListings = useCallback(() => {
    return listings.filter((listing) => listing.status === 'active').slice(0, 10);
  }, [listings]);

  const getListingsByLocation = useCallback(
    (location: string) => {
      const searchTerm = location.toLowerCase();
      return listings.filter(
        (listing) =>
          listing.status === 'active' &&
          (listing.location.toLowerCase().includes(searchTerm) ||
            listing.district.toLowerCase().includes(searchTerm) ||
            listing.state.toLowerCase().includes(searchTerm))
      );
    },
    [listings]
  );

  // Get listings for the current owner (mock - in real app, filter by authenticated user)
  const ownerListings = listings.filter((listing) => listing.status === 'active');

  return (
    <FarmListingsContext.Provider
      value={{
        listings,
        ownerListings,
        addListing,
        updateListing,
        deleteListing,
        getListingById,
        getFeaturedListings,
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
