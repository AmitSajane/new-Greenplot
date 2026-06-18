import { useCallback, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmerHomeStackParamList } from '../../../navigation/FarmerHomeStack';
import { useAuth } from '../../../context/AuthContext';
import { useFarmListings } from '../../../context/FarmListingsContext';
import { useAgriNews } from './useAgriNews';
import {
  FARMER_AI_ADVISORY,
  FARMER_BROWSE_CROPS,
  FARMER_CROP_HEALTH,
  FARMER_NEARBY_CHIPS,
  FARMER_NEWS,
  FARMER_QUICK_ACTIONS,
  FARMER_SNAPSHOT,
  FARMER_TASKS,
  FARMER_TICKER,
  FARMER_WEATHER,
  type FarmerAction,
  type NearbyChip,
} from '../constants/farmerDashboardData';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'FarmerHome'>;

/** Minimal shape we need from the parent tab navigator for cross-tab routing. */
type ParentNav = { navigate: (name: string, params?: object) => void };

export interface FarmerListingCard {
  id: string;
  title: string;
  priceLabel: string;
  locationLabel: string;
  acresLabel: string;
  leaseType?: string;
  imageUri?: string;
}

export function useFarmerHome() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { getFeaturedListings } = useFarmListings();

  const [query, setQuery] = useState('');
  const [selectedNearby, setSelectedNearby] = useState<NearbyChip>('Nearby');

  // Live agriculture news/schemes (NewsData.io) with mock fallback.
  const news = useAgriNews(FARMER_NEWS);

  // Stable cross-tab navigation helper.
  const goTab = useCallback(
    (tab: string, params?: object) => (navigation.getParent() as ParentNav | undefined)?.navigate(tab, params),
    [navigation],
  );

  /**
   * Single source of truth for navigation. Every actionable item in the mock
   * data carries a `FarmerAction`; this resolver maps it to a real screen so
   * the data stays declarative and there are no per-item closures to leak.
   */
  const onAction = useCallback(
    (action: FarmerAction) => {
      switch (action) {
        case 'leases':
          return navigation.navigate('MyActiveLeases');
        case 'crops':
        case 'addCrop':
        case 'createWork':
          return goTab('MyCrops');
        case 'tasks':
        case 'labor':
          return navigation.navigate('LaborConnect');
        case 'satellite':
          return navigation.navigate('SatelliteMap');
        case 'soil':
          return navigation.navigate('SoilTest');
        case 'market':
          return goTab('Market');
        case 'marketAlert':
          return goTab('Market', { screen: 'OversupplyAlert', params: { cropId: 'tomato' } });
        case 'leaseStatus':
          return navigation.navigate('LeaseStatus');
        case 'aiAssistant':
          return navigation.navigate('AIAssistant');
        case 'allLands':
          return navigation.navigate('AllAvailableLands');
        case 'notifications':
          return navigation.navigate('NotificationsCenter');
        case 'hub':
          return goTab('Hub');
        case 'settings':
          return goTab('Settings');
        default:
          return undefined;
      }
    },
    [navigation, goTab],
  );

  const onTickerPress = useCallback(
    (cropId: string) => goTab('Market', { screen: 'PriceTrend', params: { cropId } }),
    [goTab],
  );

  const onListingPress = useCallback(
    (farmId: string) => navigation.navigate('FarmDetail', { farmId }),
    [navigation],
  );

  // Open a live news article in the device browser.
  const onOpenArticle = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      /* unsupported/invalid URL — ignore so the app never crashes */
    });
  }, []);

  const featuredListings: FarmerListingCard[] = useMemo(
    () =>
      getFeaturedListings().map(listing => ({
        id: listing.id,
        title: listing.title,
        priceLabel: `${listing.pricePerYear}/yr`,
        locationLabel: listing.locationLabel || `${listing.location}, ${listing.district}`,
        acresLabel: listing.acresLabel || `${listing.acres} Acres`,
        leaseType: listing.leaseType,
        imageUri: listing.imageUrl,
      })),
    [getFeaturedListings],
  );

  return {
    userName: user?.name || 'Rajesh Kumar',
    locationLabel: (user as { location?: string })?.location || 'Purnea, Bihar · Kisan',

    // Static (stable) content
    weather: FARMER_WEATHER,
    snapshot: FARMER_SNAPSHOT,
    aiAdvisory: FARMER_AI_ADVISORY,
    ticker: FARMER_TICKER,
    tasks: FARMER_TASKS,
    quickActions: FARMER_QUICK_ACTIONS,
    cropHealth: FARMER_CROP_HEALTH,
    news,
    browseCrops: FARMER_BROWSE_CROPS,
    nearbyChips: FARMER_NEARBY_CHIPS,

    // Dynamic
    featuredListings,
    query,
    setQuery,
    selectedNearby,
    setSelectedNearby,

    // Stable handlers
    onAction,
    onTickerPress,
    onListingPress,
    onOpenArticle,
  };
}

export type FarmerHomeViewModel = ReturnType<typeof useFarmerHome>;
