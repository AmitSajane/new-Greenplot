import React, { useCallback } from 'react';
import {
  FlatList,
  ImageBackground,
  ListRenderItemInfo,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { farmerHomeStyles as s } from '../../styles/farmerHome.styles';
import { NearbyChip } from '../../constants/farmerDashboardData';
import { FarmerListingCard } from '../../hooks/useFarmerHome';
import { SectionHeader } from './SectionHeader';

interface ChipProps {
  label: NearbyChip;
  active: boolean;
  onSelect: (chip: NearbyChip) => void;
}

const NearbyChipButton = React.memo(({ label, active, onSelect }: ChipProps) => {
  const handlePress = useCallback(() => onSelect(label), [onSelect, label]);
  return (
    <TouchableOpacity style={[s.fchip, active && s.fchipActive]} activeOpacity={0.8} onPress={handlePress}>
      <Text style={[s.fchipText, active && s.fchipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
});

interface CardProps {
  item: FarmerListingCard;
  onPress: (id: string) => void;
}

const ListingCard = React.memo(({ item, onPress }: CardProps) => {
  const handlePress = useCallback(() => onPress(item.id), [onPress, item.id]);
  return (
    <TouchableOpacity style={s.listing} activeOpacity={0.9} onPress={handlePress}>
      <ImageBackground
        source={item.imageUri ? { uri: item.imageUri } : undefined}
        style={s.listingImg}
        resizeMode="cover"
      >
        {!!item.leaseType && <Text style={s.listingType}>{item.leaseType}</Text>}
        <Text style={s.listingPrice}>{item.priceLabel}</Text>
      </ImageBackground>
      <View style={s.listingBody}>
        <Text style={s.listingTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={s.listingMeta}>
          <Ionicons name="location" size={11} color="#6B8074" />
          <Text style={s.listingMetaText} numberOfLines={1}>
            {item.acresLabel} · {item.locationLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

interface Props {
  listings: FarmerListingCard[];
  chips: readonly NearbyChip[];
  selected: NearbyChip;
  onSelectChip: (chip: NearbyChip) => void;
  onListingPress: (id: string) => void;
  onSearch: () => void;
  onViewAll: () => void;
}

function FindLandSectionBase({ listings, chips, selected, onSelectChip, onListingPress, onSearch, onViewAll }: Props) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FarmerListingCard>) => <ListingCard item={item} onPress={onListingPress} />,
    [onListingPress],
  );
  const keyExtractor = useCallback((item: FarmerListingCard) => item.id, []);

  return (
    <View style={s.section}>
      <SectionHeader icon="map" title="Find land to lease" linkLabel="View all" onLink={onViewAll} />
      <TouchableOpacity style={s.search} activeOpacity={0.8} onPress={onSearch}>
        <Ionicons name="search" size={16} color="#9EB8A8" />
        <Text style={s.searchText}>Search land by village, crop, price…</Text>
      </TouchableOpacity>
      <View style={s.fchips}>
        {chips.map(chip => (
          <NearbyChipButton key={chip} label={chip} active={chip === selected} onSelect={onSelectChip} />
        ))}
      </View>
      <FlatList
        horizontal
        data={listings}
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

export const FindLandSection = React.memo(FindLandSectionBase);
