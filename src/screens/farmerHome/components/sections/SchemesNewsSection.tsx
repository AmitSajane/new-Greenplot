import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { farmerHomeStyles as s, tones } from '../../styles/farmerHome.styles';
import { FarmerAction, NewsItem } from '../../constants/farmerDashboardData';
import { SectionHeader } from './SectionHeader';

interface RowProps {
  item: NewsItem;
  isLast: boolean;
  onAction: (action: FarmerAction) => void;
  onOpenArticle: (url: string) => void;
}

const NewsRow = React.memo(({ item, isLast, onAction, onOpenArticle }: RowProps) => {
  // Live news items carry an external URL → open the full article;
  // mock items fall back to their in-app action.
  const handlePress = useCallback(() => {
    if (item.url) onOpenArticle(item.url);
    else onAction(item.action);
  }, [onAction, onOpenArticle, item.url, item.action]);
  const t = tones[item.tone];
  return (
    <TouchableOpacity
      style={[s.news, isLast && s.noBottomBorder]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View style={[s.newsIcon, { backgroundColor: t.bg }]}>
        <Ionicons name={item.icon} size={16} color={t.fg} />
      </View>
      <View style={s.flex1}>
        <Text style={s.newsTitle}>{item.title}</Text>
        <Text style={s.newsSub}>{item.sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9EB8A8" />
    </TouchableOpacity>
  );
});

interface Props {
  items: readonly NewsItem[];
  onAction: (action: FarmerAction) => void;
  onOpenArticle: (url: string) => void;
  onMore: () => void;
}

function SchemesNewsSectionBase({ items, onAction, onOpenArticle, onMore }: Props) {
  return (
    <View style={s.section}>
      <SectionHeader icon="newspaper" title="Schemes & news" linkLabel="More" onLink={onMore} />
      <View style={s.card}>
        {items.map((item, i) => (
          <NewsRow
            key={item.id}
            item={item}
            isLast={i === items.length - 1}
            onAction={onAction}
            onOpenArticle={onOpenArticle}
          />
        ))}
      </View>
    </View>
  );
}

export const SchemesNewsSection = React.memo(SchemesNewsSectionBase);
