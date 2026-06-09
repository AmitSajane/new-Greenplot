import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Card, ChartCard, MarketHeader, ProgressRow, SectionLabel } from '../components';
import { market } from '../theme/marketTokens';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { MOCK_CROPS, MOCK_DEMAND_DRIVERS, MOCK_DEMAND_REGIONS } from '../mockData';

const driverColor = { green: market.g4, amber: market.a4, red: market.r3 } as const;

function regionColor(pct: number) {
  if (pct >= 80) return { bar: market.g4, text: market.g1 };
  if (pct >= 65) return { bar: market.g7, border: market.g4, text: market.g2 };
  if (pct >= 50) return { bar: market.a7, border: market.a4, text: market.a2 };
  return { bar: market.r5, border: market.r3, text: market.r2 };
}

export default function DemandMapScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MarketStackParamList, 'DemandMap'>>();
  const cropId = route.params?.cropId ?? 'tomato';
  const crop = MOCK_CROPS.find(c => c.id === cropId)!;

  return (
    <View style={styles.container}>
      <MarketHeader eyebrow={`${crop.emoji} ${crop.name} · Buyer activity`} title="Demand heatmap" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ChartCard title="Regional demand intensity" sub="Buyer activity · North, South, Maharashtra, AP">
          <View style={styles.barRow}>
            {MOCK_DEMAND_REGIONS.map(r => {
              const c = regionColor(r.pct);
              return (
                <View key={r.label} style={styles.barCol}>
                  <Text style={[styles.barPct, { color: c.text }]}>{r.pct}%</Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: 18 + (r.pct / 100) * 50,
                        backgroundColor: c.bar,
                        borderTopWidth: c.border ? 2 : 0,
                        borderTopColor: c.border,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{r.label}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.legendWrap}>
            {[
              ['Very high', market.g1],
              ['High', market.g4],
              ['Moderate', market.a4],
              ['Low', market.r4],
            ].map(([l, c]) => (
              <View key={l} style={styles.legItem}>
                <View style={[styles.legDot, { backgroundColor: c }]} />
                <Text style={styles.legText}>{l}</Text>
              </View>
            ))}
          </View>
        </ChartCard>

        <View style={{ marginTop: 12 }}>
          <SectionLabel label="Demand drivers" />
          <Card>
            {MOCK_DEMAND_DRIVERS.map((d, i) => (
              <ProgressRow
                key={d.label}
                label={d.label}
                value={`${d.pct}%`}
                pct={d.pct}
                color={driverColor[d.tone]}
                last={i === MOCK_DEMAND_DRIVERS.length - 1}
              />
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
  barRow: { flexDirection: 'row', alignItems: 'flex-end', height: 96, gap: 4 },
  barCol: { flex: 1, alignItems: 'center', gap: 3 },
  barPct: { fontSize: 9, fontWeight: '600' },
  bar: { width: '100%', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  barLabel: { fontSize: 9, color: market.n4, textAlign: 'center' },
  legendWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legDot: { width: 10, height: 10, borderRadius: 2, opacity: 0.75 },
  legText: { fontSize: 10, color: market.n4 },
});
