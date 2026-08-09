import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
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
import INDIA_LOCATIONS from '../../../constants/indiaLocations.json';
import { useAuth } from '../../../context/AuthContext';
import { LANGUAGE_SHORT_LABELS } from '../../../localization/i18n';
import { LanguagePickerModal } from '../../../screens/farmerHome/components/LanguagePickerModal';
import { MandiPrice, mandiApi } from '../../../services/mandiApi';
import { Card, MarketOptionModal, SectionLabel } from '../components';
import { MARKET_CROPS, marketCropForId } from '../constants/marketCatalog';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { market, mRadius, mSpacing, mTypography } from '../theme/marketTokens';

type Navigation = NativeStackNavigationProp<MarketStackParamList, 'DemandMap'>;
type DemandRoute = RouteProp<MarketStackParamList, 'DemandMap'>;
type Picker = 'state' | 'crop' | null;

interface DemandSignal extends MandiPrice {
  score: number;
  freshnessDays: number;
  level: 'strong' | 'moderate' | 'limited';
}

const STATES = Object.keys(INDIA_LOCATIONS as Record<string, unknown>).sort();
const DEFAULT_STATE = 'Karnataka';
const ENAM_ADVANCE_DEMAND_URL = 'https://enam.gov.in/web/advance-demand';

const parseDate = (value: string) => {
  const parts = value.split(/[\/-]/).map(Number);
  if (parts.length !== 3) return 0;
  const [first, month, third] = parts;
  return first > 31
    ? new Date(first, month - 1, third).getTime()
    : new Date(third, month - 1, first).getTime();
};

const signalTone = {
  strong: { background: market.g7, border: market.g5, color: market.g2, labelKey: 'market.demand.strong' },
  moderate: { background: market.a7, border: market.a5, color: market.a2, labelKey: 'market.demand.moderate' },
  limited: { background: market.n8, border: market.n6, color: market.n4, labelKey: 'market.demand.limited' },
};

