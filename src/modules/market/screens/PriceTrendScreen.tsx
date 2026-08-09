import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { AppHeader } from '../../../components/molecules/AppHeader';
import INDIA_LOCATIONS from '../../../constants/indiaLocations.json';
import { useAuth } from '../../../context/AuthContext';
import { LANGUAGE_SHORT_LABELS } from '../../../localization/i18n';
import { LanguagePickerModal } from '../../../screens/farmerHome/components/LanguagePickerModal';
import { MandiPrice, mandiApi } from '../../../services/mandiApi';
import { Card, MarketOptionModal } from '../components';
import { MARKET_CROPS, marketCropForId } from '../constants/marketCatalog';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { market, mRadius, mSpacing, mTypography } from '../theme/marketTokens';

type Navigation = NativeStackNavigationProp<MarketStackParamList, 'PriceTrend'>;
type ScreenRoute = RouteProp<MarketStackParamList, 'PriceTrend'>;
type Picker = 'state' | 'crop' | 'market' | null;
type Point = { date: string; value: number };

const STATES = Object.keys(INDIA_LOCATIONS as Record<string, unknown>).sort();
const DEFAULT_STATE = 'Karnataka';
const MAX_POINTS = 12;

const dateValue = (value: string) => {
  const parts = value.split(/[/-]/).map(Number);
  if (parts.length !== 3) return 0;
  const [first, month, third] = parts;
  return first > 31 ? new Date(first, month - 1, third).getTime() : new Date(third, month - 1, first).getTime();
};

const shortDate = (value: string, locale: string) => {
  const timestamp = dateValue(value);
  return timestamp
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(timestamp)
    : value;
};

