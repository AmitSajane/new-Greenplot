import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors } from '../../theme/tokens';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'body' | 'caption' | 'subtitle';
  weight?: 'normal' | 'bold' | '600' | '900';
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight = 'normal',
  color = colors.textPrimary,
  align = 'left',
  style,
  children,
  ...props
}) => {
  return (
    <RNText
      style={[
        styles[variant],
        { fontWeight: weight, color, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  h1: { fontSize: 24 },
  h2: { fontSize: 20 },
  subtitle: { fontSize: 16 },
  body: { fontSize: 14 },
  caption: { fontSize: 12 },
});
