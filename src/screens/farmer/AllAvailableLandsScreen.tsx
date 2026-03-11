import React, { useState, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';
import { useFarmListings } from '../../context/FarmListingsContext';
import { LandFiltersPanel } from '../../components/leases/LandFiltersPanel';
import { BlockchainVerifiedBadge } from '../../components/leases/BlockchainVerifiedBadge';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList>;

export default function AllAvailableLandsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { getFeaturedListings } = useFarmListings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'nearby' | 'low-price'>('all');
  const [soilFilter, setSoilFilter] = useState('All');
  const [irrigationFilter, setIrrigationFilter] = useState('All');
  const [blockchainOnly, setBlockchainOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const allListings = getFeaturedListings();

  const filteredListings = useMemo(() => {
    let filtered = allListings;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.location.toLowerCase().includes(query) ||
          listing.district.toLowerCase().includes(query) ||
          listing.soilType.toLowerCase().includes(query)
      );
    }
    if (soilFilter !== 'All') {
      filtered = filtered.filter((l) => l.soilType === soilFilter);
    }
    if (blockchainOnly) {
      filtered = filtered.filter((_, i) => i < 2);
    }
    if (selectedFilter === 'low-price') {
      filtered = [...filtered].sort((a, b) => {
        const priceA = parseInt(a.pricePerYear.replace(/[^0-9]/g, ''));
        const priceB = parseInt(b.pricePerYear.replace(/[^0-9]/g, ''));
        return priceA - priceB;
      });
    }
    return filtered;
  }, [allListings, searchQuery, selectedFilter, soilFilter, irrigationFilter, blockchainOnly]);

  const handleListingPress = (farmId: string) => {
    navigation.navigate('FarmDetail', { farmId });
  };

  const renderListingCard = ({ item }: { item: typeof allListings[0] }) => (
    <TouchableOpacity
      style={[styles.listingCard, shadow.card]}
      onPress={() => handleListingPress(item.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.listingImage} />
      <View style={styles.listingContent}>
        <View style={styles.listingHeader}>
          <View style={styles.acresBadge}>
            <Text style={styles.acresText}>{item.acresLabel || `${item.acres} Acres`}</Text>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{item.pricePerYear}</Text>
            <Text style={styles.priceLabel}>/year</Text>
          </View>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.listingTitle}>{item.title}</Text>
          <BlockchainVerifiedBadge verified={item.id === 'initial-1' || item.id === 'initial-2'} compact />
        </View>
        {item.leaseType && (
          <View style={styles.leaseTypeContainer}>
            <View style={styles.leaseTypeBadge}>
              <Ionicons name="document-text-outline" size={14} color={colors.primary} />
              <Text style={styles.leaseTypeText}>{item.leaseType}</Text>
            </View>
          </View>
        )}
        <View style={styles.listingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>
              {item.location}, {item.district}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="leaf-outline" size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.soilType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.tenure}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Available Lands</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, crop, soil type..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Land filters panel (soil, irrigation, blockchain) */}
      <TouchableOpacity
        style={styles.filterToggle}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Ionicons name="options-outline" size={20} color={colors.primary} />
        <Text style={styles.filterToggleText}>Filters (soil, irrigation, blockchain)</Text>
        <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
      </TouchableOpacity>
      {showFilters && (
        <LandFiltersPanel
          soilFilter={soilFilter}
          irrigationFilter={irrigationFilter}
          blockchainOnly={blockchainOnly}
          onSoilChange={setSoilFilter}
          onIrrigationChange={setIrrigationFilter}
          onBlockchainToggle={setBlockchainOnly}
          onClear={() => {
            setSoilFilter('All');
            setIrrigationFilter('All');
            setBlockchainOnly(false);
          }}
        />
      )}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text
            style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}
          >
            All ({allListings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'nearby' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('nearby')}
        >
          <Text
            style={[styles.filterText, selectedFilter === 'nearby' && styles.filterTextActive]}
          >
            Nearby
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'low-price' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('low-price')}
        >
          <Text
            style={[styles.filterText, selectedFilter === 'low-price' && styles.filterTextActive]}
          >
            Low Price
          </Text>
        </TouchableOpacity>
      </View>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyStateTitle}>No lands found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  filterToggleText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  searchContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.surface,
  },
  listContent: {
    padding: spacing.lg,
  },
  listingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.border,
  },
  listingContent: {
    padding: spacing.lg,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  acresBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  acresText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.surface,
  },
  priceBadge: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  listingTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  leaseTypeContainer: {
    marginBottom: spacing.sm,
  },
  leaseTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  leaseTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  listingDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
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
  },
});
