import React from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { colors } from '../../theme/tokens';

interface PhoneNumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
  placeholder?: string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/** The 🇮🇳 country-code chip + mobile number field shared across Login/Register. */
export function PhoneNumberInput({
  value,
  onChangeText,
  error,
  placeholder = 'Mobile Number',
  height = 48,
  borderRadius = 6,
  style,
}: PhoneNumberInputProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={[styles.countryPicker, { height, borderRadius }]}>
        <Text style={styles.flagText}>🇮🇳</Text>
        <Text style={styles.chevron}>▾</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.authGreen.muted}
        keyboardType="phone-pad"
        maxLength={10}
        returnKeyType="next"
        style={[
          styles.input,
          { height, borderRadius, marginLeft: 12 },
          error && styles.inputError,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryPicker: {
    width: 70,
    backgroundColor: colors.authGreen.countryPickerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  flagText: { fontSize: 20 },
  chevron: { fontSize: 18, color: colors.authGreen.chevron },
  input: {
    flex: 1,
    backgroundColor: colors.authGreen.chipBg,
    paddingHorizontal: 14,
    color: colors.authGreen.inputText,
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: colors.authGreen.errorBorder,
    backgroundColor: colors.authGreen.errorBg,
  },
});
