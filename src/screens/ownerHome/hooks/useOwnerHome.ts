import { useMemo, useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OwnerHomeStackParamList } from '../../../navigation/OwnerHomeStack';
import { useAuth } from '../../../context/AuthContext';
import { useFarmListings } from '../../../context/FarmListingsContext';
import { useLeases } from '../../../context/LeaseContext';
import { notificationsApi, AppNotification } from '../../../services/notificationsApi';
import { useAgriNews } from '../../farmerHome/hooks/useAgriNews';
import { FARMER_NEWS } from '../../farmerHome/constants/farmerDashboardData';
import type { SchemeCategory } from '../../farmerHome/constants/schemeCatalog';
import { activityVisual, relativeTime, type ActivityItem } from '../../../utils/activityFeed';
import { CLOSURE_HISTORY_ACTION_LABELS, closureNeedsOwnerAction } from '../../../constants/leaseClosure';
import {
  buildPropertySnapshots,
  formatCompactRupees,
  formatRupees,
  parseAcres,
  parsePrice,
  type PropertySnapshot,
} from '../constants/ownerDashboardData';

// Icon per closure-history action — mirrors CLOSURE_HISTORY_ACTION_LABELS'
// keys, just picking a glyph instead of text.
function closureActionIcon(action: string): string {
  if (action === 'owner_rejected' || action === 'closure_cancelled') return 'close-circle';
  if (action === 'owner_accepted' || action === 'owner_accepted_with_settlement') return 'checkmark-circle';
  if (action === 'notice_waived') return 'time';
  if (action === 'settlement_confirmed' || action === 'settlement_updated') return 'cash';
  if (action === 'owner_confirmed_receipt' || action === 'farmer_confirmed_handover') return 'hand-left';
  if (action === 'lease_closed') return 'checkmark-done-circle';
  return 'document-text';
}

function closureActionTone(action: string): ActivityItem['tone'] {
  if (action === 'owner_rejected' || action === 'closure_cancelled') return 'red';
  if (action === 'lease_closed') return 'green';
  return 'blue';
}

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

export type { ActivityItem };

