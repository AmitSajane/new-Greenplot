import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';
import { HomeNewsItem } from '../../constants/farmerHomeMockData';

type Props = {
  item: HomeNewsItem;
  onPress?: () => void;
};

export function NewsUpdateRow({ item, onPress }: Props) {
  const iconName =
    item.icon === 'campaign' ? 'megaphone-outline' : 'trending-up-outline';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={18} color={colors.warning} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 34,
    backgroundColor: colors.softOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});

