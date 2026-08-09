import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import ColdStorageAppHeader from '../components/ColdStorageAppHeader';
import { market, mRadius } from '../theme/marketTokens';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { DEFAULT_STORE_INTENT, MOCK_COLD_STORAGES } from '../data/coldStorages';
import { ColdStorage } from '../types';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'ColdStorageList'>;

const FILTERS = ['nearest', 'lowestPrice', 'availableNow', 'verified'] as const;
const CATALOG_KEYS: Record<string, string> = { 'Pre-cooling': 'preCooling', '24×7 power': 'power', Insurance: 'insurance', 'Lowest price': 'lowestPrice', Sorting: 'sorting', 'Export grade': 'exportGrade', 'At best mandi': 'bestMandi', Reefer: 'reefer', Cheapest: 'cheapest', 'Coop run': 'coopRun' };

function sortStorages(list: ColdStorage[], filter: number) {
  const copy = [...list];
  switch (filter) {
    case 1:
      return copy.sort((a, b) => a.ratePerKgPerDay - b.ratePerKgPerDay);
    case 2:
      return copy.sort((a, b) => b.availableCapacityMT - a.availableCapacityMT);
    case 3:
      return copy.filter(s => s.verified);
    default:
      return copy.sort((a, b) => a.distanceKm - b.distanceKm);
  }
}

function StorageCard({ storage, onPress }: { storage: ColdStorage; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={[styles.cover, { backgroundColor: storage.tone }]}>
          <Text style={styles.coverEmoji}>{storage.image}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{storage.name}</Text>
            {storage.verified && <Ionicons name="checkmark-circle" size={14} color={market.b2} />}
          </View>
          <Text style={styles.loc}>
            {storage.location} · {storage.distanceKm} km
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={11} color={market.a4} />
            <Text style={styles.metaText}>
              {storage.rating} ({storage.reviews})
            </Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.metaText}>{t('market.storageFlow.mtFree', { count: storage.availableCapacityMT })}</Text>
          </View>
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.price}>₹{storage.ratePerKgPerDay.toFixed(2)}</Text>
          <Text style={styles.priceUnit}>{t('market.storageFlow.perKgDay')}</Text>
        </View>
      </View>

      <View style={styles.highlightRow}>
        {storage.highlights.map(h => (
          <Text key={h} style={styles.highlight}>
            {t(`market.storageFlow.catalog.${CATALOG_KEYS[h]}`)}
          </Text>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerHint}>{storage.openHours}</Text>
        <View style={styles.detailLink}>
          <Text style={styles.detailLinkText}>{t('market.storageFlow.viewDetails')}</Text>
          <Ionicons name="chevron-forward" size={13} color={market.g2} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ColdStorageListScreen() {
  const { i18n, t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<MarketStackParamList, 'ColdStorageList'>>();
  const cropName = route.params?.cropName ?? DEFAULT_STORE_INTENT.cropName;
  const quantityKg = route.params?.quantityKg ?? DEFAULT_STORE_INTENT.quantityKg;
  const recommendedDays = route.params?.recommendedDays ?? DEFAULT_STORE_INTENT.recommendedDays;

  const [filter, setFilter] = useState(0);
  const storages = useMemo(() => sortStorages(MOCK_COLD_STORAGES, filter), [filter]);

  return (
    <View style={styles.container}>
      <ColdStorageAppHeader feature="storage" subtitle={cropName} />

      {/* Intent banner carried from the crash alert */}
      <View style={styles.banner}>
        <Ionicons name="snow" size={18} color={market.g2} />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>
            {t('market.storageFlow.storing', { quantity: quantityKg.toLocaleString(i18n.language), crop: cropName })}
          </Text>
          <Text style={styles.bannerSub}>
            {t('market.storageFlow.recommended', { days: recommendedDays })}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f, i) => (
          <Text key={f} onPress={() => setFilter(i)} style={[styles.chip, i === filter && styles.chipActive]}>
            {t(`market.storageFlow.filters.${f}`)}
          </Text>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.count}>{t('market.storageFlow.availableCount', { count: storages.length })}</Text>
        {storages.map(s => (
          <StorageCard
            key={s.id}
            storage={s}
            onPress={() => navigation.navigate('ColdStorageDetail', { storageId: s.id })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 14,
    marginBottom: 0,
    backgroundColor: market.g7,
    borderWidth: 1,
    borderColor: market.g6,
    borderRadius: mRadius.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  bannerTitle: { fontSize: 13, fontWeight: '700', color: market.g1 },
  bannerSub: { fontSize: 11, color: market.g2, marginTop: 2 },
  filterBar: { backgroundColor: 'transparent', flexGrow: 0, marginTop: 10 },
  filterContent: { paddingHorizontal: 14, gap: 6 },
  chip: {
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: market.n6,
    color: market.n4,
    backgroundColor: market.white,
  },
  chipActive: { backgroundColor: market.g2, color: '#fff', borderColor: market.g2 },
  scroll: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 28 },
  count: { fontSize: 11, color: market.n4, marginBottom: 8 },
  card: {
    backgroundColor: market.white,
    borderWidth: 1,
    borderColor: market.n7,
    borderRadius: mRadius.md,
    padding: 12,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', gap: 10 },
  cover: { width: 44, height: 44, borderRadius: mRadius.sm, alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 22 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontSize: 13, fontWeight: '700', color: market.n2 },
  loc: { fontSize: 11, color: market.n4, marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  metaText: { fontSize: 10, color: market.n3, fontWeight: '500' },
  dot: { fontSize: 10, color: market.n5 },
  priceCol: { alignItems: 'flex-end' },
  price: { fontSize: 15, fontWeight: '700', color: market.g2 },
  priceUnit: { fontSize: 9, color: market.n4 },
  highlightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 },
  highlight: {
    fontSize: 10,
    fontWeight: '600',
    color: market.g2,
    backgroundColor: market.g7,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: market.n8,
  },
  footerHint: { fontSize: 10, color: market.n4 },
  detailLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailLinkText: { fontSize: 11, fontWeight: '600', color: market.g2 },
});
