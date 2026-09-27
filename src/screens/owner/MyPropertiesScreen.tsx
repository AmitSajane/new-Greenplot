import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, radius, spacing } from '../../theme/tokens';
import { MyPropertiesStackParamList } from '../../navigation/MyPropertiesStack';
import { useFarmListings, FarmListing } from '../../context/FarmListingsContext';
import { useLeases } from '../../context/LeaseContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/molecules/AppHeader';
import { LANGUAGE_SHORT_LABELS } from '../../localization/i18n';
import { LanguagePickerModal } from '../farmerHome/components/LanguagePickerModal';
import { Chip } from '../../components/atoms/Chip';
import { getManagementStatus, MANAGEMENT_STATUS_LABEL } from '../../utils/farmManagementStatus';

type NavigationProp = NativeStackNavigationProp<MyPropertiesStackParamList, 'MyPropertiesList'>;

type PropertyFilterKey = 'All' | 'Pending' | 'Verified' | 'Managed' | 'Completed';
const FILTER_KEYS: PropertyFilterKey[] = ['All', 'Pending', 'Verified', 'Managed', 'Completed'];

export default function MyPropertiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { ownerListings, deleteListing } = useFarmListings();
  const { activeLeases } = useLeases();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const languageShort = LANGUAGE_SHORT_LABELS[i18n.language] || 'EN';
  const [langOpen, setLangOpen] = useState(false);
  const [filter, setFilter] = useState<PropertyFilterKey>('All');

  // Filter listings for current owner (in real app, filter by user.id)
  const myListings = ownerListings.filter(
    (listing) => listing.ownerId === user?.id || listing.status === 'active'
  );

  // Land that has at least one closed lease — used to tell "never leased"
  // apart from "was leased, now vacant again" under the Completed filter,
  // since a closed lease resets the listing's own status back to 'active'.
  const closedLeaseLandIds = useMemo(
    () => new Set(activeLeases.filter((l) => l.status === 'closed').map((l) => l.landId)),
    [activeLeases],
  );

  const filteredListings = useMemo(
    () =>
      myListings.filter((p) => {
        switch (filter) {
          case 'Managed':
            return getManagementStatus(p) === 'managed';
          case 'Completed':
            return p.status !== 'leased' && closedLeaseLandIds.has(p.id);
          case 'Verified':
            // A completed (closed-lease) land is verified again too, so it
            // belongs here as well as under Completed — just without the
            // COMPLETED badge (added only for the Completed tab).
            return getManagementStatus(p) === 'verified';
          case 'Pending':
            return getManagementStatus(p) === 'pending_verification';
          default:
            return true;
        }
      }),
    [myListings, filter, closedLeaseLandIds],
  );

  const confirmDelete = (property: FarmListing) => {
    Alert.alert(
      `Delete "${property.title}"?`,
      'This will remove the listing permanently. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteListing(property.id) },
      ],
    );
  };

  const handleEditPress = (property: FarmListing) => {
    Alert.alert(property.title, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(property) },
      { text: 'Edit', onPress: () => navigation.navigate('AddFarm', { editListingId: property.id }) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <AppHeader
        data={{
          variant: 'default',
          title: 'My Lands',
          subtitle: `${filteredListings.length} lands`,
          // sshowBack: navigation.canGoBack(),
          languageShort,
          name: user?.name,
        }}
        handler={{
          // onBackPress: () => navigation.goBack(),
          onProfilePress: () => navigation.navigate('Settings'),
          onLanguagePress: () => setLangOpen(true),
          onNotificationPress: () => navigation.navigate('NotificationsCenter'),
        }}
      />

      <View style={styles.filtersRow}>
        {FILTER_KEYS.map((k) => (
          <Chip key={k} label={k} selected={filter === k} onPress={() => setFilter(k)} />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredListings.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="landscape" size={64} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>
              {myListings.length === 0 ? 'No Lands Added' : 'No lands match this filter'}
            </Text>
            <Text style={styles.emptyStateText}>
              {myListings.length === 0
                ? 'Start by adding your first land for Farm Management from the Home tab'
                : 'Try a different filter.'}
            </Text>
          </View>
        ) : (
          filteredListings.map((property) => {
          const managementStatus = getManagementStatus(property);
          return (
          <TouchableOpacity
            key={property.id}
            style={styles.propertyCard}
            onPress={() =>
              navigation.navigate('PropertyDetails', {
                propertyId: property.id,
                viewHistory: filter !== 'Verified' && closedLeaseLandIds.has(property.id),
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.propertyHeader}>
              <View style={styles.propertyInfo}>
                <Text style={styles.plotName}>{property.title}</Text>
                <Text style={styles.location}>
                  {property.location}, {property.district}, {property.state}
                </Text>
              </View>
              <View style={styles.badgeRow}>
                {filter !== 'Completed' && (
                  <View
                    style={[
                      styles.statusBadge,
                      managementStatus === 'managed'
                        ? styles.statusLeased
                        : managementStatus === 'verified'
                        ? styles.statusAvailable
                        : styles.statusInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        managementStatus === 'managed'
                          ? styles.statusTextLeased
                          : managementStatus === 'verified'
                          ? styles.statusTextAvailable
                          : styles.statusTextInactive,
                      ]}
                    >
                      {MANAGEMENT_STATUS_LABEL[managementStatus]}
                    </Text>
                  </View>
                )}
                {filter !== 'Verified' && property.status !== 'leased' && closedLeaseLandIds.has(property.id) && (
                  <View style={styles.completedPill}>
                    <Text style={styles.completedPillText}>COMPLETED</Text>
                  </View>
                )}
                {managementStatus !== 'managed' && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditPress(property)}
                    hitSlop={8}
                  >
                    <Icon name="edit" size={16} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.propertyDetails}>
              <View style={styles.detailRow}>
                <Icon name="straighten" size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>{property.acresLabel || `${property.acres} Acres`}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="grass" size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>Soil: {property.soilType}</Text>
              </View>
              {!!property.waterSource && (
                <View style={styles.detailRow}>
                  <Icon name="water-drop" size={18} color={colors.textSecondary} />
                  <Text style={styles.detailText}>Water: {property.waterSource}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Icon name="eco" size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>Current crop: {property.currentCrop || 'Not set'}</Text>
              </View>
            </View>
          </TouchableOpacity>
          );
        })
        )}
      </ScrollView>
      <LanguagePickerModal visible={langOpen} onClose={() => setLangOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  completedPill: {
    backgroundColor: colors.softBlue,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  completedPillText: {
    color: '#2D6CDF',
    fontWeight: '700',
    fontSize: 12,
  },
  propertyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  propertyInfo: {
    flex: 1,
  },
  plotName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  statusLeased: {
    backgroundColor: colors.softGreen,
  },
  statusAvailable: {
    backgroundColor: colors.softOrange,
  },
  statusInactive: {
    backgroundColor: colors.border,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextLeased: {
    color: colors.success,
  },
  statusTextAvailable: {
    color: colors.warning,
  },
  statusTextInactive: {
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  propertyDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  availableText: {
    color: colors.warning,
    fontWeight: '600',
  },
});
