import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { initMapbox } from '../../../config/mapbox';
import { useAuth } from '../../../context/AuthContext';
import { useFarmListings } from '../../../context/FarmListingsContext';
import { useSatelliteMap, MOCK_TIMELAPSE_DATES } from '../../../context/SatelliteMapContext';
import { calculatePolygonAreaAcres, LngLat } from '../../../utils/geo';
import { calculatePolygonCentroid, estimateZoomForPolygon } from '../../../utils/geo/polygonCentroid';
import { getNDVITileUrl } from '../../../services/satelliteMapService';
import { FarmerHomeStackParamList } from '../../../navigation/FarmerHomeStack';

// Route will be accessed inside the hook

initMapbox();

export function useSatelliteMapScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const route = useRoute<RouteProp<FarmerHomeStackParamList, 'SatelliteMap'>>();
  const farmIdFromRoute = route.params?.farmId;
  const userRole = (user as { role?: 'farmer' | 'owner' })?.role;
  // Access farm listings at top level (hook must be called unconditionally)
  const { getListingById } = useFarmListings();

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
    loadPlotData,
    setMapCenter,
    setPlotGeoJSON,
  } = useSatelliteMap();

  const [isLoading, setIsLoading] = useState(true);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [drawMode, setDrawMode] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<LngLat[]>([]);
  const [userLocation, setUserLocation] = useState<LngLat | null>(null);
  const [zoomLevel, setZoomLevel] = useState(14);

  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
          if (!isMountedRef.current) return;
          const { longitude, latitude } = position.coords;
          const coords: LngLat = [longitude, latitude];
          setUserLocation(coords);
          setMapCenter(coords);
        },
        () => {
          if (!isMountedRef.current) return;
          const fallback: LngLat = [74.91711421195988, 16.59086417203163];
          setUserLocation(fallback);
          setMapCenter(fallback);
        },
        { enableHighAccuracy: true }
      );
    };
    requestLocationPermission();
  }, [setMapCenter]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await loadPlotData();
      // If navigated with a farmId, load its GeoJSON and focus map
      if (farmIdFromRoute) {
        const listing = getListingById(farmIdFromRoute);
        if (listing?.plotGeoJSON) {
          setPlotGeoJSON(listing.plotGeoJSON);
          // Determine centroid and appropriate zoom
          const firstFeature = listing.plotGeoJSON.features?.[0];
          const coords = firstFeature?.geometry?.coordinates?.[0] || [];
          if (Array.isArray(coords) && coords.length > 0) {
            const centroid = calculatePolygonCentroid(coords as any);
            setMapCenter(centroid);
            const zoom = estimateZoomForPolygon(coords as any);
            setZoomLevel(zoom);
          }
        }
      }
      if (!isMountedRef.current) return;
      fetchUserLocation();
      if (!isMountedRef.current) return;
      setIsLoading(false);
    };
    initialize();
  }, [loadPlotData, fetchUserLocation, farmIdFromRoute]);

  const selectedIndexRef = React.useRef(selectedDateIndex);
  selectedIndexRef.current = selectedDateIndex;
  useEffect(() => {
    if (isPlaying && MOCK_TIMELAPSE_DATES.length > 0) {
      const interval = setInterval(() => {
        const next = (selectedIndexRef.current + 1) % MOCK_TIMELAPSE_DATES.length;
        setSelectedDateIndex(next);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, setSelectedDateIndex]);

  const selectedDate = MOCK_TIMELAPSE_DATES[selectedDateIndex];
  const ndviTileUrl = useMemo(
    () => (selectedDate ? getNDVITileUrl(selectedDate.date) : ''),
    [selectedDate]
  );

  const handleMapPress = useCallback(
    (feature: { geometry?: { coordinates?: number[] } }) => {
      const coords = feature?.geometry?.coordinates;
      if (drawMode && Array.isArray(coords) && coords.length >= 2) {
        setDrawnPoints((prev) => [...prev, [coords[0], coords[1]] as LngLat]);
      }
    },
    [drawMode]
  );

  const handleSavePlot = useCallback(() => {
    if (drawnPoints.length < 3) {
      Alert.alert('Error', 'Please draw at least 3 points to create a polygon');
      return;
    }
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
          properties: { name: 'Drawn Plot', areaAcres },
        },
      ],
    };
    setPlotGeoJSON(newGeoJSON);
    if (userRole === 'owner') {
      Alert.alert(
        'Success',
        `Farm boundaries saved!\n\nApproximate area: ${areaAcres.toFixed(2)} acres`,
        [
          {
            text: 'Create Farm',
            onPress: () =>
              (navigation as { navigate?: (name: string, params?: object) => void }).navigate?.(
                'AddFarm',
                { acres: areaAcres.toFixed(2), plotGeoJSON: newGeoJSON }
              ),
          },
          { text: 'Close', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Success',
        `Farm boundaries saved successfully!\n\nApproximate area: ${areaAcres.toFixed(2)} acres`
      );
    }
    setDrawMode(false);
    setDrawnPoints([]);
  }, [drawnPoints, navigation, setPlotGeoJSON, userRole]);

  const drawnPlotGeoJSON = useMemo(() => {
    if (drawnPoints.length < 3) return null;
    const coordinates = [...drawnPoints, drawnPoints[0]];
    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: { type: 'Polygon' as const, coordinates: [coordinates] },
          properties: {},
        },
      ],
    };
  }, [drawnPoints]);

  return {
    isLoading,
    showLayerPanel,
    drawMode,
    drawnPoints,
    userLocation,
    zoomLevel,
    mapCenter,
    plotGeoJSON,
    drawnPlotGeoJSON,
    ndviEnabled,
    soilMoistureEnabled,
    weatherEnabled,
    govtDataEnabled,
    ndviOpacity,
    ndviTileUrl,
    setNdviEnabled,
    setSoilMoistureEnabled,
    setWeatherEnabled,
    setGovtDataEnabled,
    setNdviOpacity,
    onBack: () => navigation.goBack(),
    onToggleLayerPanel: () => setShowLayerPanel((v) => !v),
    onMapPress: handleMapPress,
    onSavePlot: handleSavePlot,
    onCancelDraw: () => {
      setDrawMode(false);
      setDrawnPoints([]);
    },
    onStartDraw: () => setDrawMode(true),
    onCenterUser: fetchUserLocation,
    onZoomIn: () => setZoomLevel((p) => Math.min(p + 1, 20)),
    onZoomOut: () => setZoomLevel((p) => Math.max(p - 1, 3)),
  };
}

export type SatelliteMapViewModel = ReturnType<typeof useSatelliteMapScreen>;
