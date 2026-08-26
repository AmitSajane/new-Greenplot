/**
 * Which Crop to Plant — ranks the catalog crops for the farmer's state by
 * reading the SAME real mandi records (`mandiApi`) already powering
 * MarketHomeScreen / ArrivalsScreen / PriceTrendScreen. No mock data and no
 * separate backend: for each crop we split its recent daily price+arrival
 * records into an earlier half and a recent half (identical bucketing to
 * ArrivalsScreen's `dailyActivity`) and read two real signals —
 *   · price trend   = % change in average daily price, earlier → recent
 *   · supply trend   = % change in daily record count, earlier → recent
 *     (record count per day is the same "reporting activity" proxy
 *     ArrivalsScreen already uses in place of unavailable MT arrival volume)
 * A crop with too few reporting dates to trust a before/after split is
 * marked "not enough data" rather than guessing.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';
import { MandiPrice, mandiApi } from '../../../services/mandiApi';
import { Card, MarketHeader } from '../components';
import { MARKET_CROPS } from '../constants/marketCatalog';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { market, mRadius, mSpacing, mTypography } from '../theme/marketTokens';
import { Crop } from '../types';

type Navigation = NativeStackNavigationProp<MarketStackParamList, 'CropCompare'>;
const DEFAULT_STATE = 'Karnataka';
const MIN_REPORTING_DAYS = 4; // fewer than this → before/after split isn't trustworthy

/** Same day-token parsing ArrivalsScreen/MarketHomeScreen already use for
 * data.gov.in's "DD/MM/YYYY" (or "YYYY-MM-DD") arrival_date strings. */
const normalizeDate = (value: string) => {
  const parts = value.split(/[\/-]/).map(Number);
  if (parts.length !== 3) return 0;
  const [first, second, third] = parts;
  const year = first > 31 ? first : third;
  const month = second;
  const day = first > 31 ? third : first;
  return new Date(year, month - 1, day).getTime();
};

type Verdict = 'good' | 'watch' | 'risky' | 'unknown';

interface CropRanking {
  crop: Crop;
  latestPrice: number | null;
  priceChangePct: number | null;
  supplyChangePct: number | null;
  verdict: Verdict;
  score: number;
  sparkline: number[]; // recent daily-average prices, oldest→newest
}

function average(values: number[]): number {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
}

/** Turns one crop's raw records into a ranking by the two real signals
 * described in the file header. */
function rankCrop(crop: Crop, records: MandiPrice[]): CropRanking {
  const byDay = new Map<string, number[]>();
  records.forEach(r => {
    if (!r.arrivalDate || !(r.modalPrice > 0)) return;
    byDay.set(r.arrivalDate, [...(byDay.get(r.arrivalDate) ?? []), r.modalPrice]);
  });
  const daily = Array.from(byDay.entries())
    .map(([date, prices]) => ({ date, avgPrice: average(prices), reportCount: prices.length }))
    .sort((a, b) => normalizeDate(a.date) - normalizeDate(b.date));

  const latestPrice = daily.length ? daily[daily.length - 1].avgPrice : null;
  const sparkline = daily.slice(-6).map(d => d.avgPrice);

  if (daily.length < MIN_REPORTING_DAYS) {
    return { crop, latestPrice, priceChangePct: null, supplyChangePct: null, verdict: 'unknown', score: -Infinity, sparkline };
  }

  const mid = Math.floor(daily.length / 2);
  const earlier = daily.slice(0, mid);
  const recent = daily.slice(mid);
  const earlierPrice = average(earlier.map(d => d.avgPrice));
  const recentPrice = average(recent.map(d => d.avgPrice));
  const earlierReports = average(earlier.map(d => d.reportCount));
  const recentReports = average(recent.map(d => d.reportCount));

  const priceChangePct = earlierPrice > 0 ? ((recentPrice - earlierPrice) / earlierPrice) * 100 : 0;
  const supplyChangePct = earlierReports > 0 ? ((recentReports - earlierReports) / earlierReports) * 100 : 0;

  let verdict: Verdict;
  if (priceChangePct >= 2 && supplyChangePct <= 10) verdict = 'good';
  else if (priceChangePct <= -5 || supplyChangePct >= 25) verdict = 'risky';
  else verdict = 'watch';

  // Rising price is good; a supply glut erodes that upside, so it's
  // subtracted at a smaller weight than price moves it by directly.
  const score = priceChangePct - supplyChangePct * 0.3;

  return { crop, latestPrice, priceChangePct, supplyChangePct, verdict, score, sparkline };
}

const VERDICT_STYLE: Record<Verdict, { bg: string; fg: string; icon: string }> = {
  good: { bg: market.g7, fg: market.g2, icon: 'checkmark-circle' },
  watch: { bg: market.a7, fg: market.a2, icon: 'time' },
  risky: { bg: market.r5, fg: market.r2, icon: 'warning' },
  unknown: { bg: market.n8, fg: market.n4, icon: 'help-circle' },
};

