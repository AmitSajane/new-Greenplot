import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../theme/tokens';

interface IconCircleProps {
  children: React.ReactNode;
  /** Diameter in pt. Defaults to 48, the most common size found across the app (40–56 range). */
  size?: number;
  backgroundColor?: string;
  style?: ViewStyle;
}

/** A tinted circular container for an icon, initials, or a small image — the "avatar" shape used across cards, headers, and list rows. */
export const IconCircle: React.FC<IconCircleProps> = ({
  children,
  size = 48,
  backgroundColor = colors.softGreen,
  style,
}) => {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
