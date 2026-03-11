import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';

const SOIL_OPTIONS = ['All', 'Black Soil', 'Alluvial Soil', 'Red Soil', 'Clay Soil', 'Sandy Soil'];
const IRRIGATION_OPTIONS = ['All', 'Irrigated', 'Rainfed', 'Mixed'];

interface LandFiltersPanelProps {
  soilFilter: string;
  irrigationFilter: string;
  blockchainOnly: boolean;
  onSoilChange: (v: string) => void;
  onIrrigationChange: (v: string) => void;
  onBlockchainToggle: (v: boolean) => void;
  onClear: () => void;
}

export function LandFiltersPanel({
  soilFilter,
  irrigationFilter,
  blockchainOnly,
  onSoilChange,
  onIrrigationChange,
  onBlockchainToggle,
  onClear,
}: LandFiltersPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Soil type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {SOIL_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, soilFilter === opt && styles.chipActive]}
            onPress={() => onSoilChange(opt)}
          >
            <Text style={[styles.chipText, soilFilter === opt && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.label}>Irrigation</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {IRRIGATION_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, irrigationFilter === opt && styles.chipActive]}
            onPress={() => onIrrigationChange(opt)}
          >
            <Text style={[styles.chipText, irrigationFilter === opt && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={[styles.blockchainRow, blockchainOnly && styles.blockchainRowActive]}
        onPress={() => onBlockchainToggle(!blockchainOnly)}
      >
        <Ionicons name={blockchainOnly ? 'link' : 'link-outline'} size={20} color={blockchainOnly ? colors.success : colors.textMuted} />
        <Text style={[styles.blockchainText, blockchainOnly && styles.blockchainTextActive]}>Blockchain verified only</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  clearText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  chipRow: { marginBottom: spacing.lg, flexGrow: 0 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textPrimary },
  chipTextActive: { color: colors.surface, fontWeight: '600' },
  blockchainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  blockchainRowActive: { backgroundColor: colors.softGreen },
  blockchainText: { fontSize: 14, color: colors.textSecondary },
  blockchainTextActive: { color: colors.success, fontWeight: '600' },
});
