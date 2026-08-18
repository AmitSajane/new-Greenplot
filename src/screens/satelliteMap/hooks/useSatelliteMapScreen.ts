import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Alert } from 'react-native';
import { initMapbox } from '../../../config/mapbox';
import { useFarmListings } from '../../../context/FarmListingsContext';
import { useSatelliteMap, MOCK_TIMELAPSE_DATES } from '../../../context/SatelliteMapContext';
import { calculatePolygonAreaAcres, formatAcresGuntas, LngLat } from '../../../utils/geo';
import { calculatePolygonCentroid, estimateZoomForPolygon } from '../../../utils/geo/polygonCentroid';
import { getCurrentCoords } from '../../../utils/geo/location';
import { forwardGeocode, forwardGeocodeMultiple, GeoPlace, reverseGeocodeDetailed } from '../../../utils/geo/geocoding';
import { getNDVITileUrl } from '../../../services/satelliteMapService';
import { FarmerHomeStackParamList } from '../../../navigation/FarmerHomeStack';

// Route will be accessed inside the hook

initMapbox();

export function useSatelliteMapScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<FarmerHomeStackParamList, 'SatelliteMap'>>();
  const farmIdFromRoute = route.params?.farmId;
  // Set by the caller when this screen is being used to draw a boundary for a
  // new/edited listing (e.g. AddFarmScreen) — names the route to hand the
  // drawn plot back to. Absent when just opened to monitor an existing farm.
  const returnTo = (route.params as { returnTo?: string } | undefined)?.returnTo;
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
  // Set when an existing farm has no drawn boundary yet — tells the viewer the
  // map is centered on the land's entered village, not an exact plotted farm
  // (and, if even that can't be resolved, that it's not the farm's location at all).
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [drawMode, setDrawMode] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<LngLat[]>([]);
  const [userLocation, setUserLocation] = useState<LngLat | null>(null);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);

  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchUserLocation = useCallback(async () => {
    // Uses the shared helper (timeout + Android permission) so it never hangs.
    try {
      const { lat, lon } = await getCurrentCoords();
      if (!isMountedRef.current) return;
      const coords: LngLat = [lon, lat];
      setUserLocation(coords);
      setMapCenter(coords);
      setZoomLevel(16); // close-in on the farmer's field
    } catch {
      if (!isMountedRef.current) return;
      const fallback: LngLat = [74.91711421195988, 16.59086417203163];
      setUserLocation(fallback);
      setMapCenter(fallback);
    }
  }, [setMapCenter]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, []);

  const handleSearchSubmit = useCallback(async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const places = await forwardGeocodeMultiple(trimmed);
      if (!isMountedRef.current) return;
      setSearchResults(places);
    } catch {
      if (!isMountedRef.current) return;
      setSearchResults([]);
    } finally {
      if (isMountedRef.current) setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSelectSearchResult = useCallback(
    (place: GeoPlace) => {
      setMapCenter([place.lon, place.lat]);
      setZoomLevel(16); // street-level, ready to trace the boundary
      setSearchQuery(place.label);
      setShowSearchResults(false);
      setIsSearchBarVisible(false); // out of the way once the village is picked
    },
    [setMapCenter]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  }, []);

  const handleReopenSearch = useCallback(() => {
    setIsSearchBarVisible(true);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setLocationNotice(null);
      await loadPlotData();
      // If navigated with a farmId, load its GeoJSON and focus map
      let focusedOnPlot = false;
      const listing = farmIdFromRoute ? getListingById(farmIdFromRoute) : undefined;
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
          focusedOnPlot = true;
        }
      }
      if (!isMountedRef.current) return;

      if (!focusedOnPlot && farmIdFromRoute) {
        // Viewing an existing land with no drawn boundary — center on the
        // village/district the owner entered instead of the viewer's own GPS,
        // which has nothing to do with where this land actually is.
        const addressQuery = listing ? [listing.location, listing.district, listing.state].filter(Boolean).join(', ') : '';
        const place = addressQuery ? await forwardGeocode(addressQuery).catch(() => null) : null;
        if (!isMountedRef.current) return;
        if (place) {
          setMapCenter([place.lon, place.lat]);
          setZoomLevel(13); // village-level, not the tight "your own field" zoom
          setLocationNotice(
            `No exact boundary added yet — showing an approximate location for ${listing!.location}${listing!.district ? `, ${listing!.district}` : ''}.`,
          );
        } else {
          await fetchUserLocation();
          if (!isMountedRef.current) return;
          setLocationNotice("This land's location isn't available yet — showing your current location instead.");
        }
      } else if (!focusedOnPlot) {
        // New-farm flow (no farmId at all) → center on the farmer's current GPS.
        await fetchUserLocation();
      }
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

  const handleUndoLastPoint = useCallback(() => {
    setDrawnPoints((prev) => prev.slice(0, -1));
  }, []);

  const handleSavePlot = useCallback(async () => {
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
    if (returnTo) {
      // Reverse-geocode the field centroid so the caller can auto-fill location.
      const centroid = calculatePolygonCentroid(coordinates as any); // [lon, lat]
      let geo: { label?: string; district?: string; state?: string } = {};
      try {
        geo = await reverseGeocodeDetailed(centroid[1], centroid[0]);
      } catch {
        /* leave blank — user can fill manually */
      }
      if (!isMountedRef.current) return;
      Alert.alert(
        'Success',
        `Farm boundaries saved!\n\nApproximate area: ${formatAcresGuntas(areaAcres)}`,
        [
          {
            text: 'Use This Boundary',
            onPress: () =>
              (navigation as { navigate?: (name: string, params?: object) => void }).navigate?.(
                returnTo,
                {
                  acres: areaAcres.toFixed(2),
                  plotGeoJSON: newGeoJSON,
                  location: geo.label,
                  district: geo.district,
                  state: geo.state,
                }
              ),
          },
          { text: 'Close', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Success',
        `Farm boundaries saved successfully!\n\nApproximate area: ${formatAcresGuntas(areaAcres)}`
      );
    }
    setDrawMode(false);
    setDrawnPoints([]);
  }, [drawnPoints, navigation, setPlotGeoJSON, returnTo]);

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

  const handleDragPoint = useCallback((index: number, coordinate: LngLat) => {
    setDrawnPoints((prev) => prev.map((p, i) => (i === index ? coordinate : p)));
  }, []);

  return {
    isLoading,
    locationNotice,
    showLayerPanel,
    drawMode,
    drawnPoints,
    userLocation,
    zoomLevel,
    mapCenter,
    plotGeoJSON,
    drawnPlotGeoJSON,
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    isSearchBarVisible,
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
    onDragPoint: handleDragPoint,
    onUndoLastPoint: handleUndoLastPoint,
    onSavePlot: handleSavePlot,
    onCancelDraw: () => {
      setDrawMode(false);
      setDrawnPoints([]);
    },
    onStartDraw: () => setDrawMode(true),
    onCenterUser: fetchUserLocation,
    onSearchChange: handleSearchChange,
    onSearchSubmit: handleSearchSubmit,
    onSelectSearchResult: handleSelectSearchResult,
    onClearSearch: handleClearSearch,
    onReopenSearch: handleReopenSearch,
    onZoomIn: () => setZoomLevel((p) => Math.min(p + 1, 20)),
    onZoomOut: () => setZoomLevel((p) => Math.max(p - 1, 3)),
  };
}

export type SatelliteMapViewModel = ReturnType<typeof useSatelliteMapScreen>;
