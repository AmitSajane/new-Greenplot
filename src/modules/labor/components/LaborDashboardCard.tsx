import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';

export interface LaborDashboardCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  tint?: 'green' | 'blue' | 'orange' | 'purple';
}

const tintMap = {
  green: { bg: '#E9F9EE', fg: colors.primary },
  blue: { bg: '#EAF2FF', fg: colors.info },
  orange: { bg: colors.softOrange, fg: colors.warning },
  purple: { bg: '#F2EAFE', fg: '#6D28D9' },
};

export function LaborDashboardCard({
  title,
  icon,
  onPress,
  tint = 'green',
}: LaborDashboardCardProps) {
  const t = tintMap[tint];
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconCircle, { backgroundColor: t.bg }]}>
        <Ionicons name={icon as any} size={28} color={t.fg} />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '31.5%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
