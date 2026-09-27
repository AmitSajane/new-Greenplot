import React, { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, View } from 'react-native';
import { farmerHomeStyles as s } from '../../styles/farmerHome.styles';
import type { FarmListing } from '../../../../context/FarmListingsContext';
import { AvailableFarmCard } from './AvailableFarmCard';
import { SectionHeader } from './SectionHeader';

interface Props {
  farms: FarmListing[];
  onFarmPress: (id: string) => void;
  onViewAll: () => void;
}

function FarmsAvailableSectionBase({ farms, onFarmPress, onViewAll }: Props) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FarmListing>) => <AvailableFarmCard farm={item} onPress={onFarmPress} compact />,
    [onFarmPress],
  );
  const keyExtractor = useCallback((item: FarmListing) => item.id, []);

  // Nothing approved yet — no header with an empty row underneath it.
  if (farms.length === 0) return null;

  return (
    <View style={s.section}>
      <SectionHeader icon="shield-checkmark" title="Farms Available for Management" linkLabel="View all" onLink={onViewAll} />
      <FlatList
        horizontal
        data={farms}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.listingContent}
        initialNumToRender={3}
        removeClippedSubviews={false}
      />
    </View>
  );
}

export const FarmsAvailableSection = React.memo(FarmsAvailableSectionBase);
