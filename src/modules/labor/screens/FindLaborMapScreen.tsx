import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Mapbox from '@rnmapbox/maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing } from '../../../theme/tokens';
import { fetchNearbyLaborers } from '../redux';
import { LaborRootState } from '../redux/store';
import { Labor } from '../types';
import { LaborConnectStackParamList } from '../navigation/LaborConnectStack';

Mapbox.setAccessToken(
  'pk.eyJ1IjoiYW1pdHNhamFuZSIsImEiOiJjbW9uMGJ3bTEwNDNmMnFzNjg4aDN4MmZzIn0.XFX729F8EQDVEGrO8lY3WQ'
);

const MAP_CENTER: [number, number] = [74.9171, 16.5909];

type FindLaborMapRoute = RouteProp<
  LaborConnectStackParamList,
  'FindLaborMap'
>;

export default function FindLaborMapScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<FindLaborMapRoute>();
  const focusJobId = route.params?.focusJobId;
  const dispatch = useDispatch();
  const { nearbyLaborers } = useSelector((s: LaborRootState) => s.labor);

  useEffect(() => {
    dispatch(
      fetchNearbyLaborers({
        lat: 16.5909,
        lng: 74.9171,
        radiusKm: 25,
      }) as any
    );
  }, [dispatch]);

  const handleMarkerPress = (labor: Labor) => {
    navigation.navigate('LaborDetails', { labor });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Find Labor</Text>
        <Text style={styles.subtitle}>{nearbyLaborers.length} workers nearby</Text>
      </View>
      <View style={styles.mapContainer}>
        <Mapbox.MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          zoomEnabled
          scrollEnabled
          pitchEnabled
          rotateEnabled
        >
          <Mapbox.Camera
            centerCoordinate={MAP_CENTER}
            zoomLevel={12}
            animationMode="flyTo"
            animationDuration={1000}
          />
          {nearbyLaborers.map((labor) => (
            <Mapbox.PointAnnotation
              key={labor.laborId}
              id={labor.laborId}
              coordinate={[labor.location.longitude, labor.location.latitude]}
              anchor={{ x: 0.5, y: 1 }}
              onSelected={() => handleMarkerPress(labor)}
            >
              <View style={styles.marker}>
                <View style={styles.markerInner}>
                  <Ionicons name="person" size={18} color="#fff" />
                </View>
              </View>
            </Mapbox.PointAnnotation>
          ))}
        </Mapbox.MapView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { padding: spacing.xs, marginRight: spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  subtitle: {
    marginLeft: 'auto',
    fontSize: 13,
    color: colors.textSecondary,
  },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  marker: { alignItems: 'center', justifyContent: 'center' },
  markerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
