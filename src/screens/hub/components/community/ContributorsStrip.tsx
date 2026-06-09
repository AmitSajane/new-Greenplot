import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s, avatarTones } from '../../styles/hub.styles';
import { Contributor } from '../../constants/communityData';
import { SectionHeader } from './SectionHeader';

const rankColor = (rank: number) => (rank === 1 ? '#E09830' : rank === 2 ? '#9EB8A8' : rank === 3 ? '#B87214' : '#6B8074');

const ContributorCard = React.memo(({ item }: { item: Contributor }) => {
  const c = avatarTones[item.tone];
  return (
    <View style={s.contrib}>
      <View style={[s.rankBadge, { backgroundColor: rankColor(item.rank) }]}>
        <Text style={s.rankText}>{item.rank}</Text>
      </View>
      <View style={[s.contribAv, { backgroundColor: c.bg }]}>
        <Text style={[s.contribAvText, { color: c.fg }]}>{item.initials}</Text>
      </View>
      <Text style={s.contribName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={s.contribBadge} numberOfLines={1}>
        {item.badge}
      </Text>
      <View style={s.contribPts}>
        <Ionicons name="trophy" size={10} color="#B87214" />
        <Text style={s.contribPtsText}>{(item.points / 1000).toFixed(1)}k</Text>
      </View>
    </View>
  );
});

interface Props {
  contributors: readonly Contributor[];
  onSeeAll: () => void;
}

/** Leaderboard — status & competition drive more posting. */
export const ContributorsStrip = React.memo(({ contributors, onSeeAll }: Props) => (
  <View style={s.section}>
    <SectionHeader icon="ribbon" title="Top contributors" link="Leaderboard ›" onLink={onSeeAll} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.contribContent}>
      {contributors.map(c => (
        <ContributorCard key={c.id} item={c} />
      ))}
    </ScrollView>
  </View>
));
