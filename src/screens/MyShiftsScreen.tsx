import React, { useMemo } from 'react';
import {
  Alert,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ListEmptyState } from '../components/shifts/ListEmptyState';
import { ShiftCard } from '../components/shifts/ShiftCard';
import { useShifts } from '../context/ShiftsContext';
import { colors, spacing } from '../theme/tokens';
import { groupShiftsByDate, formatShiftTimeRange } from '../utils/shiftUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyShiftsScreen() {
  const {
    shifts,
    loading,
    refreshing,
    refresh,
    cancelShift,
    pendingActions,
  } = useShifts();

  const bookedSections = useMemo(
    () =>
      groupShiftsByDate(shifts.filter((shift) => shift.booked)),
    [shifts],
  );

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

  const confirmCancelShift = (shiftId: string, shiftLabel: string) => {
    Alert.alert(
      'Cancel this shift?',
      shiftLabel,
      [
        { text: 'Keep shift', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: () => handleCancel(shiftId),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.screen}>
      <Text style={styles.title}>My Shifts</Text>
      <Text style={styles.subtitle}>
        Track the shifts you have already booked.
      </Text>

      <SectionList
        sections={bookedSections}
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
            actionLabel="Cancel Shift"
            actionVariant="secondary"
            onAction={() =>
              confirmCancelShift(
                item.id,
                `${item.role} @ ${item.facility}\n${formatShiftTimeRange(item)}`,
              )
            }
            disabled={Boolean(pendingActions[item.id])}
            isLoading={pendingActions[item.id] === 'cancel'}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          bookedSections.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <ListEmptyState
              title="No shifts booked yet"
              description="Browse available shifts and tap book to add them here."
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
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.xxl,
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

