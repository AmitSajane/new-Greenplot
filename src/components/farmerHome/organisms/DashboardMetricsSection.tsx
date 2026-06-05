import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../../theme/tokens';
import { SectionHeader } from '../SectionHeader';
import { StatCard } from '../molecules/StatCard';

interface DashboardMetricsSectionProps {
  onNavigateToLeases: () => void;
  onNavigateToCrops: () => void;
  onNavigateToTasks: () => void;
  onNavigateToLabor: () => void;
}

export const DashboardMetricsSection: React.FC<DashboardMetricsSectionProps> = ({
  onNavigateToLeases,
  onNavigateToCrops,
  onNavigateToTasks,
  onNavigateToLabor,
}) => {
  return (
    <View>
      <SectionHeader title="My Dashboard" />
      <View style={styles.dashboardRow}>
        <StatCard value="2" label="Leased Lands" onPress={onNavigateToLeases} />
        <StatCard value="3" label="Active Crops" onPress={onNavigateToCrops} />
        <StatCard value="5" label="Work Tasks" onPress={onNavigateToTasks} />
      </View>
      <View style={styles.dashboardRow}>
        <StatCard value="8" label="Labor Hired" onPress={onNavigateToLabor} />
        <StatCard value="₹24k" label="Expenses" />
        <StatCard value="" label="" isPlaceholder />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dashboardRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.sm
  },
});
