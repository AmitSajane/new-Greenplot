import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type AlertVariant = 'approvals' | 'disease';

interface AlertsNotificationCardProps {
  variant: AlertVariant;
  title: string;
  description: string;
  actionLabel: string;
  onPress: () => void;
}

const variantStyles = {
  approvals: {
    cardBg: colors.softBlue,
    iconColor: colors.info,
    titleColor: colors.textPrimary,
    actionColor: colors.info,
  },
  disease: {
    cardBg: colors.softOrange,
    iconColor: colors.warning,
    titleColor: '#92400E',
    actionColor: '#B45309',
  },
};

export function AlertsNotificationCard({
  variant,
  title,
  description,
  actionLabel,
  onPress,
}: AlertsNotificationCardProps) {
  const vs = variantStyles[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.container, { backgroundColor: vs.cardBg }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: vs.cardBg }]}>
        <Ionicons name="warning" size={22} color={vs.iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: vs.titleColor }]}>{title}</Text>
        <Text style={[styles.description, { color: vs.titleColor }]} numberOfLines={2}>
          {description}
        </Text>
        <Text style={[styles.actionLabel, { color: vs.actionColor }]}>{actionLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  iconWrap: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
