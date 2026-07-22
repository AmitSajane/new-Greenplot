import { useMemo, useState, useCallback } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FarmerHomeStackParamList } from '../../../../navigation/FarmerHomeStack';
import { MyLeasesStackParamList } from '../../../../navigation/MyLeasesStack';
import { LeaseListItem, LeaseStatus } from '../../../../components/leases/LeaseCard';
import { useLeases } from '../../../../context/LeaseContext';
import { LEASE_TYPE_MAP } from '../../../../constants/leaseTypes';

const DEFAULT_LEASE_IMAGE = require('../../../../assets/images/farm1.png');

type Props = NativeStackScreenProps<
  FarmerHomeStackParamList | MyLeasesStackParamList,
  'MyActiveLeases'
>;

export type LeaseFilterKey = 'All' | LeaseStatus;

export function useMyActiveLeases({ navigation }: Props) {
  const [filter, setFilter] = useState<LeaseFilterKey>('All');
  const [query, setQuery] = useState('');
  // Single-user demo: surface all active leases + agreements awaiting signature + pending requests.
  const { activeLeases, requests, agreements } = useLeases();

  // Agreement ids that the farmer still needs to sign → tapping these jumps to the sign screen.
  const awaitingSignIds = useMemo(
    () => new Set(agreements.filter((a) => a.status === 'awaiting' && !a.farmerSigned).map((a) => a.id)),
    [agreements],
  );

  const realItems: LeaseListItem[] = useMemo(() => {
    const active: LeaseListItem[] = activeLeases.map((l) => ({
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
    const toSign: LeaseListItem[] = agreements
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
    const pending: LeaseListItem[] = requests
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
  }, [activeLeases, agreements, requests]);

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
          navigation.navigate('AgreementDetails');
        }
      },
      [navigation, awaitingSignIds],
    ),
    onOptionsPress: useCallback(() => {}, []),
    onNewLeasePress: useCallback(() => {}, []),
  };
}

export type MyActiveLeasesViewModel = ReturnType<typeof useMyActiveLeases>;
