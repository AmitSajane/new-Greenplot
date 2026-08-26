/**
 * Weather & Farm Advisory — the destination for the Farmer Home weather card.
 * Shows the multi-day forecast (today + next few days) plus farmer-oriented
 * guidance (irrigation window, spray safety, fungal risk) derived from the
 * same live weather data already used on the home card.
 */
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../components/molecules/ScreenHeader';
import { colors } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import useCurrentLocation from '../hooks/useCurrentLocation';
import useWeather from '../hooks/useWeather';
import type { ForecastDay, WeatherInfo } from './farmerHome/constants/farmerDashboardData';

interface FarmTip {
  icon: string;
  tone: 'green' | 'amber' | 'red' | 'blue';
  title: string;
  detail: string;
}

const TONE: Record<FarmTip['tone'], { bg: string; fg: string }> = {
  green: { bg: '#E4F4EC', fg: '#1A6B3A' },
  amber: { bg: '#FDF5E0', fg: '#B87214' },
  red: { bg: '#FDECEC', fg: '#C02828' },
  blue: { bg: '#E7F0FF', fg: '#1A5299' },
};

// Short, farming-relevant tip for a forecasted day, based on its icon alone
// (the multi-day API response only carries icon + temp, not full condition text).
function dayTip(emoji: string): string {
  if (emoji === '⛈' || emoji === '🌧') return 'Rain likely · skip spraying';
  if (emoji === '❄️') return 'Cold snap · protect saplings';
  if (emoji === '🌫') return 'Low visibility early on';
  if (emoji === '☀️') return 'Clear · good for fieldwork';
  return 'Workable conditions';
}

function buildFarmTips(w: WeatherInfo): FarmTip[] {
  const condition = w.condition.toLowerCase();
  const tips: FarmTip[] = [];

  if (condition.includes('rain') || condition.includes('thunder') || condition.includes('drizzle')) {
    tips.push({ icon: 'water-outline', tone: 'blue', title: 'Hold off on spraying', detail: 'Rain expected today — pesticide and fertiliser will wash off. Check field drainage instead.' });
  } else if (w.windKmh >= 25) {
    tips.push({ icon: 'leaf-outline', tone: 'amber', title: 'Skip spraying today', detail: `Wind is ${w.windKmh} km/h — spray drift risk is high. Wait for calmer conditions.` });
  } else {
    tips.push({ icon: 'leaf-outline', tone: 'green', title: 'Safe spray window', detail: 'Best between 6–9 AM or after 4 PM, when wind and heat are lowest.' });
  }

  if (w.tempC >= 34) {
    tips.push({ icon: 'sunny-outline', tone: 'amber', title: 'Irrigate early morning', detail: `High heat (${w.tempC}°C) — water before 9 AM to reduce evaporation loss.` });
  } else {
    tips.push({ icon: 'water-outline', tone: 'blue', title: 'Normal irrigation', detail: 'Temperatures are moderate — stick to your regular watering schedule.' });
  }

  if (w.humidityPct >= 80) {
    tips.push({ icon: 'warning-outline', tone: 'red', title: 'Watch for fungal disease', detail: `Humidity is ${w.humidityPct}% — inspect leaves for blight or mildew over the next few days.` });
  }

  return tips;
}

