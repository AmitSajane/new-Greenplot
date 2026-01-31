import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';

type Props = {
  location: string;
  temperatureC: number;
  condition: string;
  todayLabel: string;
  cropAdvisory: string;
  onAskExpertPress?: () => void;
  onShareStoryPress?: () => void;
};

function WeatherCardComponent({
  location,
  temperatureC,
  condition,
  todayLabel,
  cropAdvisory,
  onAskExpertPress,
  onShareStoryPress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.weatherRow}>
        <View>
          <Text style={styles.temp}>{`${temperatureC}°C`}</Text>
          <Text style={styles.location}>{location}</Text>
          <Text style={styles.condition}>{condition}</Text>
        </View>
        <View style={styles.badges}>
          <Text style={styles.todayBadge}>{todayLabel}</Text>
          <Text style={styles.cropBadge}>{cropAdvisory}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          activeOpacity={0.8}
          onPress={onAskExpertPress}
        >
          <Text style={styles.actionEmoji}>❓</Text>
          <View style={styles.actionTextWrapper}>
            <Text style={styles.actionTitle}>Ask Expert</Text>
            <Text style={styles.actionSubtitle}>Get answers fast</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity
          style={[styles.actionButton,{borderColor: colors.primary, borderWidth: 1}]}
          // activeOpacity={0.8}
          onPress={onShareStoryPress}
        >
          <Text style={styles.actionEmoji}>📷</Text>
          <View style={styles.actionTextWrapper}>
            <Text style={[styles.actionTitle,{color:colors.primaryDark}]}>Share Story</Text>
            <Text style={[styles.actionSubtitle,{color:colors.primaryDark}]}>Post photos/tips</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const WeatherCard = React.memo(WeatherCardComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadow.card,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  temp: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  location: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
  },
  condition: {
    marginTop: 2,
    fontSize: 14,
    color: colors.textMuted,
  },
  badges: {
    alignItems: 'flex-end',
  },
  todayBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  cropBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: '#E0F2FE',
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    width: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  actionEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  actionTextWrapper: {
    flexShrink: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.surface,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#E5F7EB',
  },
});


