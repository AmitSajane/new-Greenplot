import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, MarketHeader } from '../components';
import { market, mRadius } from '../theme/marketTokens';
import { MOCK_MSP_CROPS } from '../mockData';

const statusColor = { green: market.g3, amber: market.a2, red: market.r2 } as const;

export default function MspFrpScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <MarketHeader
        eyebrow="Government pricing"
        title="MSP / FRP price guide"
        badge="Kharif 2025–26"
        onBack={() => navigation.goBack()}
        colors={[market.b1, market.b1, market.b2]}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* MSP banner */}
        <View style={styles.mspBanner}>
          <Ionicons name="business" size={18} color={market.b2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.mspTitle}>Minimum Support Price (MSP)</Text>
            <Text style={styles.mspBody}>
              Government guaranteed floor price. If market falls below MSP, sell to FCI or NAFED
              procurement.
            </Text>
          </View>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Kharif crops 2025–26</Text>
          {MOCK_MSP_CROPS.map((c, i) => (
            <View key={c.name} style={[styles.row, i === MOCK_MSP_CROPS.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.emoji}>{c.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.msp}>MSP: {c.msp}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.marketPrice}>{c.market}</Text>
                <Text style={[styles.status, { color: statusColor[c.tone] }]}>{c.status}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={styles.howCard}>
          <Text style={styles.howTitle}>🏛️ How to access MSP procurement</Text>
          <Text style={styles.howBody}>
            Register at e-procurement portal or nearest FCI/NAFED depot. Bring: Kisan ID, land
            records, crop inspection report.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  scroll: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 28, gap: 10 },
  mspBanner: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: market.b5,
    borderWidth: 1,
    borderColor: market.b4,
    borderRadius: mRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mspTitle: { fontSize: 11, fontWeight: '700', color: market.b1, marginBottom: 2 },
  mspBody: { fontSize: 10, color: market.b2, lineHeight: 15 },
  cardTitle: { fontSize: 11, fontWeight: '600', color: market.n3, marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: market.n8,
  },
  emoji: { fontSize: 16 },
  name: { fontSize: 12, fontWeight: '600', color: market.n2 },
  msp: { fontSize: 10, color: market.n4 },
  marketPrice: { fontSize: 11, fontWeight: '700', color: market.n2 },
  status: { fontSize: 10, fontWeight: '600' },
  howCard: {
    backgroundColor: market.g7,
    borderWidth: 1,
    borderColor: market.g6,
    borderRadius: mRadius.sm,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  howTitle: { fontSize: 11, fontWeight: '600', color: market.g1, marginBottom: 4 },
  howBody: { fontSize: 11, color: market.g2, lineHeight: 18 },
});
