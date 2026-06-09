import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, ChartCard, MarketHeader, ProgressRow, SectionLabel } from '../components';
import { market, mRadius } from '../theme/marketTokens';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { MOCK_ARRIVAL_SOURCES, MOCK_ARRIVAL_WEEK, MOCK_CROPS } from '../mockData';

const levelColor = { low: market.r3, normal: market.g4, high: market.g2, peak: market.r3 } as const;
const sourceColors = [market.g4, market.g5, market.a4, market.a3, market.n5];

export default function ArrivalsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MarketStackParamList, 'Arrivals'>>();
  const cropId = route.params?.cropId ?? 'tomato';
  const crop = MOCK_CROPS.find(c => c.id === cropId)!;
  const maxMt = Math.max(...MOCK_ARRIVAL_WEEK.map(d => d.mt));

  return (
    <View style={styles.container}>
      <MarketHeader eyebrow={`${crop.emoji} ${crop.name} · Supply data`} title="Market arrivals" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ChartCard title="Daily arrivals this week" sub="Metric tonnes · Dharwad APMC">
          <View style={styles.barChart}>
            {MOCK_ARRIVAL_WEEK.map(d => (
              <View key={d.label} style={styles.barCol}>
                <Text style={styles.barVal}>{d.mt.toLocaleString('en-IN')}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: 12 + (d.mt / maxMt) * 64,
                      backgroundColor: levelColor[d.level],
                      opacity: d.level === 'low' || d.level === 'peak' ? 0.7 : 1,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </ChartCard>

        <View style={[styles.supplyAlert, { backgroundColor: market.r5, borderColor: market.r4 }]}>
          <Ionicons name="alert-circle" size={18} color={market.r2} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.supplyTitle, { color: market.r1 }]}>Oversupply detected</Text>
            <Text style={[styles.supplySub, { color: market.r2 }]}>
              Arrivals 38% above seasonal average. Heavy inflow from 6 districts. Price pressure
              expected in 8–12 days.
            </Text>
          </View>
        </View>

        <SectionLabel label="Arrival sources · Today" />
        <Card>
          {MOCK_ARRIVAL_SOURCES.map((s, i) => (
            <ProgressRow
              key={s.label}
              label={s.label}
              value={`${s.mt} MT · ${s.pct}%`}
              pct={s.pct}
              color={sourceColors[i]}
              last={i === MOCK_ARRIVAL_SOURCES.length - 1}
            />
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  scroll: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 28 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 },
  barCol: { flex: 1, alignItems: 'center', gap: 3 },
  barVal: { fontSize: 9, fontWeight: '600', color: market.n3 },
  bar: { width: '100%', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  barLabel: { fontSize: 9, color: market.n4 },
  supplyAlert: {
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderRadius: mRadius.sm,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginVertical: 12,
  },
  supplyTitle: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  supplySub: { fontSize: 11, lineHeight: 17 },
});
