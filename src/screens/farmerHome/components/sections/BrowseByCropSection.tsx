import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { farmerHomeStyles as s } from '../../styles/farmerHome.styles';
import { BrowseCrop } from '../../constants/farmerDashboardData';
import { SectionHeader } from './SectionHeader';

interface ChipProps {
  item: BrowseCrop;
  onPress: (id: string) => void;
}

const BrowseChip = React.memo(({ item, onPress }: ChipProps) => {
  const handlePress = useCallback(() => onPress(item.id), [onPress, item.id]);
  return (
    <TouchableOpacity style={s.browseChip} activeOpacity={0.8} onPress={handlePress}>
      <Text>{item.emoji}</Text>
      <Text style={s.browseLabel}>{item.label}</Text>
    </TouchableOpacity>
  );
});

interface Props {
  items: readonly BrowseCrop[];
  onPress: (id: string) => void;
}

function BrowseByCropSectionBase({ items, onPress }: Props) {
  return (
    <View style={[s.section, s.browseSection]}>
      <SectionHeader icon="leaf" title="Browse by crop" />
      <View style={s.browseWrap}>
        {items.map(item => (
          <BrowseChip key={item.id} item={item} onPress={onPress} />
        ))}
      </View>
    </View>
  );
}

export const BrowseByCropSection = React.memo(BrowseByCropSectionBase);
