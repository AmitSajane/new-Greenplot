import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface OwnerHeaderProps {
  name: string;
  avatarUrl?: string;
  hasNotifications?: boolean;
  onNotificationPress?: () => void;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop';

export function OwnerHeader({
  name,
  avatarUrl = DEFAULT_AVATAR,
  hasNotifications = true,
  onNotificationPress,
}: OwnerHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.textGroup}>
          <Text style={styles.greeting}>Welcome Back</Text>
          <Text style={styles.name}>Namaste, {name}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onNotificationPress}
        activeOpacity={0.7}
        style={styles.notificationButton}
      >
        <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
        {hasNotifications && <View style={styles.notificationDot} />}
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
    borderRadius: 24,
  },
  textGroup: {
    marginLeft: spacing.md,
  },
  greeting: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
});
