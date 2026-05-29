import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { spacing } from '../../../theme/tokens';
import { SectionHeader } from '../SectionHeader';
import { FeaturedListingCard } from '../FeaturedListingCard';
import { HomeFeaturedListing } from '../../../constants/farmerHomeMockData';

interface FeaturedListingsSectionProps {
  listings: HomeFeaturedListing[];
  onViewAll: () => void;
  onListingPress: (id: string) => void;
}

export const FeaturedListingsSection: React.FC<FeaturedListingsSectionProps> = ({
  listings,
  onViewAll,
  onListingPress,
}) => {
  return (
    <View>
      <SectionHeader
        title="Featured Listings"
        actionLabel="View All"
        onActionPress={onViewAll}
      />
      <View style={styles.listSpacer} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={listings}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.hListContent}
        ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
        renderItem={({ item }) => (
          <FeaturedListingCard
            item={item}
            onPress={() => onListingPress(item.id)}
          />
        )}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listSpacer: {
    height: spacing.md,
  },
  hListContent: {
    paddingRight: spacing.xl,
  },
});
