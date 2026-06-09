import React from 'react';
import { CommunityHubContent } from './components/HubContent.community';
import { useCommunityHub } from './hooks/useCommunityHub';

export default function HubScreen() {
  const vm = useCommunityHub();
  return <CommunityHubContent {...vm} />;
}
