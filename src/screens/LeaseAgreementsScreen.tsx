import React, { useState } from 'react';
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

type Props = NativeStackScreenProps<FarmerHomeStackParamList, 'LeaseAgreements'>;

type FilterType = 'All Agreements' | 'Active' | 'Pending' | 'Expired';

interface LeaseAgreement {
  id: string;
  landParcel: string;
  tenant: string;
  duration?: string;
  endDate?: string;
  status: 'Active' | 'Pending Signature' | 'Expired';
  nextPaymentAmount?: string;
  nextPaymentDue?: string;
  imageUrl: string;
}

const LEASE_AGREEMENTS: LeaseAgreement[] = [
  {
    id: '1',
    landParcel: '5 Acres in Ramgarh',
    tenant: 'Rajesh Kumar',
    duration: '1 Year (Ends Dec \'24)',
    status: 'Active',
    nextPaymentAmount: '₹15,000',
    nextPaymentDue: '15 Aug',
    imageUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    landParcel: '12 Acres in Sitapur',
    tenant: 'Suresh Patel',
    duration: '3 Years',
    status: 'Pending Signature',
    imageUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    landParcel: '2 Acres in Bilaspur',
    tenant: 'Anita Devi',
    endDate: '10 Jan 2024',
    status: 'Expired',
    imageUrl: '',
  },
  {
    id: '4',
    landParcel: '5 Acres in Ramgarh',
    tenant: 'Rajesh Kumar',
    duration: '1 Year (Ends Dec \'24)',
    status: 'Active',
    nextPaymentAmount: '₹15,000',
    nextPaymentDue: '15 Aug',
    imageUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
  },
];

export default function LeaseAgreementsScreen({ navigation }: Props) {
  const [selectedFilter, setSelectedFilter] =
    useState<FilterType>('All Agreements');

  const filters: FilterType[] = [
    'All Agreements',
    'Active',
    'Pending',
    'Expired',
  ];

  const getFilteredAgreements = () => {
    if (selectedFilter === 'All Agreements') {
      return LEASE_AGREEMENTS;
    }
    if (selectedFilter === 'Active') {
      return LEASE_AGREEMENTS.filter((item) => item.status === 'Active');
    }
    if (selectedFilter === 'Pending') {
      return LEASE_AGREEMENTS.filter(
        (item) => item.status === 'Pending Signature',
      );
    }
    if (selectedFilter === 'Expired') {
      return LEASE_AGREEMENTS.filter((item) => item.status === 'Expired');
    }
    return LEASE_AGREEMENTS;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Active':
        return {
          label: 'ACTIVE',
          bgColor: colors.success,
          textColor: colors.surface,
        };
      case 'Pending Signature':
        return {
          label: 'PENDING SIG',
          bgColor: colors.softOrange,
          textColor: colors.warning,
        };
      case 'Expired':
        return {
          label: 'EXPIRED',
          bgColor: '#F3F4F6',
          textColor: colors.textSecondary,
        };
      default:
        return {
          label: status.toUpperCase(),
          bgColor: colors.border,
          textColor: colors.textSecondary,
        };
    }
  };

  const renderItem = ({ item }: { item: LeaseAgreement }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {/* Image Thumbnail */}
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
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
                {item.landParcel}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusConfig.bgColor,
                  },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: statusConfig.textColor }]}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            {/* Tenant Info */}
            <View style={styles.infoRow}>
              <Icon name="person" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>Tenant: {item.tenant}</Text>
            </View>

            {/* Duration/End Date */}
            {item.status === 'Expired' ? (
              <View style={styles.infoRow}>
                <Icon
                  name="event-busy"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.infoText}>Ended: {item.endDate}</Text>
              </View>
            ) : (
              <View style={styles.infoRow}>
                <Icon name="event" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>{item.duration}</Text>
              </View>
            )}

           
           
         
          </View>

        </View>
         {/* Next Payment (for Active agreements) */}
         {item.status === 'Active' && item.nextPaymentAmount && (
              <>
                <View style={styles.divider} />
                <View style={styles.paymentRow}>
                  <Icon
                    name="attach-money"
                    size={20}
                    color={colors.warning}
                    style={styles.paymentIcon}
                  />
                  <Text style={styles.paymentText}>
                    Next Payment:{' '}
                    <Text style={styles.paymentAmount}>
                      {item.nextPaymentAmount}
                    </Text>{' '}
                    due{' '}
                    <Text style={styles.paymentDue}>{item.nextPaymentDue}</Text>
                  </Text>
                </View>
              </>
            )}

        <View style={styles.actionsRow}>
              {item.status === 'Active' && (
                <>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('AgreementDetails', { agreementId: item.id })}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {}}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryButtonText}>Renew</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.terminateButton}
                    onPress={() => {}}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.terminateButtonText}>Terminate</Text>
                  </TouchableOpacity>
                </>
              )}
              {item.status === 'Pending Signature' && (
                <>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {}}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryButtonText}>View Draft</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.warningButton}
                    onPress={() => {}}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.warningButtonText}>Remind</Text>
                    <Icon
                      name="arrow-forward"
                      size={16}
                      color={colors.surface}
                      style={styles.buttonIcon}
                    />
                  </TouchableOpacity>
                </>
              )}
              {item.status === 'Expired' && (
                <>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('AgreementDetails', { agreementId: item.id })}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {}}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name="archive"
                      size={16}
                      color={colors.textPrimary}
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.secondaryButtonText}>Archive</Text>
                  </TouchableOpacity>
                </>
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
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === filter && styles.filterTabTextActive,
              ]}
            >
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
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {}}
        activeOpacity={0.8}
      >
        <Icon name="add" size={24} color={colors.surface} />
        <Text style={styles.fabText}>New Agreement</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
    paddingBottom: spacing.xxl + 100, // Extra space for FAB
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
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal:spacing.md
  },
  paymentIcon: {
    marginRight: spacing.xs,
  },
  paymentText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  paymentAmount: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  paymentDue: {
    color: colors.warning,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    // paddingVertical: spacing.sm,
    // paddingHorizontal: spacing.md,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    justifyContent:'center',
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
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    backgroundColor: colors.warning,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});