function supplyLabel(t: (key: string) => string, pct: number): { text: string; tone: 'low' | 'steady' | 'high' } {
  if (pct >= 25) return { text: t('market.compare.supplyHigh'), tone: 'high' };
  if (pct <= -10) return { text: t('market.compare.supplyLow'), tone: 'low' };
  if (pct > 10) return { text: t('market.compare.supplyRising'), tone: 'high' };
  return { text: t('market.compare.supplySteady'), tone: 'steady' };
}

export default function CropCompareScreen() {
  const navigation = useNavigation<Navigation>();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const state = (user as { state?: string } | null)?.state || DEFAULT_STATE;

  const [rankings, setRankings] = useState<CropRanking[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    Promise.all(
      MARKET_CROPS.map(crop =>
        mandiApi.fetchPrices({ commodity: crop.name, state, limit: 500 }, controller.signal).then(records => rankCrop(crop, records)),
      ),
    )
      .then(results => {
        if (!active) return;
        results.sort((a, b) => b.score - a.score);
        setRankings(results);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
      controller.abort();
    };
  }, [state]);

  const reasonFor = (r: CropRanking): string => {
    if (r.verdict === 'unknown') return t('market.compare.reasonUnknown');
    if (r.verdict === 'good') return t('market.compare.reasonGood', { pct: Math.round(Math.abs(r.priceChangePct!)) });
    if (r.verdict === 'risky') {
      return t('market.compare.reasonRisky', {
        pct: Math.round(Math.abs(r.priceChangePct!)),
        arrivals: Math.round(r.supplyChangePct!),
      });
    }
    return t('market.compare.reasonWatch');
  };

  const maxSpark = useMemo(() => {
    if (!rankings) return 1;
    return Math.max(1, ...rankings.flatMap(r => r.sparkline));
  }, [rankings]);
  const minSpark = useMemo(() => {
    if (!rankings) return 0;
    const values = rankings.flatMap(r => r.sparkline);
    return values.length ? Math.min(...values) : 0;
  }, [rankings]);

  return (
    <View style={styles.container}>
      <MarketHeader
        eyebrow={t('market.compare.eyebrow')}
        title={t('market.compare.title')}
        badge={`${t('market.compare.updated')} · ${state}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={market.g3} />
            <Text style={styles.loadingText}>{t('market.compare.loading')}</Text>
          </View>
        ) : error || !rankings ? (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>{t('market.compare.loadError')}</Text>
          </View>
        ) : (
          <>
            <View style={styles.metaRow}>
              <Text style={styles.count}>
                {t('market.compare.count', { count: rankings.length })} <Text style={styles.countSub}>· {t('market.compare.countSub')}</Text>
              </Text>
            </View>

            <View style={styles.list}>
              {rankings.map((r, index) => {
                const style = VERDICT_STYLE[r.verdict];
                const supply = r.supplyChangePct != null ? supplyLabel(t, r.supplyChangePct) : null;
                const chipLabel =
                  r.verdict === 'good'
                    ? t('market.compare.chipGood')
                    : r.verdict === 'risky'
                      ? t('market.compare.chipRisky')
                      : r.verdict === 'watch'
                        ? t('market.compare.chipWatch')
                        : t('market.compare.chipUnknown');

                return (
                  <Card key={r.crop.id} style={StyleSheet.flatten([styles.card, index === 0 && r.verdict === 'good' ? styles.cardTop : undefined])}>
                    <View style={styles.cardTopRow}>
                      <View style={[styles.rank, index === 0 && r.verdict === 'good' && styles.rankTop]}>
                        <Text style={[styles.rankText, index === 0 && r.verdict === 'good' && styles.rankTextTop]}>{index + 1}</Text>
                      </View>
                      <View style={styles.emojiBox}>
                        <Text style={styles.emoji}>{r.crop.emoji}</Text>
                      </View>
                      <View style={styles.headContent}>
                        <View style={styles.nameRow}>
                          <Text style={styles.name}>{t(`market.crops.${r.crop.id}`, { defaultValue: r.crop.name })}</Text>
                          <View style={styles.priceBlock}>
                            <Text style={styles.price}>
                              {r.latestPrice != null ? `₹${Math.round(r.latestPrice).toLocaleString(i18n.language)}` : '—'}
                              <Text style={styles.unit}>{t('market.common.quintalUnit')}</Text>
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.chip, { backgroundColor: style.bg }]}>
                          <Ionicons name={style.icon} size={12} color={style.fg} />
                          <Text style={[styles.chipText, { color: style.fg }]}>{chipLabel}</Text>
                        </View>
                      </View>
                    </View>

                    {r.verdict !== 'unknown' && (
                      <View style={styles.statsRow}>
                        <View style={styles.statCol}>
                          <Text style={styles.statLabel}>{t('market.compare.priceTrend')}</Text>
                          <View style={styles.spark}>
                            {r.sparkline.map((v, i) => {
                              const range = Math.max(1, maxSpark - minSpark);
                              const heightPct = 20 + ((v - minSpark) / range) * 80;
                              const rising = (r.priceChangePct ?? 0) >= 0;
                              const isRecent = i >= r.sparkline.length - 2;
                              return (
                                <View
                                  key={i}
                                  style={[
                                    styles.sparkBar,
                                    { height: `${heightPct}%` },
                                    isRecent && { backgroundColor: rising ? market.g4 : market.r3 },
                                  ]}
                                />
                              );
                            })}
                          </View>
                        </View>
                        <View style={styles.statCol}>
                          <Text style={styles.statLabel}>{t('market.compare.marketSupply')}</Text>
                          <View style={styles.supplyBars}>
                            {[0, 1, 2].map(i => {
                              const level = supply?.tone === 'high' ? 2 : supply?.tone === 'steady' ? 1 : 0;
                              const on = i <= level;
                              const color = supply?.tone === 'high' ? market.r3 : supply?.tone === 'steady' ? market.a4 : market.g4;
                              return <View key={i} style={[styles.supplyBar, { height: `${40 + i * 30}%` }, on && { backgroundColor: color }]} />;
                            })}
                          </View>
                          <Text style={styles.supplyNote}>{supply?.text}</Text>
                        </View>
                      </View>
                    )}

                    <Text style={styles.reason}>{reasonFor(r)}</Text>
                  </Card>
                );
              })}
            </View>

            <View style={styles.disclaimer}>
              <Ionicons name="information-circle" size={16} color={market.b2} />
              <Text style={styles.disclaimerText}>{t('market.compare.disclaimer')}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  scrollContent: { paddingBottom: mSpacing.xxl },
  loading: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: mSpacing.sm, paddingHorizontal: mSpacing.xxl },
  loadingText: { fontSize: mTypography.body, color: market.n4, textAlign: 'center' },
  metaRow: { paddingHorizontal: mSpacing.lg, paddingTop: mSpacing.md, paddingBottom: mSpacing.xs },
  count: { fontSize: mTypography.bodyStrong, fontWeight: '700', color: market.n2 },
  countSub: { color: market.n4, fontWeight: '500' },
  list: { paddingHorizontal: mSpacing.lg, gap: mSpacing.sm, paddingTop: mSpacing.xs },
  card: { padding: mSpacing.lg },
  cardTop: { borderColor: market.g5, borderWidth: 1.5 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: mSpacing.sm },
  rank: { width: 22, height: 22, borderRadius: 7, backgroundColor: market.n8, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  rankTop: { backgroundColor: market.g3 },
  rankText: { fontSize: mTypography.caption, fontWeight: '800', color: market.n4 },
  rankTextTop: { color: market.white },
  emojiBox: { width: 40, height: 40, borderRadius: mRadius.sm, backgroundColor: market.g7, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: mTypography.heading },
  headContent: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: mSpacing.sm },
  name: { fontSize: mTypography.bodyStrong, fontWeight: '800', color: market.n1 },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: mTypography.bodyStrong, fontWeight: '800', color: market.n1 },
  unit: { fontSize: mTypography.caption, fontWeight: '600', color: market.n4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderRadius: mRadius.pill, paddingHorizontal: 9, paddingVertical: 4, marginTop: 6 },
  chipText: { fontSize: mTypography.caption, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: mSpacing.lg, marginTop: mSpacing.md, paddingTop: mSpacing.md, borderTopWidth: 1, borderTopColor: market.n8 },
  statCol: { flex: 1 },
  statLabel: { fontSize: mTypography.chart, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase', color: market.n4, marginBottom: 6 },
  spark: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 22 },
  sparkBar: { flex: 1, borderRadius: 2, backgroundColor: market.n6 },
  supplyBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 22 },
  supplyBar: { width: 9, borderRadius: 2, backgroundColor: market.n6 },
  supplyNote: { fontSize: mTypography.small, fontWeight: '600', color: market.n3, marginTop: 4 },
  reason: { fontSize: mTypography.small, lineHeight: 18, color: market.n3, backgroundColor: market.n8, borderRadius: mRadius.sm, padding: mSpacing.sm, marginTop: mSpacing.md },
  disclaimer: { flexDirection: 'row', gap: mSpacing.sm, marginHorizontal: mSpacing.lg, marginTop: mSpacing.md, padding: mSpacing.md, backgroundColor: market.b5, borderRadius: mRadius.md, borderWidth: 1, borderColor: '#BFDBFB' },
  disclaimerText: { flex: 1, fontSize: mTypography.small, lineHeight: 18, color: market.b2 },
});
