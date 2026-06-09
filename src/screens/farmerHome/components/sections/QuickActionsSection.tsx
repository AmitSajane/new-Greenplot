import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { farmerHomeStyles as s, tones } from '../../styles/farmerHome.styles';
import { FarmerAction, QuickAction } from '../../constants/farmerDashboardData';
import { SectionHeader } from './SectionHeader';

interface ItemProps {
  item: QuickAction;
  onAction: (action: FarmerAction) => void;
}

const QuickActionItem = React.memo(({ item, onAction }: ItemProps) => {
  const handlePress = useCallback(() => onAction(item.action), [onAction, item.action]);
  const t = tones[item.tone];
  return (
    <TouchableOpacity style={s.qaItem} activeOpacity={0.8} onPress={handlePress}>
      <View style={[s.qaIcon, { backgroundColor: t.bg }]}>
        <Ionicons name={item.icon} size={21} color={t.fg} />
      </View>
      <Text style={s.qaLabel}>{item.label}</Text>
    </TouchableOpacity>
  );
});

interface Props {
  items: readonly QuickAction[];
  onAction: (action: FarmerAction) => void;
}

function QuickActionsSectionBase({ items, onAction }: Props) {
  return (
    <View style={s.section}>
      <SectionHeader icon="flash" title="Quick actions" />
      <View style={s.qaGrid}>
        {items.map(item => (
          <QuickActionItem key={item.id} item={item} onAction={onAction} />
        ))}
      </View>
    </View>
  );
}

export const QuickActionsSection = React.memo(QuickActionsSectionBase);
