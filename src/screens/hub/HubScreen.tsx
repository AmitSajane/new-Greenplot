import React from 'react';
import { HubContent } from './components/HubContent';
import { useHub } from './hooks/useHub';

export default function HubScreen() {
  const vm = useHub();
  return <HubContent {...vm} />;
}
