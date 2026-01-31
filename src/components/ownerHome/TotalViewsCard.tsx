import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface TotalViewsCardProps {
  views: number;
  percentageChange: number;
}

export function TotalViewsCard({ views, percentageChange }: TotalViewsCardProps) {
  const isPositive = percentageChange >= 0;

  return (
    <View style={[styles.container, shadow.card]}>
      <View style={styles.iconContainer}>
        <Ionicons name="eye-outline" size={24} color={colors.info} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Total Views this week</Text>
        <View style={styles.changeRow}>
          <Ionicons
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={16}
            color={isPositive ? colors.success : colors.danger}
          />
          <Text
            style={[styles.changeText, { color: isPositive ? colors.success : colors.danger }]}
          >
            {isPositive ? '+' : ''}
            {percentageChange}% from last week
          </Text>
        </View>
      </View>
      <Text style={styles.viewsValue}>{views}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  changeText: {
    fontSize: 12,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  viewsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
