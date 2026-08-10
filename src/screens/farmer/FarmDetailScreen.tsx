import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';
import { useFarmListings } from '../../context/FarmListingsContext';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { LeaseOptionsSection } from './components/LeaseOptionsSection';
import MediaCarousel from '../../components/MediaCarousel';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList>;
type RouteProp = {
  key: string;
  name: string;
  params: { farmId: string };
};

export default function FarmDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { farmId } = route.params;
  const { getListingById } = useFarmListings();

  const farm = getListingById(farmId);

  if (!farm) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.errorText}>Farm listing not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleContactOwner = () => {
    Alert.alert('Contact Owner', 'Are you sure you want to contact the owner?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Contact', onPress: () => {
        Linking.openURL(`tel:+919876543210`);
      } },
    ]);
    // In a real app, this would open contact options
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Farm Details" onBack={() => navigation.goBack()} buttonBackgroundColor="transparent" titleWeight="700" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photos / videos */}
        <MediaCarousel urls={farm.mediaUrls?.length ? farm.mediaUrls : [farm.imageUrl]} height={250} />

        {/* Title and Location */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{farm.title}</Text>
          {farm.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.verifiedText}>
                Ownership Verified{farm.verifiedOwnerName ? ` · ${farm.verifiedOwnerName}` : ''}
              </Text>
            </View>
          )}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={styles.location}>
              {farm.location}, {farm.district}, {farm.state}
            </Text>
          </View>
        </View>

        {/* Key Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={[styles.detailCard, shadow.card]}>
            <Ionicons name="resize-outline" size={24} color={colors.primary} />
            <Text style={styles.detailValue}>{farm.acresLabel || `${farm.acres} Acres`}</Text>
            <Text style={styles.detailLabel}>Area</Text>
          </View>
          <View style={[styles.detailCard, shadow.card]}>
            <Ionicons name="leaf-outline" size={24} color={colors.success} />
            <Text style={styles.detailValue}>{farm.soilType}</Text>
            <Text style={styles.detailLabel}>Soil Type</Text>
          </View>
          {farm.waterSource && (
            <View style={[styles.detailCard, shadow.card]}>
              <Ionicons name="water-outline" size={24} color={colors.skyBlue} />
              <Text style={styles.detailValue}>{farm.waterSource}</Text>
              <Text style={styles.detailLabel}>Water Source</Text>
            </View>
          )}
          <View style={[styles.detailCard, shadow.card]}>
            <Ionicons name="calendar-outline" size={24} color={colors.warning} />
            <Text style={styles.detailValue}>{farm.tenure}</Text>
            <Text style={styles.detailLabel}>Lease Period</Text>
          </View>
          <View style={[styles.detailCard, shadow.card]}>
            <Ionicons name="cash-outline" size={24} color={colors.info} />
            <Text style={styles.detailValue}>{farm.pricePerYear}</Text>
            <Text style={styles.detailLabel}>Per Year</Text>
          </View>
          {farm.leaseType && (
            <TouchableOpacity
              style={[styles.detailCard, shadow.card, styles.leaseTypeCard]}
              onPress={() => {
                const leaseType = farm.leaseType;
                if (leaseType) {
                  navigation.navigate('LeaseTypeDetails', {
                    selectedLeaseType: leaseType,
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={24} color={colors.primary} />
              <Text style={styles.detailValue}>{farm.leaseType}</Text>
              <Text style={styles.detailLabel}>Lease Type</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        {farm.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{farm.description}</Text>
          </View>
        )}

        {/* Crop & Care Schedule */}
        {(farm.currentCrop ||
          farm.irrigationSchedule ||
          farm.pesticideSchedule ||
          farm.expectedHarvest) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crop & Care Schedule</Text>
            {farm.currentCrop && (
              <Text style={styles.description}>Current Crop: {farm.currentCrop}</Text>
            )}
            {farm.irrigationSchedule && (
              <Text style={styles.description}>Irrigation: {farm.irrigationSchedule}</Text>
            )}
            {farm.pesticideSchedule && (
              <Text style={styles.description}>
                Pesticide / Fertilizer: {farm.pesticideSchedule}
              </Text>
            )}
            {farm.expectedHarvest && (
              <Text style={styles.description}>Expected Harvest: {farm.expectedHarvest}</Text>
            )}
          </View>
        )}

        {/* Owner Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner Information</Text>
          <View style={styles.ownerCard}>
            <View style={styles.ownerInfo}>
              <View style={styles.ownerAvatar}>
                <Ionicons name="person" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.ownerName}>{farm.ownerName}</Text>
                <Text style={styles.ownerLabel}>Land Owner</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lease options (real offers the owner published) */}
        <LeaseOptionsSection
          landId={farmId}
          landTitle={farm.title}
          ownerId={farm.ownerId}
          ownerName={farm.ownerName}
        />

        {/* Contact Button */}
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactOwner}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={20} color={colors.surface} />
          <Text style={styles.contactButtonText}>Contact Owner</Text>
        </TouchableOpacity>
        {/* View in Map button */}
        <TouchableOpacity
          style={styles.viewMapButton}
          onPress={() => navigation.navigate('SatelliteMap', { farmId })}
          activeOpacity={0.8}
        >
          <Ionicons name="map" size={20} color={colors.surface} />
          <Text style={styles.contactButtonText}>View in Map</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: colors.border,
  },
  titleSection: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#1A6B3A',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginBottom: spacing.sm,
  },
  verifiedText: { color: '#fff', fontSize: 12.5, fontWeight: '800' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  location: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.md,
  },
  detailCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  leaseTypeCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.md,
  },
  chevronIcon: {
    marginLeft: spacing.sm,
  },
  section: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  ownerCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ownerLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  viewMapButton: {
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
