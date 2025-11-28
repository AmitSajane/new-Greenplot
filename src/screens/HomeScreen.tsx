import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardButton } from '../components/dashboard/DashboardButton';
import { HighlightInfoCard } from '../components/dashboard/HighlightInfoCard';
import { ListingCard } from '../components/dashboard/ListingCard';
import { TabSwitcher } from '../components/dashboard/TabSwitcher';
import { colors, radius, spacing } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ACTIVE_LISTINGS = [
  {
    id: '1',
    status: 'Active',
    title: '5 Acres in Ramgarh',
    subtitle: 'For Rent',
    imageUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    status: 'Active',
    title: '12 Acres in Sitapur',
    subtitle: 'For Sale',
    imageUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
  },
];

const PAST_LISTINGS: typeof ACTIVE_LISTINGS = [];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const listingsToDisplay = useMemo(
    () => (activeTab === 'active' ? ACTIVE_LISTINGS : PAST_LISTINGS),
    [activeTab],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader name="Ramesh" />
        <DashboardButton
          label="List Your Land"
          onPress={() => {}}
          style={styles.primaryCta}
          textStyle={styles.primaryCtaLabel}
        />

        <View style={styles.infoCards}>
          <HighlightInfoCard
            iconLabel="📄"
            title="Lease Agreements"
            description="View and manage your 3 active digital rent agreements."
            actionLabel="View Agreements"
            badgeLabel="3 active"
            onPress={() => {}}
          />
          <View style={styles.cardSpacer} />
          <HighlightInfoCard
            iconLabel="💬"
            title="New Inquiries"
            description="You have 2 new messages from interested people."
            actionLabel="View Messages"
            accentColor={colors.warning}
            badgeLabel="2 new"
            onPress={() => {}}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Land Listings</Text>
        </View>

        <TabSwitcher
          tabs={[
            { key: 'active', label: 'Active' },
            { key: 'past', label: 'Past' },
          ]}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'active' | 'past')}
        />

        {listingsToDisplay.length ? (
          listingsToDisplay.map((listing) => (
            <ListingCard
              key={listing.id}
              status={listing.status}
              title={listing.title}
              subtitle={listing.subtitle}
              imageUrl={listing.imageUrl}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No listings yet</Text>
            <Text style={styles.emptyStateDescription}>
              Past listings will show up here once they are archived.
            </Text>
            <Ionicons name="add-circle" size={24} color="black" />
            <Text style={styles.emptyStateDescription}>
              Past listings will show up here once they are archived.
            </Text>
            <Ionicons name="add-circle" size={24} color="black" />
            <Text style={styles.emptyStateDescription}>
              Past listings will show up here once they are archived.
            </Text>
            <Ionicons name="add-circle" size={24} color="black" />
          </View>
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
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  primaryCta: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  primaryCtaLabel: {
    fontSize: 18,
  },
  infoCards: {
    marginBottom: spacing.xl,
  },
  cardSpacer: {
    height: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyStateDescription: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
