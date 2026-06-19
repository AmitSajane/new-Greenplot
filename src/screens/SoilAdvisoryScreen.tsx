/**
 * AI Soil & Fertiliser Advisory — reads soil at the farm's GPS point (SoilGrids,
 * free) and gives plain-language fertiliser/amendment advice + suitable crops,
 * so farmers apply only what the soil needs and grow more for less.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { soilAdvisoryApi, SoilAdvisory, SoilAdvice } from '../services/soilAdvisoryApi';
import { getCurrentCoords } from '../utils/geo/location';

const TONE: Record<SoilAdvice['tone'], { bg: string; fg: string }> = {
  green: { bg: '#E4F4EC', fg: '#1A6B3A' },
  amber: { bg: '#FDF5E0', fg: '#B87214' },
  red: { bg: '#FDECEC', fg: '#C02828' },
  blue: { bg: '#E7F0FF', fg: '#1A5299' },
};

// Fallback point (Belagavi, Karnataka) when GPS is unavailable on the device.
const FALLBACK = { lat: 15.85, lon: 74.5 };

export default function SoilAdvisoryScreen() {
  const navigation = useNavigation();
  const [advisory, setAdvisory] = useState<SoilAdvisory | null>(null);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let coords = FALLBACK;
    let fellBack = false;
    try {
      coords = await getCurrentCoords();
    } catch {
      fellBack = true;
    }
    setUsedFallback(fellBack);
    const result = await soilAdvisoryApi.getAdvisory(coords.lat, coords.lon);
    setAdvisory(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F4A28" />
        </TouchableOpacity>
        <Text style={styles.title}>Soil Advisory</Text>
        <TouchableOpacity onPress={load} style={styles.backBtn}>
          <Ionicons name="refresh" size={20} color="#0F4A28" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1A6B3A" />
          <Text style={styles.loadingText}>Reading your soil from satellite data…</Text>
        </View>
      ) : !advisory ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color="#9EB8A8" />
          <Text style={styles.emptyText}>Couldn't fetch soil data right now.</Text>
          <TouchableOpacity style={styles.retry} onPress={load}><Text style={styles.retryText}>Try again</Text></TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {usedFallback && (
            <View style={styles.note}>
              <Ionicons name="information-circle" size={16} color="#1A5299" />
              <Text style={styles.noteText}>Using a sample location — enable GPS for your exact farm.</Text>
            </View>
          )}

          {/* Soil snapshot */}
          <Text style={styles.section}>Your soil</Text>
          <View style={styles.statRow}>
            <Stat label="pH level" value={advisory.ph != null ? advisory.ph.toFixed(1) : '—'} sub={advisory.phLabel} />
            <Stat label="Texture" value={advisory.texture.split(' ')[0]} sub={advisory.texture.includes('(') ? advisory.texture.split('(')[1].replace(')', '') : ' '} />
          </View>
          <View style={styles.statRow}>
            <Stat label="Nitrogen" value={advisory.nitrogenGkg != null ? `${advisory.nitrogenGkg.toFixed(1)}` : '—'} sub="g/kg" />
            <Stat label="Organic carbon" value={advisory.organicCarbonGkg != null ? `${advisory.organicCarbonGkg.toFixed(0)}` : '—'} sub="g/kg" />
          </View>

          {/* Recommendations */}
          <Text style={styles.section}>What to do 🌱</Text>
          {advisory.recommendations.map((r, i) => {
            const c = TONE[r.tone];
            return (
              <View key={i} style={styles.adviceCard}>
                <View style={[styles.adviceIcon, { backgroundColor: c.bg }]}>
                  <Ionicons name={r.icon} size={20} color={c.fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adviceTitle}>{r.title}</Text>
                  <Text style={styles.adviceDetail}>{r.detail}</Text>
                </View>
              </View>
            );
          })}

          {/* Suitable crops */}
          {advisory.suitableCrops.length > 0 && (
            <>
              <Text style={styles.section}>Best crops for this soil</Text>
              <View style={styles.chips}>
                {advisory.suitableCrops.map(c => (
                  <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>
                ))}
              </View>
            </>
          )}

          <Text style={styles.source}>Source: ISRIC SoilGrids (free satellite-derived soil data)</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8F5' },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E6EFE9' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: '#0D1509' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  loadingText: { fontSize: 14, color: '#6B8074', fontWeight: '600', textAlign: 'center' },
  emptyText: { fontSize: 16, color: '#3A5040', fontWeight: '700' },
  retry: { backgroundColor: '#1A6B3A', paddingHorizontal: 20, paddingVertical: 11, borderRadius: 13 },
  retryText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  note: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E7F0FF', borderRadius: 12, padding: 12, marginBottom: 14 },
  noteText: { flex: 1, fontSize: 13, color: '#1A5299', fontWeight: '600' },

  section: { fontSize: 18, fontWeight: '800', color: '#0D1509', marginTop: 8, marginBottom: 12 },
  statRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6EFE9', borderRadius: 16, padding: 16 },
  statLabel: { fontSize: 13, color: '#6B8074', fontWeight: '600' },
  statValue: { fontSize: 28, fontWeight: '800', color: '#0D1509', marginTop: 6 },
  statSub: { fontSize: 13, color: '#1A6B3A', fontWeight: '700', marginTop: 2 },

  adviceCard: { flexDirection: 'row', gap: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6EFE9', borderRadius: 16, padding: 15, marginBottom: 11 },
  adviceIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  adviceTitle: { fontSize: 16, fontWeight: '800', color: '#0D1509' },
  adviceDetail: { fontSize: 14, color: '#3A5040', marginTop: 3, lineHeight: 20 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { backgroundColor: '#E4F4EC', borderWidth: 1, borderColor: '#CDE9D8', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 14, fontWeight: '700', color: '#1A6B3A' },

  source: { fontSize: 12, color: '#9EB8A8', marginTop: 18, textAlign: 'center' },
});
