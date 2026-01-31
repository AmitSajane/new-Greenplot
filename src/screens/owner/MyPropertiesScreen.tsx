import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, radius, spacing } from '../../theme/tokens';
import { OwnerTabParamList } from '../../navigation/OwnerTabNavigator';
import { OwnerHomeStackParamList } from '../../navigation/OwnerHomeStack';
import { useFarmListings } from '../../context/FarmListingsContext';
import { useAuth } from '../../context/AuthContext';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<OwnerTabParamList, 'MyProperties'>,
  NativeStackNavigationProp<OwnerHomeStackParamList>
>;

export default function MyPropertiesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { ownerListings } = useFarmListings();
  const { user } = useAuth();

  // Filter listings for current owner (in real app, filter by user.id)
  const myListings = ownerListings.filter(
    (listing) => listing.ownerId === user?.id || listing.status === 'active'
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Properties</Text>
        <Text style={styles.headerSubtitle}>{myListings.length} active listings</Text>
      </View>

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
            onPress={() => {
              // Navigate through the tab navigator to the home stack
              const parent = navigation.getParent();
              if (parent) {
                (parent as any).navigate('OwnerHome', {
                  screen: 'AgreementDetails',
                });
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.propertyHeader}>
              <View style={styles.propertyInfo}>
                <Text style={styles.plotName}>{property.title}</Text>
                <Text style={styles.location}>
                  {property.location}, {property.district}, {property.state}
                </Text>
              </View>
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
