import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, PanResponder } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';

export interface TimelapseDate {
  id: string;
  date: string;
  label: string;
}

export interface TimelapseSliderProps {
  dates: TimelapseDate[];
  selectedIndex: number;
  onDateChange: (index: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function TimelapseSlider({
  dates,
  selectedIndex,
  onDateChange,
  isPlaying,
  onPlayPause,
}: TimelapseSliderProps) {
  const sliderRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (sliderRef.current) {
          sliderRef.current.measure((x, y, width) => {
            const touchX = evt.nativeEvent.locationX;
            const newIndex = Math.round((touchX / width) * (dates.length - 1));
            const clampedIndex = Math.max(0, Math.min(dates.length - 1, newIndex));
            onDateChange(clampedIndex);
          });
        }
      },
      onPanResponderMove: (evt) => {
        if (sliderRef.current) {
          sliderRef.current.measure((x, y, width) => {
            const touchX = evt.nativeEvent.locationX;
            const newIndex = Math.round((touchX / width) * (dates.length - 1));
            const clampedIndex = Math.max(0, Math.min(dates.length - 1, newIndex));
            onDateChange(clampedIndex);
          });
        }
      },
    })
  ).current;

  const selectedDate = dates[selectedIndex];
  const progress = dates.length > 1 ? selectedIndex / (dates.length - 1) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timelapse</Text>
        <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.dateLabel}>{selectedDate?.label || 'No date selected'}</Text>
      <View
        ref={sliderRef}
        style={styles.sliderContainer}
        {...panResponder.panHandlers}
      >
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${progress * 100}%` }]} />
          {dates.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.sliderDot,
                index === selectedIndex && styles.sliderDotActive,
                { left: `${(index / (dates.length - 1 || 1)) * 100}%` },
              ]}
              onPress={() => onDateChange(index)}
            />
          ))}
        </View>
      </View>
      <View style={styles.datesRow}>
        {dates.map((date, index) => (
          <Text
            key={date.id}
            style={[
              styles.dateMarker,
              index === selectedIndex && styles.dateMarkerActive,
            ]}
          >
            {date.date}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  playButton: {
    padding: spacing.xs,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.sm,
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
    position: 'absolute',
  },
  sliderDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'absolute',
    top: -6,
    marginLeft: -8,
  },
  sliderDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    top: -8,
    marginLeft: -10,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateMarker: {
    fontSize: 10,
    color: colors.textMuted,
  },
  dateMarkerActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
