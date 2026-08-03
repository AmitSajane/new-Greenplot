import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import {
  AlertCard,
  ChartCard,
  CropTabs,
  LegendItem,
  MarketHeader,
  NavStrip,
  PriceAreaChart,
  PriceHero,
  StatTile,
} from '../components';
import { market, mRadius } from '../theme/marketTokens';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { MOCK_ALERT_STRIP, MOCK_CROPS, MOCK_CROP_MARKETS } from '../mockData';
import { AppHeader } from '../../../components/molecules/AppHeader';
import { LANGUAGE_SHORT_LABELS } from '../../../localization/i18n';
import { LanguagePickerModal } from '../../../screens/farmerHome/components/LanguagePickerModal';
import { useAuth } from '../../../context/AuthContext';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'MarketHome'>;

const NAV_TABS = ['Overview', 'Price trend', 'Arrivals', 'Mandis', 'Demand', 'AI insight'];
const NAV_ROUTES: (keyof MarketStackParamList)[] = [
  'MarketHome',
  'PriceTrend',
  'Arrivals',
  'MandiList',
  'DemandMap',
  'AIInsight',
];

export default function MarketHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [cropId, setCropId] = useState('tomato');
  const [langOpen, setLangOpen] = useState(false);
  const { i18n } = useTranslation();
  const languageShort = LANGUAGE_SHORT_LABELS[i18n.language] || 'EN';
  const crop = MOCK_CROPS.find(c => c.id === cropId)!;
  const data = MOCK_CROP_MARKETS[cropId];

  // Position of "now" on the 52-week range bar.
  const nowPct = ((data.price - data.week52Low) / (data.week52High - data.week52Low)) * 100;

  return (
    <View style={styles.container}>
      <AppHeader
        data={{ variant: 'default', title: 'Market Intelligence', languageShort, name: user?.name }}
        handler={{
          onProfilePress: () => navigation.navigate('Settings'),
          onLanguagePress: () => setLangOpen(true),
          onNotificationPress: () => navigation.navigate('NotificationsCenter'),
        }}
      />
      <MarketHeader
        eyebrow="AgriArambh"
        title="Market Intelligence"
        badge={`Live · ${data.referenceMandi}`}
        rightLabel="UPDATED"
        rightValue="4 min ago"
      />
      <CropTabs crops={MOCK_CROPS} activeId={cropId} onSelect={setCropId} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Alert strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alertStrip}
        >
          {MOCK_ALERT_STRIP.map(a => {
            const target: keyof MarketStackParamList =
              a.type === 'crash' ? 'OversupplyAlert' : a.type === 'oversupply' ? 'Arrivals' : 'PriceTrend';
            return (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(target as any, { cropId })}
              >
                <AlertCard type={a.type} title={a.title} subtitle={a.subtitle} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <PriceHero crop={crop} data={data} />

        {/* 52-week range */}
        <View style={styles.week52}>
          <View style={styles.week52Head}>
            <Text style={styles.week52Label}>52-week range</Text>
            <Text style={styles.week52Value}>
              ₹{data.week52Low} — ₹{data.week52High}
            </Text>
          </View>
          <View style={styles.wbarTrack}>
            <View style={styles.wbarFill} />
            <View style={[styles.wbarDot, { left: `${Math.max(0, Math.min(96, nowPct))}%` }]} />
          </View>
          <View style={styles.wbarLabels}>
            <Text style={styles.wbarTick}>₹{data.week52Low} Low</Text>
            <Text style={styles.wbarTick}>Now ₹{data.price}</Text>
            <Text style={styles.wbarTick}>₹{data.week52High} High</Text>
          </View>
        </View>

        {/* Section nav → deep screens */}
        <NavStrip
          tabs={NAV_TABS}
          activeIndex={0}
          onSelect={i => {
            const route = NAV_ROUTES[i];
            if (route !== 'MarketHome') navigation.navigate(route as any, { cropId });
          }}
        />

        {/* Quick stats */}
        <View style={styles.statGrid}>
          <StatTile
            label="Demand score"
            value={`${data.demandScore}%`}
            sub={data.demandScore < 50 ? 'Weak demand' : 'Healthy demand'}
            valueColor={data.demandScore < 50 ? market.r2 : market.g3}
            subColor={data.demandScore < 50 ? market.r2 : market.g3}
          />
          <StatTile
            label="Best mandi"
            value={data.bestMandi}
            sub={`₹${data.bestMandiPrice}/${data.unit}`}
            valueColor={market.n2}
            subColor={market.g3}
          />
          <StatTile
            label="Today arrival"
            value={data.todayArrivalMT.toLocaleString('en-IN')}
            sub={`MT at ${data.bestMandi}`}
          />
          <StatTile
            label="Sentiment"
            value={data.sentiment === 'bearish' ? 'Bearish' : data.sentiment === 'bullish' ? 'Bullish' : 'Neutral'}
            sub={data.oversupply ? 'Oversupply risk' : 'Demand steady'}
            valueColor={data.sentiment === 'bearish' ? market.r2 : market.g3}
          />
        </View>

        {/* Mini chart */}
        <View style={styles.chartWrap}>
          <ChartCard
            title="Price history + forecast"
            sub={`${data.referenceMandi} · Past 6 weeks + 30-day forecast`}
            ai
          >
            <PriceAreaChart history={data.history} forecast={data.forecast} />
            <View style={styles.legendRow}>
              <LegendItem color={market.g4} label="Actual" />
              <LegendItem color={market.a3} label="AI Forecast" />
            </View>
          </ChartCard>
        </View>
      </ScrollView>
      <LanguagePickerModal visible={langOpen} onClose={() => setLangOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  alertStrip: { paddingHorizontal: 14, paddingVertical: 10, gap: 7 },
  week52: {
    marginHorizontal: 14,
    marginTop: 8,
    backgroundColor: market.white,
    borderWidth: 1,
    borderColor: market.n7,
    borderRadius: mRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  week52Head: { flexDirection: 'row', justifyContent: 'space-between' },
  week52Label: { fontSize: 10, color: market.n4, fontWeight: '500' },
  week52Value: { fontSize: 10, color: market.n2, fontWeight: '600' },
  wbarTrack: { height: 6, backgroundColor: market.n7, borderRadius: 3, marginVertical: 8, position: 'relative' },
  wbarFill: { height: 6, borderRadius: 3, backgroundColor: market.g5, opacity: 0.35, width: '100%' },
  wbarDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: market.g4,
    borderWidth: 2,
    borderColor: market.white,
    top: -3,
  },
  wbarLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  wbarTick: { fontSize: 10, color: market.n4 },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  chartWrap: { paddingHorizontal: 14, paddingTop: 12 },
  legendRow: { flexDirection: 'row', marginTop: 6 },
});
