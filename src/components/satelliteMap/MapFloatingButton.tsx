import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius } from '../../theme/tokens';

export interface MapFloatingButtonProps {
  icon: string;
  onPress: () => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
}

const POSITION_STYLES: Record<string, ViewStyle> = {
  'top-left': { top: 16, left: 16 },
  'top-right': { top: 16, right: 16 },
  'bottom-left': { bottom: 16, left: 16 },
  'bottom-right': { bottom: 16, right: 16 },
};

export function MapFloatingButton({
  icon,
  onPress,
  position = 'bottom-right',
  style,
  variant = 'primary',
}: MapFloatingButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        POSITION_STYLES[position],
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={variant === 'primary' ? colors.surface : colors.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
});
