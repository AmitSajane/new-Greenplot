import React, { useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { PostTypeFilterDef, PostTypeFilterKey } from '../../constants/communityData';

interface ChipProps {
  item: PostTypeFilterDef;
  active: boolean;
  onSelect: (key: PostTypeFilterKey) => void;
}

const Chip = React.memo(({ item, active, onSelect }: ChipProps) => {
  const handlePress = useCallback(() => onSelect(item.key), [onSelect, item.key]);
  return (
    <TouchableOpacity style={[s.filterChip, active && s.filterChipOn]} activeOpacity={0.8} onPress={handlePress}>
      <Text style={[s.filterChipText, active && s.filterChipTextOn]}>{item.label}</Text>
    </TouchableOpacity>
  );
});

interface Props {
  filters: readonly PostTypeFilterDef[];
  selected: PostTypeFilterKey;
  onSelect: (key: PostTypeFilterKey) => void;
  onOpenSort?: () => void;
}

/** Filter the community feed by post type (photo/video/blog/poll/voice).
 * The funnel button is a stub for a future sort + multi-select sheet. */
export const PostTypeFilterRow = React.memo(({ filters, selected, onSelect, onOpenSort }: Props) => (
  <>
    <View style={s.filterRow}>
      <TouchableOpacity style={s.filterFunnelBtn} activeOpacity={0.8} onPress={onOpenSort} hitSlop={6}>
        <Ionicons name="filter-outline" size={16} color="#1A6B3A" />
      </TouchableOpacity>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScrollContent}>
        {filters.map(f => (
          <Chip key={f.key} item={f} active={f.key === selected} onSelect={onSelect} />
        ))}
      </ScrollView>
    </View>
    <Text style={s.filterCaption}>Tap a chip to show only that post type.</Text>
  </>
));
