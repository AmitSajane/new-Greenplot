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
import { FarmerListingCard } from '../../hooks/useFarmerHome';
import { SectionHeader } from './SectionHeader';

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
        {!item.imageUri && (
          <View style={s.listingImgPlaceholder}>
            <Ionicons name="image-outline" size={22} color="#8FA894" />
          </View>
        )}
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
  onListingPress: (id: string) => void;
  onViewAll: () => void;
}

function FindLandSectionBase({ listings, onListingPress, onViewAll }: Props) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FarmerListingCard>) => <ListingCard item={item} onPress={onListingPress} />,
    [onListingPress],
  );
  const keyExtractor = useCallback((item: FarmerListingCard) => item.id, []);

  return (
    <View style={s.section}>
      <SectionHeader icon="map" title="Find land to lease" linkLabel="View all" onLink={onViewAll} />
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
