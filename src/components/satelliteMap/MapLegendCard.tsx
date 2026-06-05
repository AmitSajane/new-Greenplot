import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { HealthLegend } from './HealthLegend';

export interface MapLegendCardProps {
  title?: string;
  ndviItems?: { color: string; label: string }[];
  showDiseaseLayer?: boolean;
  onDiseaseLayerPress?: () => void;
}

const NDVI_ITEMS = [
  { color: '#8B4513', label: 'Bare soil' },
  { color: '#F4D03F', label: 'Low' },
  { color: '#84CC16', label: 'Moderate' },
  { color: '#2F8F46', label: 'Healthy' },
  { color: '#1A5F2A', label: 'Dense' },
];

export function MapLegendCard({
  title = 'Map legend',
  ndviItems = NDVI_ITEMS,
  showDiseaseLayer = false,
  onDiseaseLayerPress,
}: MapLegendCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <HealthLegend items={ndviItems} title="NDVI" />
      {onDiseaseLayerPress && (
        <TouchableOpacity style={styles.diseaseRow} onPress={onDiseaseLayerPress}>
          <View style={[styles.diseaseDot, showDiseaseLayer && styles.diseaseDotOn]} />
          <Text style={styles.diseaseLabel}>Disease heatmap layer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 180,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  diseaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  diseaseDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
  },
  diseaseDotOn: { backgroundColor: colors.danger },
  diseaseLabel: { fontSize: 12, color: colors.textSecondary },
});
