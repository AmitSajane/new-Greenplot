import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';
import { useFarmListings } from '../../context/FarmListingsContext';
import { useLeases } from '../../context/LeaseContext';
import { LEASE_TYPE_MAP, summarizeOffer } from '../../constants/leaseTypes';
import type { MyPropertiesStackParamList } from '../../navigation/MyPropertiesStack';

type LandDetailsTab = 'lease' | 'crop' | 'labor' | 'revenue';

type NavigationProp = NativeStackNavigationProp<MyPropertiesStackParamList, 'PropertyDetails'>;
type PropertyDetailsRoute = RouteProp<MyPropertiesStackParamList, 'PropertyDetails'>;

// Best crops by soil type for suggestions
const BEST_CROPS_BY_SOIL: Record<string, string[]> = {
  'Alluvial Soil': ['Wheat', 'Paddy', 'Sugarcane', 'Cotton', 'Maize'],
  'Clay Soil': ['Paddy', 'Wheat', 'Sugarcane', 'Jute', 'Mustard'],
  'Black Soil': ['Cotton', 'Soybean', 'Sugarcane', 'Wheat', 'Groundnut'],
  'Red Soil': ['Groundnut', 'Millets', 'Pulses', 'Cotton', 'Tobacco'],
  'Loam Soil': ['Wheat', 'Vegetables', 'Fruits', 'Pulses', 'Maize'],
};

function getBestCrops(soilType: string): string[] {
  return BEST_CROPS_BY_SOIL[soilType] ?? ['Wheat', 'Paddy', 'Pulses', 'Vegetables'];
}

