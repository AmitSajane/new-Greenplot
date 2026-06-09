import React, { useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { hubStyles as s } from '../../styles/hub.styles';
import { CategoryDef, CategoryKey } from '../../constants/communityData';

interface ChipProps {
  item: CategoryDef;
  active: boolean;
  onSelect: (key: CategoryKey) => void;
}

const Chip = React.memo(({ item, active, onSelect }: ChipProps) => {
  const handlePress = useCallback(() => onSelect(item.key), [onSelect, item.key]);
  return (
    <TouchableOpacity style={[s.chip, active && s.chipOn]} activeOpacity={0.8} onPress={handlePress}>
      <Text style={[s.chipText, active && s.chipTextOn]}>
        {item.emoji ? `${item.emoji} ` : ''}
        {item.label}
      </Text>
    </TouchableOpacity>
  );
});

interface Props {
  categories: readonly CategoryDef[];
  selected: CategoryKey;
  onSelect: (key: CategoryKey) => void;
}

export const CategoryChips = React.memo(({ categories, selected, onSelect }: Props) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={s.chipsContent}
  >
    {categories.map(c => (
      <Chip key={c.key} item={c} active={c.key === selected} onSelect={onSelect} />
    ))}
  </ScrollView>
));
