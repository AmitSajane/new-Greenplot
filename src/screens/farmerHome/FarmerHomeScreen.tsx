import React from 'react';
import { FarmerHomeContent } from './components/FarmerHomeContent';
import { useFarmerHome } from './hooks/useFarmerHome';

export default function FarmerHomeScreen() {
  const vm = useFarmerHome();
  return <FarmerHomeContent {...vm} />;
}
