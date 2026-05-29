import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../../theme/tokens';
import { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';
import { useAuth } from '../../context/AuthContext';
import { useFarmListings } from '../../context/FarmListingsContext';
import { HomeTopBar } from '../../components/farmerHome/HomeTopBar';
import { SearchBar } from '../../components/farmerHome/SearchBar';
import { WeatherCard } from '../../components/farmerHome/WeatherCard';
import { MyActiveLeasesCard } from '../../components/farmerHome/MyActiveLeasesCard';
import { DashboardMetricsSection } from '../../components/farmerHome/organisms/DashboardMetricsSection';
import { FindLandSection } from '../../components/farmerHome/organisms/FindLandSection';
import { QuickActionsSection } from '../../components/farmerHome/organisms/QuickActionsSection';
import { FeaturedListingsSection } from '../../components/farmerHome/organisms/FeaturedListingsSection';
import { NewsUpdatesSection } from '../../components/farmerHome/organisms/NewsUpdatesSection';
import { ActivitySection } from '../../components/farmerHome/organisms/ActivitySection';
import { BrowseByCropSection } from '../../components/farmerHome/organisms/BrowseByCropSection';
import { SatelliteMonitoringCard } from '../../components/satelliteMap';
import { LaborConnectCard } from '../../components/laborConnect/LaborConnectCard';
import { SoilTestCard } from '../../components/organisms/SoilTestCard';
import {
  BROWSE_BY_CROP,
  HomeFeaturedListing,
  NEWS_UPDATES,
  YOUR_ACTIVITY,
} from '../../constants/farmerHomeMockData';

type NavigationProp = NativeStackNavigationProp<
  FarmerHomeStackParamList,
  'FarmerHome'
>;

export default function FarmerHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { getFeaturedListings } = useFarmListings();
  const [query, setQuery] = useState('');
  const [selectedNearby, setSelectedNearby] = useState<'Nearby' | 'Purnea' | 'Katihar'>('Nearby');

  // Transform farm listings to the format expected by FeaturedListingCard
  const featuredListings: HomeFeaturedListing[] = useMemo(() => {
    const listings = getFeaturedListings();
    return listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      pricePerYear: listing.pricePerYear,
      locationLabel: listing.locationLabel || `${listing.location}, ${listing.district}`,
      acresLabel: listing.acresLabel || `${listing.acres} Acres`,
      image: { uri: listing.imageUrl },
      leaseType: listing.leaseType,
    }));
  }, [getFeaturedListings]);

  const nearbyChips = useMemo(
    () =>
    ([
      { id: 'nearby', label: 'Nearby' as const },
      { id: 'purnea', label: 'Purnea' as const },
      { id: 'katihar', label: 'Katihar' as const },
    ] as const),
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeTopBar
          name={user?.name || 'Rajesh'}
          locationLabel={(user as any)?.location || 'Purnea, Bihar'}
          onMenuPress={() => { }}
          onLanguagePress={() => { }}
          onNotificationsPress={() => navigation.navigate('NotificationsCenter')}
        />

        <View style={styles.heroTitleSpacer} />

        <SearchBar
          value={query}
          onChangeText={setQuery}
          onMicPress={() => navigation.navigate('AIAssistant')}
        />

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
          onPress={() => navigation.navigate('MyActiveLeases')}
        />

        <View style={styles.sectionGap} />

        <DashboardMetricsSection
          onNavigateToLeases={() => navigation.navigate('MyActiveLeases')}
          onNavigateToCrops={() => (navigation as any).navigate('MyCrops')}
          onNavigateToTasks={() => navigation.navigate('LaborConnect')}
          onNavigateToLabor={() => navigation.navigate('LaborConnect')}
        />

        <View style={styles.sectionGap} />

        <FindLandSection
          chips={nearbyChips}
          selectedLabel={selectedNearby}
          onSelect={setSelectedNearby}
        />

        <View style={styles.sectionGap} />

        <SatelliteMonitoringCard onPress={() => navigation.navigate('SatelliteMap')} />

        <View style={styles.sectionGap} />

        <LaborConnectCard onPress={() => navigation.navigate('LaborConnect')} />

        <View style={styles.sectionGap} />

        <SoilTestCard onPress={() => navigation.navigate('SoilTest')} />

        <View style={styles.sectionGap} />

        <QuickActionsSection
          actions={[
            {
              id: 'qa1',
              label: 'Add Crop',
              icon: 'add-circle-outline',
              tint: 'green',
              onPress: () => (navigation.getParent() as any)?.navigate('MyCrops'),
            },
            {
              id: 'qa2',
              label: 'Create Work',
              icon: 'document-text-outline',
              tint: 'blue',
              onPress: () => (navigation.getParent() as any)?.navigate('MyCrops'),
            },
            {
              id: 'qa3',
              label: 'Hire Labor',
              icon: 'mail-outline',
              tint: 'orange',
              onPress: () => navigation.navigate('LaborConnect'),
            },
            {
              id: 'qa4',
              label: 'Lease Status',
              icon: 'help-circle-outline',
              tint: 'purple',
              onPress: () => navigation.navigate('LeaseStatus'),
            },
          ]}
        />

        <View style={styles.sectionGap} />

        <FeaturedListingsSection
          listings={featuredListings}
          onViewAll={() => (navigation as any).navigate('AllAvailableLands')}
          onListingPress={(id) => navigation.navigate('FarmDetail', { farmId: id })}
        />

        <View style={styles.sectionGap} />

        <NewsUpdatesSection
          news={NEWS_UPDATES}
          onNewsPress={() => { }}
        />

        <View style={styles.sectionGap} />

        <ActivitySection
          activities={YOUR_ACTIVITY}
          onViewAll={() => { }}
          onActivityPress={() => { }}
        />

        <View style={styles.sectionGap} />

        <BrowseByCropSection
          crops={BROWSE_BY_CROP}
          onCropPress={() => { }}
        />
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroTitleSpacer: {
    height: spacing.md,
  },
  sectionGap: {
    height: spacing.lg,
  },
});
