import { useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OwnerHomeStackParamList } from '../../../navigation/OwnerHomeStack';
import { useAuth } from '../../../context/AuthContext';
import { useFarmListings } from '../../../context/FarmListingsContext';
import { useLeases } from '../../../context/LeaseContext';
import { useAgriNews } from '../../farmerHome/hooks/useAgriNews';
import { FARMER_NEWS } from '../../farmerHome/constants/farmerDashboardData';
import type { SchemeCategory } from '../../farmerHome/constants/schemeCatalog';
import {
  OWNER_PORTFOLIO,
  OWNER_REVENUE,
  buildPropertySnapshots,
  parseAcres,
  parsePrice,
  type PropertySnapshot,
} from '../constants/ownerDashboardData';

type NavigationProp = NativeStackNavigationProp<OwnerHomeStackParamList>;

export interface ActionItem {
  id: string;
  tone: 'amber' | 'red' | 'blue' | 'green';
  icon: string;
  title: string;
  sub: string;
  actionLabel: string;
  onPress: () => void;
}

export interface ToolItem {
  key: string;
  label: string;
  icon: string;
  tone: 'green' | 'blue' | 'amber' | 'purple' | 'neutral';
  onPress: () => void;
}

export interface ActivityItem {
  id: string;
  icon: string;
  tone: 'green' | 'blue' | 'amber';
  title: string;
  sub: string;
  time: string;
  onPress: () => void;
}

