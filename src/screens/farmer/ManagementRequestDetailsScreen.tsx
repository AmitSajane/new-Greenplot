import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { formatDateLabel } from '../../utils';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { useFarmListings } from '../../context/FarmListingsContext';
import { useAuth } from '../../context/AuthContext';
import {
  managementRequestsApi,
  MANAGEMENT_REQUEST_STATUS_LABEL,
  type ManagementRequest,
} from '../../services/managementRequestsApi';
import { MANAGEMENT_REQUEST_STATUS_META } from './managementRequestStatusMeta';
import type { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'ManagementRequestDetails'>;
type Route = RouteProp<FarmerHomeStackParamList, 'ManagementRequestDetails'>;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ManagementRequestDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const { requestId } = route.params;
  const { getListingById } = useFarmListings();
  const { user } = useAuth();
  const [request, setRequest] = useState<ManagementRequest | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRequest(await managementRequestsApi.fetchById(requestId));
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleWithdraw = useCallback(() => {
    Alert.alert('Withdraw this management request?', 'Are you sure you want to withdraw this management request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          setWithdrawing(true);
          try {
            await managementRequestsApi.withdrawRequest(requestId);
            await load();
          } catch (e) {
            const reason = e instanceof Error ? e.message : undefined;
            Alert.alert('Could not withdraw request', reason || 'Please try again.');
          } finally {
            setWithdrawing(false);
          }
        },
      },
    ]);
  }, [requestId, load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Request Details" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Request Details" onBack={() => navigation.goBack()} />
        <View style={styles.centerFill}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={styles.missingText}>Request not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const farm = getListingById(request.landId);
  const meta = MANAGEMENT_REQUEST_STATUS_META[request.status];
  const canWithdraw = request.status === 'PENDING_REVIEW' || request.status === 'UNDER_REVIEW';

  // Approved isn't just a status label — it's only really "assigned" once
  // Admin has also set this farmer as the farm's assignedFarmerId. Mirrors
  // FarmDetailScreen's `isAssignedToMe` check.
  const isAssignedToMe =
    request.status === 'APPROVED' &&
    !!user?.id &&
    farm?.assignedFarmerId === user.id &&
    (farm?.managementStatus === 'FARMER_ASSIGNED' || farm?.managementStatus === 'ACTIVE_MANAGEMENT');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Request Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.statusBanner, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
          <Text style={[styles.statusBannerText, { color: meta.color }]}>
            {MANAGEMENT_REQUEST_STATUS_LABEL[request.status]}
          </Text>
        </View>
        {(request.status === 'PENDING_REVIEW' || request.status === 'UNDER_REVIEW') && (
          <Text style={styles.reviewNote}>Your request is being reviewed by AgriArambh.</Text>
        )}
        {isAssignedToMe && (
          <>
            <Text style={styles.reviewNote}>
              Your request to manage this farm has been approved. You are now assigned to manage this farm.
            </Text>
            <TouchableOpacity
              style={styles.openFarmBtn}
              onPress={() => navigation.navigate('ManagedFarmDashboard', { farmId: request.landId })}
              activeOpacity={0.85}
            >
              <Ionicons name="leaf" size={18} color={colors.surface} />
              <Text style={styles.openFarmBtnText}>Open Managed Farm</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.sectionTitle}>Farm Information</Text>
        <View style={[styles.card, shadow.card]}>
          <Row label="Farm" value={farm?.title || '—'} />
          <Row label="Location" value={farm ? `${farm.location}, ${farm.district}` : '—'} />
          <Row label="Area" value={farm ? farm.acresLabel || `${farm.acres} Acres` : '—'} />
        </View>

        <Text style={styles.sectionTitle}>Request Information</Text>
        <View style={[styles.card, shadow.card]}>
          <Row label="Preferred Crop" value={request.preferredCrop || 'Not decided yet'} />
          <Row label="Experience" value={request.farmingExperience || '—'} />
          <Row
            label="Start Date"
            value={request.preferredStartDate ? formatDateLabel(new Date(request.preferredStartDate)) : '—'}
          />
          <Row label="Expected Duration" value={request.expectedDuration || '—'} />
          <Row label="Notes" value={request.farmerNotes || '—'} />
          <Row label="Submitted" value={formatDateLabel(new Date(request.createdAt))} />
          <Row label="Last Updated" value={formatDateLabel(new Date(request.updatedAt))} />
        </View>

        {canWithdraw && (
          <TouchableOpacity
            style={[styles.withdrawBtn, withdrawing && styles.withdrawBtnDisabled]}
            onPress={handleWithdraw}
            disabled={withdrawing}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-undo-outline" size={18} color={colors.danger} />
            <Text style={styles.withdrawBtnText}>{withdrawing ? 'Withdrawing…' : 'Withdraw Request'}</Text>
          </TouchableOpacity>
        )}
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
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  statusBannerText: { fontSize: 14, fontWeight: '700' },
  reviewNote: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.lg },
  openFarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#1A6B3A',
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  openFarmBtnText: { fontSize: 15, fontWeight: '700', color: colors.surface },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
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
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
  },
  withdrawBtnDisabled: { opacity: 0.6 },
  withdrawBtnText: { fontSize: 15, fontWeight: '700', color: colors.danger },
});
