import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';

export interface LegendItem {
  color: string;
  label: string;
}

const DEFAULT_LEGEND_ITEMS: LegendItem[] = [
  { color: '#EF4444', label: 'Poor crop' },
  { color: '#F97316', label: 'Moderate' },
  { color: '#84CC16', label: 'Healthy' },
  { color: '#2F8F46', label: 'Very healthy' },
];

export interface HealthLegendProps {
  items?: LegendItem[];
  title?: string;
}

export function HealthLegend({
  items = DEFAULT_LEGEND_ITEMS,
  title = 'Crop Health',
}: HealthLegendProps) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={[styles.colorBox, { backgroundColor: item.color }]} />
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 150,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  itemsContainer: {
    gap: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
