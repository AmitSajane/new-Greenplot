import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { useFarmListings } from '../../context/FarmListingsContext';
import { useCropCycles } from '../../context/CropCycleContext';
import { useAuth } from '../../context/AuthContext';
import { farmActivityApi } from '../../services/farmActivityApi';
import type { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'CropPlanReview'>;
type Route = RouteProp<FarmerHomeStackParamList, 'CropPlanReview'>;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function CropPlanReviewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const { farmId, draft } = route.params;
  const { getListingById } = useFarmListings();
  const { saveCropCycle } = useCropCycles();
  const { user } = useAuth();
  const farm = getListingById(farmId);

  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!farm || !user?.id || submitting) return;
    setSubmitting(true);
    try {
      const cropCycleId = await saveCropCycle({
        landId: farm.id,
        farmerId: user.id,
        ownerId: farm.ownerId,
        plotName: farm.title,
        areaAcres: parseFloat(draft.areaToCultivate) || 0,
        landlord: farm.ownerName,
        cropName: draft.cropName,
        healthStatus: 'healthy',
        cropId: draft.cropId,
        variety: draft.variety || undefined,
        plannedPlantingDate: draft.plannedPlantingDateIso,
        expectedHarvestDate: draft.expectedHarvestDateIso,
        currentStage: 'LAND_PREPARATION',
      });
      // Best-effort — the crop plan itself has already saved successfully,
      // so a hiccup generating the guided task list shouldn't block the farmer.
      try {
        await farmActivityApi.generateFromGuidance({
          cropCycleId,
          landId: farm.id,
          farmerId: user.id,
          ownerId: farm.ownerId,
          cropId: draft.cropId || undefined,
          plannedPlantingDate: draft.plannedPlantingDateIso,
        });
      } catch {
        /* non-fatal — Today's Guidance will just be empty until this succeeds later */
      }
      navigation.navigate('ManagedFarmDashboard', { farmId });
    } catch (e) {
      setSubmitting(false);
      // Supabase throws plain PostgrestError objects, not Error instances.
      const reason =
        e instanceof Error ? e.message : e && typeof e === 'object' && 'message' in e ? String((e as any).message) : undefined;
      Alert.alert('Could not save crop plan', reason || 'Please check your connection and try again.');
    }
  }, [farm, user?.id, submitting, draft, saveCropCycle, farmId, navigation]);

  if (!farm) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Review Crop Plan" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Review Crop Plan" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>{draft.cropName}</Text>
        <View style={[styles.card, shadow.card]}>
          <Row label="Crop" value={draft.cropName} />
          <Row label="Variety" value={draft.variety || 'Not specified'} />
          <Row label="Area" value={`${draft.areaToCultivate} Acres`} />
          <Row label="Planting Date" value={draft.plannedPlantingDateLabel} />
          <Row label="Expected Harvest" value={draft.expectedHarvestDateLabel} />
          <Row label="Irrigation Method" value={draft.irrigationMethod} />
          <Row label="Notes" value={draft.farmerNotes || '—'} />
        </View>

        <Text style={styles.disclaimer}>
          This creates the crop plan for {farm.title}. You can log activities (including the actual sowing date)
          from the Crop Plan tab once you're ready.
        </Text>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setConfirmed((v) => !v)} activeOpacity={0.7}>
          <View style={styles.checkbox}>
            {confirmed && <Ionicons name="checkmark" size={18} color={colors.primary} />}
          </View>
          <Text style={styles.checkboxText}>I confirm this crop plan is accurate.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmBtn, (!confirmed || submitting) && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!confirmed || submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>{submitting ? 'Saving…' : 'Confirm Crop Plan'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  heading: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 13, color: colors.textSecondary, flexShrink: 0 },
  rowValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, flex: 1, textAlign: 'right' },
  disclaimer: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginTop: spacing.xl },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: { flex: 1, fontSize: 13, color: colors.textPrimary },
  confirmBtn: {
    backgroundColor: '#4ADE80',
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    ...shadow.card,
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
});
