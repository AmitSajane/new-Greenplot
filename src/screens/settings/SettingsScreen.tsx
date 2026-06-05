import React from 'react';
import { SettingsContent } from './components/SettingsContent';
import { useSettings } from './hooks/useSettings';

export default function SettingsScreen() {
  const vm = useSettings();
  return <SettingsContent {...vm} />;
}
