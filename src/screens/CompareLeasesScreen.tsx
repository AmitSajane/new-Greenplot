import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../theme/tokens';
import { FarmerHomeStackParamList } from '../navigation/FarmerHomeStack';
import { ScreenHeader } from '../components/molecules/ScreenHeader';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList>;
type RouteProp = {
  key: string;
  name: string;
  params: { selectedLeaseTypeId?: string; propertyId?: string };
};

interface LeaseComparison {
  id: string;
  title: string;
  description: string;
  profitShare?: {
    farmer: number;
    owner: number;
  };
  riskDistribution?: {
    farmer: number;
    owner: number;
  };
  farmerResponsibilities: string[];
  ownerResponsibilities: string[];
  tag?: string;
  icon: string;
}

const COMPARISON_LEASES: LeaseComparison[] = [
  {
    id: 'share-cropping',
    title: '50/50 Crop Share',
    description: 'Equal sharing of profits and costs between farmer and owner.',
    profitShare: {
      farmer: 50,
      owner: 50,
    },
    farmerResponsibilities: [
      'Provide all labor and machinery for planting & harvesting',
      'Cover 50% of seed, fertilizer, and chemical costs',
      'Maintain field boundaries',
    ],
    ownerResponsibilities: [
      'Pay all real estate taxes and insurance',
      'Cover 50% of seed, fertilizer, and chemical costs',
      'Major infrastructure repairs (irrigation, fences)',
    ],
    icon: 'people-outline',
  },
  {
    id: 'fixed-rent',
    title: 'Fixed Cash Rent',
    description: 'A straightforward agreement where the tenant pays a set amount per acre.',
    riskDistribution: {
      farmer: 25,
      owner: 75,
    },
    farmerResponsibilities: [
      'Provide all labor and machinery',
      'Cover all seed, fertilizer, and chemical costs',
      'Maintain field boundaries',
      'Handle all operational risks',
    ],
    ownerResponsibilities: [
      'Pay all real estate taxes and insurance',
      'Major infrastructure repairs',
      'Receive fixed rent payment',
    ],
    tag: 'RECOMMENDED',
    icon: 'cash-outline',
  },
  {
    id: 'cash-rent',
    title: 'Cash Rent',
    description: 'Farmer pays a fixed rent amount per acre. Owner has no production risk.',
    riskDistribution: {
      farmer: 25,
      owner: 75,
    },
    farmerResponsibilities: [
      'Provide all labor and machinery',
      'Cover all seed, fertilizer, and chemical costs',
      'Maintain field boundaries',
      'Handle all operational risks',
    ],
    ownerResponsibilities: [
      'Pay all real estate taxes and insurance',
      'Major infrastructure repairs',
      'Receive fixed rent payment',
    ],
    tag: 'MOST COMMON',
    icon: 'cash-outline',
  },
  {
    id: 'crop-share',
    title: 'Crop Share',
    description: 'Both parties share input costs and profits from the harvest.',
    profitShare: {
      farmer: 60,
      owner: 40,
    },
    farmerResponsibilities: [
      'Provide all labor and machinery',
      'Cover 60% of seed, fertilizer, and chemical costs',
      'Maintain field boundaries',
    ],
    ownerResponsibilities: [
      'Pay all real estate taxes and insurance',
      'Cover 40% of seed, fertilizer, and chemical costs',
      'Major infrastructure repairs',
    ],
    icon: 'share-outline',
  },
  {
    id: 'revenue-share',
    title: 'Revenue Share',
    description: 'Owner receives a percentage of the total revenue generated.',
    profitShare: {
      farmer: 30,
      owner: 70,
    },
    farmerResponsibilities: [
      'Provide all labor and machinery',
      'Cover all operational costs',
      'Maintain field boundaries',
    ],
    ownerResponsibilities: [
      'Pay all real estate taxes and insurance',
      'Major infrastructure repairs',
      'Receive 70% of revenue',
    ],
    icon: 'trending-up-outline',
  },
  {
    id: 'flexible-cash',
    title: 'Flexible Cash',
    description: 'Guaranteed base rent plus bonus payment based on performance.',
    riskDistribution: {
      farmer: 30,
      owner: 70,
    },
    farmerResponsibilities: [
      'Provide all labor and machinery',
      'Cover all operational costs',
      'Maintain field boundaries',
    ],
    ownerResponsibilities: [
      'Pay all real estate taxes and insurance',
      'Major infrastructure repairs',
      'Receive base rent + performance bonus',
    ],
    icon: 'trending-up-outline',
  },
];

