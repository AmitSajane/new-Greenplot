import React, { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';
import { farmerHomeStyles as s } from '../../styles/farmerHome.styles';
import { TickerItem } from '../../constants/farmerDashboardData';
import { SectionHeader } from './SectionHeader';

interface CardProps {
  item: TickerItem;
  onPress: (cropId: string) => void;
}

const TickerCard = React.memo(({ item, onPress }: CardProps) => {
  const handlePress = useCallback(() => onPress(item.cropId), [onPress, item.cropId]);
  const up = item.change >= 0;
  return (
    <TouchableOpacity style={s.tk} activeOpacity={0.85} onPress={handlePress}>
      <Text style={s.tkCrop}>
        {item.emoji} {item.name}
      </Text>
      <Text style={s.tkPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
      <Text style={[s.tkChange, { color: up ? '#1A6B3A' : '#C02828' }]}>
        {up ? '▲ +' : '▼ '}₹{Math.abs(item.change)} /{item.unit}
      </Text>
    </TouchableOpacity>
  );
});

interface Props {
  items: readonly TickerItem[];
  onPressItem: (cropId: string) => void;
  onSeeAll: () => void;
}

function MarketTickerBase({ items, onPressItem, onSeeAll }: Props) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TickerItem>) => <TickerCard item={item} onPress={onPressItem} />,
    [onPressItem],
  );
  const keyExtractor = useCallback((item: TickerItem) => item.id, []);

  return (
    <View style={s.section}>
      <SectionHeader icon="trending-up" title="Mandi prices" linkLabel="All markets ›" onLink={onSeeAll} />
      <FlatList
        horizontal
        data={items as TickerItem[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tickerContent}
        initialNumToRender={4}
        removeClippedSubviews={false}
      />
    </View>
  );
}

export const MarketTicker = React.memo(MarketTickerBase);
