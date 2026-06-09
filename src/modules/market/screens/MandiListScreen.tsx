import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, MandiRow, MarketHeader } from '../components';
import { market, mRadius } from '../theme/marketTokens';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { MOCK_CROPS, MOCK_CROP_MARKETS, MOCK_MANDIS } from '../mockData';

const FILTERS = ['All', 'Karnataka', 'Maharashtra', 'Andhra', 'Nearest first'];

export default function MandiListScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MarketStackParamList, 'MandiList'>>();
  const cropId = route.params?.cropId ?? 'tomato';
  const crop = MOCK_CROPS.find(c => c.id === cropId)!;
  const data = MOCK_CROP_MARKETS[cropId];
  const [filter, setFilter] = useState(0);

  return (
    <View style={styles.container}>
      <MarketHeader eyebrow={`${crop.emoji} ${crop.name} · All markets`} title="Mandi prices" onBack={() => navigation.goBack()}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.searchPlaceholder}>Search mandis…</Text>
          </View>
          <View style={styles.filterBtn}>
            <Ionicons name="options" size={14} color="rgba(255,255,255,0.7)" />
          </View>
        </View>
      </MarketHeader>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {FILTERS.map((f, i) => (
          <Text
            key={f}
            onPress={() => setFilter(i)}
            style={[styles.chip, i === filter && styles.chipActive]}
          >
            {f}
          </Text>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View>
          {MOCK_MANDIS.map(m => (
            <MandiRow key={m.id} mandi={m} unit={data.unit} />
          ))}
        </View>

        <View style={styles.transportWrap}>
          <Card style={{ backgroundColor: market.g7, borderColor: market.g6 }}>
            <View style={styles.transportHead}>
              <Ionicons name="bus" size={14} color={market.g1} />
              <Text style={styles.transportTitle}>Transport cost calculator</Text>
            </View>
            <Text style={styles.transportBody}>
              Best mandi: <Text style={styles.bold}>Belagavi</Text> · ₹22/kg{'\n'}
              Transport est: ₹1.4/kg for 74 km{'\n'}
              Net gain over Dharwad: <Text style={[styles.bold, { color: market.g1 }]}>+₹2.6/kg</Text>
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  searchRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: mRadius.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchPlaceholder: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  filterBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: mRadius.xs,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
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
  transportWrap: { margin: 14 },
  transportHead: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  transportTitle: { fontSize: 11, fontWeight: '600', color: market.g1 },
  transportBody: { fontSize: 11, color: market.g2, lineHeight: 18 },
  bold: { fontWeight: '700' },
});
