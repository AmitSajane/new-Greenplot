import React from 'react';
import { TouchableOpacity, View, ViewProps, ViewStyle, StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';

type Elevation = 'flat' | 'card' | 'raised' | 'floating';

const ELEVATION_STYLES: Record<Elevation, ViewStyle> = {
  flat: {},
  card: shadow.card,
  raised: shadow.raised,
  floating: shadow.floating,
};

interface CardProps extends ViewProps {
  children: React.ReactNode;
  /** Defaults to 'card' — was previously a hand-rolled shadow that drifted from the shared `shadow.card` token (0.05 opacity vs. 0.08). */
  elevation?: Elevation;
  /** When given, the card becomes pressable instead of a plain container. */
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, elevation = 'card', onPress, ...props }) => {
  const content = (
    <View style={[styles.card, ELEVATION_STYLES[elevation], style]} {...props}>
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
