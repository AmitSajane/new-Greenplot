import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MarketHeader } from '../components';
import { market, mRadius } from '../theme/marketTokens';

export default function EmptyStateScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <MarketHeader eyebrow="Market module" title="No data" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.empty}>
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-offline" size={36} color={market.n5} />
          </View>
          <Text style={styles.title}>No market data</Text>
          <Text style={styles.sub}>
            We couldn't load price data for this crop and region. Check your internet connection or
            try again.
          </Text>
          <TouchableOpacity style={styles.retryBtn}>
            <Ionicons name="refresh" size={14} color="#fff" />
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>

        {/* Loading skeleton preview */}
        <View style={styles.skeletonWrap}>
          <Text style={styles.skeletonLabel}>Loading skeleton state</Text>
          <View style={[styles.skel, { height: 80 }]} />
          <View style={styles.skelRow}>
            <View style={[styles.skel, { flex: 1, height: 50 }]} />
            <View style={[styles.skel, { flex: 1, height: 50 }]} />
          </View>
          <View style={[styles.skel, { height: 120 }]} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20, gap: 10 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: market.n7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 13, fontWeight: '600', color: market.n3 },
  sub: { fontSize: 11, color: market.n5, textAlign: 'center', lineHeight: 17 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: market.g3,
    borderRadius: mRadius.sm,
    paddingHorizontal: 22,
    paddingVertical: 10,
    marginTop: 4,
  },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  skeletonWrap: { paddingHorizontal: 14, paddingBottom: 20 },
  skeletonLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: market.n5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  skel: { backgroundColor: market.n7, borderRadius: mRadius.md, marginBottom: 8 },
  skelRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
});
