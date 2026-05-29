import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StatusDotProps {
  status: 'good' | 'warning' | 'danger' | 'neutral';
}

export const StatusDot: React.FC<StatusDotProps> = ({ status }) => {
  const colorMap = {
    good: '#2E7D32',
    warning: '#F57F17',
    danger: '#C62828',
    neutral: '#2E7D32',
  };

  return <View style={[styles.dot, { backgroundColor: colorMap[status] }]} />;
};

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
