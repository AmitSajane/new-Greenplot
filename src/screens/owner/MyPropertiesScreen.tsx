import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, radius, spacing } from '../../theme/tokens';
import { MyPropertiesStackParamList } from '../../navigation/MyPropertiesStack';
import { useFarmListings, FarmListing } from '../../context/FarmListingsContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/molecules/AppHeader';
import { LANGUAGE_SHORT_LABELS } from '../../localization/i18n';
import { LanguagePickerModal } from '../farmerHome/components/LanguagePickerModal';

type NavigationProp = NativeStackNavigationProp<MyPropertiesStackParamList, 'MyPropertiesList'>;

export default function MyPropertiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { ownerListings, deleteListing } = useFarmListings();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const languageShort = LANGUAGE_SHORT_LABELS[i18n.language] || 'EN';
  const [langOpen, setLangOpen] = useState(false);

  // Filter listings for current owner (in real app, filter by user.id)
  const myListings = ownerListings.filter(
    (listing) => listing.ownerId === user?.id || listing.status === 'active'
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
          title: 'My Properties',
          subtitle: `${myListings.length} active listings`,
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {myListings.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="landscape" size={64} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>No Properties Listed</Text>
            <Text style={styles.emptyStateText}>
              Start by adding your first farm listing from the Home tab
            </Text>
          </View>
        ) : (
          myListings.map((property) => (
          <TouchableOpacity
            key={property.id}
            style={styles.propertyCard}
            onPress={() => navigation.navigate('PropertyDetails', { propertyId: property.id })}
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
                <View
                  style={[
                    styles.statusBadge,
                    property.status === 'leased'
                      ? styles.statusLeased
                      : property.status === 'active'
                      ? styles.statusAvailable
                      : styles.statusInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      property.status === 'leased'
                        ? styles.statusTextLeased
                        : property.status === 'active'
                        ? styles.statusTextAvailable
                        : styles.statusTextInactive,
                    ]}
                  >
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </Text>
                </View>
                {property.status !== 'leased' && (
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
              <View style={styles.detailRow}>
                <Icon name="schedule" size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>Tenure: {property.tenure}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="attach-money" size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>{property.pricePerYear}/year</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
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
