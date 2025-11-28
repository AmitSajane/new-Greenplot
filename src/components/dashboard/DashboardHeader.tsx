import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';

interface DashboardHeaderProps {
  name: string;
  avatarUrl?: string;
  onLanguagePress?: () => void;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop';

export function DashboardHeader({
  name,
  avatarUrl = DEFAULT_AVATAR,
  onLanguagePress,
}: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.textGroup}>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.name}>{name}!</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onLanguagePress}
        activeOpacity={0.8}
        style={styles.languageButton}
      >
        <Text style={styles.languageLabel}>🌐</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
  },
  textGroup: {
    marginLeft: spacing.md,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  languageButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  languageLabel: {
    fontSize: 18,
  },
});

