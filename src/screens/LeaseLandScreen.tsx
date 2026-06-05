import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';
import { Header } from '../components/leaseLand/Header';
import { SearchBar } from '../components/leaseLand/SearchBar';
import { ActionButtonsRow } from '../components/leaseLand/ActionButtonsRow';
import { LandCard } from '../components/leaseLand/LandCard';
import { TipsCard } from '../components/leaseLand/TipsCard';
import { BannerCard } from '../components/leaseLand/BannerCard';

interface LandListing {
  id: string;
  title: string;
  acres: string;
  location: string;
  tenure: string;
  imageUrl: string;
}

const BLACK_SOIL_LANDS: LandListing[] = [
  {
    id: '1',
    title: 'Black Soil Land',
    acres: '10 Acres',
    location: 'Jategaon, Maharashtra',
    tenure: 'Tenure 5 years',
    imageUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: 'Black Soil Land',
    acres: '7 Acres',
    location: 'Dhulwad, Maharashtra',
    tenure: 'Tenure 10 years',
    imageUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: 'Black Soil Land',
    acres: '15 Acres',
    location: 'Mangle, Maharashtra',
    tenure: 'Tenure 15 years',
    imageUrl:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
  },
];

const MAHARASHTRA_LANDS: LandListing[] = [
  {
    id: '4',
    title: 'Jalodh Soil Land',
    acres: '4 Acres',
    location: 'Buldana, Maharashtra',
    tenure: 'Tenure 5 years',
    imageUrl:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
  },
  {
    id: '5',
    title: 'Black Soil Land',
    acres: '8 Acres',
    location: 'Hingoli, Maharashtra',
    tenure: 'Tenure 5 years',
    imageUrl:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
  },
  {
    id: '6',
    title: 'Red Soil Land',
    acres: '10 Acres',
    location: 'Jalna, Maharashtra',
    tenure: 'Tenure 15 years',
    imageUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
  },
];

const NEAR_ME_LANDS: LandListing[] = [
  {
    id: '7',
    title: 'Alluvial Soil Land',
    acres: '12 Acres',
    location: 'Pune, Maharashtra',
    tenure: 'Tenure 7 years',
    imageUrl:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
  },
  {
    id: '8',
    title: 'Black Soil Land',
    acres: '6 Acres',
    location: 'Nashik, Maharashtra',
    tenure: 'Tenure 5 years',
    imageUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  },
  {
    id: '9',
    title: 'Red Soil Land',
    acres: '9 Acres',
    location: 'Aurangabad, Maharashtra',
    tenure: 'Tenure 10 years',
    imageUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
  },
  {
    id: '10',
    title: 'Black Soil Land',
    acres: '11 Acres',
    location: 'Kolhapur, Maharashtra',
    tenure: 'Tenure 8 years',
    imageUrl:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
  },
];

const MEMBERSHIP_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop';

const SUSTAINABLE_FARMING_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop';

export default function LeaseLandScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header
          onProfilePress={() => {}}
          onAddPostPress={() => {}}
        />
        <SearchBar
          onSearchPress={() => {}}
          onNearMePress={() => {}}
        />
        <ActionButtonsRow
          onJoinMembershipPress={() => {}}
          onPostAdvertisementPress={() => {}}
          onNotificationsPress={() => {}}
        />

        {/* Section 1: Agriculture Lease Lands Black Soil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Agriculture Lease Lands Black Soil
          </Text>
          <View style={styles.grid}>
            {BLACK_SOIL_LANDS.map((land) => (
              <View key={land.id} style={styles.gridItem}>
                <LandCard
                  title={land.title}
                  acres={land.acres}
                  location={land.location}
                  tenure={land.tenure}
                  imageUrl={land.imageUrl}
                  onPress={() => {}}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Section 2: Agriculture Lease Lands in Maharashtra */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Agriculture Lease Lands in Maharashtra
          </Text>
          <View style={styles.grid}>
            {MAHARASHTRA_LANDS.map((land) => (
              <View key={land.id} style={styles.gridItem}>
                <LandCard
                  title={land.title}
                  acres={land.acres}
                  location={land.location}
                  tenure={land.tenure}
                  imageUrl={land.imageUrl}
                  onPress={() => {}}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Section 3: Membership Banner */}
        <View style={styles.section}>
          <BannerCard
            title="NO PROBLEM! DO LEASE ON-TIME"
            subtitle="Join Membership"
            imageUrl={MEMBERSHIP_BANNER_IMAGE}
            onPress={() => {}}
          />
        </View>

        {/* Section 4: Agriculture Lease Lands Near me */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Agriculture Lease Lands Near me
          </Text>
          <View style={styles.grid}>
            {NEAR_ME_LANDS.map((land) => (
              <View key={land.id} style={styles.gridItem}>
                <LandCard
                  title={land.title}
                  acres={land.acres}
                  location={land.location}
                  tenure={land.tenure}
                  imageUrl={land.imageUrl}
                  onPress={() => {}}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Section 5: Farming Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farming Tips</Text>
          <TipsCard
            title="Farming Made Easy with Simple Expert Tricks"
            onPress={() => {}}
          />
        </View>

        {/* Section 6: Sustainable Farming Banner */}
        <View style={styles.section}>
          <BannerCard
            title="Sustainable Farming"
            subtitle="Next Generation of Growers"
            buttonText="Explore Now"
            imageUrl={SUSTAINABLE_FARMING_BANNER_IMAGE}
            onPress={() => {}}
          />
        </View>
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
    paddingBottom: spacing.xxl,
  },
  section: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: spacing.sm,
  },
});