export default function PropertyDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PropertyDetailsRoute>();
  const { propertyId } = route.params;
  const { getListingById } = useFarmListings();
  const { getOffersByLand } = useLeases();
  const offers = getOffersByLand(propertyId);

  const property = getListingById(propertyId);

  const handleShare = async () => {
    if (!property) return;
    const message = [
      `${property.title}`,
      `${property.acresLabel || `${property.acres} Acres`} • ${property.soilType}`,
      `${property.location}, ${property.district}, ${property.state}`,
      `Tenure: ${property.tenure} • ${property.pricePerYear}/year`,
      property.description ? `\n${property.description}` : '',
    ].join('\n');
    try {
      await Share.share({
        message,
        title: `Property: ${property.title}`,
      });
    } catch (err: unknown) {
      if ((err as { message?: string })?.message !== 'User did not share') {
        Alert.alert('Error', 'Could not share property details.');
      }
    }
  };

  if (!property) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.errorText}>Property not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const bestCrops = getBestCrops(property.soilType);
  const [activeTab, setActiveTab] = useState<LandDetailsTab>('lease');

  const tabs: { key: LandDetailsTab; label: string; icon: string }[] = [
    { key: 'lease', label: 'Lease history', icon: 'document-text-outline' },
    { key: 'crop', label: 'Crop grown', icon: 'leaf-outline' },
    { key: 'labor', label: 'Labor activity', icon: 'people-outline' },
    { key: 'revenue', label: 'Revenue', icon: 'bar-chart-outline' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Property Details</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        <Image source={{ uri: property.imageUrl }} style={styles.image} />

        {/* Title & status */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{property.title}</Text>
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
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text style={styles.location}>
            {property.location}, {property.district}, {property.state}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? colors.primary : colors.textMuted} />
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        {activeTab === 'lease' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lease history</Text>
            <DetailRow icon="document-text-outline" label="Status" value={property.status} />
            <DetailRow icon="calendar-outline" label="Tenure" value={property.tenure} />
            <DetailRow icon="cash-outline" label="Rent/Year" value={property.pricePerYear} />
            <TouchableOpacity
              style={styles.leaseTypeRow}
              onPress={() => navigation.navigate('LeaseTypeDetails', { propertyId, selectedLeaseType: property.leaseType })}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.detailLabel}>Lease type:</Text>
              <Text style={styles.leaseTypeValue}>{property.leaseType || 'Select'}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            {/* Lease offers the farmer will see */}
            <View style={leaseOfferStyles.box}>
              <View style={leaseOfferStyles.head}>
                <Text style={leaseOfferStyles.title}>Lease offers ({offers.length})</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddLeaseOffer', { landId: propertyId, landTitle: property.title })}
                  style={leaseOfferStyles.addBtn}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={15} color="#fff" />
                  <Text style={leaseOfferStyles.addText}>Add / manage</Text>
                </TouchableOpacity>
              </View>
              {offers.length === 0 ? (
                <Text style={styles.noDataText}>No lease offers yet. Add one so farmers can apply.</Text>
              ) : (
                offers.map((o) => (
                  <View key={o.id} style={leaseOfferStyles.row}>
                    <Text style={leaseOfferStyles.emoji}>{LEASE_TYPE_MAP[o.typeId].emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={leaseOfferStyles.name}>{LEASE_TYPE_MAP[o.typeId].name}</Text>
                      <Text style={leaseOfferStyles.sum}>{summarizeOffer(o)}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}
        {activeTab === 'crop' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crop grown</Text>
            <Text style={styles.cardSubtitle}>Suggested for {property.soilType}</Text>
            <View style={styles.chipRow}>
              {bestCrops.map((crop) => (
                <View key={crop} style={styles.chip}>
                  <Ionicons name="leaf" size={14} color={colors.primary} />
                  <Text style={styles.chipText}>{crop}</Text>
                </View>
              ))}
            </View>
            {property.lastYearCrop && (
              <>
                <DetailRow icon="leaf-outline" label="Last crop" value={property.lastYearCrop} />
                {property.lastYearYield && <DetailRow icon="stats-chart-outline" label="Yield" value={property.lastYearYield} />}
              </>
            )}
          </View>
        )}
        {activeTab === 'labor' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Labor activity</Text>
            <Text style={styles.noDataText}>No labor records for this property. Post work from Labor Connect.</Text>
          </View>
        )}
        {activeTab === 'revenue' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Revenue analytics</Text>
            {property.lastYearEarnings ? (
              <View style={styles.earningsRow}>
                <Ionicons name="wallet" size={20} color={colors.success} />
                <View style={styles.earningsContent}>
                  <Text style={styles.earningsLabel}>Earnings on this land</Text>
                  <Text style={styles.earningsValue}>{property.lastYearEarnings}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>No revenue recorded yet.</Text>
            )}
          </View>
        )}

        {/* Details card (summary) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <DetailRow icon="resize-outline" label="Area" value={property.acresLabel || `${property.acres} Acres`} />
          <DetailRow icon="leaf-outline" label="Soil" value={property.soilType} />
          <DetailRow icon="calendar-outline" label="Tenure" value={property.tenure} />
          <DetailRow icon="cash-outline" label="Rent/Year" value={property.pricePerYear} />
          <TouchableOpacity
            style={styles.leaseTypeRow}
            onPress={() =>
              navigation.navigate('LeaseTypeDetails', {
                propertyId,
                selectedLeaseType: property.leaseType,
              })
            }
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Lease type:</Text>
            <Text style={styles.leaseTypeValue}>
              {property.leaseType || 'Select lease type'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          {property.description ? (
            <View style={styles.descriptionRow}>
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.descriptionText}>{property.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Share button (full width) */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={22} color={colors.surface} />
          <Text style={styles.shareButtonText}>Share this property</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: spacing.sm,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  statusLeased: { backgroundColor: colors.softGreen },
  statusAvailable: { backgroundColor: colors.softOrange },
  statusInactive: { backgroundColor: colors.border },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusTextLeased: { color: colors.success },
  statusTextAvailable: { color: colors.warning },
  statusTextInactive: { color: colors.textMuted },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xs,
    flexWrap: 'wrap',
  },
  tab: {
    flex: 1,
    minWidth: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  tabActive: { backgroundColor: colors.softGreen },
  tabLabel: { fontSize: 12, color: colors.textMuted },
  tabLabelActive: { color: colors.primary, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    width: 90,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  leaseTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  leaseTypeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    gap: spacing.xs,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  earningsContent: {
    marginLeft: spacing.md,
  },
  earningsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  backButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
});

const leaseOfferStyles = StyleSheet.create({
  box: { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#0F4A28', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 6 },
  addText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F4F8F5', borderRadius: 10, padding: 10, marginBottom: 7 },
  emoji: { fontSize: 18 },
  name: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  sum: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
});