export function useOwnerHome() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { ownerListings } = useFarmListings();
  const { requests, activeLeases, closures, getHistoryForClosure } = useLeases();
  const pendingLeaseRequests = requests.filter(r => r.status === 'pending').length;
  // Every closure (any stage — respond, confirm settlement, confirm
  // handover, finalize) currently waiting on this owner to do something.
  const closuresNeedingAction = useMemo(
    () => closures.filter(c => c.ownerId === user?.id && closureNeedsOwnerAction(c)),
    [closures, user?.id],
  );

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
    () => buildPropertySnapshots(ownerListings, activeLeases),
    [ownerListings, activeLeases],
  );

  const portfolio = useMemo(() => {
    const lands = properties.length;
    const leased = ownerListings.filter(l => l.status === 'leased').length;
    const acres = ownerListings.reduce((sum, l) => sum + parseAcres(l.acres), 0);
    // The land model has no appraisal field. lastYearEarnings is the only
    // persisted monetary value that represents each property's contribution.
    const totalValue = ownerListings.reduce((sum, l) => sum + parsePrice(l.lastYearEarnings), 0);
    return {
      valueDisplay: formatCompactRupees(totalValue),
      lands,
      leased,
      vacant: lands - leased,
      acresDisplay: acres % 1 === 0 ? String(acres) : acres.toFixed(1),
    };
  }, [properties, ownerListings]);

  const revenue = useMemo(() => {
    // pricePerYear is stored per listing. Monthly revenue is its annual value
    // divided by 12, limited to lands currently marked as leased.
    const annualRent = ownerListings
      .filter(l => l.status === 'leased')
      .reduce((sum, l) => sum + parsePrice(l.pricePerYear), 0);

    // A payout is only shown when an active lease has both backend fields.
    const next = activeLeases
      .filter(l => l.ownerId === user?.id && l.rent && l.nextPayment)
      .map(l => ({ ...l, dueAt: new Date(`${l.nextPayment}T00:00:00`).getTime() }))
      .filter(l => Number.isFinite(l.dueAt) && l.dueAt >= new Date().setHours(0, 0, 0, 0))
      .sort((a, b) => a.dueAt - b.dueAt)[0];

    return {
      thisMonthDisplay: formatRupees(annualRent / 12),
      payoutAmountDisplay: next ? formatRupees(parsePrice(next.rent)) : null,
      payoutDate: next
        ? new Date(next.dueAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : null,
    };
  }, [activeLeases, ownerListings, user?.id]);

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
      ...(closuresNeedingAction.length > 0
        ? [
            {
              id: 'closureActions',
              tone: 'amber' as const,
              icon: 'exit-outline',
              title: `${closuresNeedingAction.length} closure action${closuresNeedingAction.length === 1 ? '' : 's'}`,
              sub: 'A lease closure needs your input',
              actionLabel: 'Review',
              onPress: () => navigation.navigate('LeaseClosure', { closureId: closuresNeedingAction[0].id }),
            },
          ]
        : []),
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
    [navigation, pendingLeaseRequests, closuresNeedingAction],
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
    [navigation],
  );

  // One real source feeding "Recent activity" below: the same `notifications`
  // table NotificationsCenter reads (that's why "View all" points there).
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }
    try {
      setNotifications(await notificationsApi.fetchForUser(user.id));
    } catch {
      setNotifications([]);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
    return user?.id ? notificationsApi.subscribe(user.id, loadNotifications) : undefined;
  }, [loadNotifications, user?.id]);

  // Recent activity merges every real, timestamped event this owner already
  // has data for — not just the notifications table (which nothing in this
  // app writes to yet, so it's often empty): a new land listed, a lease
  // going active, and a lease request coming in are all real state changes
  // already tracked in FarmListingsContext / LeaseContext.
  const activities: ActivityItem[] = useMemo(() => {
    const items: (ActivityItem & { ts: number })[] = [];

    notifications.forEach(n => {
      const { icon, tone } = activityVisual(n.type);
      const ts = new Date(n.createdAt).getTime();
      if (!Number.isFinite(ts)) return;
      items.push({
        id: `note-${n.id}`,
        icon,
        tone,
        title: n.title,
        sub: n.body,
        time: relativeTime(n.createdAt),
        actionLabel: 'View',
        onPress: () => navigation.navigate('NotificationsCenter'),
        ts,
      });
    });

    ownerListings.forEach(listing => {
      const ts = listing.createdAt.getTime();
      if (!Number.isFinite(ts)) return;
      items.push({
        id: `land-${listing.id}`,
        icon: 'add-circle',
        tone: 'green',
        title: 'New land added',
        sub: listing.locationLabel || listing.title,
        time: relativeTime(listing.createdAt.toISOString()),
        actionLabel: 'View',
        onPress: () => openProperty(listing.id),
        ts,
      });
    });

    activeLeases
      .filter(l => l.ownerId === user?.id)
      .forEach(l => {
        const ts = new Date(l.createdAt).getTime();
        if (!Number.isFinite(ts)) return;
        items.push({
          id: `leased-${l.id}`,
          icon: 'key',
          tone: 'blue',
          title: 'Land leased',
          sub: `${l.landTitle} · to ${l.farmerName}`,
          time: relativeTime(l.createdAt),
          actionLabel: 'View',
          onPress: () => openProperty(l.landId),
          ts,
        });
      });

    // Only settled outcomes here — a still-pending request belongs solely in
    // "Action required" above, not duplicated here as a completed-looking row.
    requests
      .filter(r => r.ownerId === user?.id && r.status !== 'pending')
      .forEach(r => {
        const ts = new Date(r.createdAt).getTime();
        if (!Number.isFinite(ts)) return;
        items.push({
          id: `request-${r.id}`,
          icon: r.status === 'accepted' ? 'checkmark-circle' : 'close-circle',
          tone: r.status === 'accepted' ? 'green' : 'red',
          title: r.status === 'accepted' ? 'Lease request accepted' : 'Lease request rejected',
          sub: `${r.landTitle} · ${r.farmerName}`,
          time: relativeTime(r.createdAt),
          actionLabel: 'View',
          onPress: () => navigation.navigate('LeaseRequests'),
          ts,
        });
      });

    // Lease closure — only this owner's own already-completed actions on
    // it (accept/reject, waive notice, confirm settlement/handover,
    // finalize). A closure still waiting on this owner for its *next* step
    // stays in "Action required" instead — its history so far is still
    // fair game here since each entry is something already done.
    closures
      .filter(c => c.ownerId === user?.id)
      .forEach(c => {
        getHistoryForClosure(c.id)
          .filter(h => h.userRole === 'owner')
          .forEach(h => {
            const ts = new Date(h.createdAt).getTime();
            if (!Number.isFinite(ts)) return;
            items.push({
              id: `closure-hist-${h.id}`,
              icon: closureActionIcon(h.action),
              tone: closureActionTone(h.action),
              title: CLOSURE_HISTORY_ACTION_LABELS[h.action] || h.action.replace(/_/g, ' '),
              sub: `${c.landTitle} · ${c.farmerName}`,
              time: relativeTime(h.createdAt),
              actionLabel: 'View',
              onPress: () => navigation.navigate('LeaseClosure', { closureId: c.id }),
              ts,
            });
          });
      });

    return items
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 5)
      .map(({ ts, ...rest }) => rest);
  }, [notifications, ownerListings, activeLeases, requests, closures, getHistoryForClosure, user?.id, navigation, openProperty]);

  return {
    userName: user?.name?.trim() || 'Owner',
    locationLabel: user?.location?.trim() || '',
    hasNotifications: true,
    portfolio,
    revenue,
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
    onWeatherPress: useCallback(() => navigation.navigate('WeatherDetail'), [navigation]),
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
