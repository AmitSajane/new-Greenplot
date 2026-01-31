import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface RecentActivityItemProps {
  type: 'view' | 'call';
  title: string;
  description: string;
  time: string;
  avatarUrl?: string;
  phoneNumber?: string;
  onPress?: () => void;
  onCallBack?: () => void;
}

export function RecentActivityItem({
  type,
  title,
  description,
  time,
  avatarUrl,
  phoneNumber,
  onPress,
  onCallBack,
}: RecentActivityItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, shadow.card]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {type === 'view' && avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.iconContainer, type === 'call' && styles.callIconContainer]}>
          <Ionicons
            name={type === 'call' ? 'call-outline' : 'person-outline'}
            size={20}
            color={type === 'call' ? colors.success : colors.primary}
          />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      {type === 'view' ? (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      ) : (
        <TouchableOpacity
          style={styles.callBackButton}
          onPress={onCallBack}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={20} color={colors.success} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIconContainer: {
    backgroundColor: '#E6F9EE',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  callBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
