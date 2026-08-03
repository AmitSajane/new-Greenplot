import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
};

export function Chip({ label, selected, onPress, leftIcon }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, selected && styles.containerSelected]}
    >
      {leftIcon}
      <Text style={[styles.text, selected && styles.textSelected]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  containerSelected: {
    backgroundColor: colors.softGreen,
    borderColor: colors.softGreen,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  textSelected: {
    color: colors.primaryDark,
  },
});
