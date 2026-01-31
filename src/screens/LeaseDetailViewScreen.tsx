import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
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
  params: { leaseTypeId: string; leaseTypeTitle: string };
};

interface LeaseTypeDetail {
  id: string;
  title: string;
  description: string;
  tag?: string;
  tagColor?: string;
  icon: string;
  riskDistribution?: {
    farmer: number;
    owner: number;
  };
  profitShare?: {
    farmer: number;
    owner: number;
  };
  bestUseCase: string;
}

const LEASE_TYPE_DETAILS: Record<string, LeaseTypeDetail> = {
  'fixed-rent': {
    id: 'fixed-rent',
    title: 'Fixed Cash Rent',
    description: 'A straightforward agreement where the tenant pays a set amount per acre. Ideal for predictable income.',
    tag: 'RECOMMENDED FOR STABILITY',
    tagColor: colors.primary,
    icon: 'cash-outline',
    riskDistribution: {
      farmer: 25,
      owner: 75,
    },
    bestUseCase: 'Owners seeking guaranteed income regardless of crop yield or market prices, shifting most operational risk to the farmer.',
  },
  'cash-rent': {
    id: 'cash-rent',
    title: 'Cash Rent',
    description: 'Farmer pays a fixed rent amount per acre. The owner has no production risk and receives guaranteed income.',
    tag: 'MOST COMMON',
    tagColor: colors.primary,
    icon: 'cash-outline',
    riskDistribution: {
      farmer: 25,
      owner: 75,
    },
    bestUseCase: 'Owners seeking guaranteed income regardless of crop yield or market prices, shifting most operational risk to the farmer.',
  },
  'crop-share': {
    id: 'crop-share',
    title: 'Crop Share',
    description: 'Both parties share input costs (seeds, fertilizer) and profits from the harvest based on the agreed percentage.',
    icon: 'share-outline',
    profitShare: {
      farmer: 60,
      owner: 40,
    },
    bestUseCase: 'Parties who want to share both risks and rewards of farming operations.',
  },
  'share-cropping': {
    id: 'share-cropping',
    title: '50/50 Crop Share',
    description: 'Traditional arrangement where both parties share the crop output based on agreed percentages.',
    icon: 'people-outline',
    profitShare: {
      farmer: 50,
      owner: 50,
    },
    bestUseCase: 'Parties who want equal sharing of both risks and rewards of farming operations.',
  },
  'flexible-cash': {
    id: 'flexible-cash',
    title: 'Flexible Cash',
    description: 'A guaranteed base rent plus a bonus payment to the owner triggered by high yields or strong market prices.',
    icon: 'trending-up-outline',
    riskDistribution: {
      farmer: 30,
      owner: 70,
    },
    bestUseCase: 'Owners who want guaranteed base income with potential for additional earnings based on performance.',
  },
  'revenue-share': {
    id: 'revenue-share',
    title: 'Revenue Share',
    description: 'Owner receives a percentage of the total revenue generated from the sale of crops.',
    icon: 'pie-chart-outline',
    profitShare: {
      farmer: 30,
      owner: 70,
    },
    bestUseCase: 'Owners who want to participate in revenue growth while sharing operational risks.',
  },
  'fixed-share': {
    id: 'fixed-share',
    title: 'Fixed + Share',
    description: 'Combination of fixed rent and revenue sharing, providing both guaranteed income and profit participation.',
    icon: 'layers-outline',
    riskDistribution: {
      farmer: 40,
      owner: 60,
    },
    bestUseCase: 'Owners seeking a balance between guaranteed income and profit participation.',
  },
  'custom-agreement': {
    id: 'custom-agreement',
    title: 'Custom Agreement',
    description: 'Tailored lease agreement with terms negotiated between the owner and farmer based on specific needs.',
    icon: 'document-text-outline',
    bestUseCase: 'Parties with unique requirements that need customized lease terms.',
  },
};

