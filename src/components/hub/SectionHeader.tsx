import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, spacing } from '../../theme/tokens';

type Props = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
  containerStyle?: ViewStyle;
};

function SectionHeaderComponent({
  title,
  actionLabel = 'See all',
  onPressAction,
  containerStyle,
}: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.title}>{title}</Text>
      {onPressAction && (
        <TouchableOpacity
          onPress={onPressAction}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export const SectionHeader = React.memo(SectionHeaderComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});


