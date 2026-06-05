import { useMemo, useState, useCallback } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FarmerHomeStackParamList } from '../../../../navigation/FarmerHomeStack';
import { MyLeasesStackParamList } from '../../../../navigation/MyLeasesStack';
import { LeaseStatus } from '../../../../components/leases/LeaseCard';
import { MOCK_ACTIVE_LEASES } from '../constants/mockLeases';

type Props = NativeStackScreenProps<
  FarmerHomeStackParamList | MyLeasesStackParamList,
  'MyActiveLeases'
>;

export type LeaseFilterKey = 'All' | LeaseStatus;

export function useMyActiveLeases({ navigation }: Props) {
  const [filter, setFilter] = useState<LeaseFilterKey>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_ACTIVE_LEASES.filter((l) => {
      if (filter !== 'All' && l.status !== filter) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.ownerName.toLowerCase().includes(q) ||
        l.locationLabel.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

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
      () => navigation.navigate('AgreementDetails'),
      [navigation]
    ),
    onOptionsPress: useCallback(() => {}, []),
    onNewLeasePress: useCallback(() => {}, []),
  };
}

export type MyActiveLeasesViewModel = ReturnType<typeof useMyActiveLeases>;
