import React from 'react';
import { colors } from '../../../theme/tokens';
import { ScreenHeader } from '../../../components/molecules/ScreenHeader';

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
  <ScreenHeader
    title="Satellite Monitoring"
    onBack={onBack}
    rightAction={{ icon: showLayerPanel ? 'layers' : 'layers-outline', onPress: onToggleLayerPanel }}
    buttonBackgroundColor="transparent"
    rightIconColor={colors.primary}
    titleWeight="700"
  />
);
