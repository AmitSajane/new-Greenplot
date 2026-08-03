import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text } from '../atoms/Text';
import { IconCircle } from '../atoms/IconCircle';
import { colors, radius, shadow, spacing } from '../../theme/tokens';

interface NavCardProps {
  icon: string;
  iconBackgroundColor?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

/** "Feature entry point" card — icon, title+subtitle, trailing chevron. Used for things like Soil Test / Labor Connect / Satellite Monitoring entry points. */
export function NavCard({
  icon,
  iconBackgroundColor = colors.softGreen,
  iconColor = colors.primary,
  title,
  subtitle,
  onPress,
}: NavCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <IconCircle size={52} backgroundColor={iconBackgroundColor}>
        <Ionicons name={icon} size={26} color={iconColor} />
      </IconCircle>
      <View style={styles.content}>
        <Text variant="subtitle" weight="bold">
          {title}
        </Text>
        {!!subtitle && (
          <Text variant="caption" color={colors.textSecondary} style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  subtitle: {
    marginTop: 2,
  },
});
