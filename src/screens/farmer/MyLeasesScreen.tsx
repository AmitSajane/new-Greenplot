import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, radius, spacing } from '../../theme/tokens';
import { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList>;

const DUMMY_LEASES = [
  {
    id: '1',
    plotName: 'Ramgarh Plot A',
    ownerName: 'Rajesh Singh',
    area: '2.5 Acres',
    monthlyRent: '₹15,000',
    status: 'Active',
    duration: 'Jan 2024 - Dec 2024',
  },
  {
    id: '2',
    plotName: 'Sitapur Farm',
    ownerName: 'Amit Kumar',
    area: '5 Acres',
    monthlyRent: '₹30,000',
    status: 'Active',
    duration: 'Mar 2024 - Feb 2025',
  },
];

export default function MyLeasesScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Leases</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {DUMMY_LEASES.map((lease) => (
          <TouchableOpacity
            key={lease.id}
            style={styles.leaseCard}
            onPress={() => navigation.navigate('AgreementDetails')}
            activeOpacity={0.7}
          >
            <View style={styles.leaseHeader}>
              <View style={styles.leaseInfo}>
                <Text style={styles.plotName}>{lease.plotName}</Text>
                <Text style={styles.ownerName}>Owner: {lease.ownerName}</Text>
              </View>
              <View style={[styles.statusBadge, styles.statusActive]}>
                <Text style={styles.statusText}>{lease.status}</Text>
              </View>
            </View>

            <View style={styles.leaseDetails}>
              <View style={styles.detailRow}>
                <Icon name="straighten" size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>{lease.area}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="attach-money" size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>{lease.monthlyRent}/month</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="event" size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>{lease.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  scrollContent: {
    padding: spacing.xl,
  },
  leaseCard: {
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
  leaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  leaseInfo: {
    flex: 1,
  },
  plotName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  ownerName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  statusActive: {
    backgroundColor: colors.softGreen,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  leaseDetails: {
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
});
