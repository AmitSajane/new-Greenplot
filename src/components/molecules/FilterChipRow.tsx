import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '../atoms/Chip';
import { spacing } from '../../theme/tokens';

interface FilterChipRowProps<T extends string> {
  options: readonly T[];
  selected: T | T[];
  onSelect: (value: T) => void;
  getLabel?: (value: T) => string;
}

export function FilterChipRow<T extends string>({
  options,
  selected,
  onSelect,
  getLabel = (v) => v,
}: FilterChipRowProps<T>) {
  const isSelected = (value: T) => (Array.isArray(selected) ? selected.includes(value) : selected === value);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {options.map((value) => (
        <Chip key={value} label={getLabel(value)} selected={isSelected(value)} onPress={() => onSelect(value)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
