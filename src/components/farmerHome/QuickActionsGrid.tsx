import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';

export type QuickAction = {
  id: string;
  label: string;
  icon:
    | 'add-circle-outline'
    | 'document-text-outline'
    | 'mail-outline'
    | 'help-circle-outline';
  tint: 'green' | 'blue' | 'orange' | 'purple';
  onPress?: () => void;
};

type Props = {
  actions: QuickAction[];
};

const tintMap = {
  green: { bg: '#E9F9EE', fg: colors.primaryDark },
  blue: { bg: '#EAF2FF', fg: colors.infoDark },
  orange: { bg: colors.softOrange, fg: colors.warning },
  purple: { bg: '#F2EAFE', fg: '#6D28D9' },
};

export function QuickActionsGrid({ actions }: Props) {
  return (
    <View style={styles.grid}>
      {actions.slice(0, 4).map((a, index) => {
        const tint = tintMap[a.tint];
        const isEven = index % 2 === 0;
        return (
          <View key={a.id} style={styles.tileWrapper}>
            <TouchableOpacity
              onPress={a.onPress}
              activeOpacity={0.85}
              style={styles.tile}
            >
              <View style={[styles.iconCircle, { backgroundColor: tint.bg }]}>
                <Ionicons name={a.icon} size={18} color={tint.fg} />
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {a.label}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.md / 2,
  },
  tileWrapper: {
    width: '50%',
    paddingHorizontal: spacing.md / 2,
    paddingBottom: spacing.md,
  },
  tile: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textPrimary,
  },
});

