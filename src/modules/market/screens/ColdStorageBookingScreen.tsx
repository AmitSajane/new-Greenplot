import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Card, SectionLabel } from '../components';
import ColdStorageAppHeader from '../components/ColdStorageAppHeader';
import { market, mRadius } from '../theme/marketTokens';
import { MarketStackParamList } from '../navigation/marketRoutes';
import { DEFAULT_STORE_INTENT, MOCK_COLD_STORAGES } from '../data/coldStorages';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'ColdStorageBooking'>;

const DURATIONS = [7, 15, 30];
const HANDLING_PER_KG = 0.3;

export default function ColdStorageBookingScreen() {
  const { i18n, t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<MarketStackParamList, 'ColdStorageBooking'>>();
  const storage = MOCK_COLD_STORAGES.find(s => s.id === route.params.storageId)!;
  const insured = storage.features[2].available;

  const [quantity, setQuantity] = useState(DEFAULT_STORE_INTENT.quantityKg);
  const [days, setDays] = useState(DEFAULT_STORE_INTENT.recommendedDays);

  const cost = useMemo(() => {
    const storageCost = Math.round(quantity * storage.ratePerKgPerDay * days);
    const handlingFee = Math.round(quantity * HANDLING_PER_KG);
    const insuranceFee = insured ? 0 : Math.round(quantity * 0.05 * (days / 30));
    const total = storageCost + handlingFee + insuranceFee;
    return { storageCost, handlingFee, insuranceFee, total };
  }, [quantity, days, storage.ratePerKgPerDay, insured]);

  // Value framing: expected recovery vs storage outlay.
  const expectedGain = Math.round(quantity * DEFAULT_STORE_INTENT.expectedRecoveryPerKg);
  const netGain = expectedGain - cost.total;

  const adjustQty = (delta: number) => setQuantity(q => Math.max(100, Math.min(storage.availableCapacityMT * 1000, q + delta)));

  const confirm = () => {
    navigation.navigate('StorageBookingConfirmed', {
      bookingId: 'CS' + Math.floor(100000 + Math.random() * 899999),
      storageName: storage.name,
      quantityKg: quantity,
      durationDays: days,
      total: cost.total,
    });
  };

  return (
    <View style={styles.container}>
      <ColdStorageAppHeader feature="storageBooking" subtitle={storage.name} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Storage summary */}
        <View style={styles.summary}>
          <View style={[styles.cover, { backgroundColor: storage.tone }]}>
            <Text style={styles.coverEmoji}>{storage.image}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryName}>{storage.name}</Text>
            <Text style={styles.summaryLoc}>
              {storage.location} · {storage.distanceKm} km · {storage.tempRange}
            </Text>
          </View>
        </View>

        {/* Quantity */}
        <SectionLabel label={t('market.storageFlow.quantityToStore')} />
        <Card>
          <View style={styles.stepperRow}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => adjustQty(-100)}>
              <Ionicons name="remove" size={18} color={market.g2} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.qtyValue}>{quantity.toLocaleString(i18n.language)}</Text>
              <Text style={styles.qtyUnit}>{t('market.storageFlow.kgOfCrop', { crop: DEFAULT_STORE_INTENT.cropName })}</Text>
            </View>
            <TouchableOpacity style={styles.stepBtn} onPress={() => adjustQty(100)}>
              <Ionicons name="add" size={18} color={market.g2} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Duration */}
        <View style={{ marginTop: 12 }}>
          <SectionLabel label={t('market.storageFlow.storageDuration')} />
          <View style={styles.durationRow}>
            {DURATIONS.map(d => {
              const active = d === days;
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationChip, active && styles.durationChipActive]}
                  onPress={() => setDays(d)}
                >
                  <Text style={[styles.durationValue, active && { color: '#fff' }]}>{d}</Text>
                  <Text style={[styles.durationLabel, active && { color: 'rgba(255,255,255,0.8)' }]}>{t('market.storageFlow.days')}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.recommend}>
            {t('market.storageFlow.aiRecommends', { days: DEFAULT_STORE_INTENT.recommendedDays })}
          </Text>
        </View>

        {/* Start date (mock) */}
        <View style={{ marginTop: 12 }}>
          <SectionLabel label={t('market.storageFlow.dropOffDate')} />
          <Card>
            <View style={styles.dateRow}>
              <Ionicons name="calendar" size={16} color={market.g3} />
              <Text style={styles.dateText}>{t('market.storageFlow.tomorrow')}</Text>
              <Ionicons name="chevron-down" size={16} color={market.n5} style={{ marginLeft: 'auto' }} />
            </View>
          </Card>
        </View>

        {/* Cost breakdown */}
        <View style={{ marginTop: 12 }}>
          <SectionLabel label={t('market.storageFlow.costBreakdown')} />
          <Card>
            <View style={styles.costRow}>
              <Text style={styles.costKey}>
                {t('market.storageFlow.storageCalculation', { quantity: quantity.toLocaleString(i18n.language), rate: storage.ratePerKgPerDay.toFixed(2), days })}
              </Text>
              <Text style={styles.costVal}>₹{cost.storageCost.toLocaleString(i18n.language)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costKey}>{t('market.storageFlow.handling')}</Text>
              <Text style={styles.costVal}>₹{cost.handlingFee.toLocaleString(i18n.language)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costKey}>{t('market.storageFlow.insurance')}</Text>
              <Text style={[styles.costVal, cost.insuranceFee === 0 && { color: market.g3 }]}>
                {cost.insuranceFee === 0 ? t('market.storageFlow.included') : `₹${cost.insuranceFee.toLocaleString(i18n.language)}`}
              </Text>
            </View>
            <View style={[styles.costRow, styles.totalRow]}>
              <Text style={styles.totalKey}>{t('market.storageFlow.totalPayable')}</Text>
              <Text style={styles.totalVal}>₹{cost.total.toLocaleString(i18n.language)}</Text>
            </View>
          </Card>
        </View>

        {/* Value framing */}
        <View style={styles.valueCard}>
          <Ionicons name="trending-up" size={18} color={market.g2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.valueTitle}>
              {t('market.storageFlow.expectedNetGain', { value: netGain.toLocaleString(i18n.language) })}
            </Text>
            <Text style={styles.valueSub}>
              {t('market.storageFlow.recoveryExplanation', { gain: expectedGain.toLocaleString(i18n.language), cost: cost.total.toLocaleString(i18n.language), days })}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky confirm */}
      <View style={styles.confirmBar}>
        <View>
          <Text style={styles.confirmTotal}>₹{cost.total.toLocaleString(i18n.language)}</Text>
          <Text style={styles.confirmSub}>
            {t('market.storageFlow.quantityDays', { quantity: quantity.toLocaleString(i18n.language), days })}
          </Text>
        </View>
        <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.85} onPress={confirm}>
          <Text style={styles.confirmBtnText}>{t('market.storageFlow.confirmBooking')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  scroll: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 24 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: market.white,
    borderWidth: 1,
    borderColor: market.n7,
    borderRadius: mRadius.md,
    padding: 12,
    marginBottom: 14,
  },
  cover: { width: 40, height: 40, borderRadius: mRadius.sm, alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 20 },
  summaryName: { fontSize: 13, fontWeight: '700', color: market.n2 },
  summaryLoc: { fontSize: 10, color: market.n4, marginTop: 2 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: mRadius.sm,
    borderWidth: 1,
    borderColor: market.g6,
    backgroundColor: market.g7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { fontSize: 24, fontWeight: '700', color: market.g1 },
  qtyUnit: { fontSize: 11, color: market.n4 },
  durationRow: { flexDirection: 'row', gap: 8 },
  durationChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: market.white,
    borderWidth: 1,
    borderColor: market.n7,
    borderRadius: mRadius.sm,
    paddingVertical: 12,
  },
  durationChipActive: { backgroundColor: market.g2, borderColor: market.g2 },
  durationValue: { fontSize: 18, fontWeight: '700', color: market.n2 },
  durationLabel: { fontSize: 10, color: market.n4 },
  recommend: { fontSize: 10, color: market.a2, marginTop: 8, fontWeight: '500' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 12, color: market.n2, fontWeight: '500' },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: market.n8,
  },
  costKey: { fontSize: 11, color: market.n4, flex: 1, marginRight: 8 },
  costVal: { fontSize: 12, fontWeight: '600', color: market.n2 },
  totalRow: { borderBottomWidth: 0, marginTop: 2, paddingTop: 10, borderTopWidth: 1, borderTopColor: market.n7 },
  totalKey: { fontSize: 13, fontWeight: '700', color: market.n1 },
  totalVal: { fontSize: 16, fontWeight: '800', color: market.g1 },
  valueCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: market.g7,
    borderWidth: 1,
    borderColor: market.g6,
    borderRadius: mRadius.sm,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginTop: 12,
  },
  valueTitle: { fontSize: 12, fontWeight: '700', color: market.g1 },
  valueSub: { fontSize: 11, color: market.g2, marginTop: 2, lineHeight: 16 },
  confirmBar: {
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
  confirmTotal: { fontSize: 16, fontWeight: '800', color: market.n1 },
  confirmSub: { fontSize: 10, color: market.n4 },
  confirmBtn: { backgroundColor: market.g2, borderRadius: mRadius.sm, paddingHorizontal: 22, paddingVertical: 13 },
  confirmBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
