import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface DashboardStatsCardProps {
  icon: 'seedling' | 'tractor';
  value: number;
  label: string;
  showBadge?: boolean;
  onPress?: () => void;
}

export function DashboardStatsCard({
  icon,
  value,
  label,
  showBadge = false,
  onPress,
}: DashboardStatsCardProps) {
  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <ContainerComponent
      style={[styles.container, shadow.card]}
      {...(onPress ? { onPress, activeOpacity: 0.8 } : {})}
    >
      {showBadge && <View style={styles.badge} />}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: icon === 'seedling' ? colors.softGreen : colors.softOrange },
        ]}
      >
        {icon === 'seedling' ? (
          <MaterialCommunityIcons name="sprout" size={28} color={colors.primary} />
        ) : (
          <MaterialCommunityIcons name="tractor" size={28} color={colors.warning} />
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
