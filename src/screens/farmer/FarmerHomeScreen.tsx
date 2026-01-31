import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../../theme/tokens';
import { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';
import { useAuth } from '../../context/AuthContext';
import { useFarmListings } from '../../context/FarmListingsContext';
import { HomeTopBar } from '../../components/farmerHome/HomeTopBar';
import { SearchBar } from '../../components/farmerHome/SearchBar';
import { WeatherCard } from '../../components/farmerHome/WeatherCard';
import { MyActiveLeasesCard } from '../../components/farmerHome/MyActiveLeasesCard';
import { SectionHeader } from '../../components/farmerHome/SectionHeader';
import { Chip } from '../../components/farmerHome/Chip';
import { QuickActionsGrid } from '../../components/farmerHome/QuickActionsGrid';
import { FeaturedListingCard } from '../../components/farmerHome/FeaturedListingCard';
import { NewsUpdateRow } from '../../components/farmerHome/NewsUpdateRow';
import { ActivityCard } from '../../components/farmerHome/ActivityCard';
import { BrowseByCropRow } from '../../components/farmerHome/BrowseByCropRow';
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
          onMenuPress={() => {}}
          onLanguagePress={() => {}}
          onNotificationsPress={() => {}}
        />

        <View style={styles.heroTitleSpacer} />

        <SearchBar value={query} onChangeText={setQuery} onMicPress={() => {}} />

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

        <SectionHeader title="Find Land Near You" />
        <View style={styles.chipsRow}>
          {nearbyChips.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              selected={selectedNearby === c.label}
              onPress={() => setSelectedNearby(c.label)}
            />
          ))}
        </View>

        <View style={styles.sectionGap} />

        <SectionHeader title="Quick Actions" />
        <View style={styles.quickActionsSpacer} />
        <QuickActionsGrid
          actions={[
            {
              id: 'qa1',
              label: 'List My Land',
              icon: 'add-circle-outline',
              tint: 'green',
              onPress: () => {},
            },
            {
              id: 'qa2',
              label: 'My Leases',
              icon: 'document-text-outline',
              tint: 'blue',
              onPress: () => navigation.navigate('MyActiveLeases'),
            },
            {
              id: 'qa3',
              label: 'Messages',
              icon: 'mail-outline',
              tint: 'orange',
              onPress: () => {},
            },
            {
              id: 'qa4',
              label: 'Help',
              icon: 'help-circle-outline',
              tint: 'purple',
              onPress: () => {},
            },
          ]}
        />

        <View style={styles.sectionGap} />

        <SectionHeader
          title="Featured Listings"
          actionLabel="View All"
          onActionPress={() => navigation.navigate('AllAvailableLands')}
        />
        <View style={styles.listSpacer} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={featuredListings}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.hListContent}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={({ item }) => (
            <FeaturedListingCard
              item={item}
              onPress={() => navigation.navigate('FarmDetail', { farmId: item.id })}
            />
          )}
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews
        />

        <View style={styles.sectionGap} />

        <SectionHeader title="News & Updates" />
        <View style={styles.listSpacer} />
        <View style={styles.vList}>
          {NEWS_UPDATES.map((n) => (
            <View key={n.id} style={styles.vListItem}>
              <NewsUpdateRow item={n} onPress={() => {}} />
            </View>
          ))}
        </View>

        <View style={styles.sectionGap} />

        <SectionHeader title="Your Activity" actionLabel="View All" onActionPress={() => {}} />
        <View style={styles.listSpacer} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={YOUR_ACTIVITY}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.hListContent}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={({ item }) => <ActivityCard item={item} onPress={() => {}} />}
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews
        />

        <View style={styles.sectionGap} />

        <SectionHeader title="Browse Land by Crop" />
        <View style={styles.listSpacer} />
        <BrowseByCropRow crops={BROWSE_BY_CROP} onCropPress={() => {}} />
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickActionsSpacer: {
    height: spacing.md,
  },
  listSpacer: {
    height: spacing.md,
  },
  hListContent: {
    paddingRight: spacing.xl,
  },
  vList: {
    gap: spacing.md,
  },
  vListItem: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});
