import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MarketHeader } from '../components';
import { market } from '../theme/marketTokens';
import { MOCK_ALERTS } from '../mockData';
import { AlertType, MarketAlert } from '../types';

const dotMeta: Record<AlertType, { bg: string; icon: string; color: string }> = {
  crash: { bg: market.r5, icon: 'trending-down', color: market.r2 },
  oversupply: { bg: market.a6, icon: 'cube', color: market.a1 },
  rising: { bg: market.g7, icon: 'trending-up', color: market.g2 },
  buyer: { bg: market.g7, icon: 'people', color: market.g2 },
  govt: { bg: market.b5, icon: 'business', color: market.b2 },
};

function NotifItem({ alert }: { alert: MarketAlert }) {
  const m = dotMeta[alert.type];
  return (
    <View style={[styles.item, alert.type === 'oversupply' && { backgroundColor: market.a7 }]}>
      <View style={[styles.dot, { backgroundColor: m.bg }]}>
        <Ionicons name={m.icon} size={17} color={m.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.body}>{alert.subtitle}</Text>
        <Text style={styles.time}>
          {alert.time} · {alert.source}
        </Text>
      </View>
    </View>
  );
}

export default function AlertsCentreScreen() {
  const today = MOCK_ALERTS.filter(a => a.group === 'today');
  const yesterday = MOCK_ALERTS.filter(a => a.group === 'yesterday');

  return (
    <View style={styles.container}>
      <MarketHeader eyebrow="Market module" title="Alerts centre" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <Text style={styles.group}>Today</Text>
        {today.map(a => (
          <NotifItem key={a.id} alert={a} />
        ))}
        <Text style={styles.group}>Yesterday</Text>
        {yesterday.map(a => (
          <NotifItem key={a.id} alert={a} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  group: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
    fontSize: 10,
    fontWeight: '600',
    color: market.n4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: market.n8,
  },
  dot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 12, fontWeight: '600', color: market.n2 },
  body: { fontSize: 11, color: market.n4, marginTop: 2, lineHeight: 16 },
  time: { fontSize: 10, color: market.n5, marginTop: 2 },
});
