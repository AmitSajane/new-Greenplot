import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ListEmptyState } from '../components/shifts/ListEmptyState';
import { ShiftCard } from '../components/shifts/ShiftCard';
import { useShifts } from '../context/ShiftsContext';
import { colors, radius, spacing } from '../theme/tokens';
import { groupShiftsByDate, getUniqueCities } from '../utils/shiftUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

const ALL_CITIES = 'all';

export default function AvailableShiftsScreen() {
  const {
    shifts,
    loading,
    refreshing,
    refresh,
    bookShift,
    cancelShift,
    pendingActions,
  } = useShifts();
  const [selectedCity, setSelectedCity] = useState<string>(ALL_CITIES);

  const cities = useMemo(
    () => [ALL_CITIES, ...getUniqueCities(shifts)],
    [shifts],
  );

  const filtered = useMemo(() => {
    return selectedCity === ALL_CITIES
      ? shifts
      : shifts.filter((shift) => shift.city === selectedCity);
  }, [shifts, selectedCity]);

  const sections = useMemo(() => groupShiftsByDate(filtered), [filtered]);

  const handleBook = async (shiftId: string) => {
    try {
      await bookShift(shiftId);
    } catch (error) {
      Alert.alert(
        'Unable to book',
        error instanceof Error ? error.message : 'Please try again later.',
      );
    }
  };

  const handleCancel = async (shiftId: string) => {
    try {
      await cancelShift(shiftId);
    } catch (error) {
      Alert.alert(
        'Unable to cancel',
        error instanceof Error ? error.message : 'Please try again later.',
      );
    }
  };

  const renderCityPill = (city: string) => {
    const selected = selectedCity === city;
    return (
      <Pressable
        key={city}
        style={[styles.cityPill, selected && styles.cityPillActive]}
        onPress={() => setSelectedCity(city)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <Text
          style={[
            styles.cityPillLabel,
            selected && styles.cityPillLabelActive,
          ]}
        >
          {city === ALL_CITIES ? 'All cities' : city}
        </Text>
      </Pressable>
    );
  };

  const renderActionLabel = (booked: boolean) =>
    booked ? 'Cancel Shift' : 'Book Shift';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
    <View style={styles.screen}>
      <Text style={styles.title}>Available Shifts</Text>
      <Text style={styles.subtitle}>
        Filter by city and book the shifts that fit your schedule.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {cities.map(renderCityPill)}
      </ScrollView>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionMeta}>
              {section.data.length} shifts
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ShiftCard
            shift={item}
            actionLabel={renderActionLabel(item.booked)}
            actionVariant={item.booked ? 'secondary' : 'primary'}
            onAction={() =>
              item.booked ? handleCancel(item.id) : handleBook(item.id)
            }
            disabled={Boolean(pendingActions[item.id])}
            isLoading={
              pendingActions[item.id] === 'book' ||
              pendingActions[item.id] === 'cancel'
            }
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          sections.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <ListEmptyState
              title="No shifts match this filter"
              description="Try selecting a different city or refresh the feed."
            />
          ) : null
        }
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterScroll: {
    // marginBottom: spacing.lg,
    // marginTop: spacing.lg,
  },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  filterRow: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  cityPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    height: 40,
  },
  cityPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    paddingVertical: 5,
  },
  cityPillLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 5,
    textAlignVertical: 'center',
  },
  cityPillLabelActive: {
    color: '#fff',

  },
  listContent: {
    paddingBottom: spacing.xxl * 2,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

