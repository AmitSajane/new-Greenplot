import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';
import { useCropCycles } from '../../../context/CropCycleContext';
import { workJobApi } from '../services/workJobApi';
import { useState, useEffect } from 'react';

type CropDetailsRoute = RouteProp<{ CropDetails: { cropCycleId: string } }, 'CropDetails'>;

export default function CropDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<CropDetailsRoute>();
  const { cropCycleId } = route.params;
  const [jobCount, setJobCount] = useState(0);
  const { getCropCycleById } = useCropCycles();

  const crop = getCropCycleById(cropCycleId);

  useEffect(() => {
    workJobApi.getJobsByCropCycle(cropCycleId).then((jobs) => setJobCount(jobs.length));
  }, [cropCycleId]);

  if (!crop) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Crop not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Crop Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.plotName}>{crop.plotName}</Text>
          <Text style={styles.cropName}>{crop.cropName}</Text>
          <View style={styles.row}>
            <Ionicons name="resize-outline" size={18} color={colors.primary} />
            <Text style={styles.rowText}>{crop.areaAcres} Acres</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="person-outline" size={18} color={colors.primary} />
            <Text style={styles.rowText}>Landlord: {crop.landlord}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crop timeline</Text>
          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, styles.timelineDotDone]} />
            <Text style={styles.timelineText}>Sowing</Text>
            <Text style={styles.timelineDate}>Jan 2024</Text>
          </View>
          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, styles.timelineDotDone]} />
            <Text style={styles.timelineText}>Growing</Text>
            <Text style={styles.timelineDate}>Feb–Apr</Text>
          </View>
          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, styles.timelineDotCurrent]} />
            <Text style={styles.timelineText}>Harvest</Text>
            <Text style={styles.timelineDate}>May 2024</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>NDVI health</Text>
          <View style={styles.ndviRow}>
            <View style={styles.ndviBarWrap}>
              <View style={[styles.ndviBar, { width: '72%' }]} />
            </View>
            <Text style={styles.ndviValue}>0.72</Text>
          </View>
          <Text style={styles.ndviLabel}>Healthy vegetation</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Yield prediction</Text>
          <Text style={styles.yieldValue}>~22 quintals</Text>
          <Text style={styles.yieldSubtext}>Based on current NDVI and season</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Jobs</Text>
          <Text style={styles.sectionSubtitle}>{jobCount} job(s) for this crop</Text>
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateWork', { cropCycleId })}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.createBtnText}>Create Work</Text>
        </TouchableOpacity>
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
  errorText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxl },
  backBtnText: { fontSize: 16, fontWeight: '600', color: colors.primary, marginTop: spacing.lg },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  plotName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  cropName: { fontSize: 16, color: colors.primary, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  rowText: { fontSize: 14, color: colors.textSecondary },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  sectionSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
  },
  createBtnText: { fontSize: 16, fontWeight: '700', color: colors.surface },
  timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.md },
  timelineDotDone: { backgroundColor: colors.success },
  timelineDotCurrent: { backgroundColor: colors.primary },
  timelineText: { flex: 1, fontSize: 14, color: colors.textPrimary },
  timelineDate: { fontSize: 12, color: colors.textMuted },
  ndviRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  ndviBarWrap: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  ndviBar: { height: '100%', backgroundColor: colors.success, borderRadius: 4 },
  ndviValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  ndviLabel: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs },
  yieldValue: { fontSize: 20, fontWeight: '700', color: colors.primary },
  yieldSubtext: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
});
