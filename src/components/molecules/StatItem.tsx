import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';
import { StatusDot } from '../atoms/StatusDot';
import { colors, radius, spacing } from '../../theme/tokens';

interface StatItemProps {
  iconName: string;
  title: string;
  value: string | number;
  subtitle: string;
  status: 'good' | 'warning' | 'danger' | 'neutral';
}

export const StatItem: React.FC<StatItemProps> = ({ iconName, title, value, subtitle, status }) => {
  return (
    <Card style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={24} color={colors.primaryDark} />
      </View>
      
      <Text variant="body" weight="bold" color={colors.textSecondary} style={styles.title}>
        {title}
      </Text>
      
      <View style={styles.valueRow}>
        <Text variant="h1" weight="900" style={styles.value}>
          {value}
        </Text>
        <View style={styles.dotContainer}>
          <StatusDot status={status} />
        </View>
      </View>
      
      <Text variant="caption" weight="bold" color={status === 'warning' ? '#F57F17' : colors.primaryDark}>
        {subtitle}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0EBE1', // Light beige/gray from the design
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  value: {
    marginRight: spacing.sm,
  },
  dotContainer: {
    paddingTop: 2,
  },
});
