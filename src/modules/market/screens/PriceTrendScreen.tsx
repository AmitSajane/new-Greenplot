import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  ChartCard,
  ComparisonChart,
  LegendItem,
  MarketHeader,
  PriceAreaChart,
  SectionLabel,
} from '../components';
import { MOCK_CROPS, MOCK_CROP_MARKETS } from '../mockData';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { market, mSpacing } from '../theme/marketTokens';

type PriceTrendNavigation = NativeStackNavigationProp<MarketStackParamList, 'PriceTrend'>;
type PriceTrendRoute = RouteProp<MarketStackParamList, 'PriceTrend'>;
type PriceLevel = {
  label: string;
  value: string;
  color: string;
};

const DEFAULT_CROP_ID = 'tomato';
const COMPARISON_CROP_ID = 'onion';

export default function PriceTrendScreen() {
  const navigation = useNavigation<PriceTrendNavigation>();
  const route = useRoute<PriceTrendRoute>();

  const requestedCropId = route.params?.cropId ?? DEFAULT_CROP_ID;
  const cropId = MOCK_CROP_MARKETS[requestedCropId] ? requestedCropId : DEFAULT_CROP_ID;
  const crop = MOCK_CROPS.find(item => item.id === cropId) ?? MOCK_CROPS[0];
  const data = MOCK_CROP_MARKETS[cropId];
  const comparisonData = MOCK_CROP_MARKETS[COMPARISON_CROP_ID];

  const levels = useMemo<PriceLevel[]>(
    () => [
      { label: 'Today', value: `₹${data.price}/${data.unit}`, color: market.n1 },
      {
        label: '30-day forecast',
        value: `₹${data.forecast30d}/${data.unit}`,
        color: data.trend === 'rising' ? market.g3 : market.r2,
      },
      {
        label: 'Best mandi',
        value: `${data.bestMandi} ₹${data.bestMandiPrice}/${data.unit}`,
        color: market.g3,
      },
      { label: '52-week high', value: `₹${data.week52High}/${data.unit}`, color: market.g2 },
      { label: '52-week low', value: `₹${data.week52Low}/${data.unit}`, color: market.r2 },
    ],
    [data],
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <MarketHeader
          eyebrow={`${crop.emoji} ${crop.name} · Price analysis`}
          title="Full price trend"
          onBack={navigation.goBack}
        />
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ChartCard
          title="6-week history + 30-day AI forecast"
          sub={`${data.referenceMandi} · Reference line = today`}
          ai
        >
          <PriceAreaChart history={data.history} forecast={data.forecast} height={150} />
          <View style={styles.legend}>
            <LegendItem color={market.g4} label="Actual price" />
            <LegendItem color={market.a3} label="AI forecast" />
          </View>
        </ChartCard>

        <View style={styles.section}>
          <SectionLabel label="Key price levels" />
          <Card>
            {levels.map((level, index) => (
              <View
                key={level.label}
                style={[styles.levelRow, index === levels.length - 1 && styles.lastLevelRow]}
              >
                <Text style={styles.levelLabel}>{level.label}</Text>
                <Text numberOfLines={1} style={[styles.levelValue, { color: level.color }]}>
                  {level.value}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <ChartCard title="Compare crops">
            <ComparisonChart
              seriesA={data.history}
              seriesB={comparisonData.history}
              height={88}
              dots={false}
            />
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
  screen: {
    flex: 1,
    backgroundColor: market.n8,
  },
  headerSafeArea: {
    backgroundColor: market.g1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: mSpacing.lg,
    paddingTop: mSpacing.lg,
    paddingBottom: mSpacing.xxl,
  },
  section: {
    marginTop: mSpacing.lg,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: mSpacing.sm,
    rowGap: mSpacing.sm,
  },
  levelRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: market.n7,
    gap: mSpacing.md,
  },
  lastLevelRow: {
    borderBottomWidth: 0,
  },
  levelLabel: {
    flexShrink: 0,
    fontSize: 14,
    color: market.n4,
  },
  levelValue: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
});
