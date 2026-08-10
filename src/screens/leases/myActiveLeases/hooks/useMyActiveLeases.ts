import { useMemo, useState, useCallback } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FarmerHomeStackParamList } from '../../../../navigation/FarmerHomeStack';
import { LeaseListItem, LeaseStatus } from '../../../../components/leases/LeaseCard';
import { useLeases } from '../../../../context/LeaseContext';
import { useAuth } from '../../../../context/AuthContext';
import { LEASE_TYPE_MAP } from '../../../../constants/leaseTypes';

const DEFAULT_LEASE_IMAGE = require('../../../../assets/images/farm1.png');

type Props = NativeStackScreenProps<FarmerHomeStackParamList, 'MyActiveLeases'>;

export type LeaseFilterKey = 'All' | LeaseStatus;

export function useMyActiveLeases({ navigation }: Props) {
  const [filter, setFilter] = useState<LeaseFilterKey>('All');
  const [query, setQuery] = useState('');
  const { activeLeases, requests, agreements } = useLeases();
  const { user } = useAuth();
  const farmerId = user?.id || 'farmer-demo';

  // Only this farmer's own active leases, agreements, and requests — everyone
  // else's data comes back from the same fetch and must be filtered out here.
  const myActiveLeases = useMemo(() => activeLeases.filter((l) => l.farmerId === farmerId), [activeLeases, farmerId]);
  const myAgreements = useMemo(() => agreements.filter((a) => a.farmerId === farmerId), [agreements, farmerId]);
  const myRequests = useMemo(() => requests.filter((r) => r.farmerId === farmerId), [requests, farmerId]);

  // Agreement ids that the farmer still needs to sign → tapping these jumps to the sign screen.
  const awaitingSignIds = useMemo(
    () => new Set(myAgreements.filter((a) => a.status === 'awaiting' && !a.farmerSigned).map((a) => a.id)),
    [myAgreements],
  );

  const realItems: LeaseListItem[] = useMemo(() => {
    const active: LeaseListItem[] = myActiveLeases.map((l) => ({
      id: l.id,
      title: l.landTitle,
      ownerName: l.ownerName,
      locationLabel: `${l.typeName} lease`,
      acresLabel: '',
      rentLabel: l.termsSummary,
      status: 'Active',
      expiresInLabel: `Since ${l.startDate}`,
      image: DEFAULT_LEASE_IMAGE,
    }));
    const toSign: LeaseListItem[] = myAgreements
      .filter((a) => a.status === 'awaiting' && !a.farmerSigned)
      .map((a) => ({
        id: a.id,
        title: a.landTitle,
        ownerName: a.ownerName,
        locationLabel: `${a.typeName} · ✍️ tap to sign`,
        acresLabel: '',
        rentLabel: a.termsSummary,
        status: 'Pending',
        image: DEFAULT_LEASE_IMAGE,
      }));
    const pending: LeaseListItem[] = myRequests
      .filter((r) => r.status === 'pending')
      .map((r) => ({
        id: r.id,
        title: r.landTitle,
        ownerName: r.ownerName,
        locationLabel: `${LEASE_TYPE_MAP[r.typeId].name} · awaiting approval`,
        acresLabel: '',
        rentLabel: r.termsSummary,
        status: 'Pending',
        image: DEFAULT_LEASE_IMAGE,
      }));
    return [...toSign, ...active, ...pending];
  }, [myActiveLeases, myAgreements, myRequests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return realItems.filter((l) => {
      if (filter !== 'All' && l.status !== filter) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.ownerName.toLowerCase().includes(q) ||
        l.locationLabel.toLowerCase().includes(q)
      );
    });
  }, [filter, query, realItems]);

  const filterKeys: LeaseFilterKey[] = ['All', 'Active', 'Pending', 'Expired'];

  return {
    canGoBack: navigation.canGoBack(),
    userName: user?.name,
    filtered,
    filter,
    filterKeys,
    query,
    setFilter,
    setQuery,
    onBack: useCallback(() => navigation.goBack(), [navigation]),
    onLeasePress: useCallback(
      (item: LeaseListItem) => {
      if (awaitingSignIds.has(item.id)) {
      (navigation as { navigate: (n: string, p?: object) => void }).navigate('AgreementSign', { agreementId: item.id });
      } else {
      (navigation as { navigate: (n: string, p?: object) => void }).navigate('AgreementDetails', { agreementId: item.id });
    }
  },
  [navigation, awaitingSignIds],
),
    onOptionsPress: useCallback(() => {}, []),
    onNewLeasePress: useCallback(() => {}, []),
    onProfilePress: useCallback(
      () => (navigation as { navigate: (n: string, p?: object) => void }).navigate('Settings'),
      [navigation],
    ),
    onNotificationPress: useCallback(
      () => (navigation as { navigate: (n: string, p?: object) => void }).navigate('NotificationsCenter'),
      [navigation],
    ),
  };
}

export type MyActiveLeasesViewModel = ReturnType<typeof useMyActiveLeases>;