export function useOwnerHome() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { ownerListings } = useFarmListings();
  const { requests } = useLeases();
  const pendingLeaseRequests = requests.filter(r => r.status === 'pending').length;

  // Live agriculture news + in-app readers (shared with Farmer Home).
  const news = useAgriNews(FARMER_NEWS);
  const onOpenArticle = useCallback(
    (url: string, title?: string) => navigation.navigate('Article', { url, title }),
    [navigation],
  );
  const onOpenVideo = useCallback(
    (embedUrl: string, title: string) => navigation.navigate('Article', { url: embedUrl, title }),
    [navigation],
  );
  // Tapping a category tile (or "More") on Schemes & news → the combined
  // Schemes & Subsidies screen, deep-linked to the right tab/category.
  const onNewsMore = useCallback(
    (tab: 'schemes' | 'news', category?: SchemeCategory) =>
      navigation.navigate('SchemesNewsList', { items: news, initialTab: tab, initialCategory: category ?? 'all' }),
    [navigation, news],
  );

  // Reach sibling tabs (MyProperties, Machinery, Market, Settings) from the home stack.
  const parent = useCallback(
    () =>
      (navigation as { getParent?: () => { navigate: (n: string, p?: object) => void } }).getParent?.(),
    [navigation],
  );
  const goTab = useCallback((tab: string, params?: object) => parent()?.navigate(tab, params), [parent]);
  const openProperty = useCallback(
    (propertyId: string) =>
      // `initial: false` pushes PropertyDetails on top of the Properties tab's
      // own list screen instead of replacing it, so back/tab-switch behave correctly.
      goTab('MyProperties', { screen: 'PropertyDetails', params: { propertyId }, initial: false }),
    [goTab],
  );

  const properties: PropertySnapshot[] = useMemo(
    () => buildPropertySnapshots(ownerListings),
    [ownerListings],
  );

  const portfolio = useMemo(() => {
    const lands = properties.length;
    // Real lands.status, not properties[].status — buildPropertySnapshots derives
    // that from a hardcoded demo-id lookup (PROPERTY_AUGMENT) that only covers 3
    // fake ids, so it silently reads every real property as vacant.
    const leased = ownerListings.filter(l => l.status === 'leased').length;
    const acres = ownerListings.reduce((sum, l) => sum + parseAcres(l.acres), 0);
    return {
      valueDisplay: OWNER_PORTFOLIO.valueDisplay,
      changePct: OWNER_PORTFOLIO.changePct,
      lands,
      leased,
      vacant: lands - leased,
      acresDisplay: acres % 1 === 0 ? String(acres) : acres.toFixed(1),
    };
  }, [properties, ownerListings]);

  const metrics = useMemo(() => {
    const occupancyPct = portfolio.lands ? Math.round((portfolio.leased / portfolio.lands) * 100) : 0;

    // Real average rent/acre across this owner's actually-leased land — weighted
    // by acreage, not a flat average of per-listing rates.
    const leasedListings = ownerListings.filter(l => l.status === 'leased');
    const leasedAcres = leasedListings.reduce((sum, l) => sum + parseAcres(l.acres), 0);
    const leasedRentTotal = leasedListings.reduce((sum, l) => sum + parsePrice(l.pricePerYear), 0);
    const avgRentDisplay = leasedAcres > 0 ? `₹${Math.round(leasedRentTotal / leasedAcres).toLocaleString('en-IN')}` : '—';

    return {
      occupancyPct,
      occupancySub: `${portfolio.leased} of ${portfolio.lands} leased`,
      activeLeases: portfolio.leased,
      avgRentDisplay,
    };
  }, [portfolio, ownerListings]);

  // Only "Lease requests" is backed by real data. The other four (budget
  // approvals, rent overdue, lease renewal, disease risk) are commented out
  // rather than shown as fabricated numbers — see conversation notes:
  // - approvals: BudgetApprovalsScreen has no real table behind it at all.
  // - overdue/renewal: leases.next_payment / end_date exist in Supabase but
  //   are never populated or read anywhere in the app (no payments flow,
  //   no end_date set at lease creation) — always null today.
  // - disease: crop_cycles.health_status IS real and populated, but the
  //   owner-side query (cycles where ownerId === this owner and
  //   health_status === 'pest_alert') isn't wired up yet.
  // Re-enable each once its real data source is actually wired up.
  const actionItems: ActionItem[] = useMemo(
    () => [
      {
        id: 'leaseRequests',
        tone: 'green',
        icon: 'document-text',
        title: pendingLeaseRequests > 0 ? `${pendingLeaseRequests} lease request${pendingLeaseRequests === 1 ? '' : 's'}` : 'Lease requests',
        sub: pendingLeaseRequests > 0 ? 'Farmers want to lease your land' : 'No new requests',
        actionLabel: 'Review',
        onPress: () => navigation.navigate('LeaseRequests'),
      },
      // {
      //   id: 'approvals',
      //   tone: 'amber',
      //   icon: 'clipboard',
      //   title: '3 budget approvals',
      //   sub: 'Tenant crop-input requests',
      //   actionLabel: 'Review',
      //   onPress: () => navigation.navigate('BudgetApprovals'),
      // },
      // {
      //   id: 'overdue',
      //   tone: 'red',
      //   icon: 'alert-circle',
      //   title: 'Rent overdue · Paddy Land',
      //   sub: '₹12,000 · 8 days late',
      //   actionLabel: 'Remind',
      //   onPress: () => goTab('MyProperties'),
      // },
      // {
      //   id: 'renewal',
      //   tone: 'blue',
      //   icon: 'ribbon',
      //   title: 'Lease renewal · Wheat Land',
      //   sub: 'Expires in 14 days',
      //   actionLabel: 'Renew',
      //   onPress: () => navigation.navigate('LeaseAgreements'),
      // },
      // {
      //   id: 'disease',
      //   tone: 'green',
      //   icon: 'bug',
      //   title: 'Disease risk · Tomato field',
      //   sub: 'Early blight detected · Bangalore N',
      //   actionLabel: 'View',
      //   onPress: () => navigation.navigate('MyCrops'),
      // },
    ],
    [navigation, pendingLeaseRequests],
  );

  const tools: ToolItem[] = useMemo(
    () => [
      { key: 'add', label: 'Add land', icon: 'add-circle', tone: 'neutral', onPress: () => navigation.navigate('AddFarm') },
      { key: 'satellite', label: 'Satellite', icon: 'globe', tone: 'green', onPress: () => navigation.navigate('SatelliteMap') },
      { key: 'soilAdvisory', label: 'Soil advisory', icon: 'leaf', tone: 'green', onPress: () => navigation.navigate('SoilAdvisory') },
      { key: 'mandi', label: 'Mandi prices', icon: 'pricetags', tone: 'amber', onPress: () => navigation.navigate('MandiPrices') },
      // { key: 'labor', label: 'Labor', icon: 'people', tone: 'blue', onPress: () => navigation.navigate('LaborConnect') },
      { key: 'labor', label: 'Labor', icon: 'people', tone: 'blue', onPress: () => { Alert.alert("Labor Connect is coming soon!"); } },

      // { key: 'work', label: 'Work report', icon: 'document-text', tone: 'purple', onPress: () => navigation.navigate('OwnerWorkReport') },
      { key: 'work', label: 'Work report', icon: 'document-text', tone: 'purple', onPress: () => { Alert.alert("Work Report is coming soon!"); } },
    ],
    [navigation, goTab],
  );

  const activities: ActivityItem[] = useMemo(
    () => [
      {
        id: 'a1',
        icon: 'cash',
        tone: 'green',
        title: 'Payment received · ₹45,000',
        sub: 'From Suresh M. · Wheat Land',
        time: '2h',
        onPress: () => goTab('MyProperties'),
      },
      {
        id: 'a2',
        icon: 'document-attach',
        tone: 'blue',
        title: 'New lease request',
        sub: 'Paddy Land · from Vikram R.',
        time: '4h',
        onPress: () => goTab('MyProperties'),
      },
      {
        id: 'a3',
        icon: 'checkmark-done',
        tone: 'amber',
        title: 'Work report submitted',
        sub: 'Weeding · Black Soil Land',
        time: '1d',
        onPress: () => navigation.navigate('OwnerWorkReport'),
      },
    ],
    [navigation, goTab],
  );

  return {
    userName: user?.name?.trim() || 'Owner',
    locationLabel: user?.location?.trim() || '',
    hasNotifications: true,
    portfolio,
    revenue: OWNER_REVENUE,
    metrics,
    actionItems,
    properties,
    tools,
    activities,
    news,
    onOpenArticle,
    onOpenVideo,
    onNewsMore,

    // Handlers
    onBell: useCallback(() => navigation.navigate('NotificationsCenter'), [navigation]),
    onWeatherPress: useCallback(() => navigation.navigate('SatelliteMap'), [navigation]),
    onAvatar: useCallback(() => navigation.navigate('Settings'), [navigation]),
    onPortfolioPress: useCallback(() => goTab('MyProperties'), [goTab]),
    onRevenuePress: useCallback(() => goTab('MyProperties'), [goTab]),
    onPayoutPress: useCallback(() => goTab('MyProperties'), [goTab]),
    onOccupancyPress: useCallback(() => goTab('MyProperties'), [goTab]),
    onActiveLeasesPress: useCallback(() => navigation.navigate('LeaseAgreements'), [navigation]),
    onDuesPress: useCallback(() => goTab('MyProperties'), [goTab]),
    onAvgRentPress: useCallback(() => goTab('MyProperties'), [goTab]),
    onActionViewAll: useCallback(() => navigation.navigate('NotificationsCenter'), [navigation]),
    onPropertiesViewAll: useCallback(() => goTab('MyProperties'), [goTab]),
    onPropertyPress: openProperty,
    onActivityViewAll: useCallback(() => navigation.navigate('NotificationsCenter'), [navigation]),
    onMicPress: useCallback(() => navigation.navigate('AIAssistant'), [navigation]),
  };
}

export type OwnerHomeViewModel = ReturnType<typeof useOwnerHome>;
