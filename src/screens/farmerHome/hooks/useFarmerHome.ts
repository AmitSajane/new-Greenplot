import { useMemo, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmerHomeStackParamList } from '../../../navigation/FarmerHomeStack';
import { useAuth } from '../../../context/AuthContext';
import { useFarmListings } from '../../../context/FarmListingsContext';
import {
  BROWSE_BY_CROP,
  HomeFeaturedListing,
  NEWS_UPDATES,
  YOUR_ACTIVITY,
} from '../../../constants/farmerHomeMockData';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'FarmerHome'>;

const NEARBY_CHIPS = [
  { id: 'nearby', label: 'Nearby' as const },
  { id: 'purnea', label: 'Purnea' as const },
  { id: 'katihar', label: 'Katihar' as const },
] as const;

export function useFarmerHome() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { getFeaturedListings } = useFarmListings();
  const [query, setQuery] = useState('');
  const [selectedNearby, setSelectedNearby] = useState<'Nearby' | 'Purnea' | 'Katihar'>('Nearby');

  const featuredListings: HomeFeaturedListing[] = useMemo(() => {
    return getFeaturedListings().map((listing) => ({
      id: listing.id,
      title: listing.title,
      pricePerYear: listing.pricePerYear,
      locationLabel: listing.locationLabel || `${listing.location}, ${listing.district}`,
      acresLabel: listing.acresLabel || `${listing.acres} Acres`,
      image: { uri: listing.imageUrl },
      leaseType: listing.leaseType,
    }));
  }, [getFeaturedListings]);

  const quickActions = useMemo(
    () => [
      {
        id: 'qa1',
        label: 'Add Crop',
        icon: 'add-circle-outline' as const,
        tint: 'green' as const,
        onPress: () => (navigation.getParent() as { navigate?: (n: string) => void })?.navigate?.('MyCrops'),
      },
      {
        id: 'qa2',
        label: 'Create Work',
        icon: 'document-text-outline' as const,
        tint: 'blue' as const,
        onPress: () => (navigation.getParent() as { navigate?: (n: string) => void })?.navigate?.('MyCrops'),
      },
      {
        id: 'qa3',
        label: 'Hire Labor',
        icon: 'mail-outline' as const,
        tint: 'orange' as const,
        onPress: () => navigation.navigate('LaborConnect'),
      },
      {
        id: 'qa4',
        label: 'Lease Status',
        icon: 'help-circle-outline' as const,
        tint: 'purple' as const,
        onPress: () => navigation.navigate('LeaseStatus'),
      },
    ],
    [navigation]
  );

  return {
    userName: user?.name || 'Rajesh',
    locationLabel: (user as { location?: string })?.location || 'Purnea, Bihar',
    query,
    setQuery,
    nearbyChips: NEARBY_CHIPS,
    selectedNearby,
    setSelectedNearby,
    featuredListings,
    browseCrops: BROWSE_BY_CROP,
    news: NEWS_UPDATES,
    activities: YOUR_ACTIVITY,
    quickActions,
    onMenuPress: useCallback(() => {}, []),
    onLanguagePress: useCallback(() => {}, []),
    onNotificationsPress: useCallback(
      () => navigation.navigate('NotificationsCenter'),
      [navigation]
    ),
    onMicPress: useCallback(() => navigation.navigate('AIAssistant'), [navigation]),
    onMyLeasesPress: useCallback(() => navigation.navigate('MyActiveLeases'), [navigation]),
    onSatellitePress: useCallback(() => navigation.navigate('SatelliteMap'), [navigation]),
    onLaborPress: useCallback(() => navigation.navigate('LaborConnect'), [navigation]),
    onSoilTestPress: useCallback(() => navigation.navigate('SoilTest'), [navigation]),
    onLeasesMetrics: useCallback(() => navigation.navigate('MyActiveLeases'), [navigation]),
    onCropsMetrics: useCallback(
      () => (navigation as { navigate: (n: string) => void }).navigate('MyCrops'),
      [navigation]
    ),
    onTasksMetrics: useCallback(() => navigation.navigate('LaborConnect'), [navigation]),
    onViewAllLands: useCallback(
      () => (navigation as { navigate: (n: string) => void }).navigate('AllAvailableLands'),
      [navigation]
    ),
    onListingPress: useCallback(
      (id: string) => navigation.navigate('FarmDetail', { farmId: id }),
      [navigation]
    ),
    onNewsPress: useCallback(() => {}, []),
    onActivityPress: useCallback(() => {}, []),
    onCropPress: useCallback(() => {}, []),
  };
}

export type FarmerHomeViewModel = ReturnType<typeof useFarmerHome>;
