import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';
import { JobCard } from '../components';
import { LaborConnectStackParamList } from '../navigation/LaborConnectStack';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../redux';
import { LaborRootState } from '../redux/store';
import { Application } from '../types';

type NavigationProp = NativeStackNavigationProp<LaborConnectStackParamList, 'MyJobs'>;

type Tab = 'posted' | 'applied';

export default function MyJobsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const [tab, setTab] = useState<Tab>('posted');
  const { myPostedJobs } = useSelector((s: LaborRootState) => s.job);
  const { applications } = useSelector((s: LaborRootState) => s.application);

  useEffect(() => {
    dispatch(fetchJobs('F001') as any);
  }, [dispatch]);

  const appliedJobs = applications
    .filter((a) => a.laborId === 'L001')
    .map((a) => a.job);

  const data = tab === 'posted' ? myPostedJobs : appliedJobs;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Jobs</Text>
      </View>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'posted' && styles.tabActive]}
          onPress={() => setTab('posted')}
        >
          <Text style={[styles.tabText, tab === 'posted' && styles.tabTextActive]}>
            Posted
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'applied' && styles.tabActive]}
          onPress={() => setTab('applied')}
        >
          <Text style={[styles.tabText, tab === 'applied' && styles.tabTextActive]}>
            Applied
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        keyExtractor={(i) => i.jobId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            showApply={false}
            onViewLocation={() =>
              navigation.navigate('FindLaborMap', { focusJobId: item.jobId })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {tab === 'posted' ? 'No posted jobs' : 'No applied jobs'}
            </Text>
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
  tabs: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  tabTextActive: { color: colors.surface },
  list: { padding: spacing.xl, paddingBottom: spacing.xxl },
  empty: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
