import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';

type Props = {
  name: string;
  locationLabel: string;
  languageLabel?: string;
  onMenuPress?: () => void;
  onLanguagePress?: () => void;
  onNotificationsPress?: () => void;
};

export function HomeTopBar({
  name,
  locationLabel,
  languageLabel = 'Eng/Hin',
  onMenuPress,
  onLanguagePress,
  onNotificationsPress,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        onPress={onMenuPress}
        activeOpacity={0.7}
        style={styles.iconButton}
      >
        <Ionicons name="menu" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.greeting} numberOfLines={1}>
          Namaste,
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {locationLabel}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Change language"
          onPress={onLanguagePress}
          activeOpacity={0.7}
          style={styles.languageButton}
        >
          <Text style={styles.languageText}>{languageLabel}</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={onNotificationsPress}
          activeOpacity={0.7}
          style={styles.bellButton}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.textPrimary}
          />
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '800',
    marginTop: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  languageButton: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.surface,
  },
});

