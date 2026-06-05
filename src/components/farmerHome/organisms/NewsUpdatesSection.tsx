import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, radius } from '../../../theme/tokens';
import { SectionHeader } from '../SectionHeader';
import { NewsUpdateRow } from '../NewsUpdateRow';

interface NewsUpdatesSectionProps {
  news: any[];
  onNewsPress: (id: string) => void;
}

export const NewsUpdatesSection: React.FC<NewsUpdatesSectionProps> = ({ news, onNewsPress }) => {
  return (
    <View>
      <SectionHeader title="News & Updates" />
      <View style={styles.listSpacer} />
      <View style={styles.vList}>
        {news.map((n) => (
          <View key={n.id} style={styles.vListItem}>
            <NewsUpdateRow item={n} onPress={() => onNewsPress(n.id)} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listSpacer: {
    height: spacing.md,
  },
  vList: {
    gap: spacing.md,
  },
  vListItem: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});
