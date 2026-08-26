import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmerHomeStackParamList } from '../../../navigation/FarmerHomeStack';
import { useAuth } from '../../../context/AuthContext';
import { useFarmListings } from '../../../context/FarmListingsContext';
import { useLeases } from '../../../context/LeaseContext';
import { useCropCycles } from '../../../context/CropCycleContext';
import { useAgriNews } from './useAgriNews';
import type { SchemeCategory } from '../constants/schemeCatalog';
import {
  FARMER_AI_ADVISORY,
  FARMER_BROWSE_CROPS,
  FARMER_CROP_HEALTH,
  FARMER_NEARBY_CHIPS,
  FARMER_NEWS,
  FARMER_QUICK_ACTIONS,
  FARMER_TASKS,
  FARMER_TICKER,
  type FarmerAction,
  type NearbyChip,
  type SnapStat,
} from '../constants/farmerDashboardData';

const formatAcres = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));

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
  const { getFeaturedListings, listings, getListingById } = useFarmListings();
  const { activeLeases } = useLeases();
  const { cropCycles } = useCropCycles();

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
        case 'weather':
          return navigation.navigate('WeatherDetail');
        case 'soil':
          return navigation.navigate('SoilTest');
        case 'soilAdvisory':
          return navigation.navigate('SoilAdvisory');
        case 'mandiCompare':
          return navigation.navigate('MandiPrices');
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
          return navigation.navigate('Settings');
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

  // Open a live news article in the in-app WebView reader.
  const onOpenArticle = useCallback(
    (url: string, title?: string) => navigation.navigate('Article', { url, title }),
    [navigation],
  );

  // Tapping a category tile (or "More") on Schemes & news → the combined
  // Schemes & Subsidies screen, deep-linked to the right tab/category.
  const onSchemesMore = useCallback(
    (tab: 'schemes' | 'news', category?: SchemeCategory) =>
      navigation.navigate('SchemesNewsList', { items: news, initialTab: tab, initialCategory: category ?? 'all' }),
    [navigation, news],
  );

  // Play an agriculture video in the in-app WebView (YouTube embed URL).
  const onOpenVideo = useCallback(
    (embedUrl: string, title: string) => navigation.navigate('Article', { url: embedUrl, title }),
    [navigation],
  );

  // Real farm-snapshot numbers — mirrors the own+leased acreage pattern already
  // used on MyCropsScreen, and the same activeLeases/cropCycles filters used
  // throughout the app (farmerId === current user).
  const myActiveLeases = useMemo(
    () => activeLeases.filter(l => l.farmerId === user?.id),
    [activeLeases, user?.id],
  );

  const totalAcresFarmed = useMemo(() => {
    const ownAcres = listings
      .filter(l => l.selfFarmed && l.ownerId === user?.id)
      .reduce((sum, l) => sum + (parseFloat(l.acres) || 0), 0);
    const leasedAcres = myActiveLeases.reduce((sum, l) => {
      const listing = getListingById(l.landId);
      return sum + (listing ? parseFloat(listing.acres) || 0 : 0);
    }, 0);
    return ownAcres + leasedAcres;
  }, [listings, user?.id, myActiveLeases, getListingById]);

  const activeCropsCount = useMemo(
    () => cropCycles.filter(c => c.farmerId === user?.id && c.status === 'active').length,
    [cropCycles, user?.id],
  );

  // "Tasks due" has no real backing concept in the app yet (no task/reminder
  // model exists) — show a placeholder rather than a fabricated or
  // loosely-related number, same approach as the NDVI/Yield "Coming soon"
  // cards on CropDetailsScreen.
  const snapshot: SnapStat[] = useMemo(
    () => [
      { id: 's1', emoji: '📄', value: String(myActiveLeases.length), label: 'Active leases', action: 'leases' },
      { id: 's2', emoji: '🌾', value: formatAcres(totalAcresFarmed), label: 'Acres farmed', action: 'crops' },
      { id: 's3', emoji: '🌱', value: String(activeCropsCount), label: 'Crops', action: 'crops' },
      { id: 's4', emoji: '✅', value: 'Soon', label: 'Tasks due', tone: 'amber', action: 'tasks', disabled: true },
    ],
    [myActiveLeases.length, totalAcresFarmed, activeCropsCount],
  );

  const featuredListings: FarmerListingCard[] = useMemo(
    () =>
      getFeaturedListings()
        .slice(0, 4)
        .map(listing => ({
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
    userName: user?.name?.trim() || 'Farmer',
    locationLabel: (user as { location?: string })?.location || '',

    // Dynamic (computed from real data)
    snapshot,

    // Static (stable) content
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
    onOpenVideo,
    onSchemesMore,
  };
}

export type FarmerHomeViewModel = ReturnType<typeof useFarmerHome>;
