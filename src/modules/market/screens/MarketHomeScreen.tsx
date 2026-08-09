import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppHeader } from '../../../components/molecules/AppHeader';
import { useAuth } from '../../../context/AuthContext';
import { LANGUAGE_SHORT_LABELS } from '../../../localization/i18n';
import { LanguagePickerModal } from '../../../screens/farmerHome/components/LanguagePickerModal';
import { MandiPrice, mandiApi } from '../../../services/mandiApi';
import { ChartCard, CropTabs, MarketHeader, NavStrip, StatTile } from '../components';
import { MARKET_CROPS, marketCropForId } from '../constants/marketCatalog';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { market, mRadius, mSpacing, mTypography } from '../theme/marketTokens';

type Navigation = NativeStackNavigationProp<MarketStackParamList, 'MarketHome'>;

const DEFAULT_STATE = 'Karnataka';

const parseDate = (value: string) => {
  const parts = value.split(/[\/-]/).map(Number);
  if (parts.length !== 3) return 0;
  const [first, month, third] = parts;
  return first > 31
    ? new Date(first, month - 1, third).getTime()
    : new Date(third, month - 1, first).getTime();
};

export default function MarketHomeScreen() {
  const navigation = useNavigation<Navigation>();
  const { user } = useAuth();
  const { i18n, t } = useTranslation();
  const [cropId, setCropId] = useState(MARKET_CROPS[0].id);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [records, setRecords] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const crop = marketCropForId(cropId);
  const state = (user as { state?: string } | null)?.state || DEFAULT_STATE;
  const languageShort = LANGUAGE_SHORT_LABELS[i18n.language] || 'EN';
  const navTabs = [t('market.home.tabs.overview'), t('market.home.tabs.trend'), t('market.home.tabs.arrivals'), t('market.home.tabs.mandis'), t('market.home.tabs.demand'), t('market.home.tabs.ai')];

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    mandiApi
      .fetchPrices({ commodity: crop.name, state, limit: 500 }, controller.signal)
      .then(values => active && setRecords(values))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
      controller.abort();
    };
  }, [crop.name, state]);

  const summary = useMemo(() => {
    if (!records.length) return null;
    const latestByMarket = new Map<string, MandiPrice>();
    records.forEach(record => {
      const current = latestByMarket.get(record.market);
      if (!current || parseDate(record.arrivalDate) > parseDate(current.arrivalDate)) latestByMarket.set(record.market, record);
    });
    const markets = Array.from(latestByMarket.values()).sort((a, b) => b.modalPrice - a.modalPrice);
    const prices = markets.map(item => item.modalPrice);
    const average = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
    const dates = records.map(item => item.arrivalDate).filter(Boolean).sort((a, b) => parseDate(b) - parseDate(a));
    return {
      best: markets[0],
      markets,
      average,
      low: Math.min(...prices),
      high: Math.max(...prices),
      latestDate: dates[0],
    };
  }, [records]);

  const dailyPrices = useMemo(() => {
    const grouped = new Map<string, number[]>();
    records.forEach(record => grouped.set(record.arrivalDate, [...(grouped.get(record.arrivalDate) ?? []), record.modalPrice]));
    return Array.from(grouped.entries())
      .map(([date, prices]) => ({ date, value: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length) }))
      .sort((a, b) => parseDate(a.date) - parseDate(b.date))
      .slice(-7);
  }, [records]);
  const maxDailyPrice = Math.max(1, ...dailyPrices.map(item => item.value));

  const navigateTab = (index: number) => {
    if (index === 1) navigation.navigate('PriceTrend', { cropId });
    if (index === 2) navigation.navigate('Arrivals', { cropId });
    if (index === 3) navigation.navigate('MandiList', { cropId, commodity: crop.name, state });
    if (index === 4) navigation.navigate('DemandMap', { cropId, commodity: crop.name, state });
    if (index === 5) navigation.navigate('AIInsight', { cropId });
  };

  return (
    <View style={styles.container}>
      <AppHeader
        data={{ variant: 'default', title: t('market.home.title'), languageShort, name: user?.name }}
        handler={{
          onProfilePress: () => navigation.navigate('Settings'),
          onLanguagePress: () => setLanguageOpen(true),
          onNotificationPress: () => navigation.navigate('NotificationsCenter'),
        }}
      />
      <MarketHeader
        safeTop={false}
        eyebrow={t('market.home.eyebrow')}
        title={t('market.home.title')}
        badge={summary ? `${t('market.home.officialData')} · ${state}` : t('market.home.officialData')}
        rightLabel={t('market.home.latestRecord')}
        rightValue={summary?.latestDate || t('market.common.unavailable')}
      />
      <CropTabs crops={MARKET_CROPS} activeId={cropId} onSelect={setCropId} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loading}><ActivityIndicator color={market.g3} /><Text style={styles.loadingText}>{t('market.home.loading')}</Text></View>
        ) : summary ? (
          <>
            <View style={styles.priceHero}>
              <View>
                <Text style={styles.cropName}>{crop.emoji} {t(`market.crops.${crop.id}`, { defaultValue: crop.name })}</Text>
                <Text style={styles.price}>₹{summary.average.toLocaleString(i18n.language)}<Text style={styles.unit}>{t('market.common.quintalUnit')}</Text></Text>
                <Text style={styles.reference}>{t('market.home.stateMarketAverage')} · {state}</Text>
              </View>
              <View style={styles.bestBox}>
                <Text style={styles.bestLabel}>{t('market.home.bestReported')}</Text>
                <Text style={styles.bestPrice}>₹{summary.best.modalPrice.toLocaleString(i18n.language)}{t('market.common.quintalUnit')}</Text>
                <Text style={styles.bestMarket} numberOfLines={1}>{summary.best.market}</Text>
              </View>
            </View>

            <View style={styles.rangeCard}>
              <View style={styles.rangeHeader}><Text style={styles.rangeLabel}>{t('market.home.range')}</Text><Text style={styles.rangeValue}>₹{summary.low.toLocaleString(i18n.language)} — ₹{summary.high.toLocaleString(i18n.language)}</Text></View>
              <View style={styles.rangeTrack}><View style={styles.rangeFill} /></View>
              <View style={styles.rangeTicks}><Text style={styles.tick}>{t('market.home.lowest')}</Text><Text style={styles.tick}>{t('market.common.markets', { count: summary.markets.length })}</Text><Text style={styles.tick}>{t('market.home.highest')}</Text></View>
            </View>

            <TouchableOpacity
              style={styles.storageAction}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ColdStorageList', { cropName: crop.name })}
            >
              <View style={styles.storageIcon}><Ionicons name="snow" size={22} color={market.b2} /></View>
              <View style={styles.storageContent}>
                <Text style={styles.storageTitle}>{t('market.storageEntry.title')}</Text>
                <Text style={styles.storageSubtitle}>{t('market.storageEntry.subtitle')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={market.g3} />
            </TouchableOpacity>

            <NavStrip tabs={navTabs} activeIndex={0} onSelect={navigateTab} />

            <View style={styles.statGrid}>
              <StatTile label={t('market.home.reporting')} value={`${summary.markets.length}`} sub={t('market.home.latestPerMarket')} />
              <StatTile label={t('market.home.bestMandi')} value={summary.best.market} sub={`₹${summary.best.modalPrice.toLocaleString(i18n.language)}/q`} valueColor={market.g3} />
              <StatTile label={t('market.home.stateAverage')} value={`₹${summary.average.toLocaleString(i18n.language)}`} sub={t('market.common.perQuintal')} />
              <StatTile label={t('market.home.priceSpread')} value={`₹${(summary.high - summary.low).toLocaleString(i18n.language)}`} sub={t('market.home.highestMinusLowest')} />
            </View>

            <View style={styles.chartWrap}>
              <ChartCard title={t('market.home.chartTitle')} sub={t('market.home.chartSub')}>
                <View style={styles.chart}>
                  {dailyPrices.map(item => (
                    <View key={item.date} style={styles.barColumn}>
                      <Text style={styles.barValue}>₹{item.value.toLocaleString('en-IN')}</Text>
                      <View style={[styles.bar, { height: 20 + (item.value / maxDailyPrice) * 54 }]} />
                      <Text style={styles.barDate}>{item.date.slice(0, 5)}</Text>
                    </View>
                  ))}
                </View>
              </ChartCard>
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('market.home.noRecords')}</Text>
            <Text style={styles.emptyText}>{t('market.home.noRecordsBody', { crop: crop.name, state })}</Text>
            <NavStrip tabs={navTabs} activeIndex={0} onSelect={navigateTab} />
          </View>
        )}
      </ScrollView>
      <LanguagePickerModal visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  scrollContent: { paddingBottom: mSpacing.xxl },
  loading: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: mSpacing.sm },
  loadingText: { fontSize: mTypography.body, color: market.n4 },
  priceHero: { flexDirection: 'row', justifyContent: 'space-between', gap: mSpacing.md, backgroundColor: market.white, margin: mSpacing.lg, borderWidth: 1, borderColor: market.n7, borderRadius: mRadius.md, padding: mSpacing.lg },
  cropName: { fontSize: mTypography.body, color: market.n4, fontWeight: '600' },
  price: { fontSize: mTypography.display, color: market.g1, fontWeight: '800', marginTop: 3 },
  unit: { fontSize: mTypography.body, color: market.n4, fontWeight: '500' },
  reference: { fontSize: mTypography.small, color: market.n4, marginTop: 3 },
  bestBox: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
  bestLabel: { fontSize: mTypography.chart, color: market.g3, fontWeight: '800' },
  bestPrice: { fontSize: mTypography.subtitle, color: market.g2, fontWeight: '800', marginTop: 4 },
  bestMarket: { maxWidth: 140, fontSize: mTypography.small, color: market.n4, marginTop: 2 },
  rangeCard: { backgroundColor: market.white, marginHorizontal: mSpacing.lg, marginBottom: mSpacing.md, borderWidth: 1, borderColor: market.n7, borderRadius: mRadius.md, padding: mSpacing.md },
  rangeHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: mSpacing.sm },
  rangeLabel: { fontSize: mTypography.small, color: market.n4 },
  rangeValue: { fontSize: mTypography.small, color: market.n2, fontWeight: '700' },
  rangeTrack: { height: 7, backgroundColor: market.n7, borderRadius: 4, marginVertical: mSpacing.sm },
  rangeFill: { width: '100%', height: 7, borderRadius: 4, backgroundColor: market.g5, opacity: 0.5 },
  rangeTicks: { flexDirection: 'row', justifyContent: 'space-between' },
  tick: { fontSize: mTypography.caption, color: market.n4 },
  storageAction: { flexDirection: 'row', alignItems: 'center', gap: mSpacing.md, marginHorizontal: mSpacing.lg, marginBottom: mSpacing.md, padding: mSpacing.md, backgroundColor: market.g7, borderWidth: 1, borderColor: market.g6, borderRadius: mRadius.md },
  storageIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: mRadius.sm, backgroundColor: market.white },
  storageContent: { flex: 1 },
  storageTitle: { color: market.g1, fontSize: mTypography.bodyStrong, fontWeight: '800' },
  storageSubtitle: { marginTop: 2, color: market.g3, fontSize: mTypography.small },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: mSpacing.sm, paddingHorizontal: mSpacing.lg, paddingTop: mSpacing.md },
  chartWrap: { paddingHorizontal: mSpacing.lg, paddingTop: mSpacing.md },
  chart: { height: 132, flexDirection: 'row', alignItems: 'flex-end', gap: 5, marginTop: mSpacing.md },
  barColumn: { flex: 1, alignItems: 'center', gap: 4 },
  barValue: { fontSize: mTypography.chart, color: market.n3 },
  bar: { width: '80%', maxWidth: 48, backgroundColor: market.g4, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barDate: { fontSize: mTypography.chart, color: market.n4 },
  empty: { paddingTop: mSpacing.xxl },
  emptyTitle: { fontSize: mTypography.title, color: market.n2, fontWeight: '800', textAlign: 'center' },
  emptyText: { fontSize: mTypography.body, color: market.n4, lineHeight: 21, textAlign: 'center', padding: mSpacing.xxl },
});
