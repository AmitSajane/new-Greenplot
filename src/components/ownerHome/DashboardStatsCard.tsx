import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface DashboardStatsCardProps {
  icon: 'seedling' | 'tractor' | 'cash' | 'leaf' | 'document';
  value: number | string;
  label: string;
  showBadge?: boolean;
  onPress?: () => void;
}

const iconConfig: Record<string, { bg: string; Icon: React.ComponentType<{ name: string; size: number; color: string }>; iconName: string; color: string }> = {
  seedling: { bg: colors.softGreen, Icon: MaterialCommunityIcons, iconName: 'sprout', color: colors.primary },
  tractor: { bg: colors.softOrange, Icon: MaterialCommunityIcons, iconName: 'tractor', color: colors.warning },
  cash: { bg: colors.softGreen, Icon: Ionicons, iconName: 'cash-outline', color: colors.success },
  leaf: { bg: colors.softGreen, Icon: Ionicons, iconName: 'leaf-outline', color: colors.primary },
  document: { bg: colors.softBlue, Icon: Ionicons, iconName: 'document-text-outline', color: colors.info },
};

export function DashboardStatsCard({
  icon,
  value,
  label,
  showBadge = false,
  onPress,
}: DashboardStatsCardProps) {
  const ContainerComponent = onPress ? TouchableOpacity : View;
  const config = iconConfig[icon] || iconConfig.seedling;
  const { Icon, iconName, color, bg } = config;

  return (
    <ContainerComponent
      style={[styles.container, shadow.card]}
      {...(onPress ? { onPress, activeOpacity: 0.8 } : {})}
    >
      {showBadge && <View style={styles.badge} />}
      <View style={[styles.iconContainer, { backgroundColor: bg }]}>
        <Icon name={iconName as any} size={28} color={color} />
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
