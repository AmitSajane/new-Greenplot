import React from 'react';
import { OwnerHomeContent } from './components/OwnerHomeContent';
import { useOwnerHome } from './hooks/useOwnerHome';

export default function OwnerHomeScreen() {
  const vm = useOwnerHome();
  return <OwnerHomeContent {...vm} />;
}
