import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  Card,
  ChartCard,
  ComparisonChart,
  LegendItem,
  MarketHeader,
  PriceAreaChart,
  SectionLabel,
} from '../components';
import { market } from '../theme/marketTokens';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { MOCK_CROPS, MOCK_CROP_MARKETS } from '../mockData';

export default function PriceTrendScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MarketStackParamList, 'PriceTrend'>>();
  const cropId = route.params?.cropId ?? 'tomato';
  const crop = MOCK_CROPS.find(c => c.id === cropId)!;
  const data = MOCK_CROP_MARKETS[cropId];
  const onion = MOCK_CROP_MARKETS.onion;

  const levels: [string, string, string][] = [
    ['Today', `₹${data.price}/${data.unit}`, market.n1],
    ['30-day forecast', `₹${data.forecast30d}/${data.unit}`, data.trend === 'rising' ? market.g3 : market.r2],
    ['Best mandi', `${data.bestMandi} ₹${data.bestMandiPrice}/${data.unit}`, market.g3],
    ['52-week high', `₹${data.week52High}/${data.unit}`, market.g2],
    ['52-week low', `₹${data.week52Low}/${data.unit}`, market.r2],
  ];

  return (
    <View style={styles.container}>
      <MarketHeader
        eyebrow={`${crop.emoji} ${crop.name} · Price analysis`}
        title="Full price trend"
        onBack={() => navigation.goBack()}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ChartCard
          title="6-week history + 30-day AI forecast"
          sub={`${data.referenceMandi} · Reference line = today`}
        >
          <PriceAreaChart history={data.history} forecast={data.forecast} height={130} />
          <View style={styles.legend}>
            <LegendItem color={market.g4} label="Actual price" />
            <LegendItem color={market.a3} label="AI forecast" />
          </View>
        </ChartCard>

        <View style={{ marginTop: 12 }}>
          <SectionLabel label="Key price levels" />
          <Card>
            {levels.map(([k, v, c], i) => (
              <View key={k} style={[styles.levelRow, i === levels.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.levelKey}>{k}</Text>
                <Text style={[styles.levelVal, { color: c }]}>{v}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ marginTop: 12 }}>
          <ChartCard title="Compare crops">
            <ComparisonChart seriesA={data.history} seriesB={onion.history} height={64} dots={false} />
            <View style={styles.legend}>
              <LegendItem color={market.r3} label={`${crop.emoji} ${crop.name}`} />
              <LegendItem color="#5B9BD5" label="🧅 Onion" />
            </View>
          </ChartCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  scroll: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 28 },
  legend: { flexDirection: 'row', marginTop: 6 },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: market.n8,
  },
  levelKey: { fontSize: 12, color: market.n4 },
  levelVal: { fontSize: 12, fontWeight: '600' },
});
