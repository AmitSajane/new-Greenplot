import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Card } from '../components';
import { market, mRadius } from '../theme/marketTokens';
import { MarketStackParamList } from '../navigation/marketRoutes';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'StorageBookingConfirmed'>;

export default function StorageBookingConfirmedScreen() {
  const { i18n, t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<MarketStackParamList, 'StorageBookingConfirmed'>>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={44} color="#fff" />
        </View>
        <Text style={styles.title}>{t('market.storageFlow.bookingConfirmed')}</Text>
        <Text style={styles.sub}>{t('market.storageFlow.bookingConfirmedBody')}</Text>

        <Card style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.key}>{t('market.storageFlow.bookingId')}</Text>
            <Text style={[styles.val, { color: market.g2 }]}>{params.bookingId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.key}>{t('market.storageFlow.storage')}</Text>
            <Text style={styles.val}>{params.storageName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.key}>{t('market.storageFlow.quantity')}</Text>
            <Text style={styles.val}>{params.quantityKg.toLocaleString(i18n.language)} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.key}>{t('market.storageFlow.duration')}</Text>
            <Text style={styles.val}>{t('market.storageFlow.dayCount', { count: params.durationDays })}</Text>
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.key}>{t('market.storageFlow.amountPaid')}</Text>
            <Text style={[styles.val, styles.total]}>₹{params.total.toLocaleString(i18n.language)}</Text>
          </View>
        </Card>

        <View style={styles.nextCard}>
          <Text style={styles.nextTitle}>{t('market.storageFlow.whatsNext')}</Text>
          {[
            ['cube', t('market.storageFlow.nextPack')],
            ['bus', t('market.storageFlow.nextTransport')],
            ['notifications', t('market.storageFlow.nextAlert')],
          ].map(([icon, text]) => (
            <View key={text} style={styles.nextRow}>
              <Ionicons name={icon} size={16} color={market.g3} />
              <Text style={styles.nextText}>{text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AlertsCentre')}
        >
          <Text style={styles.primaryBtnText}>{t('market.storageFlow.viewAlerts')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.85}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.secondaryBtnText}>{t('market.storageFlow.backToMarket')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  scroll: { padding: 20, alignItems: 'center', paddingBottom: 24 },
  checkCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: market.g4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', color: market.g1 },
  sub: { fontSize: 12, color: market.n4, textAlign: 'center', lineHeight: 18, marginTop: 6, marginBottom: 20 },
  card: { width: '100%' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: market.n8,
  },
  key: { fontSize: 12, color: market.n4 },
  val: { fontSize: 12, fontWeight: '600', color: market.n2 },
  total: { fontSize: 15, fontWeight: '800', color: market.g1 },
  nextCard: {
    width: '100%',
    backgroundColor: market.g7,
    borderWidth: 1,
    borderColor: market.g6,
    borderRadius: mRadius.md,
    padding: 14,
    marginTop: 14,
  },
  nextTitle: { fontSize: 12, fontWeight: '700', color: market.g1, marginBottom: 10 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 9 },
  nextText: { fontSize: 11, color: market.g2, flex: 1, lineHeight: 16 },
  footer: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  primaryBtn: { backgroundColor: market.g2, borderRadius: mRadius.sm, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 12, alignItems: 'center' },
  secondaryBtnText: { color: market.n4, fontSize: 12, fontWeight: '600' },
});
