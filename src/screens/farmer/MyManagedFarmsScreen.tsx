import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { EmptyState } from '../../components/molecules/EmptyState';
import { useFarmListings, type FarmListing } from '../../context/FarmListingsContext';
import { useCropCycles } from '../../context/CropCycleContext';
import { useAuth } from '../../context/AuthContext';
import { FARM_MANAGEMENT_STAGE_LABEL, isFarmManagementStage } from '../../utils/farmManagementStatus';
import type { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';
import { formatArea } from '../../utils/geo';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'MyManagedFarms'>;

export default function MyManagedFarmsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { myManagedFarms } = useFarmListings();
  const { getCropCycleByLand } = useCropCycles();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="My Managed Farms" onBack={() => navigation.goBack()} />
      {myManagedFarms.length === 0 ? (
        <EmptyState
          icon="leaf-outline"
          title="No managed farms yet"
          subtitle="Farms AgriArambh assigns you to manage will show up here."
        />
      ) : (
        <FlatList
          data={myManagedFarms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ManagedFarmCard
              farm={item}
              currentCrop={(user?.id && getCropCycleByLand(item.id, user.id)?.cropName) || item.currentCrop}
              onPress={() => navigation.navigate('ManagedFarmDashboard', { farmId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function ManagedFarmCard({
  farm,
  currentCrop,
  onPress,
}: {
  farm: FarmListing;
  currentCrop?: string;
  onPress: () => void;
}) {
  const stageLabel = isFarmManagementStage(farm.managementStatus)
    ? FARM_MANAGEMENT_STAGE_LABEL[farm.managementStatus]
    : 'Farm Assigned';

  return (
    <TouchableOpacity style={[styles.card, shadow.card]} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.farmName}>{farm.title}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={13} color={colors.textMuted} />
        <Text style={styles.metaText}>{farm.location}, {farm.district}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="resize-outline" size={13} color={colors.textMuted} />
        <Text style={styles.metaText}>{formatArea(farm.acres)}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="leaf-outline" size={13} color={colors.textMuted} />
        <Text style={styles.metaText}>Current Crop: {currentCrop || 'Not set yet'}</Text>
      </View>
      <View style={styles.footerRow}>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{stageLabel}</Text>
        </View>
        <View style={styles.openRow}>
          <Text style={styles.openText}>Open Farm</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  farmName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.softGreen,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  statusText: { fontSize: 11, fontWeight: '700', color: colors.success },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  openText: { fontSize: 12, fontWeight: '700', color: colors.primary },
});
