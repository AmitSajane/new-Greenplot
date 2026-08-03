import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { fetchSoilData } from '../services/soilService';
import { SoilResponse } from '../types/soil';
import { buildSoilReport } from '../utils/soil/soilAdvisor';
import { reverseGeocode, forwardGeocode } from '../utils/geo/geocoding';
import { getCurrentCoords } from '../utils/geo/location';

import { Text } from '../components/atoms/Text';
import { Loader } from '../components/atoms/Loader';
import { Button } from '../components/atoms/Button';
import { MapSection } from '../components/organisms/MapSection';
import { SoilReportView } from '../components/soil/SoilReport';
import { ScreenHeader } from '../components/molecules/ScreenHeader';
import { colors } from '../theme/tokens';

// Fallback region used if location permission is denied / unavailable.
const DEFAULT_COORDS = { lat: 16.591018669999993, lon: 74.91707610999997 };

export default function SoilTestScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SoilResponse | null>(null);
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [address, setAddress] = useState('');

  const report = useMemo(() => (data ? buildSoilReport(data) : null), [data]);

  const fetchForCoords = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const soil = await fetchSoilData(lat, lon);
      setData(soil);
    } catch {
      setError('Failed to fetch soil data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Resolve the device location, label it, and load soil for that point.
  const locateMe = useCallback(async () => {
    setLocating(true);
    let point = DEFAULT_COORDS;
    try {
      point = await getCurrentCoords();
    } catch {
      point = DEFAULT_COORDS; // permission denied / no GPS → fall back
    }
    setCoords(point);
    reverseGeocode(point.lat, point.lon)
      .then(setAddress)
      .catch(() => setAddress(`${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}`));
    setLocating(false);
    await fetchForCoords(point.lat, point.lon);
  }, [fetchForCoords]);

  // Forward-geocode the typed place and load soil for it.
  const onSubmitAddress = useCallback(async () => {
    const query = address.trim();
    if (!query) return;
    setLocating(true);
    try {
      const place = await forwardGeocode(query);
      if (place) {
        setCoords({ lat: place.lat, lon: place.lon });
        setAddress(place.label);
        await fetchForCoords(place.lat, place.lon);
      } else {
        setError('Location not found. Try a nearby town or village.');
      }
    } catch {
      setError('Could not search that location. Please try again.');
    } finally {
      setLocating(false);
    }
  }, [address, fetchForCoords]);

  const handleMapPress = useCallback(
    (lat: number, lon: number) => {
      setCoords({ lat, lon });
      reverseGeocode(lat, lon)
        .then(setAddress)
        .catch(() => setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`));
      fetchForCoords(lat, lon);
    },
    [fetchForCoords],
  );

  useEffect(() => {
    locateMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Soil Test"
        subtitle="Know your soil, grow more 🌱"
        onBack={() => navigation.goBack()}
        rightAction={{ icon: 'flask' }}
        titleColor={colors.deepGreen.g2}
        subtitleColor={colors.deepGreen.n4}
        iconColor={colors.deepGreen.g2}
        rightIconColor={colors.deepGreen.g3}
        buttonBackgroundColor={colors.deepGreen.g7}
        titleSize={24}
        titleWeight="900"
      />

      {/* Location bar */}
      <View style={styles.locCard}>
        <Ionicons name="location" size={18} color="#1A6B3A" />
        <TextInput
          style={styles.locInput}
          value={address}
          onChangeText={setAddress}
          onSubmitEditing={onSubmitAddress}
          placeholder="Enter your village or city…"
          placeholderTextColor="#9EB8A8"
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.locBtn} onPress={locateMe} activeOpacity={0.85} disabled={locating}>
          {locating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="locate" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Loader message="Analyzing your soil…" />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline" size={40} color="#C8D8CC" />
            <Text color="#C02828" style={styles.errorText}>
              {error}
            </Text>
            <Button label="Try again" onPress={locateMe} style={styles.retryButton} />
          </View>
        ) : data && report ? (
          <>
            <MapSection location={coords} onGetLocation={locateMe} onMapPress={handleMapPress} />
            <View style={styles.reportGap} />
            <SoilReportView report={report} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F8F5' },
  locCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8F0EC',
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
  },
  locInput: { flex: 1, fontSize: 13, color: '#1C2E18', paddingVertical: 6 },
  locBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#1A6B3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: 16, paddingBottom: 32 },
  errorContainer: { paddingVertical: 48, alignItems: 'center', gap: 10 },
  errorText: { textAlign: 'center' },
  retryButton: { marginTop: 8 },
  reportGap: { height: 16 },
});
