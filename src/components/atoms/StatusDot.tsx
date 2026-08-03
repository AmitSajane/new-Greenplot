import React from 'react';
import { View, StyleSheet } from 'react-native';
import { statusTones } from '../../theme/tokens';

interface StatusDotProps {
  status: 'good' | 'warning' | 'danger' | 'neutral';
}

// Uses the shared statusTones map so this always agrees with Badge and every
// other status-driven color in the app (it previously had its own palette
// that didn't match colors.success/warning/danger).
const DOT_TONE = {
  good: 'success',
  warning: 'warning',
  danger: 'danger',
  neutral: 'neutral',
} as const;

export const StatusDot: React.FC<StatusDotProps> = ({ status }) => {
  const { fg } = statusTones[DOT_TONE[status]];

  return <View style={[styles.dot, { backgroundColor: fg }]} />;
};

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
