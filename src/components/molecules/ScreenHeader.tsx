import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { commonStyles } from '../../theme/commonStyles';
import { colors, spacing } from '../../theme/tokens';

interface RightAction {
  icon: string;
  onPress?: () => void;
  /** Small red dot, e.g. for unread notifications. */
  showDot?: boolean;
  /** Numbered badge instead of a bare dot (e.g. a pending-approvals count). Takes precedence over `showDot`. */
  badgeCount?: number;
}

interface ScreenHeaderProps {
  /** Omit along with backVariant="text" for a bare "← Back" link with no title row (the hub/community screen family). */
  title?: string;
  subtitle?: string;
  /** 'icon' (default) shows a circular back-arrow button; 'text' shows a plain "← Back" link (used by the hub/community screen family); 'none' hides the back control entirely. */
  backVariant?: 'icon' | 'text' | 'none';
  onBack?: () => void;
  /** Interactive (has onPress) or purely decorative (e.g. a branding icon with no press handler, like Soil Test's flask). */
  rightAction?: RightAction;

  // A meaningful number of existing screens intentionally use a dark-green
  // branded look here rather than the neutral default — these aren't
  // accidental drift the way header-button sizing was, so they're kept as
  // explicit overrides instead of being flattened to one color.
  titleColor?: string;
  subtitleColor?: string;
  iconColor?: string;
  /** Right-side icon color, if it needs to differ from the back-button icon. Defaults to `iconColor`. */
  rightIconColor?: string;
  backgroundColor?: string;
  buttonBackgroundColor?: string;
  titleSize?: number;
  titleWeight?: '700' | '800' | '900';
  /** Some screens (e.g. the lease-agreement family) let the header blend into the page instead of separating it with a line. */
  showBorder?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  backVariant = 'icon',
  onBack,
  rightAction,
  titleColor = colors.textPrimary,
  subtitleColor = colors.textMuted,
  iconColor = colors.textPrimary,
  rightIconColor,
  backgroundColor = colors.surface,
  buttonBackgroundColor = colors.softGreen,
  titleSize = 18,
  titleWeight = '800',
  showBorder = true,
}: ScreenHeaderProps) {
  // The hub/community screen family uses a bare "← Back" link with no title
  // row at all — a distinct compact style, not just a variant of the
  // icon+title header with pieces omitted.
  const isBareBackLink = backVariant === 'text' && !title;

  return (
    <View
      style={
        isBareBackLink
          ? styles.bareHeader
          : [styles.header, { backgroundColor, borderBottomWidth: showBorder ? 1 : 0 }]
      }
    >
      {backVariant === 'icon' && (
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: buttonBackgroundColor }]}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={iconColor} />
        </TouchableOpacity>
      )}
      {backVariant === 'text' && (
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backTextButton} hitSlop={8}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      )}

      {!!title && (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: titleColor, fontSize: titleSize, fontWeight: titleWeight }]} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {rightAction && (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={[styles.rightButton, { backgroundColor: buttonBackgroundColor }]}
          hitSlop={8}
          disabled={!rightAction.onPress}
        >
          <Ionicons name={rightAction.icon} size={20} color={rightIconColor ?? iconColor} />
          {rightAction.badgeCount != null && rightAction.badgeCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rightAction.badgeCount}</Text>
            </View>
          ) : (
            rightAction.showDot && <View style={styles.dot} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.rowBetween,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bareHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTextButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  titleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  rightButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
  },
});