export default function LeaseDetailViewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { leaseTypeId, leaseTypeTitle } = route.params || {};

  // Get lease type detail or use a default
  let leaseDetail = LEASE_TYPE_DETAILS[leaseTypeId || 'fixed-rent'] || LEASE_TYPE_DETAILS['fixed-rent'];
  
  // Override title if provided in params
  if (leaseTypeTitle) {
    leaseDetail = { ...leaseDetail, title: leaseTypeTitle };
  }

  const handleSelectLease = () => {
    navigation.navigate('LeaseConfirmation', {
      leaseTypeId: leaseDetail.id,
      leaseTypeTitle: leaseDetail.title,
    });
  };

  const handleCompareLeases = () => {
    navigation.navigate('CompareLeases', {
      selectedLeaseTypeId: leaseDetail.id,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lease Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tag */}
        {leaseDetail.tag && (
          <View style={[styles.tagContainer, { backgroundColor: leaseDetail.tagColor || colors.primary }]}>
            <Text style={styles.tagText}>{leaseDetail.tag}</Text>
          </View>
        )}

        {/* Title with Icon */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{leaseDetail.title}</Text>
          <View style={styles.iconContainer}>
            <Ionicons name={leaseDetail.icon} size={32} color={colors.primary} />
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{leaseDetail.description}</Text>

        {/* Profit & Risk Split Card */}
        {(leaseDetail.riskDistribution || leaseDetail.profitShare) && (
          <View style={[styles.card, shadow.card]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Profit & Risk Split</Text>
              <Text style={styles.estimatedText}>ESTIMATED</Text>
            </View>
            <View style={styles.barContainer}>
              {leaseDetail.riskDistribution ? (
                <>
                  <View
                    style={[
                      styles.bar,
                      styles.farmerBar,
                      { width: `${leaseDetail.riskDistribution.farmer}%` },
                    ]}
                  >
                    <Text style={styles.barText}>{leaseDetail.riskDistribution.farmer}%</Text>
                  </View>
                  <View
                    style={[
                      styles.bar,
                      styles.ownerBar,
                      { width: `${leaseDetail.riskDistribution.owner}%` },
                    ]}
                  >
                    <Text style={styles.barText}>{leaseDetail.riskDistribution.owner}%</Text>
                  </View>
                </>
              ) : leaseDetail.profitShare ? (
                <>
                  <View
                    style={[
                      styles.bar,
                      styles.farmerBar,
                      { width: `${leaseDetail.profitShare.farmer}%` },
                    ]}
                  >
                    <Text style={styles.barText}>{leaseDetail.profitShare.farmer}%</Text>
                  </View>
                  <View
                    style={[
                      styles.bar,
                      styles.ownerBar,
                      { width: `${leaseDetail.profitShare.owner}%` },
                    ]}
                  >
                    <Text style={styles.barText}>{leaseDetail.profitShare.owner}%</Text>
                  </View>
                </>
              ) : null}
            </View>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.farmerDot]} />
                <Text style={styles.legendText}>Farmer Risk</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.ownerDot]} />
                <Text style={styles.legendText}>Owner Risk</Text>
              </View>
            </View>
          </View>
        )}

        {/* Best Use Case Card */}
        <View style={[styles.card, styles.bestUseCaseCard, shadow.card]}>
          <View style={styles.bestUseCaseHeader}>
            <Ionicons name="bulb-outline" size={24} color={colors.info} />
            <Text style={styles.bestUseCaseTitle}>Best Use Case</Text>
          </View>
          <Text style={styles.bestUseCaseText}>{leaseDetail.bestUseCase}</Text>
        </View>

        {/* Responsibilities Heading */}
        <Text style={styles.responsibilitiesHeading}>Responsibilities</Text>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={handleSelectLease}
          activeOpacity={0.8}
        >
          <Text style={styles.selectButtonText}>Select This Lease</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.surface} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.compareButton}
          onPress={handleCompareLeases}
          activeOpacity={0.8}
        >
          <Text style={styles.compareButtonText}>Compare Other Leases</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
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
    padding: spacing.xl,
    paddingBottom: 200,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  tagText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  estimatedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  barContainer: {
    flexDirection: 'row',
    height: 40,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  bar: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmerBar: {
    backgroundColor: colors.primary,
  },
  ownerBar: {
    backgroundColor: '#8B4513',
  },
  barText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  farmerDot: {
    backgroundColor: colors.primary,
  },
  ownerDot: {
    backgroundColor: '#8B4513',
  },
  legendText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bestUseCaseCard: {
    backgroundColor: colors.softBlue,
  },
  bestUseCaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bestUseCaseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.info,
  },
  bestUseCaseText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  responsibilitiesHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  compareButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  compareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
