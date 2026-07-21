import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { satelliteMapStyles as styles } from '../styles/satelliteMap.styles';

export interface SatelliteDrawControlsProps {
  pointCount: number;
  onUndoLastPoint: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export const SatelliteDrawControls: React.FC<SatelliteDrawControlsProps> = ({
  pointCount,
  onUndoLastPoint,
  onCancel,
  onSave,
}) => (
  <View style={styles.drawControls}>
    <Text style={styles.drawInstructions}>
      Tap on map to add points{'\n'}
      {pointCount > 0 && `${pointCount} points added`}
    </Text>
    <View style={styles.drawButtons}>
      <TouchableOpacity
        style={[styles.drawButton, styles.undoButton, pointCount === 0 && styles.drawButtonDisabled]}
        onPress={onUndoLastPoint}
        disabled={pointCount === 0}
      >
        <Text style={styles.drawButtonText}>Undo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.drawButton, styles.cancelButton]} onPress={onCancel}>
        <Text style={styles.drawButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.drawButton, styles.saveButton, pointCount < 3 && styles.drawButtonDisabled]}
        onPress={onSave}
        disabled={pointCount < 3}
      >
        <Text style={styles.drawButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  </View>
);
