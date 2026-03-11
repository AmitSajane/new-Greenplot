import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';
import { workJobApi } from '../services/workJobApi';
import { WorkJob } from '../types';

export default function WorkDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<{ params: { jobId: string } }>();
  const jobId = route.params?.jobId;
  const [job, setJob] = useState<WorkJob | null>(null);

  useEffect(() => {
    if (jobId) {
      workJobApi.getJobById(jobId).then(setJob);
    }
  }, [jobId]);

  if (!job) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Work Details</Text>
        </View>
        <Text style={styles.emptyText}>Job not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Work Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.workType}>{job.workType}</Text>
          <View style={styles.statusWrap}>
            <View style={[styles.statusBadge, styles[`status_${job.status}` as keyof typeof styles]]}>
              <Text style={styles.statusText}>{job.status.replace('_', ' ')}</Text>
            </View>
          </View>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.desc}>{job.description}</Text>
          <DetailRow icon="people-outline" label="Workers needed" value={String(job.workersNeeded)} />
          <DetailRow icon="cash-outline" label="Wage/day" value={`₹${job.wagePerDay}`} />
          <DetailRow icon="calendar-outline" label="Date" value={job.workDate} />
          <DetailRow icon="time-outline" label="Time" value={`${job.startTime} – ${job.endTime}`} />
        </View>
        <TouchableOpacity
          style={styles.attendanceBtn}
          onPress={() => (navigation.getParent() as any)?.navigate('FarmerHome')}
        >
          <Ionicons name="checkmark-done-outline" size={22} color={colors.surface} />
          <Text style={styles.attendanceBtnText}>Mark attendance</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
  scroll: { padding: spacing.lg },
  emptyText: { padding: spacing.xl, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workType: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  statusWrap: { marginTop: spacing.sm },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  status_open: { backgroundColor: colors.softGreen },
  status_in_progress: { backgroundColor: colors.softBlue },
  status_completed: { backgroundColor: colors.border },
  status_cancelled: { backgroundColor: colors.softOrange },
  statusText: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginTop: spacing.md },
  desc: { fontSize: 14, color: colors.textPrimary, marginTop: spacing.xs },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  detailLabel: { marginLeft: spacing.sm, fontSize: 14, color: colors.textSecondary, width: 120 },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  attendanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
  },
  attendanceBtnText: { fontSize: 16, fontWeight: '700', color: colors.surface },
});
