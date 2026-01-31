import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { FarmingTechnique } from '../../constants/hubMockData';

type Props = {
  item: FarmingTechnique;
  onPress?: () => void;
  containerStyle?: ViewStyle;
};

function TechniqueCardComponent({ item, onPress, containerStyle }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.container, containerStyle]}
      onPress={onPress}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.tag}>{item.tag}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.duration}>{`Watch video (${item.durationMinutes} min)`}</Text>
      </View>
    </TouchableOpacity>
  );
}

export const TechniqueCard = React.memo(TechniqueCardComponent);

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadow.card,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: spacing.lg,
  },
  tag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  duration: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
});


