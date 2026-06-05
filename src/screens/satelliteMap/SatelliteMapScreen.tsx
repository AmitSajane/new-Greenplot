import React from 'react';
import { SatelliteMapContent } from './components/SatelliteMapContent';
import { useSatelliteMapScreen } from './hooks/useSatelliteMapScreen';

export default function SatelliteMapScreen() {
  const vm = useSatelliteMapScreen();
  return <SatelliteMapContent {...vm} />;
}
