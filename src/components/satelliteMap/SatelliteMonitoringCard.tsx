import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing, shadow } from '../../theme/tokens';

export interface SatelliteMonitoringCardProps {
  onPress: () => void;
}

export function SatelliteMonitoringCard({ onPress }: SatelliteMonitoringCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, shadow.card]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="earth-sharp" size={32} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Satellite Monitoring</Text>
          <Text style={styles.subtitle}>View NDVI, soil moisture & crop health</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