export default function WeatherDetailScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { address, loading: locLoading, refresh } = useCurrentLocation();
  const location = (user as { location?: string })?.location || address || '';
  const { weather, loading: weatherLoading, error, refresh: refreshWeather } = useWeather(location);
  const loading = locLoading || weatherLoading;

  const onRefresh = useCallback(() => {
    refresh();
    refreshWeather();
  }, [refresh, refreshWeather]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Weather & Farm Advisory"
        onBack={() => navigation.goBack()}
        rightAction={{ icon: 'refresh', onPress: onRefresh }}
        titleColor={colors.deepGreen.n1}
        iconColor={colors.deepGreen.g2}
        buttonBackgroundColor="transparent"
      />

      {loading && !weather ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1A6B3A" />
          <Text style={styles.loadingText}>Fetching your local forecast…</Text>
        </View>
      ) : !weather ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color="#9EB8A8" />
          <Text style={styles.emptyText}>{error || "Couldn't fetch weather right now."}</Text>
          <TouchableOpacity style={styles.retry} onPress={onRefresh}><Text style={styles.retryText}>Try again</Text></TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#1A6B3A']} tintColor="#1A6B3A" />}
        >
          {/* Current conditions */}
          <View style={styles.currentCard}>
            <Text style={styles.currentEmoji}>{weather.emoji}</Text>
            <View style={styles.flex1}>
              <Text style={styles.currentTemp}>{weather.tempC}°C</Text>
              <Text style={styles.currentCond}>{weather.condition}</Text>
              <Text style={styles.currentLoc}>{weather.location}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <MetaStat icon="water-outline" label="Humidity" value={`${weather.humidityPct}%`} />
            <MetaStat icon="cloudy-outline" label="Wind" value={`${weather.windKmh} km/h`} />
          </View>

          {/* Forecast strip */}
          <Text style={styles.section}>Next few days</Text>
          <View style={styles.forecastRow}>
            {weather.forecast.map((f: ForecastDay) => (
              <View key={f.id} style={styles.forecastCell}>
                <Text style={styles.fDay}>{f.day}</Text>
                <Text style={styles.fEmoji}>{f.emoji}</Text>
                <Text style={styles.fTemp}>{f.temp}</Text>
                <Text style={styles.fTip}>{dayTip(f.emoji)}</Text>
              </View>
            ))}
          </View>

          {/* Farm tips */}
          <Text style={styles.section}>What this means for your farm</Text>
          {buildFarmTips(weather).map((tip, i) => {
            const c = TONE[tip.tone];
            return (
              <View key={i} style={styles.tipCard}>
                <View style={[styles.tipIcon, { backgroundColor: c.bg }]}>
                  <Ionicons name={tip.icon} size={20} color={c.fg} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDetail}>{tip.detail}</Text>
                </View>
              </View>
            );
          })}

          <View style={styles.advisoryBanner}>
            <Ionicons name="leaf" size={16} color="#1A6B3A" />
            <Text style={styles.advisoryText}>{weather.advisory}</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function MetaStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.metaStat}>
      <Ionicons name={icon} size={18} color="#1A6B3A" />
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8F5' },
  flex1: { flex: 1 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  loadingText: { fontSize: 14, color: '#6B8074', fontWeight: '600', textAlign: 'center' },
  emptyText: { fontSize: 16, color: '#3A5040', fontWeight: '700', textAlign: 'center' },
  retry: { backgroundColor: '#1A6B3A', paddingHorizontal: 20, paddingVertical: 11, borderRadius: 13 },
  retryText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  content: { padding: 16, paddingBottom: 40 },

  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6EFE9',
    borderRadius: 18,
    padding: 18,
  },
  currentEmoji: { fontSize: 48 },
  currentTemp: { fontSize: 32, fontWeight: '800', color: '#0D1509' },
  currentCond: { fontSize: 15, color: '#3A5040', fontWeight: '600', marginTop: 2 },
  currentLoc: { fontSize: 13, color: '#6B8074', marginTop: 2 },

  metaRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  metaStat: { flex: 1, alignItems: 'center', gap: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6EFE9', borderRadius: 14, paddingVertical: 12 },
  metaValue: { fontSize: 16, fontWeight: '800', color: '#0D1509' },
  metaLabel: { fontSize: 12, color: '#6B8074', fontWeight: '600' },

  section: { fontSize: 18, fontWeight: '800', color: '#0D1509', marginTop: 20, marginBottom: 12 },

  forecastRow: { flexDirection: 'row', gap: 8 },
  forecastCell: { flex: 1, alignItems: 'center', gap: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6EFE9', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 4 },
  fDay: { fontSize: 12, color: '#6B8074', fontWeight: '700' },
  fEmoji: { fontSize: 22, marginVertical: 2 },
  fTemp: { fontSize: 15, fontWeight: '800', color: '#0D1509' },
  fTip: { fontSize: 10, color: '#6B8074', textAlign: 'center', marginTop: 4, lineHeight: 13 },

  tipCard: { flexDirection: 'row', gap: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6EFE9', borderRadius: 16, padding: 15, marginBottom: 11 },
  tipIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  tipTitle: { fontSize: 16, fontWeight: '800', color: '#0D1509' },
  tipDetail: { fontSize: 14, color: '#3A5040', marginTop: 3, lineHeight: 20 },

  advisoryBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#E4F4EC', borderRadius: 12, padding: 12, marginTop: 6 },
  advisoryText: { flex: 1, fontSize: 13, color: '#1A6B3A', fontWeight: '600', lineHeight: 18 },
});
