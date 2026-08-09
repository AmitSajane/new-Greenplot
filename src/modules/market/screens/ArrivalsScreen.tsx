import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppHeader } from '../../../components/molecules/AppHeader';
import { useAuth } from '../../../context/AuthContext';
import INDIA_LOCATIONS from '../../../constants/indiaLocations.json';
import { LANGUAGE_SHORT_LABELS } from '../../../localization/i18n';
import { LanguagePickerModal } from '../../../screens/farmerHome/components/LanguagePickerModal';
import { MandiPrice, mandiApi } from '../../../services/mandiApi';
import { Card, MarketOptionModal, SectionLabel } from '../components';
import { MARKET_CROPS, marketCropForId } from '../constants/marketCatalog';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { market, mRadius, mSpacing, mTypography } from '../theme/marketTokens';

type Navigation = NativeStackNavigationProp<MarketStackParamList, 'Arrivals'>;
type ArrivalsRoute = RouteProp<MarketStackParamList, 'Arrivals'>;
type Picker = 'state' | 'crop' | 'market' | null;

const STATES = Object.keys(INDIA_LOCATIONS as Record<string, unknown>).sort();
const DEFAULT_STATE = 'Karnataka';
const MAX_BARS = 7;

const normalizeDate = (value: string) => {
  const parts = value.split(/[\/-]/).map(Number);
  if (parts.length !== 3) return 0;
  const [first, second, third] = parts;
  const year = first > 31 ? first : third;
  const month = second;
  const day = first > 31 ? third : first;
  return new Date(year, month - 1, day).getTime();
};

const formatDate = (value: string) => {
  const timestamp = normalizeDate(value);
  if (!timestamp) return value;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(timestamp);
};

