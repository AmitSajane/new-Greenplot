import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { GradientText } from '../GradientText';

interface BannerCardProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  imageUrl: string;
  onPress?: () => void;
}

const DEFAULT_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop';

export function BannerCard({
  title,
  subtitle,
  buttonText,
  imageUrl = DEFAULT_BANNER_IMAGE,
  onPress,
}: BannerCardProps) {
  return (
    <ImageBackground
      source={{ uri: imageUrl }}
      style={styles.banner}
      imageStyle={styles.bannerImage}
    >
      <View style={styles.overlay}>
        {title && (
          <GradientText
            style={styles.title}
            colors={['#AAD922', '#008000',]}
          >
            {title}
          </GradientText>
        )}
        {subtitle && (
          <GradientText
            style={styles.subtitle}
            colors={['#AAD922', '#008000']}
          >
            {subtitle}
          </GradientText>
        )}
        {buttonText && (
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 200,
    marginBottom: spacing.xl,
    borderRadius: radius.lg,
    overflow: 'hidden',
    // flexWrap: 'wrap',
    // justifyContent: 'space-between',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  bannerImage: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 14,
  },
});

