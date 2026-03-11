import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../theme/tokens';
import { FarmerHomeStackParamList } from '../navigation/FarmerHomeStack';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList>;
type RouteProp = {
  key: string;
  name: string;
  params: { selectedLeaseType?: string; propertyId?: string };
};

interface LeaseType {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  riskDistribution?: {
    farmer: number;
    owner: number;
  };
  profitShare?: {
    farmer: number;
    owner: number;
  };
  flexibleShare?: {
    base: string;
    variable: string;
  };
  tag?: string;
}

const LEASE_TYPES: LeaseType[] = [
  {
    id: 'cash-rent',
    title: 'Cash Rent',
    description: 'Farmer pays a fixed rent amount per acre. The owner has no production risk and receives guaranteed income.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
    riskDistribution: {
      farmer: 25,
      owner: 75,
    },
    tag: 'MOST COMMON',
  },
  {
    id: 'crop-share',
    title: 'Crop Share',
    description: 'Both parties share input costs (seeds, fertilizer) and profits from the harvest based on the agreed percentage.',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
    profitShare: {
      farmer: 60,
      owner: 40,
    },
  },
  {
    id: 'flexible-cash',
    title: 'Flexible Cash',
    description: 'A guaranteed base rent plus a bonus payment to the owner triggered by high yields or strong market prices.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
    flexibleShare: {
      base: 'Base + Bonus',
      variable: 'Variable',
    },
  },
  {
    id: 'fixed-rent',
    title: 'Fixed Rent',
    description: 'Similar to Cash Rent, farmer pays a predetermined fixed amount regardless of crop yield or market conditions.',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    riskDistribution: {
      farmer: 100,
      owner: 0,
    },
  },
  {
    id: 'share-cropping',
    title: 'Share Cropping',
    description: 'Traditional arrangement where both parties share the crop output based on agreed percentages.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
    profitShare: {
      farmer: 50,
      owner: 50,
    },
  },
  {
    id: 'revenue-share',
    title: 'Revenue Share',
    description: 'Owner receives a percentage of the total revenue generated from the sale of crops.',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
    profitShare: {
      farmer: 30,
      owner: 70,
    },
  },
  {
    id: 'fixed-share',
    title: 'Fixed + Share',
    description: 'Combination of fixed rent and revenue sharing, providing both guaranteed income and profit participation.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
    flexibleShare: {
      base: 'Base Rent',
      variable: 'Revenue Share',
    },
  },
  {
    id: 'custom-agreement',
    title: 'Custom Agreement',
    description: 'Tailored lease agreement with terms negotiated between the owner and farmer based on specific needs.',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  },
];

// Map owner's lease type selection to our lease type IDs
const mapLeaseTypeToId = (leaseType?: string): string | undefined => {
  if (!leaseType) return undefined;
  
  const mapping: Record<string, string> = {
    'Fixed Rent': 'fixed-rent',
    'Cash Rent': 'cash-rent',
    'Share Cropping': 'share-cropping',
    'Revenue Share': 'revenue-share',
    'Crop Share': 'crop-share',
    'Fixed + Share': 'fixed-share',
    'Flexible Cash': 'flexible-cash',
    'Custom Agreement': 'custom-agreement',
  };
  
  return mapping[leaseType] || leaseType.toLowerCase().replace(/\s+/g, '-');
};

export default function LeaseTypeDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { selectedLeaseType } = route.params || {};
  const selectedId = mapLeaseTypeToId(selectedLeaseType);

  const renderLeaseTypeCard = (leaseType: LeaseType) => {
    const isSelected = selectedId === leaseType.id;

    return (
      <View
        key={leaseType.id}
        style={[
          styles.leaseTypeCard,
          shadow.card,
          isSelected && styles.selectedCard,
        ]}
      >
        {/* Image with Title Overlay */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: leaseType.imageUrl }} style={styles.image} />
          <View style={styles.imageOverlay} />
          {leaseType.tag && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{leaseType.tag}</Text>
            </View>
          )}
          <Text style={styles.imageTitle}>{leaseType.title}</Text>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={24} color={colors.surface} />
            </View>
          )}
        </View>

        {/* Risk/Profit Distribution Bar */}
        {leaseType.riskDistribution && (
          <View style={styles.distributionContainer}>
            <Text style={styles.distributionLabel}>Risk Distribution</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  styles.farmerBar,
                  { width: `${leaseType.riskDistribution.farmer}%` },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  styles.ownerBar,
                  { width: `${leaseType.riskDistribution.owner}%` },
                ]}
              />
            </View>
            <View style={styles.barLabels}>
              <Text style={styles.barLabel}>
                {leaseType.riskDistribution.farmer}% Farmer
              </Text>
              <Text style={styles.barLabel}>
                {leaseType.riskDistribution.owner}% Owner
              </Text>
            </View>
          </View>
        )}

        {leaseType.profitShare && (
          <View style={styles.distributionContainer}>
            <Text style={styles.distributionLabel}>Profit & Cost Share</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  styles.farmerBar,
                  { width: `${leaseType.profitShare.farmer}%` },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  styles.ownerBar,
                  { width: `${leaseType.profitShare.owner}%` },
                ]}
              />
            </View>
            <View style={styles.barLabels}>
              <Text style={styles.barLabel}>
                {leaseType.profitShare.farmer}% Farmer
              </Text>
              <Text style={styles.barLabel}>
                {leaseType.profitShare.owner}% Owner
              </Text>
            </View>
          </View>
        )}

        {leaseType.flexibleShare && (
          <View style={styles.distributionContainer}>
            <Text style={styles.distributionLabel}>Flexible Share</Text>
            <View style={styles.barContainer}>
              <View style={[styles.bar, styles.farmerBar, { width: '60%' }]} />
              <View
                style={[
                  styles.bar,
                  styles.variableBar,
                  { width: '40%' },
                ]}
              />
            </View>
            <View style={styles.barLabels}>
              <Text style={styles.barLabel}>{leaseType.flexibleShare.base}</Text>
              <Text style={styles.barLabel}>{leaseType.flexibleShare.variable}</Text>
            </View>
          </View>
        )}

        {/* Description */}
        <Text style={styles.description}>{leaseType.description}</Text>

        {/* View Details Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() =>
              navigation.navigate('LeaseDetailView', {
                leaseTypeId: leaseType.id,
                leaseTypeTitle: leaseType.title,
                ...(route.params?.propertyId != null && { propertyId: route.params.propertyId }),
              })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lease Types</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            {selectedLeaseType
              ? `Selected: ${selectedLeaseType}`
              : 'Choose Lease Type'}
          </Text>
          <Text style={styles.hintText}>
            Based on who invests & manages the land.
          </Text>

          {LEASE_TYPES.map((leaseType) => renderLeaseTypeCard(leaseType))}
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  content: {
    padding: spacing.xl,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  hintText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  leaseTypeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.softGreen,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  tagContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  tagText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  imageTitle: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    fontSize: 20,
    fontWeight: '700',
    color: colors.surface,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    padding: spacing.xs,
  },
  distributionContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  distributionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  barContainer: {
    flexDirection: 'row',
    height: 24,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  bar: {
    height: '100%',
  },
  farmerBar: {
    backgroundColor: colors.primary,
  },
  ownerBar: {
    backgroundColor: colors.success,
  },
  variableBar: {
    backgroundColor: colors.primary,
    opacity: 0.6,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    padding: spacing.lg,
    paddingTop: 0,
  },
  buttonContainer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  viewDetailsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
});
