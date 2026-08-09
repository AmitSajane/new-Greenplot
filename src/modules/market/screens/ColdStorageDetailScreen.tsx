import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Card, SectionLabel } from '../components';
import ColdStorageAppHeader from '../components/ColdStorageAppHeader';
import { market, mRadius } from '../theme/marketTokens';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { MOCK_COLD_STORAGES } from '../data/coldStorages';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'ColdStorageDetail'>;

const REVIEWS = [
  { name: 'Mahesh P.', rating: 5, text: 'Stored 8 quintal tomato for 12 days, zero spoilage. Staff helped with loading.' },
  { name: 'Lakshmi B.', rating: 4, text: 'Fair pricing and clean chambers. Reefer pickup was on time.' },
];
const FEATURE_KEYS: Record<string, string> = { 'Pre-cooling chamber': 'preCoolingChamber', '24×7 power backup': 'powerBackup', 'Insurance covered': 'insuranceCovered', 'Sorting & grading': 'sortingGrading', 'Loading dock + reefer': 'loadingReefer', 'IoT temp monitoring': 'tempMonitoring' };

export default function ColdStorageDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<MarketStackParamList, 'ColdStorageDetail'>>();
  const storage = MOCK_COLD_STORAGES.find(s => s.id === route.params.storageId)!;
  const usedPct = Math.round(((storage.totalCapacityMT - storage.availableCapacityMT) / storage.totalCapacityMT) * 100);

  return (
    <View style={styles.container}>
      <ColdStorageAppHeader feature="storageDetails" subtitle={storage.name} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Quick stats */}
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Ionicons name="star" size={14} color={market.a4} />
            <Text style={styles.statValue}>{storage.rating}</Text>
            <Text style={styles.statLabel}>{t('market.storageFlow.reviewCount', { count: storage.reviews })}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="navigate" size={14} color={market.b2} />
            <Text style={styles.statValue}>{storage.distanceKm} km</Text>
            <Text style={styles.statLabel}>{storage.openHours}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="thermometer" size={14} color={market.g3} />
            <Text style={styles.statValue}>{storage.tempRange}</Text>
            <Text style={styles.statLabel}>{storage.commodities}</Text>
          </View>
        </View>

        {/* Capacity */}
        <View style={styles.capWrap}>
          <Card>
            <View style={styles.capHead}>
              <Text style={styles.capTitle}>{t('market.storageFlow.availableCapacity')}</Text>
              <Text style={styles.capValue}>
                {storage.availableCapacityMT} / {storage.totalCapacityMT} MT
              </Text>
            </View>
            <View style={styles.capTrack}>
              <View style={[styles.capFill, { width: `${usedPct}%` }]} />
            </View>
            <Text style={styles.capNote}>{t('market.storageFlow.occupied', { percent: usedPct })}</Text>
          </Card>
        </View>

        {/* Features grid */}
        <SectionLabel label={t('market.storageFlow.facilityFeatures')} />
        <View style={styles.featureGrid}>
          {storage.features.map(f => (
            <View
              key={f.label}
              style={[styles.feature, !f.available && styles.featureOff]}
            >
              <Ionicons
                name={f.available ? f.icon : 'close-circle-outline'}
                size={18}
                color={f.available ? market.g3 : market.n5}
              />
              <Text style={[styles.featureLabel, !f.available && { color: market.n5 }]}>{t(`market.storageFlow.catalog.${FEATURE_KEYS[f.label]}`)}</Text>
              {f.available ? (
                <Ionicons name="checkmark-circle" size={14} color={market.g4} style={styles.featureTick} />
              ) : (
                <Text style={styles.featureNa}>{t('market.storageFlow.notApplicable')}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={{ marginTop: 4 }}>
          <SectionLabel label={t('market.storageFlow.pricing')} />
          <Card>
            <View style={styles.priceRow}>
              <Text style={styles.priceKey}>{t('market.storageFlow.storageRate')}</Text>
              <Text style={styles.priceVal}>₹{storage.ratePerKgPerDay.toFixed(2)} {t('market.storageFlow.perKgDay')}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceKey}>{t('market.storageFlow.handling')}</Text>
              <Text style={styles.priceVal}>₹0.30 / kg</Text>
            </View>
            <View style={[styles.priceRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.priceKey}>{t('market.storageFlow.insurance')}</Text>
              <Text style={[styles.priceVal, { color: storage.features[2].available ? market.g3 : market.n4 }]}>
                {storage.features[2].available ? t('market.storageFlow.included') : t('market.common.unavailable')}
              </Text>
            </View>
          </Card>
        </View>

        {/* Reviews */}
        <View style={{ marginTop: 12 }}>
          <SectionLabel label={t('market.storageFlow.farmerReviews')} />
          {REVIEWS.map(r => (
            <Card key={r.name} style={{ marginBottom: 8 }}>
              <View style={styles.reviewHead}>
                <Text style={styles.reviewName}>{r.name}</Text>
                <View style={{ flexDirection: 'row' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons key={i} name="star" size={11} color={i < r.rating ? market.a4 : market.n6} />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{t(`market.storageFlow.reviews.${r.name.startsWith('Mahesh') ? 'first' : 'second'}`)}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Sticky book bar */}
      <View style={styles.bookBar}>
        <View>
          <Text style={styles.bookFrom}>{t('market.storageFlow.fromRate', { rate: storage.ratePerKgPerDay.toFixed(2) })}</Text>
          <Text style={styles.bookSub}>{t('market.storageFlow.mtFreeNow', { count: storage.availableCapacityMT })}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ColdStorageBooking', { storageId: storage.id })}
        >
          <Text style={styles.bookBtnText}>{t('market.storageFlow.bookThisStorage')}</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  scroll: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 24 },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: {
    flex: 1,
    backgroundColor: market.white,
    borderWidth: 1,
    borderColor: market.n7,
    borderRadius: mRadius.sm,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 13, fontWeight: '700', color: market.n2 },
  statLabel: { fontSize: 9, color: market.n4, textAlign: 'center' },
  capWrap: { marginBottom: 12 },
  capHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  capTitle: { fontSize: 12, fontWeight: '600', color: market.n2 },
  capValue: { fontSize: 12, fontWeight: '700', color: market.g2 },
  capTrack: { height: 7, backgroundColor: market.n7, borderRadius: 4, overflow: 'hidden' },
  capFill: { height: 7, borderRadius: 4, backgroundColor: market.a4 },
  capNote: { fontSize: 10, color: market.n4, marginTop: 6 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  feature: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: market.white,
    borderWidth: 1,
    borderColor: market.g6,
    borderRadius: mRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  featureOff: { borderColor: market.n7, backgroundColor: market.n9 },
  featureLabel: { fontSize: 11, color: market.n2, flex: 1, fontWeight: '500' },
  featureTick: {},
  featureNa: { fontSize: 9, color: market.n5, fontWeight: '600' },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: market.n8,
  },
  priceKey: { fontSize: 12, color: market.n4 },
  priceVal: { fontSize: 12, fontWeight: '600', color: market.n2 },
  reviewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewName: { fontSize: 12, fontWeight: '600', color: market.n2 },
  reviewText: { fontSize: 11, color: market.n4, lineHeight: 16 },
  bookBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: market.white,
    borderTopWidth: 1,
    borderTopColor: market.n7,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  bookFrom: { fontSize: 13, fontWeight: '700', color: market.n1 },
  bookSub: { fontSize: 10, color: market.n4 },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: market.g2,
    borderRadius: mRadius.sm,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  bookBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
