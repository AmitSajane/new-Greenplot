import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';
import { useFarmListings } from '../../context/FarmListingsContext';
import { MOCK_WORK_JOBS } from '../../modules/work/mockData/workJobs';
import { MOCK_CROP_CYCLES } from '../../modules/work/mockData/cropCycles';

export default function OwnerWorkReportScreen() {
  const navigation = useNavigation<any>();
  const { ownerListings } = useFarmListings();

  const report = useMemo(() => {
    const landWork: Array<{
      landId: string;
      landTitle: string;
      cropCount: number;
      workCount: number;
      laborCount: number;
      laborCost: number;
      progress: string;
    }> = [];

    ownerListings.forEach((land) => {
      const crops = MOCK_CROP_CYCLES.filter((c) => c.landId === land.id);
      const jobs = MOCK_WORK_JOBS.filter((j) => j.landId === land.id);
      const laborCount = jobs.reduce((sum, j) => sum + j.workersHired, 0);
      const laborCost = jobs.reduce((sum, j) => {
        const estimatedDays = 5;
        return sum + j.workersHired * j.wagePerDay * estimatedDays;
      }, 0);
      const completed = jobs.filter((j) => j.status === 'completed').length;
      const total = jobs.length;
      const progress = total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%';

      landWork.push({
        landId: land.id,
        landTitle: land.title,
        cropCount: crops.length,
        workCount: jobs.length,
        laborCount,
        laborCost,
        progress,
      });
    });

    const totalLaborCost = landWork.reduce((s, r) => s + r.laborCost, 0);
    const totalWorks = landWork.reduce((s, r) => s + r.workCount, 0);
    const totalLabor = landWork.reduce((s, r) => s + r.laborCount, 0);

    return { landWork, totalLaborCost, totalWorks, totalLabor };
  }, [ownerListings]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Work Report</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Overview</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{report.totalWorks}</Text>
              <Text style={styles.summaryLabel}>Total Jobs</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{report.totalLabor}</Text>
              <Text style={styles.summaryLabel}>Labor Count</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>₹{report.totalLaborCost.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Labor Cost</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Land → Crop → Work</Text>
        {report.landWork.map((r) => (
          <View key={r.landId} style={styles.landCard}>
            <Text style={styles.landTitle}>{r.landTitle}</Text>
            <View style={styles.landRow}>
              <Ionicons name="leaf-outline" size={18} color={colors.primary} />
              <Text style={styles.landText}>{r.cropCount} crops</Text>
            </View>
            <View style={styles.landRow}>
              <Ionicons name="briefcase-outline" size={18} color={colors.primary} />
              <Text style={styles.landText}>{r.workCount} work jobs</Text>
            </View>
            <View style={styles.landRow}>
              <Ionicons name="people-outline" size={18} color={colors.primary} />
              <Text style={styles.landText}>{r.laborCount} laborers</Text>
            </View>
            <View style={styles.landRow}>
              <Ionicons name="cash-outline" size={18} color={colors.primary} />
              <Text style={styles.landText}>₹{r.laborCost.toLocaleString()} labor cost</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{r.progress}</Text>
            </View>
          </View>
        ))}

        {report.landWork.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No work data for your lands yet</Text>
          </View>
        )}
      </ScrollView>
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
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.md,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  landCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  landTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  landRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  landText: { fontSize: 14, color: colors.textSecondary },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  progressValue: { fontSize: 14, fontWeight: '700', color: colors.primary },
  empty: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: { fontSize: 15, color: colors.textSecondary, marginTop: spacing.md },
});
