import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/tokens';
import { satelliteMapStyles as styles } from '../styles/satelliteMap.styles';

export interface SatelliteMapHeaderProps {
  showLayerPanel: boolean;
  onBack: () => void;
  onToggleLayerPanel: () => void;
}

export const SatelliteMapHeader: React.FC<SatelliteMapHeaderProps> = ({
  showLayerPanel,
  onBack,
  onToggleLayerPanel,
}) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.headerButton} onPress={onBack}>
      <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Satellite Monitoring</Text>
    <TouchableOpacity style={styles.headerButton} onPress={onToggleLayerPanel}>
      <Ionicons
        name={showLayerPanel ? 'layers' : 'layers-outline'}
        size={24}
        color={colors.primary}
      />
    </TouchableOpacity>
  </View>
);
