import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';

interface LandCardProps {
  title: string;
  acres: string;
  location: string;
  tenure: string;
  imageUrl: string;
  onPress?: () => void;
}

const DEFAULT_LAND_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop';

export function LandCard({
  title,
  acres,
  location,
  tenure,
  imageUrl = DEFAULT_LAND_IMAGE,
  onPress,
}: LandCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.card, shadow.card]}
    >
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.acres}>{acres}</Text>
        <Text style={styles.location} numberOfLines={1}>
          {location}
        </Text>
        <Text style={styles.tenure}>{tenure}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  acres: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  location: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tenure: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

