import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../../theme/tokens';
import { Chip } from '../Chip';

interface FilterChipsProps {
  chips: readonly { id: string; label: any }[];
  selectedLabel: string;
  onSelect: (label: any) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ chips, selectedLabel, onSelect }) => {
  return (
    <View style={styles.chipsRow}>
      {chips.map((c) => (
        <Chip
          key={c.id}
          label={c.label}
          selected={selectedLabel === c.label}
          onPress={() => onSelect(c.label)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
