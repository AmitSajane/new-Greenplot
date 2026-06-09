import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MarketHeader, SectionLabel } from '../components';
import { market, mRadius } from '../theme/marketTokens';

const CROPS = ['🍅 Tomato', '🧅 Onion', '🌶 Chilli', '🌾 Jowar', '☁️ Cotton', '🎋 Sugarcane'];
const REGIONS = ['Karnataka', 'Maharashtra', 'Andhra Pradesh', 'Telangana'];
const SORTS = ['Nearest mandi first', 'Highest price first', 'Best AI score', 'Most arrivals'];

function ChipGroup({ items, multi }: { items: string[]; multi?: boolean }) {
  const [selected, setSelected] = useState<number[]>([0]);
  const toggle = (i: number) => {
    if (multi) {
      setSelected(s => (s.includes(i) ? s.filter(x => x !== i) : [...s, i]));
    } else {
      setSelected([i]);
    }
  };
  return (
    <View style={styles.chipWrap}>
      {items.map((item, i) => (
        <Text
          key={item}
          onPress={() => toggle(i)}
          style={[styles.chip, selected.includes(i) && styles.chipActive]}
        >
          {item}
        </Text>
      ))}
    </View>
  );
}

export default function FilterSearchScreen() {
  const navigation = useNavigation();
  const [sort, setSort] = useState(0);

  return (
    <View style={styles.container}>
      <MarketHeader title="Filter markets" onBack={() => navigation.goBack()}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.5)" />
          <Text style={styles.searchPlaceholder}>Search crops, mandis, buyers…</Text>
        </View>
      </MarketHeader>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <SectionLabel label="Crop" />
        <ChipGroup items={CROPS} multi />

        <View style={{ marginTop: 14 }}>
          <SectionLabel label="Region" />
          <ChipGroup items={REGIONS} />
        </View>

        <View style={{ marginTop: 14 }}>
          <SectionLabel label="Sort by" />
          {SORTS.map((s, i) => (
            <TouchableOpacity key={s} style={styles.sortRow} onPress={() => setSort(i)} activeOpacity={0.7}>
              <Text style={styles.sortLabel}>{s}</Text>
              <View style={[styles.radio, { borderColor: i === sort ? market.g3 : market.n6 }]}>
                {i === sort && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.applyBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.applyText}>Apply filters</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: mRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchPlaceholder: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  scroll: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 28 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: market.n6,
    color: market.n4,
  },
  chipActive: { backgroundColor: market.g2, color: '#fff', borderColor: market.g2 },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: market.n8,
  },
  sortLabel: { fontSize: 12, color: market.n2 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 7, height: 7, borderRadius: 4, backgroundColor: market.g3 },
  applyBtn: {
    marginTop: 14,
    backgroundColor: market.g2,
    borderRadius: mRadius.sm,
    paddingVertical: 13,
    alignItems: 'center',
  },
  applyText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
