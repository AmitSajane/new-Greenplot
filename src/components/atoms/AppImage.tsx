import React, { useState } from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, ImageStyle, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/tokens';

interface AppImageProps {
  source: ImageSourcePropType;
  style?: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  borderRadius?: number;
  /** Show a small spinner over the image while it loads (network images only — local `require()` assets resolve instantly). */
  showLoadingIndicator?: boolean;
}

/**
 * Thin wrapper around RN's `Image` so resizeMode/loading behavior is
 * consistent everywhere instead of each screen deciding independently.
 * Swapping in `react-native-fast-image` later (for disk caching on the
 * large network images) only means editing this one file.
 */
export const AppImage: React.FC<AppImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  borderRadius,
  showLoadingIndicator = false,
}) => {
  const [loading, setLoading] = useState(showLoadingIndicator);

  return (
    <View style={[styles.container, borderRadius != null && { borderRadius, overflow: 'hidden' }]}>
      <Image
        source={source}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoadStart={() => showLoadingIndicator && setLoading(true)}
        onLoadEnd={() => showLoadingIndicator && setLoading(false)}
      />
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
