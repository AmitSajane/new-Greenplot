import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LayerToggle } from '../../../components/satelliteMap';
import { satelliteMapStyles as styles } from '../styles/satelliteMap.styles';

export interface SatelliteLayerPanelProps {
  ndviEnabled: boolean;
  soilMoistureEnabled: boolean;
  weatherEnabled: boolean;
  govtDataEnabled: boolean;
  ndviOpacity: number;
  onNdviToggle: (v: boolean) => void;
  onSoilMoistureToggle: (v: boolean) => void;
  onWeatherToggle: (v: boolean) => void;
  onGovtDataToggle: (v: boolean) => void;
  onNdviOpacityChange: (v: number) => void;
}

export const SatelliteLayerPanel: React.FC<SatelliteLayerPanelProps> = ({
  ndviEnabled,
  soilMoistureEnabled,
  weatherEnabled,
  govtDataEnabled,
  ndviOpacity,
  onNdviToggle,
  onSoilMoistureToggle,
  onWeatherToggle,
  onGovtDataToggle,
  onNdviOpacityChange,
}) => (
  <View style={styles.layerPanel}>
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.panelTitle}>Layers</Text>
      <LayerToggle
        label="NDVI"
        icon="leaf"
        enabled={ndviEnabled}
        onToggle={onNdviToggle}
        showOpacityControl={ndviEnabled}
        opacity={ndviOpacity}
        onOpacityChange={onNdviOpacityChange}
      />
      <LayerToggle
        label="Soil Moisture"
        icon="water"
        enabled={soilMoistureEnabled}
        onToggle={onSoilMoistureToggle}
      />
      <LayerToggle
        label="Weather"
        icon="cloud"
        enabled={weatherEnabled}
        onToggle={onWeatherToggle}
      />
      <LayerToggle
        label="ISRO Bhuvan"
        icon="map"
        enabled={govtDataEnabled}
        onToggle={onGovtDataToggle}
      />
    </ScrollView>
  </View>
);