export default function DemandMapScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<DemandRoute>();
  const { user } = useAuth();
  const { i18n, t } = useTranslation();

  const routeCrop = marketCropForId(route.params?.cropId);
  const userState = (user as { state?: string } | null)?.state;
  const [state, setState] = useState(route.params?.state || (userState && STATES.includes(userState) ? userState : DEFAULT_STATE));
  const [commodity, setCommodity] = useState(route.params?.commodity || routeCrop.name);
  const [records, setRecords] = useState<MandiPrice[]>([]);
  const [commodities, setCommodities] = useState<string[]>(MARKET_CROPS.map(item => item.name));
  const [picker, setPicker] = useState<Picker>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    mandiApi.commoditiesForState(state, controller.signal).then(values => {
      if (values.length) setCommodities(values);
    });
    return () => controller.abort();
  }, [state]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    mandiApi
      .compareMarkets(commodity, state, controller.signal)
      .then(values => {
        if (!active) return;
        setRecords(values);
        if (!values.length) setError('market.demand.noData');
      })
      .catch(() => active && setError('market.demand.loadError'))
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
  }, [commodity, reloadKey, state]);

  const signals = useMemo<DemandSignal[]>(() => {
    if (!records.length) return [];
    const prices = records.map(item => item.modalPrice);
    const minimum = Math.min(...prices);
    const maximum = Math.max(...prices);
    const range = maximum - minimum || 1;
    return records
      .map(item => {
        const freshnessDays = item.arrivalDate
          ? Math.max(0, Math.floor((Date.now() - parseDate(item.arrivalDate)) / 86_400_000))
          : 30;
        const priceStrength = ((item.modalPrice - minimum) / range) * 70;
        const freshnessStrength = Math.max(0, 30 - freshnessDays * 3);
        const score = Math.round(Math.min(100, priceStrength + freshnessStrength));
        const level: DemandSignal['level'] = score >= 70 ? 'strong' : score >= 45 ? 'moderate' : 'limited';
        return { ...item, score, freshnessDays, level };
      })
      .sort((a, b) => b.score - a.score);
  }, [records]);

  const summary = useMemo(() => {
    if (!signals.length) return null;
    const best = signals[0];
    const averagePrice = Math.round(signals.reduce((sum, item) => sum + item.modalPrice, 0) / signals.length);
    const freshMarkets = signals.filter(item => item.freshnessDays <= 7).length;
    const spread = Math.max(...signals.map(item => item.modalPrice)) - Math.min(...signals.map(item => item.modalPrice));
    return { best, averagePrice, freshMarkets, spread };
  }, [signals]);

  const languageShort = LANGUAGE_SHORT_LABELS[i18n.language] || 'EN';
  const refresh = useCallback(() => {
    setRefreshing(true);
    setReloadKey(value => value + 1);
  }, []);

  const selectValue = (value: string) => {
    if (picker === 'state') setState(value);
    if (picker === 'crop') setCommodity(value);
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        data={{ variant: 'default', title: t('market.demand.title'), subtitle: `${commodity} · ${state}`, name: user?.name, languageShort }}
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
        <View style={styles.selectorRow}>
          <Selector label={t('market.common.crop')} value={commodity} onPress={() => setPicker('crop')} />
          <Selector label={t('market.common.state')} value={state} onPress={() => setPicker('state')} />
        </View>

        <View style={styles.explainer}>
          <Ionicons name="information-circle" size={21} color={market.b2} />
          <Text style={styles.explainerText}>
            {t('market.demand.explanation')}
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={market.g3} /><Text style={styles.centerText}>{t('market.demand.loading')}</Text></View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={44} color={market.n5} />
            <Text style={styles.emptyTitle}>{t('market.demand.unavailable')}</Text>
            <Text style={styles.centerText}>{t(error, { crop: commodity, state })}</Text>
            <TouchableOpacity style={styles.retry} onPress={refresh}><Text style={styles.retryText}>{t('market.common.retry')}</Text></TouchableOpacity>
          </View>
        ) : summary ? (
          <>
            <Card style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.heroIcon}><Ionicons name="trending-up" size={24} color={market.g2} /></View>
                <View style={styles.flexContent}>
                  <Text style={styles.heroEyebrow}>{t('market.demand.bestSignal')}</Text>
                  <Text style={styles.heroTitle}>{summary.best.market}</Text>
                  <Text style={styles.heroSubtitle}>{summary.best.district} · {summary.best.variety || commodity}</Text>
                </View>
                <View style={styles.scoreBadge}><Text style={styles.scoreValue}>{summary.best.score}</Text><Text style={styles.scoreUnit}>/100</Text></View>
              </View>
              <Text style={styles.heroBody}>
                {t('market.demand.priceComparison', { price: summary.best.modalPrice.toLocaleString(i18n.language), average: summary.averagePrice.toLocaleString(i18n.language) })}
              </Text>
            </Card>

            <View style={styles.metrics}>
              <Metric label={t('market.demand.covered')} value={`${signals.length}`} />
              <Metric label={t('market.demand.fresh')} value={`${summary.freshMarkets}`} />
              <Metric label={t('market.demand.spread')} value={`₹${summary.spread.toLocaleString(i18n.language)}`} />
            </View>

            <SectionLabel label={t('market.demand.opportunities')} />
            <View style={styles.signalGrid}>
              {signals.slice(0, 8).map(signal => {
                const tone = signalTone[signal.level];
                return (
                  <View key={`${signal.market}-${signal.district}`} style={[styles.signalCard, { backgroundColor: tone.background, borderColor: tone.border }]}>
                    <View style={styles.signalTopRow}>
                      <Text style={[styles.signalScore, { color: tone.color }]}>{signal.score}</Text>
                      <Text style={[styles.signalLevel, { color: tone.color }]}>{t(tone.labelKey)}</Text>
                    </View>
                    <Text style={styles.signalMarket} numberOfLines={2}>{signal.market}</Text>
                    <Text style={styles.signalDistrict} numberOfLines={1}>{signal.district}</Text>
                    <Text style={styles.signalPrice}>₹{signal.modalPrice.toLocaleString(i18n.language)}{t('market.common.quintalUnit')}</Text>
                    <Text style={styles.signalFreshness}>{signal.freshnessDays === 0 ? t('market.demand.today') : t('market.demand.daysOld', { count: signal.freshnessDays })}</Text>
                  </View>
                );
              })}
            </View>

            <SectionLabel label={t('market.demand.action')} />
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => navigation.navigate('MandiList', { cropId: route.params?.cropId, commodity, state })}
            >
              <Ionicons name="storefront" size={22} color={market.white} />
              <View style={styles.flexContent}><Text style={styles.primaryTitle}>{t('market.demand.compare')}</Text><Text style={styles.primarySubtitle}>{t('market.demand.compareSub')}</Text></View>
              <Ionicons name="chevron-forward" size={20} color={market.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.officialAction} onPress={() => Linking.openURL(ENAM_ADVANCE_DEMAND_URL)}>
              <Ionicons name="open-outline" size={22} color={market.b2} />
              <View style={styles.flexContent}><Text style={styles.officialTitle}>{t('market.demand.official')}</Text><Text style={styles.officialSubtitle}>{t('market.demand.officialSub')}</Text></View>
              <Ionicons name="chevron-forward" size={20} color={market.b2} />
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>

      {picker ? (
        <MarketOptionModal
          visible
          title={picker === 'state' ? t('market.common.state') : t('market.common.crop')}
          options={picker === 'state' ? STATES : commodities}
          selected={picker === 'state' ? state : commodity}
          onSelect={selectValue}
          onClose={() => setPicker(null)}
        />
      ) : null}
      <LanguagePickerModal visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </View>
  );
}

