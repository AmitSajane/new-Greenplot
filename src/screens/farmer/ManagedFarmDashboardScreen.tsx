import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { useFarmListings } from '../../context/FarmListingsContext';
import { FARM_MANAGEMENT_STAGE_LABEL, isFarmManagementStage } from '../../utils/farmManagementStatus';
import type { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'ManagedFarmDashboard'>;
type Route = RouteProp<FarmerHomeStackParamList, 'ManagedFarmDashboard'>;

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// Crop Guidance / Farm Activities aren't built yet (Step 5 only prepares
// navigation/placeholders for them) — a plain "coming soon" card, not a
// fabricated value, for anything those modules would eventually own.
function ComingSoonCard({ icon, title, note }: { icon: string; title: string; note: string }) {
  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.comingSoonHeader}>
        <Ionicons name={icon as any} size={20} color={colors.textMuted} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.comingSoonText}>{note}</Text>
    </View>
  );
}

export default function ManagedFarmDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const { farmId } = route.params;
  const { getListingById } = useFarmListings();
  const farm = getListingById(farmId);

  if (!farm) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Managed Farm" onBack={() => navigation.goBack()} />
        <View style={styles.centerFill}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={styles.missingText}>Farm not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stageLabel = isFarmManagementStage(farm.managementStatus)
    ? FARM_MANAGEMENT_STAGE_LABEL[farm.managementStatus]
    : 'Active Management';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title={farm.title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusBanner}>
          <Ionicons name="shield-checkmark" size={18} color={colors.success} />
          <Text style={styles.statusBannerText}>{stageLabel}</Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.locationText}>{farm.location}, {farm.district}, {farm.state}</Text>
        </View>

        <View style={[styles.card, shadow.card]}>
          <Text style={styles.cardTitle}>Farm Overview</Text>
          <InfoRow icon="resize-outline" label="Area" value={farm.acresLabel || `${farm.acres} Acres`} />
          <InfoRow icon="leaf-outline" label="Current Crop" value={farm.currentCrop || 'Not set yet'} />
          {!!farm.waterSource && <InfoRow icon="water-outline" label="Water Source" value={farm.waterSource} />}
        </View>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate('SatelliteMap', { farmId })}
          activeOpacity={0.8}
        >
          <Ionicons name="map" size={20} color={colors.surface} />
          <Text style={styles.mapButtonText}>View Farm Boundary on Map</Text>
        </TouchableOpacity>

        <ComingSoonCard
          icon="trending-up-outline"
          title="Crop Stage"
          note="Crop Guidance isn't set up for this farm yet — stage tracking will appear here once it starts."
        />
        <ComingSoonCard
          icon="water-outline"
          title="Soil Health & Water Status"
          note="Soil and irrigation monitoring for this farm will appear here soon."
        />
        <ComingSoonCard
          icon="cloud-outline"
          title="Weather"
          note="Local weather for this farm will appear here soon."
        />
        <ComingSoonCard
          icon="time-outline"
          title="Recent Activities"
          note="Farm activities you log will show up here once that module is available."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  missingText: { fontSize: 15, color: colors.textPrimary, textAlign: 'center' },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.softGreen,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statusBannerText: { fontSize: 14, fontWeight: '700', color: colors.success },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  locationText: { fontSize: 13, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  infoLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  mapButton: {
    backgroundColor: colors.map,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mapButtonText: { fontSize: 15, fontWeight: '700', color: colors.surface },
  comingSoonHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  comingSoonText: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', lineHeight: 18 },
});
