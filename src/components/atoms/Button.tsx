import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { Text } from './Text';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'brown';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  icon,
  style,
  ...props
}) => {
  const bgColors = {
    primary: colors.primary,
    secondary: colors.surface,
    brown: '#6B4A3A',
  };

  const textColors = {
    primary: colors.surface,
    secondary: colors.primary,
    brown: colors.surface,
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bgColors[variant] }, style]}
      activeOpacity={0.8}
      {...props}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text variant="subtitle" weight="bold" color={textColors[variant]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
});
