import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// @ts-ignore - react-native-vector-icons types may not be available
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, radius, spacing } from '../theme/tokens';
import { FarmerHomeStackParamList } from '../navigation/FarmerHomeStack';
import { useLeases } from '../context/LeaseContext';
import { useFarmListings } from '../context/FarmListingsContext';
import { useAuth } from '../context/AuthContext';
import { profilesApi, FarmerProfile } from '../services/profilesApi';
import { ScreenHeader } from '../components/molecules/ScreenHeader';

type Props = NativeStackScreenProps<FarmerHomeStackParamList, 'AgreementDetails'>;

function toInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Opens the dialer for a stored phone number (+91), same convention as TenantsScreen. */
function callNumber(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-10);
  Linking.openURL(`tel:+91${digits}`).catch(() => Alert.alert('Call', 'Unable to open the dialer.'));
}

export default function AgreementDetailsScreen({ navigation, route }: Props) {
  const { agreementId } = route.params;
  const { user } = useAuth();
  const { agreements, getAgreementById, activeLeases } = useLeases();
  const { getListingById } = useFarmListings();
  const activeLease = activeLeases.find((l) => l.id === agreementId);
  // `agreementId` is sometimes actually an ActiveLease id (LeaseAgreementsScreen's
  // "View Details" for a Leased card passes the lease row's own id, not the
  // originating lease_agreements row's id — they're separate DB rows/UUIDs).
  // When that direct lookup misses, recover the real Agreement via the
  // offerId + farmerId both rows carry, so signature data still resolves.
  const agreement =
    getAgreementById(agreementId) ||
    (activeLease
      ? agreements.find((a) => a.offerId === activeLease.offerId && a.farmerId === activeLease.farmerId)
      : undefined);
  const record = agreement || activeLease;
  // Only the tenant pays rent — the land owner reviews the schedule, they don't pay.
  const isFarmer = !!record && user?.id === record.farmerId;

  const [profilesById, setProfilesById] = useState<Record<string, FarmerProfile>>({});
  useEffect(() => {
    if (!record) return;
    profilesApi.fetchFarmersByIds([record.farmerId, record.ownerId]).then((rows) => {
      setProfilesById(Object.fromEntries(rows.map((r) => [r.id, r])));
    });
  }, [record?.farmerId, record?.ownerId]);

  if (!record) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader
          title="Agreement Details"
          onBack={() => navigation.goBack()}
          buttonBackgroundColor="transparent"
          titleWeight="700"
          showBorder={false}
        />
        <Text style={{ paddingHorizontal: spacing.xl, color: colors.textSecondary }}>
          Agreement not found.
        </Text>
      </SafeAreaView>
    );
  }

  const tenure = 'tenure' in record ? record.tenure : undefined;
  const land = getListingById(record.landId);
  const ownerProfile = profilesById[record.ownerId];
  const farmerProfile = profilesById[record.farmerId];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, !isFarmer && styles.scrollContentNoFooter]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Agreement Details"
          onBack={() => navigation.goBack()}
          buttonBackgroundColor="transparent"
          titleWeight="700"
          showBorder={false}
        />

        {/* Status Badge and Agreement Title */}
        <View style={styles.statusSection}>
          <View style={styles.statusBadge}>
            <Icon name="check-circle" size={14} color={colors.surface} />
            <Text style={styles.statusText}>STATUS: {record.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.agreementTitle}>
            Lease Agreement for {record.landTitle}
          </Text>
          <Text style={styles.agreementId}>#{record.id}</Text>
        </View>

        {/* Land Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="landscape" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Land Details</Text>
          </View>

          {/* Map Container */}
          <View style={styles.mapContainer}>
            <Image
              source={land?.imageUrl ? { uri: land.imageUrl } : require('../assets/images/landscape.jpg')}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.satelliteButton}>
              <Text style={styles.satelliteButtonText}>Satellite View</Text>
            </TouchableOpacity>
          </View>

          {/* Land Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Plot Name</Text>
              <Text style={styles.infoValue}>{record.landTitle}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Survey No.</Text>
              <Text style={styles.infoValue}>{land?.surveyNumber || '—'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total Area</Text>
              <Text style={styles.infoValue}>{land ? land.acresLabel || `${land.acres} Acres` : '—'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{land ? `${land.location}, ${land.district}, ${land.state}` : '—'}</Text>
            </View>
          </View>
        </View>

        {/* Lease Terms Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="description" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Lease Terms</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Rent Terms</Text>
              <Text style={styles.infoValue}>{record.termsSummary}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{tenure || '—'}</Text>
              {!!record.startDate && (
                <Text style={styles.termSubtext}>Since {record.startDate}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Parties Involved Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="people" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Parties Involved</Text>
          </View>

          <View style={styles.partyRow}>
            <View style={styles.partyLeft}>
              <View style={[styles.avatar, styles.avatarOrange]}>
                <Text style={styles.avatarText}>{toInitials(record.ownerName)}</Text>
              </View>
              <View style={styles.partyInfo}>
                <View style={styles.partyNameRow}>
                  <Text style={styles.partyName}>{record.ownerName}</Text>
                  <Icon name="check-circle" size={16} color={colors.success} />
                </View>
                <Text style={styles.partyRole}>Lessor (Owner)</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.phoneButton}
              disabled={!ownerProfile?.phone}
              onPress={() => ownerProfile?.phone && callNumber(ownerProfile.phone)}
            >
              <Icon name="phone" size={20} color={ownerProfile?.phone ? colors.primary : colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.partyRow}>
            <View style={styles.partyLeft}>
              <View style={[styles.avatar, styles.avatarBlue]}>
                <Text style={styles.avatarText}>{toInitials(record.farmerName)}</Text>
              </View>
              <View style={styles.partyInfo}>
                <View style={styles.partyNameRow}>
                  <Text style={styles.partyName}>{record.farmerName}</Text>
                  <Icon name="check-circle" size={16} color={colors.success} />
                </View>
                <Text style={styles.partyRole}>Lessee (Tenant)</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.phoneButton}
              disabled={!farmerProfile?.phone}
              onPress={() => farmerProfile?.phone && callNumber(farmerProfile.phone)}
            >
              <Icon name="phone" size={20} color={farmerProfile?.phone ? colors.primary : colors.textMuted} />
            </TouchableOpacity>
          </View>

          {!!agreement?.farmerSignatureUrl && (
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>Farmer's signature</Text>
              <Image
                source={{ uri: agreement.farmerSignatureUrl }}
                style={styles.signatureImg}
                resizeMode="contain"
              />
              {!!agreement.farmerSignedAt && (
                <Text style={styles.signatureDate}>
                  Signed{' '}
                  {new Date(agreement.farmerSignedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Payment Schedule Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="today" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Payment Schedule</Text>
          </View>
          <Text style={styles.comingSoon}>Coming soon</Text>
        </View>

        {/* Documents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <View style={styles.documentsRow}>
            <TouchableOpacity style={styles.documentButton}>
              <Icon name="description" size={20} color={colors.primary} />
              <Text style={styles.documentButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.documentButton}>
              <Icon name="share" size={20} color={colors.primary} />
              <Text style={styles.documentButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.documentButton}>
              <Icon name="print" size={20} color={colors.primary} />
              <Text style={styles.documentButtonText}>Print</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        {/* <View style={styles.bottomSpacing} /> */}
      </ScrollView>

      {/* Make Payment — tenant only. The owner reviews the Payment Schedule above instead;
          with nothing left to show them, the footer bar itself is skipped, not just its
          buttons, so scrolling doesn't leave a reserved blank gap where it would've been. */}
      {isFarmer && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.paymentButton} activeOpacity={0.8}>
            <Icon name="camera-alt" size={20} color={colors.surface} />
            <Text style={styles.paymentButtonText}>Make Payment</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  scrollContentNoFooter: {
    paddingBottom: spacing.xxl,
  },
  statusSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  statusText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  agreementTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  agreementId: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  mapContainer: {
    position: 'relative',
    height: 200,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.border,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  satelliteButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  satelliteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoItem: {
    width: '47%',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  termSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  comingSoon: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  partyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOrange: {
    backgroundColor: '#FF9500',
  },
  avatarBlue: {
    backgroundColor: '#007AFF',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface,
  },
  partyInfo: {
    flex: 1,
  },
  partyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  partyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  partyRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  phoneButton: {
    padding: spacing.sm,
  },
  signatureBlock: {
    marginTop: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
  },
  signatureLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  signatureImg: {
    width: '100%',
    height: 60,
  },
  signatureDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  documentsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  documentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
});

