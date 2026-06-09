import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { Card, MarketHeader } from '../components';
import { market, mRadius } from '../theme/marketTokens';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { MOCK_CROPS, MOCK_FORECAST_WEEKS } from '../mockData';

const toneColor = { amber: market.a4, red: market.r3, green: market.g4 } as const;
const priceColor = { amber: market.a2, red: market.r2, green: market.g3 } as const;

export default function PriceForecastScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MarketStackParamList, 'PriceForecast'>>();
  const cropId = route.params?.cropId ?? 'tomato';
  const crop = MOCK_CROPS.find(c => c.id === cropId)!;

  return (
    <View style={styles.container}>
      <MarketHeader
        eyebrow={`${crop.emoji} ${crop.name} · 30-day outlook`}
        title="Price forecast"
        badge="AI · 87% confidence"
        onBack={() => navigation.goBack()}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.cardTitle}>Day-by-day forecast</Text>
          {MOCK_FORECAST_WEEKS.map(w => (
            <View key={w.label} style={styles.predictRow}>
              <Text style={styles.predictDate}>{w.label}</Text>
              <View style={styles.barWrap}>
                <View style={[styles.bar, { width: `${w.pct}%`, backgroundColor: toneColor[w.tone] }]} />
              </View>
              <Text style={[styles.predictPrice, { color: priceColor[w.tone] }]}>₹{w.price}/kg</Text>
              <Text style={[styles.predictChg, { color: w.change >= 0 ? market.g3 : market.r2 }]}>
                {w.change >= 0 ? '+' : '−'}₹{Math.abs(w.change)}
              </Text>
            </View>
          ))}
        </Card>

        <View style={styles.sellWindow}>
          <Text style={styles.sellTitle}>⏰ Best sell window</Text>
          <Text style={styles.sellBody}>
            Sell within <Text style={styles.bold}>next 3–4 days</Text> before the price drops below
            ₹14. If storing, wait until after <Text style={styles.bold}>Nov 25</Text> when prices
            stabilise around ₹12–14.
          </Text>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Confidence interval</Text>
          <Svg width="100%" height={84} viewBox="0 0 220 80">
            <Path d="M10,30 L55,38 L100,52 L145,60 L190,58" fill="none" stroke={market.a4} strokeWidth={1.8} strokeLinecap="round" />
            <Path d="M10,22 L55,30 L100,42 L145,50 L190,46 L190,66 L145,70 L100,62 L55,46 L10,38 Z" fill={market.a6} opacity={0.6} />
            <Path d="M10,22 L55,30 L100,42 L145,50 L190,46" fill="none" stroke={market.a5} strokeWidth={0.8} strokeDasharray="3,2" />
            <Path d="M10,38 L55,46 L100,62 L145,70 L190,66" fill="none" stroke={market.a5} strokeWidth={0.8} strokeDasharray="3,2" />
            <SvgText x={10} y={9} fill={market.n4} fontSize={7}>High</SvgText>
            <SvgText x={10} y={78} fill={market.n4} fontSize={7}>Low</SvgText>
            <Line x1={10} y1={76} x2={200} y2={76} stroke={market.n7} strokeWidth={0.5} />
            <SvgText x={10} y={84} fill={market.n5} fontSize={6.5}>Now</SvgText>
            <SvgText x={180} y={84} fill={market.n5} fontSize={6.5}>+30d</SvgText>
          </Svg>
          <Text style={styles.bandNote}>Shaded area = price range with 80% probability</Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  scroll: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 28, gap: 12 },
  cardTitle: { fontSize: 11, fontWeight: '600', color: market.n3, marginBottom: 10 },
  predictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: market.n8,
  },
  predictDate: { fontSize: 11, color: market.n4, width: 48 },
  barWrap: { flex: 1, height: 6, backgroundColor: market.n8, borderRadius: 3, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3 },
  predictPrice: { fontSize: 11, fontWeight: '600', width: 52, textAlign: 'right' },
  predictChg: { fontSize: 10, width: 36, textAlign: 'right' },
  sellWindow: {
    backgroundColor: market.a7,
    borderWidth: 1,
    borderColor: market.a6,
    borderRadius: mRadius.sm,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  sellTitle: { fontSize: 12, fontWeight: '700', color: market.a1, marginBottom: 4 },
  sellBody: { fontSize: 12, color: market.a2, lineHeight: 19 },
  bold: { fontWeight: '700' },
  bandNote: { fontSize: 10, color: market.n4, marginTop: 4 },
});
