import React from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { colors, spacing } from '../../theme/tokens';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** 'error' swaps the default icon/tone to red — same layout as 'empty', just a different tone for a failed-fetch case instead of a genuinely-empty list. */
  variant?: 'empty' | 'error';
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  variant = 'empty',
}: EmptyStateProps) {
  const resolvedIcon = icon ?? (variant === 'error' ? 'cloud-offline' : 'file-tray-outline');
  const iconColor = variant === 'error' ? colors.danger : colors.textMuted;

  return (
    <View style={styles.container}>
      <Ionicons name={resolvedIcon} size={40} color={iconColor} />
      <Text variant="subtitle" weight="bold" color={colors.textPrimary} style={styles.title}>
        {title}
      </Text>
      {!!subtitle && (
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
      {!!actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} size="sm" style={styles.action} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  action: {
    marginTop: spacing.sm,
  },
});
