import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { Shift } from '../../types/shifts';
import { formatShiftTimeRange, getShiftDuration } from '../../utils/shiftUtils';

interface ShiftCardProps {
  shift: Shift;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  actionVariant?: 'primary' | 'secondary';
}

const actionVariants = {
  primary: {
    backgroundColor: colors.primary,
    textColor: '#fff',
  },
  secondary: {
    backgroundColor: '#FEE2E2',
    textColor: '#B91C1C',
  },
} as const;

export function ShiftCard({
  shift,
  actionLabel,
  onAction,
  disabled,
  isLoading,
  actionVariant = 'primary',
}: ShiftCardProps) {
  const variantStyles = actionVariants[actionVariant];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.role}>{shift.role}</Text>
        {shift.premium && <Text style={styles.premiumBadge}>Premium</Text>}
      </View>
      <Text style={styles.facility}>{shift.facility}</Text>
      <Text style={styles.time}>{formatShiftTimeRange(shift)}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{shift.area}</Text>
        <Text style={styles.metaText}>{shift.city}</Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>₹{shift.hourlyRate}/hr</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>{getShiftDuration(shift)}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={[
          styles.actionButton,
          { backgroundColor: variantStyles.backgroundColor },
          disabled && styles.disabledButton,
        ]}
        onPress={onAction}
        disabled={disabled}
      >
        {isLoading ? (
          <ActivityIndicator
            color={variantStyles.textColor}
            size="small"
            style={styles.spinner}
          />
        ) : (
          <Text
            style={[
              styles.actionLabel,
              { color: variantStyles.textColor },
            ]}
          >
            {actionLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  role: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  facility: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  time: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statPill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.softGreen,
    borderRadius: radius.pill,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  actionButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  premiumBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.warning,
  },
  spinner: {
    paddingVertical: 2,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

