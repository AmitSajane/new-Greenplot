import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/tokens';
import { getBhuvanVegetationUrl } from '../../../services/satelliteMapService';
import { LngLat } from '../../../utils/geo';
import { satelliteMapStyles as styles } from '../styles/satelliteMap.styles';

export interface SatelliteMapCanvasProps {
  isLoading: boolean;
  mapCenter: LngLat;
  zoomLevel: number;
  userLocation: LngLat | null;
  plotGeoJSON: object | null;
  drawnPlotGeoJSON: object | null;
  drawnPoints: LngLat[];
  ndviEnabled: boolean;
  ndviTileUrl: string;
  ndviOpacity: number;
  govtDataEnabled: boolean;
  onMapPress: (feature: object) => void;
  onDragPoint: (index: number, coordinate: LngLat) => void;
}

export const SatelliteMapCanvas: React.FC<SatelliteMapCanvasProps> = ({
  isLoading,
  mapCenter,
  zoomLevel,
  userLocation,
  plotGeoJSON,
  drawnPlotGeoJSON,
  drawnPoints,
  ndviEnabled,
  ndviTileUrl,
  ndviOpacity,
  govtDataEnabled,
  onMapPress,
  onDragPoint,
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <Mapbox.MapView
      style={styles.map}
      styleURL={Mapbox.StyleURL.Satellite}
      zoomEnabled
      scrollEnabled
      pitchEnabled
      rotateEnabled
      onPress={onMapPress}
    >
      <Mapbox.Camera
        centerCoordinate={mapCenter}
        zoomLevel={zoomLevel}
        animationMode="flyTo"
        animationDuration={2000}
      />
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
            {plotGeoJSON && (
            <Mapbox.ShapeSource id="plotSource" shape={plotGeoJSON as object}>
              {/* Highlight owner field with a vivid color */}
              <Mapbox.FillLayer
                id="plotFill"
                style={{
                  fillColor: colors.success, // bright green for emphasis
                  fillOpacity: 0.35,
                  fillOutlineColor: colors.success,
                }}
              />
              <Mapbox.LineLayer
                id="plotLine"
                style={{
                  lineColor: colors.success,
                  lineWidth: 3,
                }}
              />
            </Mapbox.ShapeSource>
          )}
      {drawnPlotGeoJSON && (
        <Mapbox.ShapeSource id="drawnPlotSource" shape={drawnPlotGeoJSON as object}>
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
            style={{ lineColor: colors.warning, lineWidth: 2, lineDasharray: [2, 2] }}
          />
        </Mapbox.ShapeSource>
      )}
      {drawnPoints.map((point, index) => (
        <Mapbox.PointAnnotation
          key={`drawPoint-${index}`}
          id={`drawPoint-${index}`}
          coordinate={point}
          draggable
          onDragEnd={(e) => {
            const [lon, lat] = e.geometry.coordinates;
            onDragPoint(index, [lon, lat]);
          }}
        >
          <View style={styles.drawPointMarker} />
        </Mapbox.PointAnnotation>
      ))}
      {ndviEnabled && ndviTileUrl && (
        <Mapbox.RasterSource id="ndviSource" url={ndviTileUrl}>
          <Mapbox.RasterLayer id="ndviLayer" style={{ rasterOpacity: ndviOpacity }} />
        </Mapbox.RasterSource>
      )}
      {govtDataEnabled && (
        <Mapbox.RasterSource id="bhuvanSource" url={getBhuvanVegetationUrl()}>
          <Mapbox.RasterLayer id="bhuvanLayer" style={{ rasterOpacity: 0.6 }} />
        </Mapbox.RasterSource>
      )}
    </Mapbox.MapView>
  );
};
