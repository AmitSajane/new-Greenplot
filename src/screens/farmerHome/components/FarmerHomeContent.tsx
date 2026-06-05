import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeTopBar } from '../../../components/farmerHome/HomeTopBar';
import { SearchBar } from '../../../components/farmerHome/SearchBar';
import { WeatherCard } from '../../../components/farmerHome/WeatherCard';
import { MyActiveLeasesCard } from '../../../components/farmerHome/MyActiveLeasesCard';
import { DashboardMetricsSection } from '../../../components/farmerHome/organisms/DashboardMetricsSection';
import { FindLandSection } from '../../../components/farmerHome/organisms/FindLandSection';
import { QuickActionsSection } from '../../../components/farmerHome/organisms/QuickActionsSection';
import { FeaturedListingsSection } from '../../../components/farmerHome/organisms/FeaturedListingsSection';
import { NewsUpdatesSection } from '../../../components/farmerHome/organisms/NewsUpdatesSection';
import { ActivitySection } from '../../../components/farmerHome/organisms/ActivitySection';
import { BrowseByCropSection } from '../../../components/farmerHome/organisms/BrowseByCropSection';
import { SatelliteMonitoringCard } from '../../../components/satelliteMap';
import { LaborConnectCard } from '../../../components/laborConnect/LaborConnectCard';
import { SoilTestCard } from '../../../components/organisms/SoilTestCard';
import { FarmerHomeViewModel } from '../hooks/useFarmerHome';
import { farmerHomeStyles as styles } from '../styles/farmerHome.styles';

export const FarmerHomeContent: React.FC<FarmerHomeViewModel> = (vm) => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <HomeTopBar
        name={vm.userName}
        locationLabel={vm.locationLabel}
        onMenuPress={vm.onMenuPress}
        onLanguagePress={vm.onLanguagePress}
        onNotificationsPress={vm.onNotificationsPress}
      />
      <View style={styles.heroTitleSpacer} />
      <SearchBar value={vm.query} onChangeText={vm.setQuery} onMicPress={vm.onMicPress} />
      <View style={styles.sectionGap} />
      <WeatherCard
        temperatureC={32}
        conditionLabel="Sunny & Dry"
        descriptionLabel="Good day for harvesting"
        locationLabel="Purnea"
        humidityPct={45}
        windKmh={12}
        forecast={[
          { id: 'f1', day: 'Tomorrow', icon: 'sunny', tempC: 30 },
          { id: 'f2', day: 'Wed', icon: 'rainy', tempC: 28 },
          { id: 'f3', day: 'Thu', icon: 'rainy', tempC: 26 },
        ]}
      />
      <View style={styles.sectionGap} />
      <MyActiveLeasesCard
        title="My Active Leases"
        subtitle="चालू पट्टे"
        countLabel="2 Agreements Active"
        ctaLabel="TAP TO VIEW"
        onPress={vm.onMyLeasesPress}
      />
      <View style={styles.sectionGap} />
      <DashboardMetricsSection
        onNavigateToLeases={vm.onLeasesMetrics}
        onNavigateToCrops={vm.onCropsMetrics}
        onNavigateToTasks={vm.onTasksMetrics}
        onNavigateToLabor={vm.onLaborPress}
      />
      <View style={styles.sectionGap} />
      <FindLandSection
        chips={vm.nearbyChips}
        selectedLabel={vm.selectedNearby}
        onSelect={vm.setSelectedNearby}
      />
      <View style={styles.sectionGap} />
      <SatelliteMonitoringCard onPress={vm.onSatellitePress} />
      <View style={styles.sectionGap} />
      <LaborConnectCard onPress={vm.onLaborPress} />
      <View style={styles.sectionGap} />
      <SoilTestCard onPress={vm.onSoilTestPress} />
      <View style={styles.sectionGap} />
      <QuickActionsSection actions={vm.quickActions} />
      <View style={styles.sectionGap} />
      <FeaturedListingsSection
        listings={vm.featuredListings}
        onViewAll={vm.onViewAllLands}
        onListingPress={vm.onListingPress}
      />
      <View style={styles.sectionGap} />
      <NewsUpdatesSection news={vm.news} onNewsPress={vm.onNewsPress} />
      <View style={styles.sectionGap} />
      <ActivitySection
        activities={vm.activities}
        onViewAll={vm.onActivityPress}
        onActivityPress={vm.onActivityPress}
      />
      <View style={styles.sectionGap} />
      <BrowseByCropSection crops={vm.browseCrops} onCropPress={vm.onCropPress} />
    </ScrollView>
  </SafeAreaView>
);
