import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { market } from '../theme/marketTokens';

interface Props {
  tabs: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/** Underlined horizontal section tabs (Overview · Price trend · …). */
export default function NavStrip({ tabs, activeIndex, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.strip}
      contentContainerStyle={styles.content}
    >
      {tabs.map((tab, i) => {
        const active = i === activeIndex;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onSelect(i)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { backgroundColor: market.white, borderBottomWidth: 1, borderBottomColor: market.n7 },
  content: { paddingHorizontal: 0 },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: market.g2 },
  label: { fontSize: 11, fontWeight: '600', color: market.n4 },
  labelActive: { color: market.g2 },
});
