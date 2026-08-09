import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/molecules/AppHeader';
import INDIA_LOCATIONS from '../../../constants/indiaLocations.json';
import { useAuth } from '../../../context/AuthContext';
import { LANGUAGE_SHORT_LABELS } from '../../../localization/i18n';
import { LanguagePickerModal } from '../../../screens/farmerHome/components/LanguagePickerModal';
import { mandiApi } from '../../../services/mandiApi';
import { Card, MarketOptionModal } from '../components';
import { MARKET_CROPS } from '../constants/marketCatalog';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { market, mRadius, mSpacing, mTypography } from '../theme/marketTokens';

type Navigation = NativeStackNavigationProp<MarketStackParamList, 'AlertsCentre'>;
type Direction = 'above' | 'below';
type Picker = 'state' | 'crop' | null;
interface PriceRule { id: string; state: string; cropId: string; commodity: string; direction: Direction; threshold: number; enabled: boolean; createdAt: string }

const STORAGE_KEY = '@greenplot/market-price-rules/v1';
const STATES = Object.keys(INDIA_LOCATIONS as Record<string, unknown>).sort();
const DEFAULT_STATE = 'Karnataka';

export default function AlertsCentreScreen() {
  const navigation = useNavigation<Navigation>();
  const { user } = useAuth();
  const { i18n, t } = useTranslation();
  const profileState = (user as { state?: string } | null)?.state;
  const [state, setState] = useState(profileState && STATES.includes(profileState) ? profileState : DEFAULT_STATE);
  const [cropId, setCropId] = useState(MARKET_CROPS[0].id);
  const [direction, setDirection] = useState<Direction>('above');
  const [threshold, setThreshold] = useState('');
  const [rules, setRules] = useState<PriceRule[]>([]);
  const [latestPrices, setLatestPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [picker, setPicker] = useState<Picker>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const crop = MARKET_CROPS.find(item => item.id === cropId) || MARKET_CROPS[0];

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(value => value && setRules(JSON.parse(value)))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (next: PriceRule[]) => {
    setRules(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const evaluateRules = useCallback(async () => {
    if (!rules.length) { setRefreshing(false); return; }
    setRefreshing(true);
    const groups = Array.from(new Map(rules.map(rule => [`${rule.state}|${rule.commodity}`, rule])).values());
    const results = await Promise.all(groups.map(async rule => {
      const records = await mandiApi.fetchPrices({ state: rule.state, commodity: rule.commodity, limit: 500 });
      if (!records.length) return [`${rule.state}|${rule.commodity}`, 0] as const;
      const value = Math.round(records.reduce((sum, item) => sum + item.modalPrice, 0) / records.length);
      return [`${rule.state}|${rule.commodity}`, value] as const;
    }));
    setLatestPrices(Object.fromEntries(results));
    setRefreshing(false);
  }, [rules]);

  useEffect(() => { evaluateRules(); }, [evaluateRules]);

  const addRule = async () => {
    const value = Number(threshold.replace(/,/g, ''));
    if (!Number.isFinite(value) || value <= 0) return;
    const next: PriceRule = { id: `${Date.now()}`, state, cropId, commodity: crop.name, direction, threshold: value, enabled: true, createdAt: new Date().toISOString() };
    await persist([next, ...rules]);
    setThreshold('');
  };

  const toggle = (id: string) => persist(rules.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
  const remove = (id: string) => persist(rules.filter(rule => rule.id !== id));
  const activePicker = picker === 'state'
    ? { title: t('market.common.state'), options: STATES, selected: state }
    : picker === 'crop'
      ? { title: t('market.common.crop'), options: MARKET_CROPS.map(item => item.name), selected: crop.name }
      : null;

  return (
    <View style={styles.screen}>
      <AppHeader
        data={{ variant: 'default', showBack: true, title: t('market.alertRules.title'), subtitle: t('market.alertRules.subtitle'), languageShort: LANGUAGE_SHORT_LABELS[i18n.language] || 'EN' }}
        handler={{ onBackPress: navigation.goBack, onLanguagePress: () => setLanguageOpen(true), onNotificationPress: () => navigation.navigate('NotificationsCenter') }}
      />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={evaluateRules} tintColor={market.g3} />}>
        <Card style={styles.createCard}>
          <Text style={styles.cardTitle}>{t('market.alertRules.create')}</Text>
          <Text style={styles.cardSub}>{t('market.alertRules.createSub')}</Text>
          <View style={styles.selectorRow}>
            <Selector label={t('market.common.state')} value={state} onPress={() => setPicker('state')} />
            <Selector label={t('market.common.crop')} value={t(`market.crops.${crop.id}`)} onPress={() => setPicker('crop')} />
          </View>
          <View style={styles.directionRow}>
            {(['above', 'below'] as Direction[]).map(item => <TouchableOpacity key={item} style={[styles.direction, direction === item && styles.directionActive]} onPress={() => setDirection(item)}><Ionicons name={item === 'above' ? 'trending-up' : 'trending-down'} size={17} color={direction === item ? market.white : market.n4} /><Text style={[styles.directionText, direction === item && styles.directionTextActive]}>{t(`market.alertRules.${item}`)}</Text></TouchableOpacity>)}
          </View>
          <View style={styles.inputRow}><Text style={styles.rupee}>₹</Text><TextInput value={threshold} onChangeText={setThreshold} keyboardType="numeric" placeholder={t('market.alertRules.threshold')} placeholderTextColor={market.n5} style={styles.input} /><Text style={styles.unit}>{t('market.common.quintalUnit')}</Text></View>
          <TouchableOpacity style={[styles.addButton, !threshold && styles.disabled]} disabled={!threshold} onPress={addRule}><Ionicons name="add-circle-outline" size={19} color={market.white} /><Text style={styles.addText}>{t('market.alertRules.add')}</Text></TouchableOpacity>
        </Card>

        <View style={styles.info}><Ionicons name="information-circle-outline" size={20} color={market.b2} /><Text style={styles.infoText}>{t('market.alertRules.deliveryNote')}</Text></View>
        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>{t('market.alertRules.saved')}</Text>{rules.length ? <Text style={styles.count}>{rules.length}</Text> : null}</View>
        {loading ? <ActivityIndicator color={market.g3} /> : rules.length === 0 ? <View style={styles.empty}><Ionicons name="notifications-outline" size={38} color={market.n5} /><Text style={styles.emptyTitle}>{t('market.alertRules.empty')}</Text><Text style={styles.emptyText}>{t('market.alertRules.emptySub')}</Text></View> : rules.map(rule => {
          const current = latestPrices[`${rule.state}|${rule.commodity}`];
          const triggered = rule.enabled && current > 0 && (rule.direction === 'above' ? current >= rule.threshold : current <= rule.threshold);
          return <Card key={rule.id} style={triggered ? { ...styles.ruleCard, ...styles.triggeredCard } : styles.ruleCard}>
            <View style={styles.ruleTop}><View style={[styles.ruleIcon, triggered && styles.triggeredIcon]}><Ionicons name={rule.direction === 'above' ? 'trending-up' : 'trending-down'} size={20} color={triggered ? market.white : market.g3} /></View><View style={styles.flex}><Text style={styles.ruleTitle}>{t(`market.crops.${rule.cropId}`, { defaultValue: rule.commodity })} · {rule.state}</Text><Text style={styles.ruleCondition}>{t(`market.alertRules.${rule.direction}Value`, { value: rule.threshold.toLocaleString(i18n.language) })}</Text></View><Switch value={rule.enabled} onValueChange={() => toggle(rule.id)} trackColor={{ false: market.n6, true: market.g6 }} thumbColor={rule.enabled ? market.g3 : market.n5} /></View>
            <View style={styles.ruleFooter}><Text style={[styles.status, triggered && styles.triggeredText]}>{current ? (triggered ? t('market.alertRules.triggered', { value: current.toLocaleString(i18n.language) }) : t('market.alertRules.current', { value: current.toLocaleString(i18n.language) })) : t('market.alertRules.awaiting')}</Text><TouchableOpacity onPress={() => remove(rule.id)} hitSlop={8}><Ionicons name="trash-outline" size={19} color={market.r2} /></TouchableOpacity></View>
          </Card>;
        })}
      </ScrollView>
      {activePicker ? <MarketOptionModal visible title={activePicker.title} options={activePicker.options} selected={activePicker.selected} onSelect={value => { if (picker === 'state') setState(value); else setCropId(MARKET_CROPS.find(item => item.name === value)?.id || cropId); }} onClose={() => setPicker(null)} /> : null}
      <LanguagePickerModal visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </View>
  );
}

function Selector({ label, value, onPress }: { label: string; value: string; onPress: () => void }) { return <TouchableOpacity style={styles.selector} onPress={onPress}><View style={styles.flex}><Text style={styles.selectorLabel}>{label}</Text><Text style={styles.selectorValue} numberOfLines={1}>{value}</Text></View><Ionicons name="chevron-down" size={17} color={market.n4} /></TouchableOpacity>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: market.n8 }, content: { padding: mSpacing.lg, paddingBottom: mSpacing.xxl }, createCard: { marginBottom: mSpacing.md }, cardTitle: { fontSize: mTypography.title, fontWeight: '800', color: market.n1 }, cardSub: { marginTop: 3, fontSize: mTypography.small, lineHeight: 19, color: market.n4 }, selectorRow: { flexDirection: 'row', gap: mSpacing.sm, marginTop: mSpacing.md }, selector: { flex: 1, minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: mSpacing.md, borderWidth: 1, borderColor: market.n7, borderRadius: mRadius.sm, backgroundColor: market.n9 }, flex: { flex: 1 }, selectorLabel: { fontSize: mTypography.caption, color: market.n4 }, selectorValue: { marginTop: 2, fontSize: mTypography.small, color: market.n1, fontWeight: '700' }, directionRow: { flexDirection: 'row', gap: mSpacing.sm, marginTop: mSpacing.sm }, direction: { flex: 1, minHeight: 42, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: market.n7, borderRadius: mRadius.sm }, directionActive: { backgroundColor: market.g3, borderColor: market.g3 }, directionText: { color: market.n4, fontSize: mTypography.small, fontWeight: '700' }, directionTextActive: { color: market.white }, inputRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', marginTop: mSpacing.sm, borderWidth: 1, borderColor: market.n7, borderRadius: mRadius.sm, paddingHorizontal: mSpacing.md }, rupee: { fontSize: mTypography.title, color: market.n2, fontWeight: '700' }, input: { flex: 1, paddingHorizontal: mSpacing.sm, fontSize: mTypography.bodyStrong, color: market.n1 }, unit: { fontSize: mTypography.small, color: market.n4 }, addButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: mSpacing.md, borderRadius: mRadius.sm, backgroundColor: market.g3 }, disabled: { opacity: 0.45 }, addText: { color: market.white, fontSize: mTypography.body, fontWeight: '800' }, info: { flexDirection: 'row', alignItems: 'flex-start', gap: mSpacing.sm, padding: mSpacing.md, borderRadius: mRadius.md, backgroundColor: market.b5 }, infoText: { flex: 1, color: market.b1, fontSize: mTypography.small, lineHeight: 19 }, sectionRow: { flexDirection: 'row', alignItems: 'center', gap: mSpacing.sm, marginTop: mSpacing.lg, marginBottom: mSpacing.sm }, sectionTitle: { color: market.n2, fontSize: mTypography.subtitle, fontWeight: '800' }, count: { minWidth: 22, textAlign: 'center', color: market.white, backgroundColor: market.g3, borderRadius: mRadius.pill, overflow: 'hidden', fontSize: mTypography.caption }, empty: { minHeight: 210, alignItems: 'center', justifyContent: 'center', padding: mSpacing.xxl }, emptyTitle: { marginTop: mSpacing.sm, color: market.n2, fontSize: mTypography.bodyStrong, fontWeight: '800' }, emptyText: { marginTop: 4, color: market.n4, fontSize: mTypography.small, textAlign: 'center' }, ruleCard: { marginBottom: mSpacing.sm }, triggeredCard: { borderColor: market.g5, backgroundColor: market.g7 }, ruleTop: { flexDirection: 'row', alignItems: 'center', gap: mSpacing.sm }, ruleIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: market.g7 }, triggeredIcon: { backgroundColor: market.g3 }, ruleTitle: { color: market.n1, fontSize: mTypography.bodyStrong, fontWeight: '800' }, ruleCondition: { marginTop: 2, color: market.n4, fontSize: mTypography.small }, ruleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: mSpacing.sm, paddingTop: mSpacing.sm, borderTopWidth: 1, borderTopColor: market.n7 }, status: { color: market.n4, fontSize: mTypography.caption }, triggeredText: { color: market.g3, fontWeight: '800' },
});
