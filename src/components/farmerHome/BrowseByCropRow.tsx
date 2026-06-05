import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';
import { HomeCrop } from '../../constants/farmerHomeMockData';

type Props = {
  crops: HomeCrop[];
  onCropPress?: (crop: HomeCrop) => void;
};

const iconMap: Record<HomeCrop['icon'], string> = {
  leaf: 'leaf-outline',
  grain: 'nutrition-outline',
  nutrition: 'restaurant-outline',
  flower: 'flower-outline',
};

export function BrowseByCropRow({ crops, onCropPress }: Props) {
  return (
    <View style={styles.row}>
      {crops.slice(0, 4).map((c) => (
        <TouchableOpacity
          key={c.id}
          activeOpacity={0.85}
          onPress={() => onCropPress?.(c)}
          style={styles.item}
        >
          <View style={styles.circle}>
            <Ionicons
              name={iconMap[c.icon] as any}
              size={18}
              color={colors.primaryDark}
            />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {c.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  item: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 44,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D6F2DE',
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textSecondary,
  },
});

