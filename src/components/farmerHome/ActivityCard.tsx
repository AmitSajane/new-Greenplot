import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { HomeActivityItem } from '../../constants/farmerHomeMockData';

type Props = {
  item: HomeActivityItem;
  onPress?: () => void;
};

const badgeConfig = (badge?: HomeActivityItem['badge']) => {
  if (badge === 'Active') return { bg: colors.softGreen, fg: colors.primaryDark };
  if (badge === 'Pending') return { bg: colors.softOrange, fg: colors.warning };
  if (badge === 'Completed') return { bg: '#EAF2FF', fg: colors.infoDark };
  return { bg: colors.border, fg: colors.textSecondary };
};

export function ActivityCard({ item, onPress }: Props) {
  const badge = badgeConfig(item.badge);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
    >
      <Image source={item.image} style={styles.image} />
      {item.badge ? (
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.fg }]}>
            {item.badge}
          </Text>
        </View>
      ) : null}
      <View style={styles.bottom}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: 110,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    height: 22,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  bottom: {
    padding: spacing.md,
  },
  title: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});

