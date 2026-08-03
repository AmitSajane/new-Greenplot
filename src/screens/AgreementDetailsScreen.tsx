import React from 'react';
import {
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

export default function AgreementDetailsScreen({ navigation, route }: Props) {
  const { agreementId } = route.params;
  const { getAgreementById, activeLeases } = useLeases();
  const agreement = getAgreementById(agreementId);
  const activeLease = activeLeases.find((l) => l.id === agreementId);
  const record = agreement || activeLease;

  if (!record) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agreement Details</Text>
        </View>
        <Text style={{ paddingHorizontal: spacing.xl, color: colors.textSecondary }}>
          Agreement not found.
        </Text>
      </SafeAreaView>
    );
  }

  const tenure = 'tenure' in record ? record.tenure : undefined;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agreement Details</Text>
        </View>

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
              source={require('../assets/images/landscape.jpg')}
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
              <Text style={styles.infoValue}>42/1 - B</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total Area</Text>
              <Text style={styles.infoValue}>2.5 Acres</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>Ramgarh, Pune</Text>
            </View>
          </View>
        </View>

        {/* Lease Terms Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="description" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Lease Terms</Text>
          </View>

          <View style={styles.termRow}>
            <View style={styles.termLeft}>
              <Icon name="attach-money" size={20} color={colors.primary} />
              <Text style={styles.termLabel}>Monthly Rent</Text>
            </View>
            <View style={styles.termRight}>
              <Text style={styles.termValue}>{record.termsSummary}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Pre-paid</Text>
              </View>
            </View>
          </View>

          <View style={styles.termRow}>
            <View style={styles.termLeft}>
              <Icon name="event" size={20} color={colors.textSecondary} />
              <Text style={styles.termLabel}>Duration</Text>
            </View>
            <Text style={styles.termValue}>{tenure || '—'}</Text>
          </View>
          <Text style={styles.termSubtext}>{record.startDate ? `Since ${record.startDate}` : ''}</Text>

          <View style={styles.termRow}>
            <View style={styles.termLeft}>
              <Icon name="schedule" size={20} color={colors.textSecondary} />
              <Text style={styles.termLabel}>Payment Freq.</Text>
            </View>
            <Text style={styles.termValue}>Monthly</Text>
          </View>
          <Text style={styles.termSubtext}>Due on 5th</Text>

          <View style={styles.termRow}>
            <View style={styles.termLeft}>
              <Icon name="security" size={20} color={colors.textSecondary} />
              <Text style={styles.termLabel}>Security Deposit</Text>
            </View>
            <View style={styles.termRight}>
              <Text style={styles.termValue}>₹50,000</Text>
              <View style={[styles.badge, styles.badgeSuccess]}>
                <Text style={[styles.badgeText, styles.badgeTextSuccess]}>
                  Paid
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.termRow}>
            <View style={styles.termLeft}>
              <Icon name="opacity" size={20} color={colors.textSecondary} />
              <Text style={styles.termLabel}>Water Rights</Text>
            </View>
            <Text style={styles.termValue}>Full Access</Text>
          </View>
          <Text style={styles.termSubtext}>Source: Canal Source</Text>
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
            <TouchableOpacity style={styles.phoneButton}>
              <Icon name="phone" size={20} color={colors.primary} />
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
            <TouchableOpacity style={styles.phoneButton}>
              <Icon name="phone" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Schedule Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="today" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Payment Schedule</Text>
          </View>

          <View style={styles.paymentScheduleRow}>
            <View>
              <Text style={styles.paymentLabel}>Next Due Date</Text>
              <Text style={styles.paymentDate}>05 Nov 2023</Text>
            </View>
            <View style={styles.paymentAmountContainer}>
              <Text style={styles.paymentAmount}>₹15,000</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewScheduleLink}>
            <Text style={styles.viewScheduleText}>
              View Full Schedule & History →
            </Text>
          </TouchableOpacity>
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

      {/* Make Payment Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.paymentButton} activeOpacity={0.8}>
          <Icon name="camera-alt" size={20} color={colors.surface} />
          <Text style={styles.paymentButtonText}>Make Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton} activeOpacity={0.8}>
          <Icon name="more-vert" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
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
  termRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  termLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  termLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  termRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  termValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  termSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.xl + spacing.sm,
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  badgeSuccess: {
    backgroundColor: colors.softGreen,
  },
  badgeTextSuccess: {
    color: colors.success,
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
  paymentScheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  paymentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  paymentAmountContainer: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
  },
  viewScheduleLink: {
    marginTop: spacing.sm,
  },
  viewScheduleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
  moreButton: {
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

