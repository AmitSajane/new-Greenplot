import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

type Navigation = NativeStackNavigationProp<MarketStackParamList, 'MandiList'>;
type MandiListRoute = RouteProp<MarketStackParamList, 'MandiList'>;
type SortKey = 'best' | 'latest' | 'market';
type Picker = 'state' | 'crop' | null;

const STATES = Object.keys(INDIA_LOCATIONS as Record<string, unknown>).sort();
const DEFAULT_STATE = 'Karnataka';

const parseDate = (value: string) => {
  const parts = value.split(/[\/-]/).map(Number);
  if (parts.length !== 3) return 0;
  const [first, month, third] = parts;
  return first > 31
    ? new Date(first, month - 1, third).getTime()
    : new Date(third, month - 1, first).getTime();
};

const ageLabel = (value: string, t: TFunction) => {
  const timestamp = parseDate(value);
  if (!timestamp) return value || t('market.mandis.dateUnavailable');
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
  if (days === 0) return t('market.mandis.reportedToday');
  if (days === 1) return t('market.mandis.reportedYesterday');
  return t('market.mandis.reportedDays', { count: days });
};

export default function MandiListScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<MandiListRoute>();
  const { user } = useAuth();
  const { i18n, t } = useTranslation();

  const routeCrop = marketCropForId(route.params?.cropId);
  const userState = (user as { state?: string } | null)?.state;
  const [state, setState] = useState(route.params?.state || (userState && STATES.includes(userState) ? userState : DEFAULT_STATE));
  const [commodity, setCommodity] = useState(route.params?.commodity || routeCrop.name);
  const [records, setRecords] = useState<MandiPrice[]>([]);
  const [commodities, setCommodities] = useState<string[]>(MARKET_CROPS.map(item => item.name));
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('best');
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
        if (!values.length) setError('market.mandis.noData');
      })
      .catch(() => active && setError('market.mandis.loadError'))
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

  const visibleRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const next = records.filter(item =>
      !normalizedQuery || [item.market, item.district, item.variety].some(value => value.toLocaleLowerCase().includes(normalizedQuery)),
    );
    return [...next].sort((a, b) => {
      if (sort === 'latest') return parseDate(b.arrivalDate) - parseDate(a.arrivalDate);
      if (sort === 'market') return a.market.localeCompare(b.market);
      return b.modalPrice - a.modalPrice;
    });
  }, [query, records, sort]);

  const best = records[0];
  const reference = records.find(item => item.market === route.params?.market);
  const priceDifference = best && reference ? best.modalPrice - reference.modalPrice : null;
  const languageShort = LANGUAGE_SHORT_LABELS[i18n.language] || 'EN';

  const refresh = useCallback(() => {
    setRefreshing(true);
    setReloadKey(value => value + 1);
  }, []);

  const selectPickerValue = (value: string) => {
    if (picker === 'state') setState(value);
    if (picker === 'crop') setCommodity(value);
  };

  const renderMandi = ({ item, index }: { item: MandiPrice; index: number }) => {
    const isBest = item.market === best?.market && item.district === best?.district;
    const difference = best ? best.modalPrice - item.modalPrice : 0;
    const staleDays = item.arrivalDate ? Math.floor((Date.now() - parseDate(item.arrivalDate)) / 86_400_000) : 99;
    return (
      <View style={[styles.row, isBest && styles.bestRow]}>
        <View style={[styles.rank, isBest && styles.bestRank]}>
          {isBest ? <Ionicons name="trophy" size={20} color={market.a3} /> : <Text style={styles.rankText}>{index + 1}</Text>}
        </View>
        <View style={styles.rowContent}>
          <View style={styles.rowTitleLine}>
            <Text style={[styles.marketName, isBest && styles.bestText]} numberOfLines={1}>{item.market}</Text>
            {staleDays > 7 ? <Text style={styles.staleBadge}>{t('market.mandis.stale')}</Text> : null}
          </View>
          <Text style={styles.marketMeta} numberOfLines={1}>{item.district}{item.variety ? ` · ${item.variety}` : ''}</Text>
          <Text style={styles.reportDate}>{ageLabel(item.arrivalDate, t)}</Text>
          <View style={styles.rangeRow}>
            <Text style={styles.rangeText}>{t('market.mandis.low', { value: item.minPrice.toLocaleString(i18n.language) })}</Text>
            <Text style={styles.rangeText}>{t('market.mandis.high', { value: item.maxPrice.toLocaleString(i18n.language) })}</Text>
          </View>
        </View>
        <View style={styles.priceColumn}>
          <Text style={[styles.price, isBest && styles.bestText]}>₹{item.modalPrice.toLocaleString('en-IN')}</Text>
          <Text style={styles.unit}>{t('market.common.quintalUnit')}</Text>
          {difference > 0 ? <Text style={styles.difference}>{t('market.mandis.belowBest', { value: difference.toLocaleString(i18n.language) })}</Text> : <Text style={styles.bestLabel}>{t('market.mandis.best')}</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        data={{ variant: 'default', showBack: true, title: t('market.mandis.title'), subtitle: `${commodity} · ${state}`, name: user?.name, languageShort }}
        handler={{
          onBackPress: () => navigation.goBack(),
          onProfilePress: () => navigation.navigate('Settings'),
          onLanguagePress: () => setLanguageOpen(true),
          onNotificationPress: () => navigation.navigate('NotificationsCenter'),
        }}
      />

      <View style={styles.controls}>
        <View style={styles.selectorRow}>
          <FilterSelector label={t('market.common.crop')} value={commodity} onPress={() => setPicker('crop')} />
          <FilterSelector label={t('market.common.state')} value={state} onPress={() => setPicker('state')} />
        </View>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={market.n4} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholder={t('market.mandis.search')}
            placeholderTextColor={market.n5}
          />
          {query ? <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={market.n5} /></TouchableOpacity> : null}
        </View>
        <View style={styles.sortRow}>
          {([['best', t('market.mandis.bestPrice')], ['latest', t('market.mandis.latest')], ['market', t('market.mandis.az')]] as [SortKey, string][]).map(([key, label]) => (
            <TouchableOpacity key={key} style={[styles.sortChip, sort === key && styles.sortChipActive]} onPress={() => setSort(key)}>
              <Text style={[styles.sortText, sort === key && styles.sortTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.resultCount}>{t('market.common.markets', { count: visibleRecords.length })}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={market.g3} /><Text style={styles.centerText}>{t('market.mandis.loading')}</Text></View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color={market.n5} />
          <Text style={styles.emptyTitle}>{t('market.mandis.unavailable')}</Text>
          <Text style={styles.centerText}>{t(error, { crop: commodity, state })}</Text>
          <TouchableOpacity style={styles.retry} onPress={refresh}><Text style={styles.retryText}>{t('market.common.retry')}</Text></TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visibleRecords}
          keyExtractor={item => `${item.market}-${item.district}`}
          renderItem={renderMandi}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={market.g3} />}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={best ? (
            <Card style={styles.opportunityCard}>
              <View style={styles.opportunityTitleRow}>
                <Ionicons name="analytics" size={22} color={market.g2} />
                <Text style={styles.opportunityTitle}>{t('market.mandis.opportunity')}</Text>
              </View>
              <Text style={styles.opportunityBody}>{t('market.mandis.opportunityBody', { market: best.market, price: best.modalPrice.toLocaleString(i18n.language) })}</Text>
              {reference && priceDifference !== null ? <Text style={styles.referenceText}>{priceDifference > 0 ? `₹${priceDifference.toLocaleString('en-IN')}/q above ${reference.market}` : `${reference.market} is already the best reported market`}.</Text> : null}
              <Text style={styles.disclosure}>{t('market.mandis.disclosure')}</Text>
            </Card>
          ) : null}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyTitle}>{t('market.mandis.noMatches')}</Text><Text style={styles.centerText}>{t('market.mandis.noMatchesBody')}</Text></View>}
        />
      )}

      {picker ? (
        <MarketOptionModal
          visible
          title={picker === 'state' ? t('market.common.state') : t('market.common.crop')}
          options={picker === 'state' ? STATES : commodities}
          selected={picker === 'state' ? state : commodity}
          onSelect={selectPickerValue}
          onClose={() => setPicker(null)}
        />
      ) : null}
      <LanguagePickerModal visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </View>
  );
}

