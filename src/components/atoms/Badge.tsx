import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { radius, spacing, statusTones } from '../../theme/tokens';
import { getStatusTone } from '../../utils/statusColors';

type Tone = keyof typeof statusTones;

interface BadgeProps {
  label: string;
  /** Pick the tone directly ... */
  tone?: Tone;
  /** ...or resolve it from a domain status string (e.g. 'pending', 'accepted'). `tone` wins if both are given. */
  status?: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, tone, status, style }) => {
  const { bg, fg } = tone ? statusTones[tone] : getStatusTone(status);

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
