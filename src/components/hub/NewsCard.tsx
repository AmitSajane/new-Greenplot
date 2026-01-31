import React from 'react';
import {
  Image,
  ImageStyle,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { NewsItem } from '../../constants/hubMockData';

type Props = {
  item: NewsItem;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
};

function NewsCardComponent({ item, onPress, containerStyle, imageStyle }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.container, containerStyle]}
      onPress={onPress}
    >
      <Image source={{ uri: item.imageUrl }} style={[styles.image, imageStyle]} />
      <View style={styles.metaRow}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.timeAgo}>{item.timeAgo}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

export const NewsCard = React.memo(NewsCardComponent);

const styles = StyleSheet.create({
  container: {
    width: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginRight: spacing.lg,
    ...shadow.card,
  },
  image: {
    width: '100%',
    height: 130,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  timeAgo: {
    fontSize: 11,
    color: colors.textMuted,
  },
  title: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});


