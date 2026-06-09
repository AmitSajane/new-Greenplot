import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { market, mRadius } from '../theme/marketTokens';
import { Mandi } from '../types';

/** Single mandi price row with rank accent + today's change. */
export default function MandiRow({ mandi, unit = 'kg' }: { mandi: Mandi; unit?: string }) {
  const isBest = mandi.rank === 'best';
  const isNearest = mandi.rank === 'nearest';
  const accent = isBest ? market.g3 : mandi.rank === 'lowest' ? market.r3 : market.n5;
  const up = mandi.changeToday >= 0;
  const changeStr = `${up ? '▲ +' : '▼ '}₹${Math.abs(mandi.changeToday)} today`;
  return (
    <View style={[styles.row, { borderLeftColor: accent }]}>
      <View style={styles.emojiBox}>
        <Text style={styles.emoji}>{mandi.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, (isBest || isNearest) && { color: market.g2, fontWeight: '700' }]}>
          {mandi.name}
        </Text>
        <Text style={styles.loc}>{mandi.location}</Text>
      </View>
      <View style={styles.priceCol}>
        <Text style={[styles.price, isBest && { color: market.g2 }]}>
          ₹{mandi.price}/{unit}
        </Text>
        <Text style={[styles.change, { color: up ? market.g3 : market.r2 }]}>{changeStr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: market.n8,
    borderLeftWidth: 3,
    backgroundColor: market.white,
  },
  emojiBox: {
    width: 34,
    height: 34,
    backgroundColor: market.g7,
    borderRadius: mRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 17 },
  name: { fontSize: 12, fontWeight: '600', color: market.n2 },
  loc: { fontSize: 10, color: market.n4, marginTop: 1 },
  priceCol: { alignItems: 'flex-end' },
  price: { fontSize: 15, fontWeight: '700', color: market.n1 },
  change: { fontSize: 10, fontWeight: '600', marginTop: 1 },
});