export default function PriceTrendScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const { user } = useAuth();
  const { i18n, t } = useTranslation();
  const requestedCrop = marketCropForId(route.params?.cropId);
  const profileState = (user as { state?: string } | null)?.state;
  const initialState = route.params?.state || (profileState && STATES.includes(profileState) ? profileState : DEFAULT_STATE);

  const [state, setState] = useState(initialState);
  const [crop, setCrop] = useState(route.params?.commodity || requestedCrop.name);
  const [marketName, setMarketName] = useState(route.params?.market || '');
  const [records, setRecords] = useState<MandiPrice[]>([]);
  const [commodities, setCommodities] = useState(MARKET_CROPS.map(item => item.name));
  const [picker, setPicker] = useState<Picker>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    mandiApi.commoditiesForState(state, controller.signal).then(values => values.length && setCommodities(values));
    return () => controller.abort();
  }, [state]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    mandiApi.fetchPrices({ state, commodity: crop, limit: 500 }, controller.signal)
      .then(values => {
        if (!active) return;
        setRecords(values);
        const names = Array.from(new Set(values.map(item => item.market).filter(Boolean))).sort();
        setMarketName(current => (current && names.includes(current) ? current : names[0] || ''));
      })
      .catch(() => active && setFailed(true))
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
  }, [crop, reloadKey, state]);

  const markets = useMemo(() => Array.from(new Set(records.map(item => item.market).filter(Boolean))).sort(), [records]);
  const points = useMemo(() => {
    const grouped = new Map<string, number[]>();
    records.filter(item => item.market === marketName).forEach(item => {
      grouped.set(item.arrivalDate, [...(grouped.get(item.arrivalDate) || []), item.modalPrice]);
    });
    return Array.from(grouped.entries())
      .map(([date, prices]) => ({ date, value: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length) }))
      .sort((a, b) => dateValue(a.date) - dateValue(b.date))
      .slice(-MAX_POINTS);
  }, [marketName, records]);

  const summary = useMemo(() => {
    if (!points.length) return null;
    const prices = points.map(point => point.value);
    const first = prices[0];
    const latest = prices[prices.length - 1];
    const change = first ? ((latest - first) / first) * 100 : 0;
    return {
      latest,
      low: Math.min(...prices),
      high: Math.max(...prices),
      average: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length),
      change,
    };
  }, [points]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setReloadKey(value => value + 1);
  }, []);
  const locale = i18n.language || 'en';
  const languageShort = LANGUAGE_SHORT_LABELS[locale] || 'EN';
  const activePicker = picker === 'state'
    ? { title: t('market.common.state'), options: STATES, selected: state }
    : picker === 'crop'
      ? { title: t('market.common.crop'), options: commodities, selected: crop }
      : picker === 'market'
        ? { title: t('market.trend.market'), options: markets, selected: marketName }
        : null;

  const selectValue = (value: string) => {
    if (picker === 'state') { setState(value); setMarketName(''); }
    if (picker === 'crop') { setCrop(value); setMarketName(''); }
    if (picker === 'market') setMarketName(value);
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        data={{ variant: 'default', showBack: true, title: t('market.trend.title'), subtitle: `${crop} · ${marketName || state}`, name: user?.name, languageShort }}
        handler={{
          onBackPress: navigation.goBack,
          onLanguagePress: () => setLanguageOpen(true),
          onNotificationPress: () => navigation.navigate('NotificationsCenter'),
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={market.g3} />}
      >
        <View style={styles.selectorRow}>
          <Selector label={t('market.common.state')} value={state} onPress={() => setPicker('state')} />
          <Selector label={t('market.common.crop')} value={crop} onPress={() => setPicker('crop')} />
        </View>
        <Selector label={t('market.trend.market')} value={marketName || t('market.trend.noMarket')} onPress={() => setPicker('market')} disabled={!markets.length} />

        {loading ? <State icon={null} text={t('market.trend.loading')} loading /> : failed ? (
          <State icon="cloud-offline-outline" title={t('market.trend.unavailable')} text={t('market.trend.loadError')} action={t('market.common.retry')} onAction={refresh} />
        ) : !summary ? (
          <State icon="analytics-outline" title={t('market.trend.noData')} text={t('market.trend.noDataBody', { crop, state })} />
        ) : (
          <>
            <View style={styles.metaRow}>
              <View style={styles.official}><View style={styles.dot} /><Text style={styles.officialText}>{t('market.trend.official')}</Text></View>
              <Text style={styles.metaText}>{t('market.trend.points', { count: points.length })}</Text>
            </View>
            <Card style={styles.heroCard}>
              <Text style={styles.eyebrow}>{t('market.trend.latestModal')}</Text>
              <View style={styles.heroRow}>
                <Text style={styles.price}>₹{summary.latest.toLocaleString(locale)}<Text style={styles.unit}>{t('market.common.quintalUnit')}</Text></Text>
                <View style={[styles.changeChip, summary.change < 0 ? styles.negativeChip : styles.positiveChip]}>
                  <Ionicons name={summary.change < 0 ? 'trending-down' : 'trending-up'} size={16} color={summary.change < 0 ? market.r2 : market.g3} />
                  <Text style={[styles.changeText, summary.change < 0 ? styles.negativeText : styles.positiveText]}>{summary.change >= 0 ? '+' : ''}{summary.change.toFixed(1)}%</Text>
                </View>
              </View>
              <Text style={styles.period}>{t('market.trend.periodChange', { first: shortDate(points[0].date, locale), last: shortDate(points[points.length - 1].date, locale) })}</Text>
            </Card>
            <Card style={styles.chartCard}>
              <Text style={styles.cardTitle}>{t('market.trend.chartTitle')}</Text>
              <Text style={styles.cardSubtitle}>{t('market.trend.chartSub')}</Text>
              {points.length > 1 ? <TrendChart points={points} locale={locale} /> : (
                <View style={styles.historyState}><Ionicons name="time-outline" size={28} color={market.a3} /><Text style={styles.historyTitle}>{t('market.trend.moreHistory')}</Text><Text style={styles.historyText}>{t('market.trend.moreHistoryBody')}</Text></View>
              )}
            </Card>
            <View style={styles.stats}>
              <Stat label={t('market.trend.low')} value={`₹${summary.low.toLocaleString(locale)}`} />
              <Stat label={t('market.trend.average')} value={`₹${summary.average.toLocaleString(locale)}`} />
              <Stat label={t('market.trend.high')} value={`₹${summary.high.toLocaleString(locale)}`} />
            </View>
            <View style={styles.disclosure}><Ionicons name="information-circle-outline" size={19} color={market.b2} /><Text style={styles.disclosureText}>{t('market.trend.disclosure')}</Text></View>
          </>
        )}
      </ScrollView>
      {activePicker ? <MarketOptionModal visible title={activePicker.title} options={[...activePicker.options]} selected={activePicker.selected} onSelect={selectValue} onClose={() => setPicker(null)} /> : null}
      <LanguagePickerModal visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </View>
  );
}

function Selector({ label, value, onPress, disabled }: { label: string; value: string; onPress: () => void; disabled?: boolean }) {
  return <TouchableOpacity style={[styles.selector, disabled && styles.disabled]} onPress={onPress} disabled={disabled}><View style={styles.flex}><Text style={styles.selectorLabel}>{label}</Text><Text style={styles.selectorValue} numberOfLines={1}>{value}</Text></View><Ionicons name="chevron-down" size={18} color={market.n4} /></TouchableOpacity>;
}

function State({ icon, title, text, loading, action, onAction }: { icon: string | null; title?: string; text: string; loading?: boolean; action?: string; onAction?: () => void }) {
  return <View style={styles.centerState}>{loading ? <ActivityIndicator size="large" color={market.g3} /> : icon ? <Ionicons name={icon} size={42} color={market.n5} /> : null}{title ? <Text style={styles.stateTitle}>{title}</Text> : null}<Text style={styles.stateText}>{text}</Text>{action ? <TouchableOpacity style={styles.retry} onPress={onAction}><Text style={styles.retryText}>{action}</Text></TouchableOpacity> : null}</View>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>;
}

