import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';
import { JobCard } from '../components';
import { LaborConnectStackParamList } from '../navigation/LaborConnectStack';
import { fetchJobs, setFilters, clearFilters } from '../redux';
import { applyForJob } from '../redux';
import { LaborRootState } from '../redux/store';
import { Job, WorkType } from '../types';
import { MOCK_LABORERS } from '../mockData';

const USER_LOC = { lat: 16.5909, lng: 74.9171 };
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const WORK_TYPES: WorkType[] = ['Harvesting', 'Weeding', 'Planting', 'Plowing', 'Irrigation', 'Spraying'];

type NavigationProp = NativeStackNavigationProp<LaborConnectStackParamList, 'JobList'>;

export default function JobListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { filteredJobs } = useSelector((s: LaborRootState) => s.job);
  const { filters } = useSelector((s: LaborRootState) => s.job);
  const [sortBy, setSortBy] = useState<'distance' | 'wage' | 'date'>('distance');

  useEffect(() => {
    dispatch(fetchJobs() as any);
  }, [dispatch]);

  useEffect(() => {
    dispatch(setFilters({ sortBy }) as any);
  }, [dispatch, sortBy]);

  const jobsWithDistance = filteredJobs
    .filter((j) => j.status === 'open')
    .map((j) => ({
      ...j,
      distanceKm: haversine(
        USER_LOC.lat, USER_LOC.lng,
        j.location.latitude, j.location.longitude
      ),
    }))
    .sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'wage') return b.wagePerDay - a.wagePerDay;
      return new Date(b.workDate).getTime() - new Date(a.workDate).getTime();
    });

  const appliedJobIds = React.useRef<Set<string>>(new Set());
  const handleApply = async (job: Job) => {
    const labor = MOCK_LABORERS[0];
    if (appliedJobIds.current.has(job.jobId)) return;
    try {
      await dispatch(
        applyForJob({
          jobId: job.jobId,
          laborId: labor.laborId,
          labor,
          job,
          message: 'I am interested in this work.',
        }) as any
      ).unwrap();
      appliedJobIds.current.add(job.jobId);
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Browse Jobs</Text>
      </View>
      <View style={styles.filters}>
        {(['distance', 'wage', 'date'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, sortBy === s && styles.filterChipActive]}
            onPress={() => setSortBy(s)}
          >
            <Text style={[styles.filterText, sortBy === s && styles.filterTextActive]}>
              {s === 'distance' ? 'Distance' : s === 'wage' ? 'Wage' : 'Date'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={jobsWithDistance}
        keyExtractor={(i) => i.jobId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            distanceKm={item.distanceKm}
            showApply={true}
            onApply={() => handleApply(item)}
            onViewLocation={() =>
              navigation.navigate('FindLaborMap', { focusJobId: item.jobId })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No jobs found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { padding: spacing.xs, marginRight: spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  filters: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: { fontSize: 13, color: colors.textPrimary },
  filterTextActive: { color: colors.surface },
  list: { padding: spacing.xl, paddingBottom: spacing.xxl },
  empty: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
