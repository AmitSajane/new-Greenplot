import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { formatDateLabel } from '../../utils';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { EmptyState } from '../../components/molecules/EmptyState';
import { useFarmListings } from '../../context/FarmListingsContext';
import { useAuth } from '../../context/AuthContext';
import {
  managementRequestsApi,
  MANAGEMENT_REQUEST_STATUS_LABEL,
  type ManagementRequest,
} from '../../services/managementRequestsApi';
import { MANAGEMENT_REQUEST_STATUS_META } from './managementRequestStatusMeta';
import type { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'MyManagementRequests'>;

export default function MyManagementRequestsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { getListingById } = useFarmListings();
  const [requests, setRequests] = useState<ManagementRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) {
      setRequests([]);
      setLoading(false);
      return;
    }
    try {
      setRequests(await managementRequestsApi.fetchMine(user.id));
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Refresh whenever this screen regains focus (e.g. coming back from
  // withdrawing a request on the details screen).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="My Management Requests" onBack={() => navigation.goBack()} />
      {!loading && requests.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No management requests yet"
          subtitle="Requests you send to AgriArambh will show up here."
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const farm = getListingById(item.landId);
            const meta = MANAGEMENT_REQUEST_STATUS_META[item.status];
            return (
              <TouchableOpacity
                style={[styles.card, shadow.card]}
                onPress={() => navigation.navigate('ManagementRequestDetails', { requestId: item.id })}
                activeOpacity={0.85}
              >
                <Text style={styles.farmName}>{farm?.title || 'Farm'}</Text>
                {!!farm && (
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                    <Text style={styles.metaText}>{farm.location}, {farm.district}</Text>
                  </View>
                )}
                {!!farm && (
                  <View style={styles.metaRow}>
                    <Ionicons name="resize-outline" size={13} color={colors.textMuted} />
                    <Text style={styles.metaText}>{farm.acresLabel || `${farm.acres} Acres`}</Text>
                  </View>
                )}
                <View style={styles.metaRow}>
                  <Ionicons name="leaf-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.metaText}>Preferred Crop: {item.preferredCrop || 'Not decided yet'}</Text>
                </View>
                <View style={styles.footerRow}>
                  <Text style={styles.dateText}>Requested: {formatDateLabel(new Date(item.createdAt))}</Text>
                  <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
                    <Text style={[styles.statusText, { color: meta.color }]}>
                      {MANAGEMENT_REQUEST_STATUS_LABEL[item.status]}
                    </Text>
                  </View>
                </View>
                {item.status === 'APPROVED' &&
                  !!user?.id &&
                  farm?.assignedFarmerId === user.id &&
                  (farm?.managementStatus === 'FARMER_ASSIGNED' || farm?.managementStatus === 'ACTIVE_MANAGEMENT') && (
                    <TouchableOpacity
                      style={styles.openFarmBtn}
                      onPress={() => navigation.navigate('ManagedFarmDashboard', { farmId: item.landId })}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="leaf" size={14} color={colors.surface} />
                      <Text style={styles.openFarmBtnText}>Open Managed Farm</Text>
                    </TouchableOpacity>
                  )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
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
  dateText: { fontSize: 11, color: colors.textMuted },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  openFarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: '#1A6B3A',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  openFarmBtnText: { fontSize: 12, fontWeight: '700', color: colors.surface },
});
