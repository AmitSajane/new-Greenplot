import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, PanResponder } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';

export interface LayerToggleProps {
  label: string;
  icon: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  showOpacityControl?: boolean;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
}

export function LayerToggle({
  label,
  icon,
  enabled,
  onToggle,
  showOpacityControl = false,
  opacity = 1,
  onOpacityChange,
}: LayerToggleProps) {
  const sliderRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (sliderRef.current && onOpacityChange) {
          sliderRef.current.measure((x, y, width) => {
            const touchX = evt.nativeEvent.locationX;
            const newOpacity = Math.max(0, Math.min(1, touchX / width));
            onOpacityChange(newOpacity);
          });
        }
      },
      onPanResponderMove: (evt) => {
        if (sliderRef.current && onOpacityChange) {
          sliderRef.current.measure((x, y, width) => {
            const touchX = evt.nativeEvent.locationX;
            const newOpacity = Math.max(0, Math.min(1, touchX / width));
            onOpacityChange(newOpacity);
          });
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.toggleButton, enabled && styles.toggleButtonActive]}
        onPress={() => onToggle(!enabled)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={enabled ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.label, enabled && styles.labelActive]}>{label}</Text>
        <View style={[styles.switch, enabled && styles.switchActive]}>
          <View style={[styles.switchThumb, enabled && styles.switchThumbActive]} />
        </View>
      </TouchableOpacity>
      {showOpacityControl && enabled && onOpacityChange && (
        <View style={styles.opacityContainer}>
          <Text style={styles.opacityLabel}>Opacity: {Math.round(opacity * 100)}%</Text>
          <View
            ref={sliderRef}
            style={styles.sliderContainer}
            {...panResponder.panHandlers}
          >
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${opacity * 100}%` }]} />
              <TouchableOpacity
                style={[styles.sliderThumb, { left: `${opacity * 100}%` }]}
                onPress={() => {}}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.softGreen,
  },
  label: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.textPrimary,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  opacityContainer: {
    marginTop: spacing.sm,
    paddingLeft: spacing.md,
  },
  opacityLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  sliderContainer: {
    height: 20,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    position: 'relative',
  },
  sliderFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  sliderThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: -6,
    marginLeft: -8,
  },
});
