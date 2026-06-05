import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../../../theme/tokens';
import { StatText } from '../atoms/StatText';

interface StatCardProps extends TouchableOpacityProps {
  value: string;
  label: string;
  isPlaceholder?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, isPlaceholder, style, ...props }) => {
  if (isPlaceholder) {
    return <View style={[styles.card, styles.placeholder, style]} />;
  }
  return (
    <TouchableOpacity style={[styles.card, style]} {...props}>
      <StatText type="value">{value}</StatText>
      <StatText type="label">{label}</StatText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholder: {
    backgroundColor: colors.background,
    borderColor: 'transparent',
  },
});
