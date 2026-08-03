import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../theme/tokens';
import { ScreenHeader } from '../components/molecules/ScreenHeader';
import { FarmerHomeStackParamList } from '../navigation/FarmerHomeStack';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList>;
type RouteProp = {
  key: string;
  name: string;
  params: { leaseTypeId: string; leaseTypeTitle: string };
};

interface LeaseTypeData {
  id: string;
  title: string;
  term: string;
  acres: string;
  profitShare: {
    farmer: number;
    owner: number;
  };
  farmerResponsibilities: string[];
  ownerResponsibilities: string[];
  imageUrl: string;
}

const LEASE_DATA: Record<string, LeaseTypeData> = {
  'share-cropping': {
    id: 'share-cropping',
    title: '50/50 Crop Share',
    term: '12 Month Term',
    acres: '50 Acres',
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
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
  },
  'fixed-rent': {
    id: 'fixed-rent',
    title: 'Fixed Cash Rent',
    term: '12 Month Term',
    acres: '50 Acres',
    profitShare: {
      farmer: 25,
      owner: 75,
    },
    farmerResponsibilities: [
      'Provide all labor and machinery for planting & harvesting',
      'Cover all seed, fertilizer, and chemical costs',
      'Maintain field boundaries',
      'Handle all operational risks',
    ],
    ownerResponsibilities: [
      'Pay all real estate taxes and insurance',
      'Major infrastructure repairs (irrigation, fences)',
      'Receive fixed rent payment',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
  },
  'cash-rent': {
    id: 'cash-rent',
    title: 'Cash Rent',
    term: '12 Month Term',
    acres: '50 Acres',
    profitShare: {
      farmer: 25,
      owner: 75,
    },
    farmerResponsibilities: [
      'Provide all labor and machinery for planting & harvesting',
      'Cover all seed, fertilizer, and chemical costs',
      'Maintain field boundaries',
      'Handle all operational risks',
    ],
    ownerResponsibilities: [
      'Pay all real estate taxes and insurance',
      'Major infrastructure repairs (irrigation, fences)',
      'Receive fixed rent payment',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
  },
  'crop-share': {
    id: 'crop-share',
    title: 'Crop Share',
    term: '12 Month Term',
    acres: '50 Acres',
    profitShare: {
      farmer: 60,
      owner: 40,
    },
    farmerResponsibilities: [
      'Provide all labor and machinery for planting & harvesting',
      'Cover 60% of seed, fertilizer, and chemical costs',
      'Maintain field boundaries',
    ],
    ownerResponsibilities: [
      'Pay all real estate taxes and insurance',
      'Cover 40% of seed, fertilizer, and chemical costs',
      'Major infrastructure repairs (irrigation, fences)',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
  },
  'revenue-share': {
    id: 'revenue-share',
    title: 'Revenue Share',
    term: '12 Month Term',
    acres: '50 Acres',
    profitShare: {
      farmer: 30,
      owner: 70,
    },
    farmerResponsibilities: [
      'Provide all labor and machinery for planting & harvesting',
      'Cover all operational costs',
      'Maintain field boundaries',
    ],
    ownerResponsibilities: [
      'Pay all real estate taxes and insurance',
      'Major infrastructure repairs (irrigation, fences)',
      'Receive 70% of revenue',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
  },
  'flexible-cash': {
    id: 'flexible-cash',
    title: 'Flexible Cash',
    term: '12 Month Term',
    acres: '50 Acres',
    profitShare: {
      farmer: 30,
      owner: 70,
    },
    farmerResponsibilities: [
      'Provide all labor and machinery for planting & harvesting',
      'Cover all operational costs',
      'Maintain field boundaries',
    ],
    ownerResponsibilities: [
      'Pay all real estate taxes and insurance',
      'Major infrastructure repairs (irrigation, fences)',
      'Receive base rent + performance bonus',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
  },
};

export default function LeaseConfirmationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { leaseTypeId } = route.params || {};
  const [agreed, setAgreed] = useState(true);

  // Get lease data or use default
  let leaseData = LEASE_DATA[leaseTypeId || 'share-cropping'] || LEASE_DATA['share-cropping'];
  
  // Override title if provided in params
  if (route.params?.leaseTypeTitle && !LEASE_DATA[leaseTypeId || '']) {
    leaseData = {
      ...leaseData,
      title: route.params.leaseTypeTitle,
    };
  }

  const handleProceed = () => {
    // Navigate to next step (agreement generation)
    // navigation.navigate('AgreementGeneration', { leaseTypeId });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Lease Confirmation"
        onBack={() => navigation.goBack()}
        buttonBackgroundColor="transparent"
        titleWeight="700"
        showBorder={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Plan Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECTED PLAN</Text>
          <View style={[styles.planCard, shadow.card]}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: leaseData.imageUrl }}
                style={styles.planImage}
                resizeMode="cover"
              />
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>
            <View style={styles.planInfo}>
              <View style={styles.planTitleRow}>
                <Text style={styles.planTitle}>{leaseData.title}</Text>
                <View style={styles.handshakeIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                </View>
              </View>
              <Text style={styles.planDetails}>
                {leaseData.term} • {leaseData.acres}
              </Text>
            </View>
          </View>
        </View>

        {/* Profit Sharing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profit Sharing</Text>
          <View style={[styles.profitCard, shadow.card]}>
            <View style={styles.profitRow}>
              <View style={styles.profitItem}>
                <Text style={styles.profitLabel}>OWNER</Text>
                <Text style={styles.profitPercentage}>{leaseData.profitShare.owner}%</Text>
              </View>
              <View style={styles.profitItem}>
                <Text style={styles.profitLabel}>FARMER</Text>
                <Text style={[styles.profitPercentage, styles.farmerPercentage]}>
                  {leaseData.profitShare.farmer}%
                </Text>
              </View>
            </View>
            <View style={styles.profitBarContainer}>
              <View
                style={[
                  styles.profitBar,
                  styles.ownerBar,
                  { width: `${leaseData.profitShare.owner}%` },
                ]}
              />
              <View
                style={[
                  styles.profitBar,
                  styles.farmerBar,
                  { width: `${leaseData.profitShare.farmer}%` },
                ]}
              />
            </View>
            <Text style={styles.profitNote}>
              Net profit calculated after input costs
            </Text>
          </View>
        </View>

        {/* Responsibilities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Responsibilities</Text>

          {/* Farmer's Duties */}
          <View style={[styles.responsibilityCard, shadow.card]}>
            <View style={styles.responsibilityHeader}>
              <Ionicons name="tractor-outline" size={24} color={colors.primary} />
              <Text style={styles.responsibilityTitle}>Farmer's Duties</Text>
            </View>
            {leaseData.farmerResponsibilities.map((duty, index) => (
              <View key={index} style={styles.dutyItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={styles.dutyText}>{duty}</Text>
              </View>
            ))}
          </View>

          {/* Owner's Duties */}
          <View style={[styles.responsibilityCard, shadow.card]}>
            <View style={styles.responsibilityHeader}>
              <Ionicons name="home-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.responsibilityTitle}>Owner's Duties</Text>
            </View>
            {leaseData.ownerResponsibilities.map((duty, index) => (
              <View key={index} style={styles.dutyItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.textSecondary} />
                <Text style={styles.dutyText}>{duty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            <Text style={styles.noteLabel}>Note:</Text> This is a summary of the lease terms. The full legal contract will be generated in the next step for your signature.
          </Text>
        </View>

        {/* Agreement Checkbox */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            {agreed && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            I understand and agree to the responsibilities listed above.
          </Text>
        </View>
      </ScrollView>

      {/* Proceed Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.proceedButton, !agreed && styles.proceedButtonDisabled]}
          onPress={handleProceed}
          disabled={!agreed}
          activeOpacity={0.8}
        >
          <Text style={styles.proceedButtonText}>Proceed to Agreement →</Text>
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
    padding: spacing.xl,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
  },
  planImage: {
    width: '100%',
    height: '100%',
  },
  activeBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  activeBadgeText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  planInfo: {
    padding: spacing.lg,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  handshakeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  profitCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  profitItem: {
    flex: 1,
  },
  profitLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  profitPercentage: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  farmerPercentage: {
    color: colors.primary,
  },
  profitBarContainer: {
    flexDirection: 'row',
    height: 32,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  profitBar: {
    height: '100%',
  },
  ownerBar: {
    backgroundColor: colors.border,
  },
  farmerBar: {
    backgroundColor: colors.primary,
  },
  profitNote: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  responsibilityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  responsibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  responsibilityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dutyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dutyText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  noteContainer: {
    backgroundColor: colors.softBlue,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  noteText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  noteLabel: {
    fontWeight: '700',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  proceedButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: colors.border,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
});
