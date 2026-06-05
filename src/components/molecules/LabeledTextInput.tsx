import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../atoms/Text';
import { colors, radius, spacing } from '../../theme/tokens';

export interface LabeledTextInputProps extends TextInputProps {
  label: string;
  containerStyle?: ViewStyle;
}

/**
 * Presentational labeled input — no business logic.
 * Parent owns value, onChangeText, and validation.
 */
export const LabeledTextInput: React.FC<LabeledTextInputProps> = ({
  label,
  containerStyle,
  style,
  placeholderTextColor = colors.textMuted,
  ...inputProps
}) => (
  <View style={[styles.group, containerStyle]}>
    <Text variant="body" weight="600" style={styles.label}>
      {label}
    </Text>
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={placeholderTextColor}
      {...inputProps}
    />
  </View>
);

const styles = StyleSheet.create({
  group: { marginBottom: spacing.xl },
  label: { marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
