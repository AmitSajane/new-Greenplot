import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, shadow } from '../../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface FloatingMicButtonProps {
  onPress?: () => void;
}

export function FloatingMicButton({ onPress }: FloatingMicButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, shadow.card]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.innerCircle}>
        <Ionicons name="mic" size={28} color={colors.success} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.success,
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
