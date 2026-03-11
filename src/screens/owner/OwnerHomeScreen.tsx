import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../../theme/tokens';
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
  AlertsNotificationCard,
} from '../../components/ownerHome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SatelliteMonitoringCard } from '../../components/satelliteMap';
import { LaborConnectCard } from '../../components/laborConnect/LaborConnectCard';

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
  const totalLands = ownerListings.length;
  const activeLeasesCount = ownerListings.filter((l) => l.status === 'leased').length;
  const activeListingsCount = ownerListings.filter((l) => l.status === 'active').length;
  const revenueEarned = ownerListings
    .filter((l) => l.lastYearEarnings)
    .reduce((sum, l) => sum + parseInt((l.lastYearEarnings || '0').replace(/[^0-9]/g, ''), 10), 0);
  const revenueDisplay = revenueEarned >= 100000 ? `₹${(revenueEarned / 100000).toFixed(1)}L` : revenueEarned >= 1000 ? `₹${(revenueEarned / 1000).toFixed(0)}k` : `₹${revenueEarned}`;
  const cropActivityCount = ownerListings.filter((l) => l.currentCrop || l.lastYearCrop).length;

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
    navigation.navigate('NotificationsCenter');
  };

  const handleActivityPress = (activity: (typeof RECENT_ACTIVITIES)[0]) => {
    // Handle activity item press
  };

  const handleCallBack = (phoneNumber: string) => {
    // Handle call back action
  };

  const handleMicPress = () => {
    navigation.navigate('AIAssistant');
  };

  const handleViewAll = () => {
    // Navigate to all activities
  };

  const handleBudgetApprovals = () => {
    navigation.navigate('BudgetApprovals');
  };

  const handleDiseaseRiskDetails = () => {
    navigation.navigate('MyCrops');
  };

  const handleAlertsViewAll = () => {
    // Could navigate to a dedicated Alerts list screen
    navigation.navigate('BudgetApprovals');
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

        {/* Satellite Monitoring Card */}
        <SatelliteMonitoringCard onPress={() => navigation.navigate('SatelliteMap')} />

        {/* Labor Connect Card */}
        <View style={{ height: spacing.lg }} />
        <LaborConnectCard onPress={() => navigation.navigate('LaborConnect')} />

        <View style={{ height: spacing.lg }} />
        <TouchableOpacity
          style={styles.reportCard}
          onPress={() => navigation.navigate('OwnerWorkReport')}
        >
          <View style={styles.reportIconCircle}>
            <Ionicons name="document-text" size={24} color={colors.primary} />
          </View>
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>Work Report</Text>
            <Text style={styles.reportSubtitle}>Land → Crop → Work → Labor</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        {/* My Dashboard Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="bar-chart" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>My Dashboard</Text>
        </View>

        {/* Stats Cards Row - 2x2 grid */}
        <View style={styles.statsRow}>
          <DashboardStatsCard
            icon="seedling"
            value={totalLands}
            label="Total Lands"
            onPress={handleActiveListingsPress}
          />
          <View style={styles.statsSpacer} />
          <DashboardStatsCard
            icon="document"
            value={activeLeasesCount}
            label="Active Leases"
            onPress={handleActiveListingsPress}
          />
        </View>
        <View style={styles.statsRow}>
          <DashboardStatsCard
            icon="cash"
            value={revenueDisplay}
            label="Revenue Earned"
            onPress={handleActiveListingsPress}
          />
          <View style={styles.statsSpacer} />
          <DashboardStatsCard
            icon="leaf"
            value={cropActivityCount}
            label="Crop Activity"
            onPress={handleDiseaseRiskDetails}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsHeader}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleAddListing} activeOpacity={0.8}>
            <View style={styles.quickActionIconWrap}>
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Add Land</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => (navigation as any).getParent()?.navigate('MyProperties')} activeOpacity={0.8}>
            <View style={styles.quickActionIconWrap}>
              <Ionicons name="document-text" size={28} color={colors.info} />
            </View>
            <Text style={styles.quickActionLabel}>Lease Requests</Text>
          </TouchableOpacity>
        </View>

        {/* Total Views Card */}
        <TotalViewsCard
          views={142}
          percentageChange={12}
        />

        {/* Alerts & Notifications Section */}
        <View style={styles.recentActivityHeader}>
          <Text style={styles.recentActivityTitle}>Alerts & Notifications</Text>
          <Text style={styles.viewAllText} onPress={handleAlertsViewAll}>
            View All
          </Text>
        </View>
        <AlertsNotificationCard
          variant="approvals"
          title="Pending Approvals"
          description="3 budget requests need your approval"
          actionLabel="Review Now"
          onPress={handleBudgetApprovals}
        />
        <AlertsNotificationCard
          variant="disease"
          title="Disease Risk Alert"
          description="Early blight detected in tomato field - Bangalore North"
          actionLabel="View Details"
          onPress={handleDiseaseRiskDetails}
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
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reportIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  reportContent: { flex: 1 },
  reportTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  reportSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  quickActionsHeader: { marginTop: spacing.lg, marginBottom: spacing.md },
  quickActionsTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  quickActionsRow: { flexDirection: 'row', gap: spacing.md },
  quickActionBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionIconWrap: { marginBottom: spacing.sm },
  quickActionLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
});
