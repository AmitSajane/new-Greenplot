import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/tokens';
import {
  OwnerHeader,
  ListYourLandBanner,
  DashboardStatsCard,
  TotalViewsCard,
  RecentActivityItem,
  FloatingMicButton,
  AlertsNotificationCard,
} from '../../../components/ownerHome';
import { SatelliteMonitoringCard } from '../../../components/satelliteMap';
import { LaborConnectCard } from '../../../components/laborConnect/LaborConnectCard';
import { SoilTestCard } from '../../../components/organisms/SoilTestCard';
import { OwnerHomeViewModel } from '../hooks/useOwnerHome';
import { ownerHomeStyles as styles } from '../styles/ownerHome.styles';
import { WorkReportCard } from './WorkReportCard';

export const OwnerHomeContent: React.FC<OwnerHomeViewModel> = (vm) => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <OwnerHeader
        name={vm.userName}
        hasNotifications={vm.hasNotifications}
        onNotificationPress={vm.onNotificationPress}
      />
      <ListYourLandBanner onPress={vm.onAddListing} />
      <SatelliteMonitoringCard onPress={vm.onSatellitePress} />
      <View style={styles.sectionGap} />
      <LaborConnectCard onPress={vm.onLaborPress} />
      <View style={styles.sectionGap} />
      <WorkReportCard onPress={vm.onWorkReportPress} />
      <View style={styles.sectionGap} />
      <SoilTestCard onPress={vm.onSoilTestPress} />
      <View style={styles.sectionHeader}>
        <Ionicons name="bar-chart" size={20} color={colors.primary} />
        <Text style={styles.sectionTitle}>My Dashboard</Text>
      </View>
      <View style={styles.statsRow}>
        <DashboardStatsCard
          icon="seedling"
          value={vm.dashboard.totalLands}
          label="Total Lands"
          onPress={vm.onDashboardStatPress}
        />
        <View style={styles.statsSpacer} />
        <DashboardStatsCard
          icon="document"
          value={vm.dashboard.activeLeasesCount}
          label="Active Leases"
          onPress={vm.onDashboardStatPress}
        />
      </View>
      <View style={styles.statsRow}>
        <DashboardStatsCard
          icon="cash"
          value={vm.dashboard.revenueDisplay}
          label="Revenue Earned"
          onPress={vm.onDashboardStatPress}
        />
        <View style={styles.statsSpacer} />
        <DashboardStatsCard
          icon="leaf"
          value={vm.dashboard.cropActivityCount}
          label="Crop Activity"
          onPress={vm.onDiseaseRiskPress}
        />
      </View>
      <View style={styles.quickActionsHeader}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      </View>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={vm.onAddListing}
          activeOpacity={0.8}
        >
          <View style={styles.quickActionIconWrap}>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </View>
          <Text style={styles.quickActionLabel}>Add Land</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={vm.onLeaseRequestsPress}
          activeOpacity={0.8}
        >
          <View style={styles.quickActionIconWrap}>
            <Ionicons name="document-text" size={28} color={colors.info} />
          </View>
          <Text style={styles.quickActionLabel}>Lease Requests</Text>
        </TouchableOpacity>
      </View>
      <TotalViewsCard views={vm.views} percentageChange={vm.viewsChangePct} />
      <View style={styles.recentActivityHeader}>
        <Text style={styles.recentActivityTitle}>Alerts & Notifications</Text>
        <Text style={styles.viewAllText} onPress={vm.onAlertsViewAll}>
          View All
        </Text>
      </View>
      <AlertsNotificationCard
        variant="approvals"
        title="Pending Approvals"
        description="3 budget requests need your approval"
        actionLabel="Review Now"
        onPress={vm.onBudgetApprovals}
      />
      <AlertsNotificationCard
        variant="disease"
        title="Disease Risk Alert"
        description="Early blight detected in tomato field - Bangalore North"
        actionLabel="View Details"
        onPress={vm.onDiseaseRiskPress}
      />
      <View style={styles.recentActivityHeader}>
        <Text style={styles.recentActivityTitle}>Recent Activity</Text>
        <Text style={styles.viewAllText} onPress={vm.onViewAllActivity}>
          View All
        </Text>
      </View>
      {vm.recentActivities.map((activity) => (
        <RecentActivityItem
          key={activity.id}
          type={activity.type}
          title={activity.title}
          description={activity.description}
          time={activity.time}
          avatarUrl={activity.avatarUrl}
          onPress={() => vm.onActivityPress(activity)}
          onCallBack={
            activity.phoneNumber
              ? () => vm.onCallBack(activity.phoneNumber!)
              : undefined
          }
        />
      ))}
    </ScrollView>
    <FloatingMicButton onPress={vm.onMicPress} />
  </SafeAreaView>
);
