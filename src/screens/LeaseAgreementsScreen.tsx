import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// @ts-ignore - react-native-vector-icons types may not be available
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, radius, spacing } from '../theme/tokens';
import { FarmerHomeStackParamList } from '../navigation/FarmerHomeStack';
import { ScreenHeader } from '../components/molecules/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { useLeases } from '../context/LeaseContext';
import { useFarmListings } from '../context/FarmListingsContext';

type Props = NativeStackScreenProps<FarmerHomeStackParamList, 'LeaseAgreements'>;

// Matches MyPropertiesScreen's real status vocabulary ("Leased" for a signed,
// ongoing lease) plus the two pre-lease stages this screen also covers.
type FilterType = 'All Agreements' | 'Leased' | 'Pending Signature' | 'Pending Requests';

interface LeaseAgreementItem {
  id: string;
  landId: string;
  landTitle: string;
  /** "Tenant: X" if I'm the owner here, "Owner: X" if I'm the farmer here. */
  otherPartyLabel: string;
  status: 'Leased' | 'Pending Signature' | 'Pending Request';
  startDate?: string;
  tenure?: string;
  requestedOn?: string;
}

export default function LeaseAgreementsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { activeLeases, agreements, requests } = useLeases();
  const { getListingById } = useFarmListings();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All Agreements');

  const filters: FilterType[] = ['All Agreements', 'Leased', 'Pending Signature', 'Pending Requests'];

  // Real leases/agreements/requests involving the current user, either as
  // owner or farmer — same "either party can see it" rule the RLS policies
  // already use. Three real pipeline stages: a farmer applies (LeaseRequest,
  // 'pending') → owner approves (Agreement, 'awaiting' until both sign) →
  // both sign (ActiveLease, and the land's own status flips to 'leased').
  const items: LeaseAgreementItem[] = useMemo(() => {
    const isMine = (p: { farmerId: string; ownerId: string }) =>
      p.farmerId === user?.id || p.ownerId === user?.id;
    const otherPartyLabel = (p: { farmerId: string; farmerName: string; ownerId: string; ownerName: string }) =>
      p.farmerId === user?.id ? `Owner: ${p.ownerName}` : `Tenant: ${p.farmerName}`;

    const leased: LeaseAgreementItem[] = activeLeases
      .filter(isMine)
      .map((l) => ({
        id: l.id,
        landId: l.landId,
        landTitle: l.landTitle,
        otherPartyLabel: otherPartyLabel(l),
        status: 'Leased',
        startDate: l.startDate,
      }));

    const pendingSignature: LeaseAgreementItem[] = agreements
      .filter((a) => a.status === 'awaiting' && isMine(a))
      .map((a) => ({
        id: a.id,
        landId: a.landId,
        landTitle: a.landTitle,
        otherPartyLabel: otherPartyLabel(a),
        status: 'Pending Signature',
        tenure: a.tenure,
      }));

    const pendingRequests: LeaseAgreementItem[] = requests
      .filter((r) => r.status === 'pending' && isMine(r))
      .map((r) => ({
        id: r.id,
        landId: r.landId,
        landTitle: r.landTitle,
        otherPartyLabel: otherPartyLabel(r),
        status: 'Pending Request',
        requestedOn: r.createdAt,
      }));

    return [...leased, ...pendingSignature, ...pendingRequests];
  }, [activeLeases, agreements, requests, user?.id]);

  const getFilteredAgreements = () => {
    if (selectedFilter === 'Leased') return items.filter((item) => item.status === 'Leased');
    if (selectedFilter === 'Pending Signature') return items.filter((item) => item.status === 'Pending Signature');
    if (selectedFilter === 'Pending Requests') return items.filter((item) => item.status === 'Pending Request');
    return items;
  };

  const getStatusConfig = (status: LeaseAgreementItem['status']) => {
    if (status === 'Leased') {
      return { label: 'LEASED', bgColor: colors.success, textColor: colors.surface };
    }
    if (status === 'Pending Signature') {
      return { label: 'PENDING SIG', bgColor: colors.softOrange, textColor: colors.warning };
    }
    return { label: 'NEW REQUEST', bgColor: colors.softBlue, textColor: colors.info };
  };

  const renderItem = ({ item }: { item: LeaseAgreementItem }) => {
    const statusConfig = getStatusConfig(item.status);
    const imageUrl = getListingById(item.landId)?.imageUrl;

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {/* Image Thumbnail */}
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderImage}>
                <Icon name="landscape" size={32} color={colors.textMuted} />
              </View>
            )}
          </View>

          {/* Card Info */}
          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.landParcel} numberOfLines={1}>
                {item.landTitle}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="person" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{item.otherPartyLabel}</Text>
            </View>

            {item.status === 'Leased' && item.startDate && (
              <View style={styles.infoRow}>
                <Icon name="event" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>Since {item.startDate}</Text>
              </View>
            )}
            {item.status === 'Pending Signature' && (
              <View style={styles.infoRow}>
                <Icon name="event" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>{item.tenure || '—'}</Text>
              </View>
            )}
            {item.status === 'Pending Request' && item.requestedOn && (
              <View style={styles.infoRow}>
                <Icon name="event" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>Requested {item.requestedOn}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionsRow}>
          {item.status === 'Leased' && (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('AgreementDetails', { agreementId: item.id })}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>View Details</Text>
              </TouchableOpacity>
              {/* Renew is hidden for now — not ready yet. */}
              <TouchableOpacity style={styles.terminateButton} onPress={() => {}} activeOpacity={0.8}>
                <Text style={styles.terminateButtonText}>Terminate</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'Pending Signature' && (
            <>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('AgreementDetails', { agreementId: item.id })}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>View Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.warningButton} onPress={() => {}} activeOpacity={0.8}>
                <Text style={styles.warningButtonText}>Remind</Text>
                <Icon name="arrow-forward" size={16} color={colors.surface} style={styles.buttonIcon} />
              </TouchableOpacity>
            </>
          )}
          {item.status === 'Pending Request' && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => (navigation as any).navigate('LeaseRequests')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Review Request</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Lease Agreements"
        onBack={() => navigation.goBack()}
        buttonBackgroundColor="transparent"
        titleSize={24}
        titleWeight="700"
        showBorder={false}
      />

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, selectedFilter === filter && styles.filterTabActive]}
            onPress={() => setSelectedFilter(filter)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, selectedFilter === filter && styles.filterTabTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Agreements List */}
      <FlatList
        data={getFilteredAgreements()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="description" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              {selectedFilter === 'All Agreements' ? 'No lease agreements yet.' : `No ${selectedFilter.toLowerCase()} agreements.`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // ScrollView always sets flexGrow:1 on itself internally (even when
  // horizontal), so left unchecked this pill row competes with the FlatList
  // below for vertical space and balloons to fill it on short lists —
  // pinning it to its content height instead.
  filterScrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    height: 40,
    paddingVertical: 0,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  filterTabTextActive: {
    color: colors.surface,
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing.lg,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  landParcel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  warningButton: {
    backgroundColor: colors.warning,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  warningButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  terminateButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  terminateButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: spacing.xs,
  },
});
