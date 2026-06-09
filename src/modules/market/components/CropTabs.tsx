import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { market } from '../theme/marketTokens';
import { Crop } from '../types';

interface Props {
  crops: Crop[];
  activeId: string;
  onSelect: (id: string) => void;
  dark?: boolean;
}

/** Horizontally scrolling crop selector pills. */
export default function CropTabs({ crops, activeId, onSelect, dark = true }: Props) {
  return (
    <View style={dark ? styles.darkBg : undefined}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {crops.map(crop => {
          const active = crop.id === activeId;
          return (
            <TouchableOpacity
              key={crop.id}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onSelect(crop.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{crop.emoji}</Text>
              <Text style={[styles.label, active && styles.labelActive]}>{crop.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  darkBg: { backgroundColor: market.g1 },
  row: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, gap: 6 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 40,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.45)',
  },
  emoji: { fontSize: 13 },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '500' },
  labelActive: { color: '#fff', fontWeight: '700' },
});
