import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { spacing } from '../../../theme/tokens';
import { SectionHeader } from '../SectionHeader';
import { ActivityCard } from '../ActivityCard';

interface ActivitySectionProps {
  activities: any[];
  onViewAll: () => void;
  onActivityPress: (id: string) => void;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({ activities, onViewAll, onActivityPress }) => {
  return (
    <View>
      <SectionHeader title="Your Activity" actionLabel="View All" onActionPress={onViewAll} />
      <View style={styles.listSpacer} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={activities}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.hListContent}
        ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
        renderItem={({ item }) => <ActivityCard item={item} onPress={() => onActivityPress(item.id)} />}
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