export default function CompareLeasesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { selectedLeaseTypeId, propertyId } = route.params || {};
  const isOwnerFlow = propertyId != null;

  const renderLeaseCard = ({ item }: { item: LeaseComparison }) => {
    const isSelected = selectedLeaseTypeId === item.id;

    return (
      <View
        style={[
          styles.leaseCard,
          shadow.card,
          isSelected && styles.selectedCard,
        ]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          {item.tag && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          )}
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={24} color={colors.primary} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>

        {/* Profit/Risk Distribution */}
        {(item.profitShare || item.riskDistribution) && (
          <View style={styles.distributionContainer}>
            <View style={styles.barContainer}>
              {item.profitShare ? (
                <>
                  <View
                    style={[
                      styles.bar,
                      styles.farmerBar,
                      { width: `${item.profitShare.farmer}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      styles.ownerBar,
                      { width: `${item.profitShare.owner}%` },
                    ]}
                  />
                </>
              ) : item.riskDistribution ? (
                <>
                  <View
                    style={[
                      styles.bar,
                      styles.farmerBar,
                      { width: `${item.riskDistribution.farmer}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      styles.ownerBar,
                      { width: `${item.riskDistribution.owner}%` },
                    ]}
                  />
                </>
              ) : null}
            </View>
            <View style={styles.barLabels}>
              {item.profitShare ? (
                <>
                  <Text style={styles.barLabel}>
                    Farmer {item.profitShare.farmer}%
                  </Text>
                  <Text style={styles.barLabel}>
                    Owner {item.profitShare.owner}%
                  </Text>
                </>
              ) : item.riskDistribution ? (
                <>
                  <Text style={styles.barLabel}>
                    Farmer {item.riskDistribution.farmer}%
                  </Text>
                  <Text style={styles.barLabel}>
                    Owner {item.riskDistribution.owner}%
                  </Text>
                </>
              ) : null}
            </View>
          </View>
        )}

        {/* Responsibilities */}
        <View style={styles.responsibilitiesContainer}>
          <Text style={styles.responsibilitiesTitle}>Responsibilities</Text>

          {/* Farmer's Responsibilities */}
          <View style={styles.responsibilitySection}>
            <View style={styles.responsibilityHeader}>
              <Ionicons name="tractor-outline" size={16} color={colors.primary} />
              <Text style={styles.responsibilityLabel}>Farmer</Text>
            </View>
            {item.farmerResponsibilities.map((responsibility, index) => (
              <View key={index} style={styles.responsibilityItem}>
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                <Text style={styles.responsibilityText}>{responsibility}</Text>
              </View>
            ))}
          </View>

          {/* Owner's Responsibilities */}
          <View style={styles.responsibilitySection}>
            <View style={styles.responsibilityHeader}>
              <Ionicons name="home-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.responsibilityLabel}>Owner</Text>
            </View>
            {item.ownerResponsibilities.map((responsibility, index) => (
              <View key={index} style={styles.responsibilityItem}>
                <Ionicons name="checkmark-circle" size={14} color={colors.textSecondary} />
                <Text style={styles.responsibilityText}>{responsibility}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Select Button */}
        <TouchableOpacity
          style={styles.selectCardButton}
          onPress={() => {
            if (isOwnerFlow && propertyId) {
              navigation.navigate('LeaseDetailView', {
                leaseTypeId: item.id,
                leaseTypeTitle: item.title,
                propertyId,
              });
            } else {
              navigation.navigate('LeaseConfirmation', {
                leaseTypeId: item.id,
                leaseTypeTitle: item.title,
              });
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.selectCardButtonText}>
            {isOwnerFlow ? 'View details / Update lease type' : 'Select This Lease'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Compare Leases"
        onBack={() => navigation.goBack()}
        buttonBackgroundColor="transparent"
        titleWeight="700"
        showBorder={false}
      />

      {/* Horizontal Scrolling List */}
      <FlatList
        data={COMPARISON_LEASES}
        renderItem={renderLeaseCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={320 + spacing.md}
        decelerationRate="fast"
        pagingEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingRight: spacing.xl,
  },
  leaseCard: {
    width: 320,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.softGreen,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tagContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  distributionContainer: {
    marginBottom: spacing.lg,
  },
  barContainer: {
    flexDirection: 'row',
    height: 24,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  bar: {
    height: '100%',
  },
  farmerBar: {
    backgroundColor: colors.primary,
  },
  ownerBar: {
    backgroundColor: '#8B4513',
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  responsibilitiesContainer: {
    marginBottom: spacing.md,
  },
  responsibilitiesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  responsibilitySection: {
    marginBottom: spacing.md,
  },
  responsibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  responsibilityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  responsibilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  responsibilityText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  selectCardButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  selectCardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },
});
