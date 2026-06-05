import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../../theme/tokens';
import { SectionHeader } from '../SectionHeader';
import { QuickActionsGrid } from '../QuickActionsGrid';

interface QuickActionsSectionProps {
  actions: any[];
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ actions }) => {
  return (
    <View>
      <SectionHeader title="Quick Actions" />
      <View style={styles.quickActionsSpacer} />
      <QuickActionsGrid actions={actions} />
    </View>
  );
};

const styles = StyleSheet.create({
  quickActionsSpacer: {
    height: spacing.md,
  },
});
