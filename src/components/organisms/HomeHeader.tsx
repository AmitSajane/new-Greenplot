import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../theme/tokens';

/** "John Doe" -> "JD". Was duplicated identically between the farmer and owner home headers. */
export function initialsFromName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface HeaderAction {
  /** Icon-only button (e.g. the bell), or... */
  icon?: string;
  /** ...a short text button (e.g. the "EN" language switcher). */
  label?: string;
  onPress: () => void;
  showDot?: boolean;
}

interface HomeHeaderProps {
  gradientColors: string[];
  name: string;
  location: string;
  locationLoading?: boolean;
  greeting?: string;
  onAvatarPress?: () => void;
  actions?: HeaderAction[];
  /** Extra content rendered inside the same gradient block, below the greeting row (e.g. Owner home's portfolio summary card). */
  children?: React.ReactNode;

  // Visual overrides — the farmer and owner headers this was merged from
  // differ in these specifics (avatar color/size, action-button size, the
  // bottom padding needed before whatever follows). Defaults match the
  // farmer header; pass the owner values explicitly on that screen.
  avatarSize?: number;
  avatarBackgroundColor?: string;
  avatarTextColor?: string;
  actionButtonSize?: number;
  actionButtonRadius?: number;
  dotSize?: number;
  /** Space below the greeting row / children, before the gradient block ends. */
  contentPaddingBottom?: number;
}

export function HomeHeader({
  gradientColors,
  name,
  location,
  locationLoading,
  greeting = 'Namaste 🙏',
  onAvatarPress,
  actions = [],
  children,
  avatarSize = 42,
  avatarBackgroundColor = '#4CAF7A',
  avatarTextColor = colors.surface,
  actionButtonSize = 36,
  actionButtonRadius = 11,
  dotSize = 7,
  contentPaddingBottom = spacing.xxl + 8,
}: HomeHeaderProps) {
  return (
    <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView edges={['top']}>
        <View style={[styles.header, { paddingBottom: contentPaddingBottom }]}>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.avatar,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                  backgroundColor: avatarBackgroundColor,
                },
              ]}
              onPress={onAvatarPress}
              activeOpacity={0.8}
              hitSlop={6}
            >
              <Text style={[styles.avatarText, { color: avatarTextColor }]}>{initialsFromName(name)}</Text>
            </TouchableOpacity>

            <View style={styles.greetingBlock}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.name}>{name}</Text>
              <View style={styles.locRow}>
                <Ionicons name="location" size={11} color="rgba(255,255,255,0.55)" />
                <Text style={styles.locText}>{location}</Text>
                {locationLoading && (
                  <ActivityIndicator style={styles.locLoader} size="small" color="rgba(255,255,255,0.9)" />
                )}
              </View>
            </View>

            <View style={styles.actions}>
              {actions.map((action, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.actionButton,
                    { width: actionButtonSize, height: actionButtonSize, borderRadius: actionButtonRadius },
                  ]}
                  onPress={action.onPress}
                  activeOpacity={0.8}
                  hitSlop={6}
                >
                  {action.icon ? (
                    <Ionicons name={action.icon} size={17} color="#fff" />
                  ) : (
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  )}
                  {action.showDot && (
                    <View
                      style={[
                        styles.dot,
                        { width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: spacing.xxl + 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontWeight: '800', fontSize: 15 },
  greetingBlock: { flex: 1 },
  greeting: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  name: { fontSize: 19, fontWeight: '800', color: colors.surface, lineHeight: 23 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
  locText: { fontSize: 10, color: 'rgba(255,255,255,0.55)' },
  locLoader: { marginLeft: spacing.xs },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { color: colors.surface, fontWeight: '700', fontSize: 12 },
  dot: {
    position: 'absolute',
    top: 8,
    right: 9,
    borderRadius: 4,
    backgroundColor: '#E04848',
    borderWidth: 1.5,
    borderColor: colors.deepGreen.g2,
  },
});
