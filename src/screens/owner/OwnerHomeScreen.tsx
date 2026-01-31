import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../../theme/tokens';
import { OwnerHomeStackParamList } from '../../navigation/OwnerHomeStack';
import { useAuth } from '../../context/AuthContext';
import { useFarmListings } from '../../context/FarmListingsContext';
import {
  OwnerHeader,
  ListYourLandBanner,
  DashboardStatsCard,
  TotalViewsCard,
  RecentActivityItem,
  FloatingMicButton,
} from '../../components/ownerHome';
import Ionicons from 'react-native-vector-icons/Ionicons';

type NavigationProp = NativeStackNavigationProp<OwnerHomeStackParamList>;

const RECENT_ACTIVITIES = [
  {
    id: '1',
    type: 'view' as const,
    title: 'Ramesh Kumar',
    description: 'Viewed your 2-acre Wheat plot...',
    time: '2 hours ago',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    type: 'call' as const,
    title: 'Missed Call',
    description: 'From +91 98*** ***12 regardin...',
    time: 'Yesterday',
    phoneNumber: '+919876543212',
  },
];

export default function OwnerHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { ownerListings } = useFarmListings();

  // Calculate dashboard data from actual listings
  const activeListingsCount = ownerListings.filter((l) => l.status === 'active').length;

  const handleAddListing = () => {
    navigation.navigate('AddFarm');
  };

  const handleActiveListingsPress = () => {
    const parent = (navigation as any).getParent();
    if (parent) {
      parent.navigate('MyProperties');
    }
  };

  const handleNotificationPress = () => {
    // Navigate to notifications
  };

  const handleActivityPress = (activity: (typeof RECENT_ACTIVITIES)[0]) => {
    // Handle activity item press
  };

  const handleCallBack = (phoneNumber: string) => {
    // Handle call back action
  };

  const handleMicPress = () => {
    // Handle voice assistant
  };

  const handleViewAll = () => {
    // Navigate to all activities
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <OwnerHeader
          name={user?.name || 'Rajesh'}
          hasNotifications={true}
          onNotificationPress={handleNotificationPress}
        />

        {/* List Your Land Banner */}
        <ListYourLandBanner onPress={handleAddListing} />

        {/* My Dashboard Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="bar-chart" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>My Dashboard</Text>
        </View>

        {/* Stats Cards Row */}
        <View style={styles.statsRow}>
          <DashboardStatsCard
            icon="seedling"
            value={activeListingsCount}
            label="Active Listings"
            onPress={handleActiveListingsPress}
          />
          <View style={styles.statsSpacer} />
          <DashboardStatsCard
            icon="tractor"
            value={5}
            label="New Calls"
            showBadge={true}
          />
        </View>

        {/* Total Views Card */}
        <TotalViewsCard
          views={142}
          percentageChange={12}
        />

        {/* Recent Activity Section */}
        <View style={styles.recentActivityHeader}>
          <Text style={styles.recentActivityTitle}>Recent Activity</Text>
          <Text style={styles.viewAllText} onPress={handleViewAll}>
            View All
          </Text>
        </View>

        {/* Activity Items */}
        {RECENT_ACTIVITIES.map((activity) => (
          <RecentActivityItem
            key={activity.id}
            type={activity.type}
            title={activity.title}
            description={activity.description}
            time={activity.time}
            avatarUrl={activity.avatarUrl}
            onPress={() => handleActivityPress(activity)}
            onCallBack={
              activity.phoneNumber ? () => handleCallBack(activity.phoneNumber!) : undefined
            }
          />
        ))}
      </ScrollView>

      {/* Floating Mic Button */}
      <FloatingMicButton onPress={handleMicPress} />
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  statsSpacer: {
    width: spacing.md,
  },
  recentActivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  recentActivityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
});
