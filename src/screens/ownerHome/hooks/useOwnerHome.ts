import { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OwnerHomeStackParamList } from '../../../navigation/OwnerHomeStack';
import { useAuth } from '../../../context/AuthContext';
import { useFarmListings } from '../../../context/FarmListingsContext';
import { formatIndianRevenue, parseEarningsString } from '../../../utils/format';
import { RECENT_ACTIVITIES, OwnerActivity } from '../constants/recentActivities';

type ExtendedOwnerHomeStackParamList = OwnerHomeStackParamList & { SoilTest: undefined };
type NavigationProp = NativeStackNavigationProp<ExtendedOwnerHomeStackParamList>;

export function useOwnerHome() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { ownerListings } = useFarmListings();

  const dashboard = useMemo(() => {
    const totalLands = ownerListings.length;
    const activeLeasesCount = ownerListings.filter((l) => l.status === 'leased').length;
    const revenueEarned = ownerListings
      .filter((l) => l.lastYearEarnings)
      .reduce((sum, l) => sum + parseEarningsString(l.lastYearEarnings), 0);
    const cropActivityCount = ownerListings.filter(
      (l) => l.currentCrop || l.lastYearCrop
    ).length;
    return {
      totalLands,
      activeLeasesCount,
      revenueDisplay: formatIndianRevenue(revenueEarned),
      cropActivityCount,
    };
  }, [ownerListings]);

  const navigateMyProperties = useCallback(() => {
    (navigation as { getParent?: () => { navigate: (n: string) => void } })
      .getParent?.()
      ?.navigate('MyProperties');
  }, [navigation]);

  return {
    userName: user?.name || 'Rajesh',
    hasNotifications: true,
    dashboard,
    recentActivities: RECENT_ACTIVITIES,
    views: 142,
    viewsChangePct: 12,
    onAddListing: useCallback(() => navigation.navigate('AddFarm'), [navigation]),
    onNotificationPress: useCallback(
      () => navigation.navigate('NotificationsCenter'),
      [navigation]
    ),
    onSatellitePress: useCallback(() => navigation.navigate('SatelliteMap'), [navigation]),
    onLaborPress: useCallback(() => navigation.navigate('LaborConnect'), [navigation]),
    onWorkReportPress: useCallback(
      () => navigation.navigate('OwnerWorkReport'),
      [navigation]
    ),
    onSoilTestPress: useCallback(() => navigation.navigate('SoilTest'), [navigation]),
    onDashboardStatPress: navigateMyProperties,
    onDiseaseRiskPress: useCallback(() => navigation.navigate('MyCrops'), [navigation]),
    onBudgetApprovals: useCallback(
      () => navigation.navigate('BudgetApprovals'),
      [navigation]
    ),
    onAlertsViewAll: useCallback(
      () => navigation.navigate('BudgetApprovals'),
      [navigation]
    ),
    onMicPress: useCallback(() => navigation.navigate('AIAssistant'), [navigation]),
    onViewAllActivity: useCallback(() => {}, []),
    onActivityPress: useCallback((_a: OwnerActivity) => {}, []),
    onCallBack: useCallback((_phone: string) => {}, []),
    onLeaseRequestsPress: navigateMyProperties,
  };
}

export type OwnerHomeViewModel = ReturnType<typeof useOwnerHome>;
