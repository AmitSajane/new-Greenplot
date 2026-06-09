import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, ChartCard, ComparisonChart, LegendItem, MarketHeader } from '../components';
import { market, mRadius } from '../theme/marketTokens';
import { MOCK_CROP_MARKETS } from '../mockData';

export default function CropCompareScreen() {
  const navigation = useNavigation();
  const tomato = MOCK_CROP_MARKETS.tomato;
  const onion = MOCK_CROP_MARKETS.onion;

  const rows: [string, string, string, string, string][] = [
    ['Trend', '▼ Down', market.r2, '▲ Up', market.g3],
    ['Demand', '32%', market.r2, '68%', market.g3],
    ['Best mandi', '₹22', market.n2, '₹27', market.n2],
    ['30d forecast', '₹11', market.r2, '₹28', market.g3],
  ];

  return (
    <View style={styles.container}>
      <MarketHeader eyebrow="Market module" title="Crop comparison" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* A / B cards */}
        <View style={styles.abRow}>
          <View style={[styles.abCard, { backgroundColor: market.g1, borderWidth: 2, borderColor: market.g4 }]}>
            <Text style={[styles.abLabel, { color: market.g6 }]}>Crop A</Text>
            <Text style={styles.abName}>🍅 Tomato</Text>
            <Text style={[styles.abPrice, { color: market.g5 }]}>₹{tomato.price}/kg</Text>
            <Text style={[styles.abTrend, { color: market.r4 }]}>▼ Falling</Text>
          </View>
          <View style={[styles.abCard, { backgroundColor: market.white, borderWidth: 1, borderColor: market.n7 }]}>
            <Text style={[styles.abLabel, { color: market.n4 }]}>Crop B</Text>
            <Text style={[styles.abName, { color: market.n2 }]}>🧅 Onion</Text>
            <Text style={[styles.abPrice, { color: market.g3 }]}>₹{onion.price}/kg</Text>
            <Text style={[styles.abTrend, { color: market.g3 }]}>▲ Rising</Text>
          </View>
        </View>

        <ChartCard title="6-week price comparison">
          <ComparisonChart seriesA={tomato.history} seriesB={onion.history} />
          <View style={styles.legend}>
            <LegendItem color={market.r3} label="🍅 Tomato" />
            <LegendItem color="#5B9BD5" label="🧅 Onion" />
          </View>
        </ChartCard>

        <View style={{ marginTop: 10 }}>
          <Card>
            <View style={styles.tableHead}>
              <Text style={styles.thBlank} />
              <Text style={[styles.thEmoji, { color: market.r2 }]}>🍅</Text>
              <Text style={[styles.thEmoji, { color: '#5B9BD5' }]}>🧅</Text>
            </View>
            {rows.map(([label, a, ac, b, bc]) => (
              <View key={label} style={styles.tableRow}>
                <Text style={styles.tdLabel}>{label}</Text>
                <Text style={[styles.td, { color: ac }]}>{a}</Text>
                <Text style={[styles.td, { color: bc }]}>{b}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  scroll: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 28 },
  abRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  abCard: { flex: 1, borderRadius: mRadius.md, padding: 11 },
  abLabel: { fontSize: 10, marginBottom: 4 },
  abName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  abPrice: { fontSize: 13, marginTop: 2 },
  abTrend: { fontSize: 10, marginTop: 2 },
  legend: { flexDirection: 'row', marginTop: 6 },
  tableHead: { flexDirection: 'row', marginBottom: 4 },
  thBlank: { flex: 1 },
  thEmoji: { flex: 1, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  tdLabel: { flex: 1, fontSize: 11, color: market.n4 },
  td: { flex: 1, fontSize: 11, textAlign: 'center', fontWeight: '500' },
});