function TrendChart({ points, locale }: { points: Point[]; locale: string }) {
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.max(260, screenWidth - 60);
  const height = 190;
  const padX = 20;
  const padTop = 24;
  const padBottom = 34;
  const values = points.map(item => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (index: number) => padX + ((width - padX * 2) * index) / (points.length - 1);
  const y = (value: number) => padTop + (height - padTop - padBottom) * (1 - (value - min) / range);
  const path = points.map((item, index) => `${index ? 'L' : 'M'}${x(index)},${y(item.value)}`).join(' ');
  return <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
    {[0, 0.5, 1].map(step => <Line key={step} x1={padX} y1={padTop + (height - padTop - padBottom) * step} x2={width - padX} y2={padTop + (height - padTop - padBottom) * step} stroke={market.n7} strokeWidth={1} />)}
    <Path d={path} fill="none" stroke={market.g4} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    {points.map((item, index) => <Circle key={`${item.date}-${index}`} cx={x(index)} cy={y(item.value)} r={index === points.length - 1 ? 5 : 3} fill={market.g4} stroke={market.white} strokeWidth={2} />)}
    <SvgText x={padX} y={16} fill={market.n4} fontSize={mTypography.chart}>₹{max.toLocaleString(locale)}</SvgText>
    <SvgText x={padX} y={height - 10} fill={market.n4} fontSize={mTypography.chart}>{shortDate(points[0].date, locale)}</SvgText>
    <SvgText x={width - padX} y={height - 10} fill={market.n4} fontSize={mTypography.chart} textAnchor="end">{shortDate(points[points.length - 1].date, locale)}</SvgText>
  </Svg>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: market.n8 }, content: { padding: mSpacing.lg, paddingBottom: mSpacing.xxl },
  selectorRow: { flexDirection: 'row', gap: mSpacing.sm }, selector: { flex: 1, minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: mSpacing.sm, paddingHorizontal: mSpacing.md, marginBottom: mSpacing.sm, backgroundColor: market.white, borderWidth: 1, borderColor: market.n7, borderRadius: mRadius.md }, disabled: { opacity: 0.5 }, flex: { flex: 1 }, selectorLabel: { fontSize: mTypography.caption, color: market.n4, fontWeight: '600' }, selectorValue: { marginTop: 2, fontSize: mTypography.body, color: market.n1, fontWeight: '700' },
  centerState: { minHeight: 360, alignItems: 'center', justifyContent: 'center', paddingHorizontal: mSpacing.xxl }, stateTitle: { marginTop: mSpacing.md, fontSize: mTypography.subtitle, color: market.n2, fontWeight: '800', textAlign: 'center' }, stateText: { marginTop: mSpacing.sm, fontSize: mTypography.body, lineHeight: 21, color: market.n4, textAlign: 'center' }, retry: { minHeight: 44, justifyContent: 'center', marginTop: mSpacing.lg, paddingHorizontal: mSpacing.xl, borderRadius: mRadius.sm, backgroundColor: market.g3 }, retryText: { color: market.white, fontSize: mTypography.body, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: mSpacing.sm }, official: { flexDirection: 'row', alignItems: 'center', gap: 5 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: market.g4 }, officialText: { color: market.g3, fontSize: mTypography.caption, fontWeight: '800' }, metaText: { color: market.n4, fontSize: mTypography.caption },
  heroCard: { marginBottom: mSpacing.md }, eyebrow: { color: market.n4, fontSize: mTypography.small, fontWeight: '700' }, heroRow: { marginTop: mSpacing.xs, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, price: { color: market.g1, fontSize: mTypography.display, fontWeight: '800' }, unit: { color: market.n4, fontSize: mTypography.small, fontWeight: '500' }, changeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: mRadius.pill }, positiveChip: { backgroundColor: market.g7 }, negativeChip: { backgroundColor: market.r5 }, changeText: { fontSize: mTypography.small, fontWeight: '800' }, positiveText: { color: market.g3 }, negativeText: { color: market.r2 }, period: { marginTop: mSpacing.xs, color: market.n4, fontSize: mTypography.caption },
  chartCard: { marginBottom: mSpacing.md }, cardTitle: { color: market.n2, fontSize: mTypography.subtitle, fontWeight: '800' }, cardSubtitle: { marginTop: 2, color: market.n4, fontSize: mTypography.caption }, historyState: { minHeight: 170, alignItems: 'center', justifyContent: 'center', padding: mSpacing.lg }, historyTitle: { marginTop: mSpacing.sm, color: market.n2, fontSize: mTypography.bodyStrong, fontWeight: '700' }, historyText: { marginTop: mSpacing.xs, color: market.n4, fontSize: mTypography.small, lineHeight: 19, textAlign: 'center' },
  stats: { flexDirection: 'row', gap: mSpacing.sm }, stat: { flex: 1, padding: mSpacing.md, backgroundColor: market.white, borderWidth: 1, borderColor: market.n7, borderRadius: mRadius.md }, statLabel: { color: market.n4, fontSize: mTypography.caption }, statValue: { marginTop: 3, color: market.n2, fontSize: mTypography.subtitle, fontWeight: '800' }, disclosure: { flexDirection: 'row', alignItems: 'flex-start', gap: mSpacing.sm, marginTop: mSpacing.md, padding: mSpacing.md, borderRadius: mRadius.md, backgroundColor: market.b5 }, disclosureText: { flex: 1, color: market.b1, fontSize: mTypography.small, lineHeight: 19 },
});
