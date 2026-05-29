import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, spacing } from '../../../theme/tokens';

interface StatTextProps extends TextProps {
  type: 'value' | 'label';
}

export const StatText: React.FC<StatTextProps> = ({ type, style, children, ...props }) => {
  return (
    <Text style={[type === 'value' ? styles.value : styles.label, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  value: { fontSize: 20, fontWeight: '800', color: colors.primary },
  label: { fontSize: 11, color: colors.textSecondary, marginTop: spacing.xs },
});