export default function ArrivalsScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ArrivalsRoute>();
  const { user } = useAuth();
  const { i18n, t } = useTranslation();

  const requestedCrop = marketCropForId(route.params?.cropId);
  const profileState = (user as { state?: string } | null)?.state;
  const initialState = profileState && STATES.includes(profileState) ? profileState : DEFAULT_STATE;

  const [state, setState] = useState(initialState);
  const [crop, setCrop] = useState(requestedCrop.name);
  const [marketName, setMarketName] = useState('');
  const [picker, setPicker] = useState<Picker>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [records, setRecords] = useState<MandiPrice[]>([]);
  const [commodities, setCommodities] = useState<string[]>(MARKET_CROPS.map(item => item.name));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    mandiApi.commoditiesForState(state, controller.signal).then(options => {
      if (options.length) setCommodities(options);
    });
    return () => controller.abort();
  }, [state]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    mandiApi
      .fetchPrices({ state, commodity: crop, limit: 500 }, controller.signal)
      .then(nextRecords => {
        if (!active) return;
        setRecords(nextRecords);
        const availableMarkets = Array.from(new Set(nextRecords.map(item => item.market).filter(Boolean))).sort();
        setMarketName(current => (current && availableMarkets.includes(current) ? current : availableMarkets[0] ?? ''));
        if (!nextRecords.length) setError('market.arrivals.noData');
      })
      .catch(() => active && setError('market.arrivals.loadError'))
      .finally(() => {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [crop, state, reloadKey]);

  const markets = useMemo(
    () => Array.from(new Set(records.map(item => item.market).filter(Boolean))).sort(),
    [records],
  );
  const marketRecords = useMemo(
    () => (marketName ? records.filter(item => item.market === marketName) : records),
    [marketName, records],
  );

  const dailyActivity = useMemo(() => {
    const grouped = new Map<string, { count: number; prices: number[] }>();
    marketRecords.forEach(record => {
      const current = grouped.get(record.arrivalDate) ?? { count: 0, prices: [] };
      current.count += 1;
      current.prices.push(record.modalPrice);
      grouped.set(record.arrivalDate, current);
    });
    return Array.from(grouped.entries())
      .map(([date, value]) => ({
        date,
        count: value.count,
        price: value.prices.reduce((sum, price) => sum + price, 0) / value.prices.length,
      }))
      .sort((a, b) => normalizeDate(a.date) - normalizeDate(b.date))
      .slice(-MAX_BARS);
  }, [marketRecords]);

  const districtSources = useMemo(() => {
    const grouped = new Map<string, number>();
    records.forEach(record => grouped.set(record.district, (grouped.get(record.district) ?? 0) + 1));
    const total = records.length || 1;
    return Array.from(grouped.entries())
      .map(([label, count]) => ({ label: label || t('market.arrivals.unknownDistrict'), count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [records, t]);

  const intelligence = useMemo(() => {
    if (dailyActivity.length < 2) {
      return {
        tone: 'neutral' as const,
        title: t('market.arrivals.moreHistory'),
        body: t('market.arrivals.moreHistoryBody'),
      };
    }
    const first = dailyActivity[0].price;
    const latest = dailyActivity[dailyActivity.length - 1].price;
    const change = first ? ((latest - first) / first) * 100 : 0;
    if (change <= -5) {
      return {
        tone: 'risk' as const,
        title: t('market.arrivals.pressure'),
        body: t('market.arrivals.pressureBody', { change: Math.abs(change).toFixed(1) }),
      };
    }
    if (change >= 5) {
      return {
        tone: 'positive' as const,
        title: t('market.arrivals.positive'),
        body: t('market.arrivals.positiveBody', { change: change.toFixed(1) }),
      };
    }
    return {
      tone: 'neutral' as const,
      title: t('market.arrivals.stable'),
      body: t('market.arrivals.stableBody', { change: Math.abs(change).toFixed(1) }),
    };
  }, [dailyActivity, t]);

  const maxActivity = Math.max(1, ...dailyActivity.map(item => item.count));
  const latestRecord = [...records].sort((a, b) => normalizeDate(b.arrivalDate) - normalizeDate(a.arrivalDate))[0];
  const languageShort = LANGUAGE_SHORT_LABELS[i18n.language] || 'EN';

  const openPicker = useCallback((value: Exclude<Picker, null>) => setPicker(value), []);
  const refresh = useCallback(() => {
    setRefreshing(true);
    setReloadKey(value => value + 1);
  }, []);

  const pickerConfig = {
    state: { title: t('market.common.state'), options: STATES, selected: state },
    crop: { title: t('market.common.crop'), options: commodities, selected: crop },
    market: { title: t('market.arrivals.market'), options: markets, selected: marketName },
  } as const;
  const activePicker = picker ? pickerConfig[picker] : null;

  const selectPickerValue = (value: string) => {
    if (picker === 'state') {
      setState(value);
      setMarketName('');
    } else if (picker === 'crop') {
      setCrop(value);
      setMarketName('');
    } else if (picker === 'market') {
      setMarketName(value);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        data={{
          variant: 'default',
          title: t('market.arrivals.title'),
          subtitle: marketName || `${crop} · ${state}`,
          name: user?.name,
          languageShort,
          hasNotificationDot: true,
        }}
        handler={{
          onProfilePress: () => navigation.navigate('Settings'),
          onLanguagePress: () => setLanguageOpen(true),
          onNotificationPress: () => navigation.navigate('NotificationsCenter'),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={market.g3} />}
      >
        <View style={styles.selectors}>
          <Selector label={t('market.common.state')} value={state} onPress={() => openPicker('state')} />
          <Selector label={t('market.common.crop')} value={crop} onPress={() => openPicker('crop')} />
        </View>
        <Selector label={t('market.arrivals.market')} value={marketName || t('market.arrivals.noMarket')} onPress={() => openPicker('market')} disabled={!markets.length} />

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={market.g3} />
            <Text style={styles.stateText}>{t('market.arrivals.loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Ionicons name="cloud-offline-outline" size={42} color={market.n5} />
            <Text style={styles.stateTitle}>{t('market.arrivals.unavailable')}</Text>
            <Text style={styles.stateText}>{t(error, { crop, state })}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryText}>{t('market.common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.metaRow}>
              <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>{t('market.arrivals.official')}</Text></View>
              <Text style={styles.updatedText}>{t('market.arrivals.updated', { date: latestRecord ? latestRecord.arrivalDate : '—' })}</Text>
            </View>

            <Card style={styles.chartCard}>
              <Text style={styles.cardTitle}>{t('market.arrivals.activity')}</Text>
              <Text style={styles.cardSubtitle}>{t('market.arrivals.activitySub')}</Text>
              <View style={styles.chart}>
                {dailyActivity.map(item => (
                  <View key={item.date} style={styles.barColumn}>
                    <Text style={styles.barValue}>{item.count}</Text>
                    <View style={[styles.bar, { height: 18 + (item.count / maxActivity) * 66 }]} />
                    <Text style={styles.barLabel}>{formatDate(item.date)}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <View style={[styles.insightCard, styles[`${intelligence.tone}Insight`]]}>
              <Ionicons
                name={intelligence.tone === 'risk' ? 'warning' : intelligence.tone === 'positive' ? 'trending-up' : 'analytics'}
                size={22}
                color={intelligence.tone === 'risk' ? market.r2 : intelligence.tone === 'positive' ? market.g3 : market.a2}
              />
              <View style={styles.flexContent}>
                <Text style={styles.insightTitle}>{intelligence.title}</Text>
                <Text style={styles.insightBody}>{intelligence.body}</Text>
                <Text style={styles.disclosure}>{t('market.arrivals.disclosure')}</Text>
              </View>
            </View>

            <SectionLabel label={t('market.arrivals.coverage')} />
            <Card>
              {districtSources.map(source => (
                <View key={source.label} style={styles.sourceRow}>
                  <View style={styles.sourceHeader}>
                    <Text style={styles.sourceLabel}>{source.label}</Text>
                    <Text style={styles.sourceValue}>{t('market.arrivals.recordCount', { count: source.count })} · {source.pct}%</Text>
                  </View>
                  <View style={styles.track}><View style={[styles.fill, { width: `${source.pct}%` }]} /></View>
                </View>
              ))}
            </Card>

            <SectionLabel label={t('market.arrivals.actions')} />
            <View style={styles.actions}>
              <ActionButton
                icon="storefront-outline"
                label={t('market.arrivals.compare')}
                onPress={() => navigation.navigate('MandiList', {
                  cropId: route.params?.cropId,
                  commodity: crop,
                  state,
                  market: marketName,
                })}
              />
              <ActionButton icon="trending-up-outline" label={t('market.arrivals.trend')} onPress={() => navigation.navigate('PriceTrend', { cropId: route.params?.cropId, commodity: crop, state, market: marketName })} />
              <ActionButton icon="sparkles-outline" label={t('market.arrivals.ai')} onPress={() => navigation.navigate('AIInsight', { cropId: route.params?.cropId })} />
            </View>
          </>
        )}
      </ScrollView>

      {activePicker ? (
        <MarketOptionModal
          visible
          title={activePicker.title}
          options={[...activePicker.options]}
          selected={activePicker.selected}
          onSelect={selectPickerValue}
          onClose={() => setPicker(null)}
        />
      ) : null}
      <LanguagePickerModal visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </View>
  );
}

function Selector({ label, value, onPress, disabled = false }: { label: string; value: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity style={[styles.selector, disabled && styles.selectorDisabled]} onPress={onPress} disabled={disabled}>
      <View style={styles.flexContent}>
        <Text style={styles.selectorLabel}>{label}</Text>
        <Text style={styles.selectorValue} numberOfLines={1}>{value}</Text>
      </View>
      <Ionicons name="chevron-down" size={18} color={market.n4} />
    </TouchableOpacity>
  );
}

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Ionicons name={icon} size={22} color={market.g3} />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: market.n8 },
  scrollContent: { padding: mSpacing.lg, paddingBottom: mSpacing.xxl },
  selectors: { flexDirection: 'row', gap: mSpacing.sm, marginBottom: mSpacing.sm },
  selector: {
    minHeight: 58,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: mSpacing.sm,
    backgroundColor: market.white,
    borderWidth: 1,
    borderColor: market.n7,
    borderRadius: mRadius.md,
    paddingHorizontal: mSpacing.md,
    marginBottom: mSpacing.sm,
  },
  selectorDisabled: { opacity: 0.5 },
  flexContent: { flex: 1 },
  selectorLabel: { fontSize: mTypography.caption, color: market.n4, fontWeight: '600' },
  selectorValue: { fontSize: mTypography.body, color: market.n1, fontWeight: '700', marginTop: 2 },
  centerState: { minHeight: 320, alignItems: 'center', justifyContent: 'center', paddingHorizontal: mSpacing.xxl },
  stateTitle: { fontSize: mTypography.subtitle, fontWeight: '700', color: market.n2, marginTop: mSpacing.md },
  stateText: { fontSize: mTypography.body, color: market.n4, textAlign: 'center', marginTop: mSpacing.sm, lineHeight: 21 },
  retryButton: { minHeight: 44, justifyContent: 'center', backgroundColor: market.g3, borderRadius: mRadius.sm, paddingHorizontal: mSpacing.xl, marginTop: mSpacing.lg },
  retryText: { fontSize: mTypography.body, color: market.white, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: mSpacing.sm },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: market.g4 },
  liveText: { fontSize: mTypography.caption, color: market.g3, fontWeight: '700' },
  updatedText: { fontSize: mTypography.caption, color: market.n4 },
  chartCard: { marginBottom: mSpacing.md },
  cardTitle: { fontSize: mTypography.subtitle, fontWeight: '700', color: market.n2 },
  cardSubtitle: { fontSize: mTypography.small, color: market.n4, marginTop: 3 },
  chart: { height: 140, flexDirection: 'row', alignItems: 'flex-end', gap: 5, marginTop: mSpacing.md },
  barColumn: { flex: 1, alignItems: 'center', gap: 4 },
  barValue: { fontSize: mTypography.caption, color: market.n3, fontWeight: '700' },
  bar: { width: '82%', maxWidth: 48, minHeight: 18, backgroundColor: market.g4, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  barLabel: { fontSize: mTypography.chart, color: market.n4, textAlign: 'center' },
  insightCard: { flexDirection: 'row', gap: mSpacing.sm, borderWidth: 1, borderRadius: mRadius.md, padding: mSpacing.md, marginBottom: mSpacing.lg },
  riskInsight: { backgroundColor: market.r5, borderColor: market.r4 },
  positiveInsight: { backgroundColor: market.g7, borderColor: market.g6 },
  neutralInsight: { backgroundColor: market.a7, borderColor: market.a6 },
  insightTitle: { fontSize: mTypography.bodyStrong, fontWeight: '700', color: market.n1 },
  insightBody: { fontSize: mTypography.body, color: market.n3, lineHeight: 21, marginTop: 3 },
  disclosure: { fontSize: mTypography.caption, color: market.n4, lineHeight: 18, marginTop: mSpacing.sm },
  sourceRow: { marginBottom: mSpacing.md },
  sourceHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: mSpacing.sm, marginBottom: 5 },
  sourceLabel: { flex: 1, fontSize: mTypography.body, color: market.n2, fontWeight: '600' },
  sourceValue: { fontSize: mTypography.small, color: market.g3, fontWeight: '700' },
  track: { height: 7, overflow: 'hidden', borderRadius: 4, backgroundColor: market.n7 },
  fill: { height: 7, borderRadius: 4, backgroundColor: market.g4 },
  actions: { flexDirection: 'row', gap: mSpacing.sm },
  actionButton: { minHeight: 82, flex: 1, alignItems: 'center', justifyContent: 'center', gap: mSpacing.sm, backgroundColor: market.white, borderWidth: 1, borderColor: market.n7, borderRadius: mRadius.md, padding: mSpacing.sm },
  actionLabel: { fontSize: mTypography.small, color: market.g2, fontWeight: '700', textAlign: 'center' },
});
