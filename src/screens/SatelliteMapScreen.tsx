import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Mapbox from '@rnmapbox/maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../theme/tokens';
import { useSatelliteMap, MOCK_TIMELAPSE_DATES } from '../context/SatelliteMapContext';
import { useAuth } from '../context/AuthContext';
import {
  LayerToggle,
  TimelapseSlider,
  HealthLegend,
  MapLegendCard,
  MapFloatingButton,
} from '../components/satelliteMap';
import { getNDVITileUrl, getBhuvanVegetationUrl } from '../services/satelliteMapService';

// Set Mapbox access token
// TODO: Replace with your Mapbox access token from https://account.mapbox.com/access-tokens/
// For production, use environment variables or secure storage
// See MAPBOX_SETUP.md for instructions
Mapbox.setAccessToken(
  // process.env.MAPBOX_ACCESS_TOKEN || 
  '' // Replace with your token
);

// Approximate polygon area on Earth (in acres) from [lng, lat] coordinates
// Uses a local projection to meters and the shoelace formula.
const calculatePolygonAreaAcres = (coords: Array<[number, number]>): number => {
  if (!coords || coords.length < 3) {
    return 0;
  }

  // Ensure polygon is closed
  const points =
    coords[0][0] === coords[coords.length - 1][0] &&
    coords[0][1] === coords[coords.length - 1][1]
      ? coords
      : [...coords, coords[0]];

  const R = 6371000; // Earth radius in meters

  // Use first point as origin for a simple local projection
  const [lng0, lat0] = points[0];
  const lambda0 = (lng0 * Math.PI) / 180;
  const phi0 = (lat0 * Math.PI) / 180;
  const cosPhi0 = Math.cos(phi0);

  const projected = points.map(([lng, lat]) => {
    const lambda = (lng * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;

    const x = R * (lambda - lambda0) * cosPhi0;
    const y = R * (phi - phi0);

    return { x, y };
  });

  // Shoelace formula for polygon area in projected (meter) coordinates
  let areaMeters2 = 0;
  for (let i = 0; i < projected.length - 1; i++) {
    const p1 = projected[i];
    const p2 = projected[i + 1];
    areaMeters2 += p1.x * p2.y - p2.x * p1.y;
  }
  areaMeters2 = Math.abs(areaMeters2) / 2;

  const ACRES_PER_SQ_METER = 1 / 4046.8564224;
  return areaMeters2 * ACRES_PER_SQ_METER;
};

export default function SatelliteMapScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const userRole = (user as any)?.role as 'farmer' | 'owner' | undefined;
  const {
    ndviEnabled,
    soilMoistureEnabled,
    weatherEnabled,
    govtDataEnabled,
    ndviOpacity,
    selectedDateIndex,
    isPlaying,
    plotGeoJSON,
    mapCenter,
    setNdviEnabled,
    setSoilMoistureEnabled,
    setWeatherEnabled,
    setGovtDataEnabled,
    setNdviOpacity,
    setSelectedDateIndex,
    setIsPlaying,
    loadPlotData,
    setMapCenter,
    setPlotGeoJSON,
  } = useSatelliteMap();

  const [isLoading, setIsLoading] = useState(true);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [diseaseHeatmapEnabled, setDiseaseHeatmapEnabled] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<Array<[number, number]>>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [zoomLevel, setZoomLevel] = useState(14);

  const fetchUserLocation = useCallback(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Location Required',
            'Please enable location access to show your position on the map.'
          );
          return;
        }
      }
      Geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          const coords: [number, number] = [longitude, latitude];
          setUserLocation(coords);
          setMapCenter(coords);
        },
        () => {
          const fallback: [number, number] = [74.91711421195988, 16.59086417203163];
          setUserLocation(fallback);
          setMapCenter(fallback);
        },
        { enableHighAccuracy: true }
      );
    };
    requestLocationPermission();
  }, [setMapCenter]);

  // Load plot data and fetch user location on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await loadPlotData();
      fetchUserLocation();
      setIsLoading(false);
    };
    initialize();
  }, [loadPlotData, fetchUserLocation]);

  // Timelapse animation effect
  const selectedIndexRef = React.useRef(selectedDateIndex);
  selectedIndexRef.current = selectedDateIndex;
  useEffect(() => {
    if (isPlaying && MOCK_TIMELAPSE_DATES.length > 0) {
      const interval = setInterval(() => {
        const next = (selectedIndexRef.current + 1) % MOCK_TIMELAPSE_DATES.length;
        setSelectedDateIndex(next);
      }, 2000); // Change date every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isPlaying, setSelectedDateIndex]);

  const selectedDate = MOCK_TIMELAPSE_DATES[selectedDateIndex];
  const ndviTileUrl = useMemo(
    () => (selectedDate ? getNDVITileUrl(selectedDate.date) : ''),
    [selectedDate]
  );

  const handleMapPress = useCallback(
    (feature: any) => {
      const coords = feature?.geometry?.coordinates;
      if (drawMode && Array.isArray(coords) && coords.length >= 2) {
        const [longitude, latitude] = coords;
        setDrawnPoints((prev) => [...prev, [longitude, latitude]]);
      }
    },
    [drawMode]
  );

  const handleSavePlot = useCallback(async () => {
    if (drawnPoints.length < 3) {
      Alert.alert('Error', 'Please draw at least 3 points to create a polygon');
      return;
    }

    // Close polygon by adding first point at the end
    const coordinates = [...drawnPoints, drawnPoints[0]];

    const areaAcres = calculatePolygonAreaAcres(coordinates);

    const newGeoJSON = {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [coordinates],
          },
          properties: {
            name: 'Drawn Plot',
            // Store area metadata for later use if needed
            areaAcres,
          },
        },
      ],
    };

    // Persist plot to context (in production, call API)
    setPlotGeoJSON(newGeoJSON);

    if (userRole === 'owner') {
      Alert.alert(
        'Success',
        `Farm boundaries saved!\n\nApproximate area: ${areaAcres.toFixed(2)} acres`,
        [
          {
            text: 'Create Farm',
            onPress: () =>
              (navigation as any).navigate?.('AddFarm', {
                acres: areaAcres.toFixed(2),
                plotGeoJSON: newGeoJSON,
              }),
          },
          {
            text: 'Close',
            style: 'cancel',
          },
        ]
      );
    } else {
      Alert.alert(
        'Success',
        `Farm boundaries saved successfully!\n\nApproximate area: ${areaAcres.toFixed(
          2
        )} acres`
      );
    }

    setDrawMode(false);
    setDrawnPoints([]);
  }, [drawnPoints, navigation, setPlotGeoJSON, userRole]);

  const handleCancelDraw = useCallback(() => {
    setDrawMode(false);
    setDrawnPoints([]);
  }, []);

  const centerOnUserLocation = useCallback(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 1, 20));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 1, 3));
  }, []);

  // Create GeoJSON for drawn plot
  const drawnPlotGeoJSON = useMemo(() => {
    if (drawnPoints.length < 3) return null;

    const coordinates = [...drawnPoints, drawnPoints[0]];

    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [coordinates],
          },
          properties: {},
        },
      ],
    };
  }, [drawnPoints]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Satellite Monitoring</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowLayerPanel(!showLayerPanel)}
        >
          <Ionicons
            name={showLayerPanel ? 'layers' : 'layers-outline'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        ) : (
          <Mapbox.MapView
            style={styles.map}
            styleURL={Mapbox.StyleURL.Satellite}
            zoomEnabled={true}
            scrollEnabled={true}
            pitchEnabled={true}
            rotateEnabled={true}
            onPress={handleMapPress}
            
          >
            <Mapbox.Camera
              centerCoordinate={mapCenter}
              zoomLevel={zoomLevel}
              animationMode="flyTo"
              animationDuration={2000}
            />

            {/* Custom marker for user's current location */}
            {userLocation && (
              <Mapbox.PointAnnotation
                id="userLocationMarker"
                coordinate={userLocation}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={styles.userMarkerInner}>
                  <Ionicons name="location" size={24} color="#fff" />
                </View>
              </Mapbox.PointAnnotation>
            )}

            {/* Plot Boundary */}
            {plotGeoJSON && (
              <Mapbox.ShapeSource id="plotSource" shape={plotGeoJSON as any}>
                <Mapbox.FillLayer
                  id="plotFill"
                  style={{
                    fillColor: colors.primary,
                    fillOpacity: 0.3,
                    fillOutlineColor: colors.primary,
                  }}
                />
                <Mapbox.LineLayer
                  id="plotLine"
                  style={{
                    lineColor: colors.primary,
                    lineWidth: 2,
                  }}
                />
              </Mapbox.ShapeSource>
            )}

            {/* Drawn Plot (in draw mode) */}
            {drawnPlotGeoJSON && (
              <Mapbox.ShapeSource id="drawnPlotSource" shape={drawnPlotGeoJSON}>
                <Mapbox.FillLayer
                  id="drawnPlotFill"
                  style={{
                    fillColor: colors.warning,
                    fillOpacity: 0.2,
                    fillOutlineColor: colors.warning,
                  }}
                />
                <Mapbox.LineLayer
                  id="drawnPlotLine"
                  style={{
                    lineColor: colors.warning,
                    lineWidth: 2,
                    lineDasharray: [2, 2],
                  }}
                />
              </Mapbox.ShapeSource>
            )}

            {/* NDVI Layer */}
            {ndviEnabled && ndviTileUrl && (
              <Mapbox.RasterSource id="ndviSource" url={ndviTileUrl}>
                <Mapbox.RasterLayer
                  id="ndviLayer"
                  style={{
                    rasterOpacity: ndviOpacity,
                  }}
                />
              </Mapbox.RasterSource>
            )}

            {/* ISRO Bhuvan Vegetation Layer */}
            {govtDataEnabled && (
              <Mapbox.RasterSource id="bhuvanSource" url={getBhuvanVegetationUrl()}>
                <Mapbox.RasterLayer
                  id="bhuvanLayer"
                  style={{
                    rasterOpacity: 0.6,
                  }}
                />
              </Mapbox.RasterSource>
            )}
          </Mapbox.MapView>
        )}

        {/* Layer Control Panel */}
        {showLayerPanel && (
          <View style={styles.layerPanel}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.panelTitle}>Layers</Text>
              
              <LayerToggle
                label="NDVI"
                icon="leaf"
                enabled={ndviEnabled}
                onToggle={setNdviEnabled}
                showOpacityControl={ndviEnabled}
                opacity={ndviOpacity}
                onOpacityChange={setNdviOpacity}
              />
              
              <LayerToggle
                label="Soil Moisture"
                icon="water"
                enabled={soilMoistureEnabled}
                onToggle={setSoilMoistureEnabled}
              />
              
              <LayerToggle
                label="Weather"
                icon="cloud"
                enabled={weatherEnabled}
                onToggle={setWeatherEnabled}
              />
              
              <LayerToggle
                label="ISRO Bhuvan"
                icon="map"
                enabled={govtDataEnabled}
                onToggle={setGovtDataEnabled}
              />
            </ScrollView>
          </View>
        )}

        {/* Health Legend */}
        {showLegend && (
          <View style={styles.legendContainer}>
            {/* <MapLegendCard
              showDiseaseLayer={diseaseHeatmapEnabled}
              onDiseaseLayerPress={() => setDiseaseHeatmapEnabled((v) => !v)}
            /> */}
          </View>
        )}

        {/* My Location FAB */}
        <MapFloatingButton
          icon="locate"
          onPress={centerOnUserLocation}
          position="bottom-right"
          variant="secondary"
        />

        {/* Zoom Controls */}
        <MapFloatingButton
          icon="add"
          onPress={handleZoomIn}
          position="bottom-left"
          variant="primary"
        />
        <MapFloatingButton
          icon="remove"
          onPress={handleZoomOut}
          position="bottom-left"
          variant="primary"
          style={{ bottom: 76 }}
        />

        {/* Draw Farm Polygon FAB */}
        {!drawMode && (
          <MapFloatingButton
            icon="create-outline"
            onPress={() => setDrawMode(true)}
            position="bottom-right"
            variant="primary"
            style={{ bottom: 70 }}
          />
        )}

        {/* Draw Mode Controls */}
        {drawMode && (
          <View style={styles.drawControls}>
            <Text style={styles.drawInstructions}>
              Tap on map to add points{'\n'}
              {drawnPoints.length > 0 && `${drawnPoints.length} points added`}
            </Text>
            <View style={styles.drawButtons}>
              <TouchableOpacity
                style={[styles.drawButton, styles.cancelButton]}
                onPress={handleCancelDraw}
              >
                <Text style={styles.drawButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.drawButton, styles.saveButton]}
                onPress={handleSavePlot}
                disabled={drawnPoints.length < 3}
              >
                <Text style={styles.drawButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Timelapse Slider */}
      <View style={styles.timelapseContainer}>
        {/* <TimelapseSlider
          dates={MOCK_TIMELAPSE_DATES}
          selectedIndex={selectedDateIndex}
          onDateChange={setSelectedDateIndex}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        /> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  userMarkerInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 6,
  },
  layerPanel: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 200,
    maxHeight: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 120,
    left: spacing.md,
  },
  drawControls: {
    position: 'absolute',
    bottom: 120,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  drawInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  drawButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  drawButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  drawButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timelapseContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
