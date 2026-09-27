import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../../theme/tokens';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { SearchBar } from '../../components/molecules/SearchBar';
import { FilterChipRow } from '../../components/molecules/FilterChipRow';
import { EmptyState } from '../../components/molecules/EmptyState';
import { useFarmListings } from '../../context/FarmListingsContext';
import { AvailableFarmCard } from '../farmerHome/components/sections/AvailableFarmCard';
import type { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';

// Mirrors the soil options already offered on the legacy lease marketplace's
// filter panel (components/leases/LandFiltersPanel.tsx) — same option set,
// not a new filtering system.
const SOIL_FILTERS = ['All', 'Black Soil', 'Alluvial Soil', 'Red Soil', 'Clay Soil', 'Sandy Soil'] as const;

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'FarmsAvailableForManagement'>;

export default function FarmsAvailableForManagementScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { availableForManagement } = useFarmListings();
  const [query, setQuery] = useState('');
  const [soilFilter, setSoilFilter] = useState<typeof SOIL_FILTERS[number]>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return availableForManagement.filter(farm => {
      if (soilFilter !== 'All' && farm.soilType !== soilFilter) return false;
      if (!q) return true;
      return (
        farm.title.toLowerCase().includes(q) ||
        farm.location.toLowerCase().includes(q) ||
        farm.soilType.toLowerCase().includes(q) ||
        (farm.currentCrop ?? '').toLowerCase().includes(q)
      );
    });
  }, [availableForManagement, query, soilFilter]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Farms Available for Management" onBack={() => navigation.goBack()} />
      <View style={styles.filters}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, location, soil, crop"
        />
        <FilterChipRow options={SOIL_FILTERS} selected={soilFilter} onSelect={setSoilFilter} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <AvailableFarmCard farm={item} onPress={id => navigation.navigate('FarmDetail', { farmId: id })} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="shield-checkmark-outline"
            title="No Farms Available"
            subtitle="There are currently no verified farms available for management."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filters: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  listContent: {
    padding: spacing.xl,
    flexGrow: 1,
  },
});
