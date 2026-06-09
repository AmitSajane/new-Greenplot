import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { market, mRadius } from '../theme/marketTokens';
import { Crop, CropMarket } from '../types';

interface Props {
  crop: Crop;
  data: CropMarket;
}

const trendMeta = {
  rising: { chip: market.g7, chipText: market.g2, label: '▲ Rising', color: market.g3 },
  falling: { chip: market.r5, chipText: market.r2, label: '▼ Falling', color: market.r2 },
  flat: { chip: market.n7, chipText: market.n3, label: '— No change', color: market.n3 },
};

/** Headline price card with today's change + AI 30-day forecast. */
export default function PriceHero({ crop, data }: Props) {
  const t = trendMeta[data.trend];
  const changeStr = `${data.changeToday < 0 ? '▼' : data.changeToday > 0 ? '▲' : '—'} ₹${Math.abs(
    data.changeToday,
  )} today`;
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{crop.emoji}</Text>
          <Text style={styles.cropName}>{crop.name}</Text>
          {data.oversupply && (
            <View style={[styles.chip, { backgroundColor: market.r5 }]}>
              <Text style={[styles.chipText, { color: market.r2 }]}>Oversupply</Text>
            </View>
          )}
        </View>
        <Text style={styles.price}>
          ₹{data.price}
          <Text style={styles.unit}>/{data.unit}</Text>
        </Text>
        <View style={styles.subRow}>
          <Text style={styles.subText}>{data.referenceMandi}</Text>
          <View style={[styles.trendChip, { backgroundColor: t.chip }]}>
            <Text style={[styles.trendChipText, { color: t.chipText }]}>{t.label}</Text>
          </View>
        </View>
        <Text style={[styles.changeText, { color: t.color }]}>{changeStr}</Text>
      </View>
      <View style={styles.right}>
        <View style={styles.aiPill}>
          <Text style={styles.aiPillText}>✦ AI forecast</Text>
        </View>
        <Text style={[styles.forecast, { color: data.trend === 'rising' ? market.g3 : market.r2 }]}>
          ₹{data.forecast30d}/{data.unit}
        </Text>
        <Text style={styles.forecastSub}>in 30 days</Text>
        <View style={styles.confPill}>
          <Text style={styles.confText}>{data.forecastConfidence}% conf.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: market.white,
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: mRadius.md,
    borderWidth: 1,
    borderColor: market.n7,
    padding: 14,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  emoji: { fontSize: 16 },
  cropName: { fontWeight: '500', fontSize: 12, color: market.n4 },
  chip: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  chipText: { fontSize: 9, fontWeight: '700' },
  price: { fontSize: 30, color: market.g1, fontWeight: '700', lineHeight: 32 },
  unit: { fontSize: 14, color: market.n4, fontWeight: '400' },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  subText: { fontSize: 11, color: market.n4 },
  trendChip: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  trendChipText: { fontSize: 10, fontWeight: '700' },
  changeText: { fontSize: 11, fontWeight: '600', marginTop: 3 },
  right: { alignItems: 'flex-end' },
  aiPill: {
    backgroundColor: market.aiPurpleBg,
    borderWidth: 1,
    borderColor: market.aiPurpleBorder,
    borderRadius: mRadius.xs,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginBottom: 5,
  },
  aiPillText: { fontSize: 10, fontWeight: '600', color: market.aiPurpleText },
  forecast: { fontSize: 16, fontWeight: '600' },
  forecastSub: { fontSize: 10, color: market.n4 },
  confPill: {
    marginTop: 4,
    backgroundColor: market.aiPurpleBg,
    borderWidth: 1,
    borderColor: market.aiPurpleBorder,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  confText: { fontSize: 10, color: market.aiPurpleText, fontWeight: '600' },
});
