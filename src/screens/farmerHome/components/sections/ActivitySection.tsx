import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { farmerHomeStyles as s, tones } from '../../styles/farmerHome.styles';
import type { ActivityItem } from '../../../../utils/activityFeed';
import { SectionHeader } from './SectionHeader';

interface CardProps {
  item: ActivityItem;
}

// Same "colored card + white icon chip + title/sub + pill action button"
// shape as OwnerHome's "Action required" alert cards — each activity is its
// own card with a direct action button, not a passive log line.
const ActivityCard = React.memo(({ item }: CardProps) => {
  const t = tones[item.tone];
  return (
    <View style={[s.actRow, { backgroundColor: t.bg, borderColor: t.bg }]}>
      <View style={s.actIcon}>
        <Ionicons name={item.icon} size={16} color={t.fg} />
      </View>
      <View style={s.flex1}>
        <Text style={[s.actTitle, { color: t.strong }]}>{item.title}</Text>
        <Text style={[s.actSub, { color: t.fg }]}>{item.sub}</Text>
      </View>
      <TouchableOpacity style={[s.actBtn, { backgroundColor: t.fg }]} onPress={item.onPress} activeOpacity={0.85}>
        <Text style={s.actBtnText}>{item.actionLabel || 'View'}</Text>
      </TouchableOpacity>
    </View>
  );
});

interface Props {
  items: readonly ActivityItem[];
  onViewAll: () => void;
}

// "Recent activity" home section — every lease-lifecycle event this farmer
// has been party to (a request sent, land leased once signed, a closure
// requested or completed) merged with real notifications, newest first.
function ActivitySectionBase({ items, onViewAll }: Props) {
  return (
    <View style={s.section}>
      <SectionHeader icon="time" title="Recent activity" linkLabel="View all" onLink={onViewAll} />
      {items.length === 0 ? (
        <View style={[s.card, s.actEmpty]}>
          <Ionicons name="time-outline" size={20} color="#9EB8A8" />
          <Text style={s.actEmptyText}>No recent activity yet</Text>
        </View>
      ) : (
        items.map(item => <ActivityCard key={item.id} item={item} />)
      )}
    </View>
  );
}

export const ActivitySection = React.memo(ActivitySectionBase);