function Selector({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.selector} onPress={onPress}>
      <View style={styles.flexContent}><Text style={styles.selectorLabel}>{label}</Text><Text style={styles.selectorValue} numberOfLines={1}>{value}</Text></View>
      <Ionicons name="chevron-down" size={18} color={market.n4} />
    </TouchableOpacity>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: market.n8 },
  scrollContent: { padding: mSpacing.lg, paddingBottom: mSpacing.xxl },
  selectorRow: { flexDirection: 'row', gap: mSpacing.sm },
  selector: { minHeight: 56, flex: 1, flexDirection: 'row', alignItems: 'center', gap: mSpacing.sm, backgroundColor: market.white, borderWidth: 1, borderColor: market.n7, borderRadius: mRadius.md, paddingHorizontal: mSpacing.md },
  flexContent: { flex: 1 },
  selectorLabel: { fontSize: mTypography.caption, color: market.n4, fontWeight: '600' },
  selectorValue: { fontSize: mTypography.body, color: market.n1, fontWeight: '700', marginTop: 2 },
  explainer: { flexDirection: 'row', gap: mSpacing.sm, backgroundColor: market.b5, borderWidth: 1, borderColor: market.b4, borderRadius: mRadius.md, padding: mSpacing.md, marginVertical: mSpacing.md },
  explainerText: { flex: 1, fontSize: mTypography.small, color: market.b1, lineHeight: 19 },
  bold: { fontWeight: '800' },
  center: { minHeight: 320, alignItems: 'center', justifyContent: 'center', padding: mSpacing.xxl },
  emptyTitle: { fontSize: mTypography.subtitle, color: market.n2, fontWeight: '700', marginTop: mSpacing.sm },
  centerText: { fontSize: mTypography.body, color: market.n4, textAlign: 'center', lineHeight: 21, marginTop: mSpacing.sm },
  retry: { minHeight: 44, justifyContent: 'center', backgroundColor: market.g3, borderRadius: mRadius.sm, paddingHorizontal: mSpacing.xl, marginTop: mSpacing.lg },
  retryText: { color: market.white, fontSize: mTypography.body, fontWeight: '700' },
  heroCard: { backgroundColor: market.white, marginBottom: mSpacing.md },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: mSpacing.sm },
  heroIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: market.g7 },
  heroEyebrow: { fontSize: mTypography.caption, color: market.g3, fontWeight: '800', letterSpacing: 0.4 },
  heroTitle: { fontSize: mTypography.subtitle, color: market.n1, fontWeight: '800', marginTop: 2 },
  heroSubtitle: { fontSize: mTypography.small, color: market.n4, marginTop: 2 },
  scoreBadge: { alignItems: 'center', justifyContent: 'center', width: 58, height: 58, borderRadius: 29, backgroundColor: market.g2 },
  scoreValue: { fontSize: mTypography.title, color: market.white, fontWeight: '800' },
  scoreUnit: { fontSize: mTypography.chart, color: market.g6 },
  heroBody: { fontSize: mTypography.body, color: market.n3, lineHeight: 21, marginTop: mSpacing.md },
  metrics: { flexDirection: 'row', gap: mSpacing.sm, marginBottom: mSpacing.lg },
  metric: { flex: 1, minHeight: 74, alignItems: 'center', justifyContent: 'center', backgroundColor: market.white, borderWidth: 1, borderColor: market.n7, borderRadius: mRadius.md, padding: mSpacing.sm },
  metricValue: { fontSize: mTypography.subtitle, color: market.g2, fontWeight: '800' },
  metricLabel: { fontSize: mTypography.caption, color: market.n4, textAlign: 'center', marginTop: 3 },
  signalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: mSpacing.sm, marginBottom: mSpacing.lg },
  signalCard: { width: '48.7%', minHeight: 150, borderWidth: 1, borderRadius: mRadius.md, padding: mSpacing.md },
  signalTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  signalScore: { fontSize: mTypography.title, fontWeight: '800' },
  signalLevel: { flexShrink: 1, fontSize: mTypography.chart, fontWeight: '800', textAlign: 'right' },
  signalMarket: { fontSize: mTypography.body, color: market.n1, fontWeight: '700', marginTop: mSpacing.sm },
  signalDistrict: { fontSize: mTypography.caption, color: market.n4, marginTop: 2 },
  signalPrice: { fontSize: mTypography.body, color: market.n2, fontWeight: '700', marginTop: 'auto' },
  signalFreshness: { fontSize: mTypography.chart, color: market.n4, marginTop: 2 },
  primaryAction: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: mSpacing.sm, backgroundColor: market.g2, borderRadius: mRadius.md, padding: mSpacing.md, marginBottom: mSpacing.sm },
  primaryTitle: { fontSize: mTypography.body, color: market.white, fontWeight: '700' },
  primarySubtitle: { fontSize: mTypography.caption, color: market.g6, marginTop: 2 },
  officialAction: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: mSpacing.sm, backgroundColor: market.b5, borderWidth: 1, borderColor: market.b4, borderRadius: mRadius.md, padding: mSpacing.md },
  officialTitle: { fontSize: mTypography.body, color: market.b1, fontWeight: '700' },
  officialSubtitle: { fontSize: mTypography.caption, color: market.b2, marginTop: 2 },
});