function FilterSelector({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.selector} onPress={onPress}>
      <View style={styles.selectorContent}><Text style={styles.selectorLabel}>{label}</Text><Text style={styles.selectorValue} numberOfLines={1}>{value}</Text></View>
      <Ionicons name="chevron-down" size={18} color={market.n4} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: market.n8 },
  controls: { backgroundColor: market.white, paddingHorizontal: mSpacing.lg, paddingTop: mSpacing.md, borderBottomWidth: 1, borderBottomColor: market.n7 },
  selectorRow: { flexDirection: 'row', gap: mSpacing.sm },
  selector: { minHeight: 54, flex: 1, flexDirection: 'row', alignItems: 'center', gap: mSpacing.sm, borderWidth: 1, borderColor: market.n7, borderRadius: mRadius.md, paddingHorizontal: mSpacing.md },
  selectorContent: { flex: 1 },
  selectorLabel: { fontSize: mTypography.caption, color: market.n4, fontWeight: '600' },
  selectorValue: { fontSize: mTypography.body, color: market.n1, fontWeight: '700', marginTop: 2 },
  searchBox: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: mSpacing.sm, backgroundColor: market.n8, borderRadius: mRadius.md, paddingHorizontal: mSpacing.md, marginTop: mSpacing.sm },
  searchInput: { flex: 1, fontSize: mTypography.body, color: market.n1 },
  sortRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortChip: { minHeight: 34, justifyContent: 'center', borderWidth: 1, borderColor: market.n6, borderRadius: mRadius.pill, paddingHorizontal: 10 },
  sortChipActive: { backgroundColor: market.g2, borderColor: market.g2 },
  sortText: { fontSize: mTypography.caption, color: market.n4, fontWeight: '600' },
  sortTextActive: { color: market.white },
  resultCount: { marginLeft: 'auto', fontSize: mTypography.caption, color: market.n4 },
  listContent: { paddingBottom: mSpacing.xxl },
  opportunityCard: { margin: mSpacing.lg, backgroundColor: market.g7, borderColor: market.g6 },
  opportunityTitleRow: { flexDirection: 'row', alignItems: 'center', gap: mSpacing.sm },
  opportunityTitle: { fontSize: mTypography.bodyStrong, color: market.g1, fontWeight: '700' },
  opportunityBody: { fontSize: mTypography.body, color: market.g2, lineHeight: 21, marginTop: mSpacing.sm },
  referenceText: { fontSize: mTypography.body, color: market.g2, marginTop: 4 },
  disclosure: { fontSize: mTypography.caption, color: market.n4, lineHeight: 17, marginTop: mSpacing.sm },
  bold: { fontWeight: '800' },
  row: { minHeight: 132, flexDirection: 'row', alignItems: 'flex-start', gap: mSpacing.sm, backgroundColor: market.white, borderBottomWidth: 1, borderBottomColor: market.n7, padding: mSpacing.md },
  bestRow: { borderLeftWidth: 4, borderLeftColor: market.g3, backgroundColor: market.n9 },
  rank: { width: 36, height: 36, borderRadius: 18, backgroundColor: market.n8, alignItems: 'center', justifyContent: 'center' },
  bestRank: { backgroundColor: market.a7 },
  rankText: { fontSize: mTypography.body, color: market.n4, fontWeight: '700' },
  rowContent: { flex: 1, minWidth: 0 },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  marketName: { flexShrink: 1, fontSize: mTypography.bodyStrong, color: market.n2, fontWeight: '700' },
  bestText: { color: market.g2 },
  staleBadge: { fontSize: mTypography.chart, color: market.r2, fontWeight: '800', backgroundColor: market.r5, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, overflow: 'hidden' },
  marketMeta: { fontSize: mTypography.small, color: market.n4, marginTop: 3 },
  reportDate: { fontSize: mTypography.caption, color: market.n5, marginTop: 3 },
  rangeRow: { flexDirection: 'row', gap: mSpacing.sm, marginTop: mSpacing.sm },
  rangeText: { fontSize: mTypography.caption, color: market.n3 },
  priceColumn: { alignItems: 'flex-end', maxWidth: '34%' },
  price: { fontSize: mTypography.subtitle, color: market.n1, fontWeight: '800' },
  unit: { fontSize: mTypography.caption, color: market.n4 },
  difference: { fontSize: mTypography.chart, color: market.r2, textAlign: 'right', marginTop: mSpacing.sm },
  bestLabel: { fontSize: mTypography.chart, color: market.g3, fontWeight: '800', marginTop: mSpacing.sm },
  center: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center', padding: mSpacing.xxl },
  emptyTitle: { fontSize: mTypography.subtitle, color: market.n2, fontWeight: '700', marginTop: mSpacing.sm },
  centerText: { fontSize: mTypography.body, color: market.n4, textAlign: 'center', lineHeight: 21, marginTop: mSpacing.sm },
  retry: { minHeight: 44, justifyContent: 'center', backgroundColor: market.g3, borderRadius: mRadius.sm, paddingHorizontal: mSpacing.xl, marginTop: mSpacing.lg },
  retryText: { fontSize: mTypography.body, color: market.white, fontWeight: '700' },
});
