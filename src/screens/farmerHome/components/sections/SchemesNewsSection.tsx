import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { farmerHomeStyles as s, tones } from '../../styles/farmerHome.styles';
import { FarmerAction, NewsItem } from '../../constants/farmerDashboardData';
import { CENTRAL_SCHEMES, CREDIT_SCHEMES, DEFAULT_STATE_KEY, SchemeCategory, STATE_SCHEMES } from '../../constants/schemeCatalog';
import { SectionHeader } from './SectionHeader';

interface RowProps {
  item: NewsItem;
  isLast: boolean;
  onAction: (action: FarmerAction) => void;
  onOpenArticle: (url: string, title?: string) => void;
}

export const NewsRow = React.memo(({ item, isLast, onAction, onOpenArticle }: RowProps) => {
  // Live news items carry an external URL -> open the in-app reader;
  // mock items fall back to their in-app action.
  const handlePress = useCallback(() => {
    if (item.url) onOpenArticle(item.url, item.title);
    else onAction(item.action);
  }, [onAction, onOpenArticle, item.url, item.title, item.action]);
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

interface TileProps {
  icon: string;
  tone: 'blue' | 'green' | 'amber' | 'red';
  title: string;
  count: string;
  onPress: () => void;
}

function Tile({ icon, tone, title, count, onPress }: TileProps) {
  const t = tones[tone];
  return (
    <TouchableOpacity style={s.tile} activeOpacity={0.8} onPress={onPress}>
      <View style={[s.tileIcon, { backgroundColor: t.bg }]}>
        <Ionicons name={icon} size={16} color={t.fg} />
      </View>
      <Text style={s.tileTitle}>{title}</Text>
      <Text style={s.tileCount}>{count}</Text>
    </TouchableOpacity>
  );
}

interface Props {
  items: readonly NewsItem[];
  onAction: (action: FarmerAction) => void;
  onOpenArticle: (url: string, title?: string) => void;
  onMore: (tab: 'schemes' | 'news', category?: SchemeCategory) => void;
}

function SchemesNewsSectionBase({ items, onAction, onOpenArticle, onMore }: Props) {
  const stateCount = STATE_SCHEMES[DEFAULT_STATE_KEY].items.length;
  const teaser = items.slice(0, 2);

  return (
    <View style={s.section}>
      <SectionHeader icon="newspaper" title="Schemes & news" linkLabel="More" onLink={() => onMore('schemes')} />

      <View style={s.tileGrid}>
        <Tile
          icon="business"
          tone="blue"
          title="Central Govt. Programs"
          count={`${CENTRAL_SCHEMES.length} schemes`}
          onPress={() => onMore('schemes', 'central')}
        />
        <Tile
          icon="location"
          tone="green"
          title="State Schemes"
          count={`${STATE_SCHEMES[DEFAULT_STATE_KEY].label} · ${stateCount} scheme${stateCount === 1 ? '' : 's'}`}
          onPress={() => onMore('schemes', 'state')}
        />
        <Tile
          icon="card"
          tone="amber"
          title="Loans & Credit"
          count={`${CREDIT_SCHEMES.length} schemes`}
          onPress={() => onMore('schemes', 'credit')}
        />
        <Tile
          icon="megaphone"
          tone="red"
          title="Latest Agri News"
          count={`${items.length} update${items.length === 1 ? '' : 's'}`}
          onPress={() => onMore('news')}
        />
      </View>

      {teaser.length > 0 && (
        <View style={[s.card, s.teaserCard]}>
          {teaser.map((item, i) => {
            const t = tones[item.tone];
            return (
              <TouchableOpacity
                key={item.id}
                style={[s.teaserRow, i === teaser.length - 1 && s.noBottomBorder]}
                activeOpacity={0.8}
                onPress={() => (item.url ? onOpenArticle(item.url, item.title) : onAction(item.action))}
              >
                <View style={[s.teaserIcon, { backgroundColor: t.bg }]}>
                  <Ionicons name={item.icon} size={13} color={t.fg} />
                </View>
                <Text style={[s.teaserTitle, s.flex1]} numberOfLines={2}>{item.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export const SchemesNewsSection = React.memo(SchemesNewsSectionBase);
