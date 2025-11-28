import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { DashboardButton } from './DashboardButton';

interface HighlightInfoCardProps {
  iconLabel: string;
  title: string;
  description: string;
  actionLabel: string;
  accentColor?: string;
  badgeLabel?: string;
  onPress?: () => void;
}

export function HighlightInfoCard({
  iconLabel,
  title,
  description,
  actionLabel,
  accentColor = colors.primary,
  badgeLabel,
  onPress,
}: HighlightInfoCardProps) {
  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrapper, { backgroundColor: accentColor }]}>
          <Text style={styles.iconLabel}>{iconLabel}</Text>
        </View>
        {badgeLabel ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <DashboardButton
        label={actionLabel}
        variant="ghost"
        onPress={onPress}
        style={[
          styles.cta,
          { backgroundColor: accentColor === colors.warning ? colors.softOrange : colors.softGreen },
        ]}
        textStyle={{ color: accentColor }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    fontSize: 24,
  },
  badge: {
    backgroundColor: '#FDF2F8',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  badgeText: {
    color: colors.warning,
    fontWeight: '600',
    fontSize: 12,
  },
  title: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  cta: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xl,
  },
});

