import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';
import { workJobApi } from '../services/workJobApi';
import { WorkJob } from '../types';

function getStatusStyle(status: string) {
  if (status === 'open') return { backgroundColor: colors.softGreen };
  if (status === 'in_progress') return { backgroundColor: colors.softBlue };
  if (status === 'completed') return { backgroundColor: colors.border };
  return { backgroundColor: colors.softOrange };
}

export default function WorkListScreen() {
  const navigation = useNavigation<any>();
  const [jobs, setJobs] = useState<WorkJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workJobApi.getJobsByFarmer('F001').then((list) => {
      setJobs(list);
      setLoading(false);
    });
  }, []);

  const renderItem = ({ item }: { item: WorkJob }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('WorkDetails', { jobId: item.jobId })}
      activeOpacity={0.8}
    >
      <View style={styles.cardRow}>
        <Text style={styles.workType}>{item.workType}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.meta}>
        <Ionicons name="people-outline" size={14} color={colors.textMuted} />
        <Text style={styles.metaText}>{item.workersNeeded} workers</Text>
        <Ionicons name="cash-outline" size={14} color={colors.textMuted} style={styles.metaIcon} />
        <Text style={styles.metaText}>₹{item.wagePerDay}/day</Text>
        <Ionicons name="calendar-outline" size={14} color={colors.textMuted} style={styles.metaIcon} />
        <Text style={styles.metaText}>{item.workDate}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Work List</Text>
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Work List</Text>
      </View>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.jobId}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No work jobs yet. Create from a crop.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { marginRight: spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  list: { padding: spacing.lg },
  loadingText: { padding: spacing.xl, color: colors.textSecondary },
  emptyText: { padding: spacing.xl, color: colors.textMuted, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  workType: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill },
  statusText: { fontSize: 11, fontWeight: '600', color: colors.textPrimary },
  desc: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, flexWrap: 'wrap' },
  metaText: { fontSize: 12, color: colors.textMuted, marginLeft: spacing.xs },
  metaIcon: { marginLeft: spacing.md },
});
