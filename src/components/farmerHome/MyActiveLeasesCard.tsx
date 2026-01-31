import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';

type Props = {
  title: string;
  subtitle: string;
  countLabel: string;
  ctaLabel: string;
  onPress?: () => void;
};

export function MyActiveLeasesCard({
  title,
  subtitle,
  countLabel,
  ctaLabel,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.container}
    >
      <View style={styles.left}>
        <View style={styles.iconCircle}>
          <Ionicons name="document-text-outline" size={18} color={colors.primaryDark} />
        </View>
        <View style={styles.textGroup}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.primaryDark} />
              <Text style={styles.badgeText}>{countLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.ctaText}>{ctaLabel}</Text>
        <View style={styles.chevronCircle}>
          <Ionicons name="arrow-forward" size={18} color={colors.primaryDark} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2DD438',
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0E3B1C',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
    color: '#0E3B1C',
    opacity: 0.9,
  },
  badgeRow: {
    marginTop: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0E3B1C',
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  ctaText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: '#0E3B1C',
    opacity: 0.95,
  },
  chevronCircle: {
    width: 34,
    height: 34,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

