import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';

type Props = {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onMicPress?: () => void;
};

export function SearchBar({
  value,
  placeholder = 'Search for land, crops...',
  onChangeText,
  onMicPress,
}: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onChangeText={onChangeText}
        style={styles.input}
        returnKeyType="search"
      />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Voice search"
        onPress={onMicPress}
        activeOpacity={0.8}
        style={styles.micButton}
      >
        <Ionicons name="mic" size={18} color={colors.primaryDark} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 0,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

