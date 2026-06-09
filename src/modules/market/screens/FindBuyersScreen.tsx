import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MarketHeader } from '../components';
import { market, mRadius } from '../theme/marketTokens';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { MOCK_BUYERS, MOCK_CROPS } from '../mockData';
import { Buyer } from '../types';

const FILTERS = ['Nearby', 'Best price', 'Bulk only', 'With transport'];

const avatarTone = {
  strong: { bg: market.b5, fg: market.b2 },
  normal: { bg: market.a7, fg: market.a1 },
  low: { bg: market.r5, fg: market.r1 },
};
const tagTone = {
  green: { bg: market.g7, fg: market.g2 },
  blue: { bg: market.b5, fg: market.b2 },
  amber: { bg: market.a7, fg: market.a1 },
  purple: { bg: '#F3E8FD', fg: '#4A148C' },
};

function BuyerCard({ buyer }: { buyer: Buyer }) {
  const av = avatarTone[buyer.tone];
  return (
    <View style={[styles.buyerCard, buyer.tone === 'strong' && { borderLeftWidth: 3, borderLeftColor: market.g3 }]}>
      <View style={[styles.avatar, { backgroundColor: av.bg }]}>
        <Text style={[styles.avatarText, { color: av.fg }]}>{buyer.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.buyerName}>{buyer.name}</Text>
        <Text style={styles.buyerCrop}>{buyer.crops}</Text>
        <View style={styles.tagRow}>
          {buyer.tags.map(t => {
            const tt = tagTone[t.tone];
            return (
              <Text key={t.label} style={[styles.tag, { backgroundColor: tt.bg, color: tt.fg }]}>
                {t.label}
              </Text>
            );
          })}
        </View>
      </View>
      <View style={styles.priceCol}>
        <Text style={[styles.buyerPrice, buyer.tone === 'low' && { color: market.n3 }]}>₹{buyer.price}/kg</Text>
        <TouchableOpacity style={[styles.chatBtn, buyer.tone === 'low' && { backgroundColor: market.n5 }]}>
          <Text style={styles.chatBtnText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FindBuyersScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MarketStackParamList, 'FindBuyers'>>();
  const cropId = route.params?.cropId ?? 'tomato';
  const crop = MOCK_CROPS.find(c => c.id === cropId)!;
  const [filter, setFilter] = useState(0);

  return (
    <View style={styles.container}>
      <MarketHeader eyebrow={`${crop.emoji} ${crop.name} · Direct buyers`} title="Find buyers" onBack={() => navigation.goBack()} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {FILTERS.map((f, i) => (
          <Text key={f} onPress={() => setFilter(i)} style={[styles.chip, i === filter && styles.chipActive]}>
            {f}
          </Text>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.stockCard}>
          <Text style={styles.stockLabel}>Your available stock</Text>
          <Text style={styles.stockValue}>1,200 kg {crop.name}</Text>
          <Text style={styles.stockSub}>Ready to sell · Harvest in 3 days</Text>
          <TouchableOpacity style={styles.matchBtn}>
            <Text style={styles.matchBtnText}>Find best match →</Text>
          </TouchableOpacity>
        </View>

        {MOCK_BUYERS.map(b => (
          <BuyerCard key={b.id} buyer={b} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  filterBar: {
    backgroundColor: market.white,
    borderBottomWidth: 1,
    borderBottomColor: market.n7,
    flexGrow: 0,
  },
  filterBarContent: { paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  chip: {
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: market.n6,
    color: market.n4,
  },
  chipActive: { backgroundColor: market.g2, color: '#fff', borderColor: market.g2 },
  stockCard: {
    margin: 14,
    backgroundColor: market.g7,
    borderWidth: 1,
    borderColor: market.g6,
    borderRadius: mRadius.md,
    padding: 12,
  },
  stockLabel: { fontSize: 11, color: market.n4, marginBottom: 4 },
  stockValue: { fontSize: 16, fontWeight: '700', color: market.g1 },
  stockSub: { fontSize: 11, color: market.n4 },
  matchBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: market.g2,
    borderRadius: mRadius.sm,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  matchBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  buyerCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: market.white,
    borderWidth: 1,
    borderColor: market.n7,
    borderRadius: mRadius.md,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginHorizontal: 14,
    marginBottom: 8,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '600' },
  buyerName: { fontSize: 12, fontWeight: '600', color: market.n2 },
  buyerCrop: { fontSize: 10, color: market.n4, marginVertical: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  tag: { fontSize: 9, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10, overflow: 'hidden' },
  priceCol: { alignItems: 'flex-end' },
  buyerPrice: { fontSize: 14, fontWeight: '700', color: market.g2 },
  chatBtn: { backgroundColor: market.g4, borderRadius: mRadius.xs, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 },
  chatBtnText: { color: '#fff', fontSize: 10, fontWeight: '600' },
});
