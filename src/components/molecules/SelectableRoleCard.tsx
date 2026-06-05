import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text } from '../atoms/Text';
import { colors, radius, spacing } from '../../theme/tokens';
import { UserRole } from '../../types/auth';

export interface SelectableRoleCardProps {
  role: UserRole;
  label: string;
  iconName: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * Presentational role chip — parent controls selection state and handler.
 */
export const SelectableRoleCard: React.FC<SelectableRoleCardProps> = ({
  label,
  iconName,
  selected,
  onPress,
  style,
}) => (
  <TouchableOpacity
    style={[styles.card, selected && styles.cardSelected, style]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Ionicons
      name={iconName}
      size={22}
      color={selected ? colors.surface : colors.primary}
    />
    <Text
      variant="subtitle"
      weight="600"
      color={selected ? colors.surface : colors.textPrimary}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
