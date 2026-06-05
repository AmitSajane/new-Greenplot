import React from 'react';
import { View } from 'react-native';
import { SectionHeader } from '../SectionHeader';
import { FilterChips } from '../molecules/FilterChips';

interface FindLandSectionProps {
  chips: readonly { id: string; label: any }[];
  selectedLabel: string;
  onSelect: (label: any) => void;
}

export const FindLandSection: React.FC<FindLandSectionProps> = ({ chips, selectedLabel, onSelect }) => {
  return (
    <View>
      <SectionHeader title="Find Land Near You" />
      <FilterChips chips={chips} selectedLabel={selectedLabel} onSelect={onSelect} />
    </View>
  );
};
