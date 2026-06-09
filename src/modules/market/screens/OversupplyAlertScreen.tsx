import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, SectionLabel } from '../components';
import { market, mRadius } from '../theme/marketTokens';
import { MarketStackParamList } from '../navigation/marketRoutes';

type Nav = NativeStackNavigationProp<MarketStackParamList, 'OversupplyAlert'>;

const REASONS = [
  { icon: 'cube', color: market.r2, title: 'Arrivals +38% above average', sub: 'Heavy inflow from Dharwad, Haveri, Gadag' },
  { icon: 'location', color: market.a2, title: 'Similar crash in Oct 2024', sub: 'Same pattern — prices fell 42% in 2 weeks' },
  { icon: 'trending-down', color: market.r3, title: 'Demand score only 32%', sub: 'Buyers less active this week' },
];

export default function OversupplyAlertScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: market.r2 }}>
        <View style={styles.header}>
          <View style={styles.headRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
              <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <Text style={styles.eyebrow}>Price crash warning</Text>
          </View>
          <Text style={styles.title}>Tomato price{'\n'}crash alert</Text>
          <View style={styles.dropBox}>
            <Text style={styles.dropLabel}>Predicted drop</Text>
            <Text style={styles.dropValue}>₹18 → ₹11/kg</Text>
            <Text style={styles.dropSub}>in 18 days · 87% AI confidence</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <SectionLabel label="Why this alert?" />
        <Card>
          {REASONS.map((r, i) => (
            <View key={r.title} style={[styles.reasonRow, i === REASONS.length - 1 && { borderBottomWidth: 0 }]}>
              <Ionicons name={r.icon} size={16} color={r.color} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.reasonTitle}>{r.title}</Text>
                <Text style={styles.reasonSub}>{r.sub}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: market.g3 }]}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('ColdStorageList', {
                cropName: 'Tomato',
                quantityKg: 1200,
                recommendedDays: 15,
              })
            }
          >
            <Ionicons name="snow" size={20} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitlePrimary}>Book cold storage</Text>
              <Text style={styles.actionSubPrimary}>Store 15 days · Potential +₹9,600</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: market.g7, borderWidth: 1, borderColor: market.g6 }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MandiList', { cropId: 'tomato' })}
          >
            <Ionicons name="bus" size={20} color={market.g2} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionTitle, { color: market.g1 }]}>Sell at Belagavi APMC</Text>
              <Text style={[styles.actionSub, { color: market.g3 }]}>Best price ₹22/kg · 74 km</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={market.g4} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: market.white, borderWidth: 1, borderColor: market.n7 }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FindBuyers', { cropId: 'tomato' })}
          >
            <Ionicons name="people" size={20} color={market.b2} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionTitle, { color: market.n2 }]}>Find direct buyers</Text>
              <Text style={[styles.actionSub, { color: market.n4 }]}>3 buyers interested · bypass mandi</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={market.n5} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  eyebrow: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: { fontSize: 22, color: '#fff', fontWeight: '700', lineHeight: 26, marginBottom: 8 },
  dropBox: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: mRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  dropValue: { fontSize: 20, fontWeight: '700', color: '#fff' },
  dropSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  scroll: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 28 },
  reasonRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: market.n8,
  },
  reasonTitle: { fontSize: 12, fontWeight: '600', color: market.n2 },
  reasonSub: { fontSize: 11, color: market.n4, marginTop: 1 },
  actions: { marginTop: 12, gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: mRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionTitlePrimary: { fontSize: 13, fontWeight: '700', color: '#fff' },
  actionSubPrimary: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  actionTitle: { fontSize: 13, fontWeight: '600' },
  actionSub: { fontSize: 11 },
});
