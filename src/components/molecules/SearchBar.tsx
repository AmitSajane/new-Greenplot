import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';

interface TrailingAction {
  icon: string;
  label?: string;
  onPress?: () => void;
}

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  /** Optional trailing button — a bare icon (e.g. mic) or an icon+label button (e.g. "Near me"). Omit for no trailing action. */
  trailingAction?: TrailingAction;
  containerStyle?: ViewStyle;
}

export function SearchBar({
  value,
  placeholder = 'Search',
  onChangeText,
  onFocus,
  trailingAction,
  containerStyle,
}: SearchBarProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          onChangeText={onChangeText}
          onFocus={onFocus}
          style={styles.input}
          returnKeyType="search"
        />
      </View>
      {trailingAction && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={trailingAction.label ?? 'Search action'}
          onPress={trailingAction.onPress}
          activeOpacity={0.8}
          style={[styles.trailingButton, !!trailingAction.label && styles.trailingButtonLabeled]}
        >
          <Ionicons
            name={trailingAction.icon}
            size={trailingAction.label ? 16 : 18}
            color={trailingAction.label ? colors.surface : colors.primaryDark}
          />
          {!!trailingAction.label && <Text style={styles.trailingLabel}>{trailingAction.label}</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    alignSelf: 'stretch',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  // Bare icon button (e.g. mic)
  trailingButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Icon+label button (e.g. "Near me") needs its own width/padding/color instead of the bare-icon square
  trailingButtonLabeled: {
    width: undefined,
    height: undefined,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    gap: spacing.xs,
  },
  trailingLabel: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 14,
  },
});
