import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text } from '../atoms/Text';
import { IconCircle } from '../atoms/IconCircle';
import { colors, spacing } from '../../theme/tokens';

interface MenuRowProps {
  /** An icon name (rendered in an IconCircle) or a custom left element (e.g. an avatar image). */
  icon?: string;
  leftSlot?: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  /** Defaults to a trailing chevron; pass null to hide it (e.g. when the row isn't pressable). */
  trailing?: React.ReactNode | null;
}

export function MenuRow({ icon, leftSlot, label, value, onPress, trailing }: MenuRowProps) {
  const resolvedTrailing =
    trailing !== undefined ? trailing : <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      {leftSlot ?? (icon && (
        <IconCircle size={40} backgroundColor={colors.softGreen}>
          <Ionicons name={icon} size={18} color={colors.primaryDark} />
        </IconCircle>
      ))}
      <Text variant="body" weight="600" style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {!!value && (
        <Text variant="body" color={colors.textSecondary} numberOfLines={1}>
          {value}
        </Text>
      )}
      {resolvedTrailing && <View style={styles.trailing}>{resolvedTrailing}</View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  label: {
    flex: 1,
  },
  trailing: {
    marginLeft: spacing.xs,
  },
});
