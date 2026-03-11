import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';

interface BlockchainVerifiedBadgeProps {
  verified?: boolean;
  compact?: boolean;
}

export function BlockchainVerifiedBadge({ verified = true, compact }: BlockchainVerifiedBadgeProps) {
  if (!verified) return null;
  return (
    <View style={[styles.badge, compact && styles.badgeCompact]}>
      <Ionicons name="link" size={compact ? 12 : 14} color={colors.success} />
      {!compact && <Text style={styles.text}>Blockchain Verified</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  badgeCompact: {
    paddingHorizontal: spacing.xs,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
});
