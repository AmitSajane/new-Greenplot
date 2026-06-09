import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { Button } from '../atoms/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { radius, spacing } from '../../theme/tokens';
import { SoilLocation } from '../../types/soil';
import { initMapbox } from '../../config/mapbox';

// Ensure the Mapbox access token is set before this map renders, even when the
// Soil Test screen is opened without first visiting the Satellite screen
// (otherwise Mapbox tile requests return 401).
initMapbox();

interface MapSectionProps {
  location: SoilLocation | null;
  onGetLocation: () => void;
  onMapPress?: (lat: number, lon: number) => void;
}

export const MapSection: React.FC<MapSectionProps> = ({ location, onGetLocation, onMapPress }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapboxGL.MapView
          style={styles.map}
          styleURL={MapboxGL.StyleURL.Satellite}
          logoEnabled={false}
          attributionEnabled={false}
          onPress={(feature) => {
            if (feature.geometry && feature.geometry.coordinates) {
              const [lon, lat] = feature.geometry.coordinates;
              onMapPress && onMapPress(lat as number, lon as number);
            }
          }}
        >
          {location && (
            <MapboxGL.Camera
              zoomLevel={14}
              centerCoordinate={[location.lon, location.lat]}
              animationMode="flyTo"
              animationDuration={1000}
            />
          )}
          {location && (
            <MapboxGL.PointAnnotation
              id="soil-location"
              coordinate={[location.lon, location.lat]}
            >
              <View style={styles.markerContainer}>
                <Ionicons name="location" size={40} color="#C62828" />
              </View>
            </MapboxGL.PointAnnotation>
          )}
        </MapboxGL.MapView>
        
        {/* Grid Overlay to match the design */}
        <View style={styles.gridOverlay} pointerEvents="none" />
        
        <View style={styles.buttonContainer}>
          <Button
            label={t('soilTest.getLocation')}
            icon={<Ionicons name="locate-outline" size={20} color="white" />}
            onPress={onGetLocation}
            style={styles.locationButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  mapContainer: {
    height: 250,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    // In a real app we might use an SVG grid pattern here
  },
  buttonContainer: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  locationButton: {
    backgroundColor: '#0F6122', // Darker green from design
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
