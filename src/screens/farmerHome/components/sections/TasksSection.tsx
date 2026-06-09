import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { farmerHomeStyles as s, tones } from '../../styles/farmerHome.styles';
import { FarmerAction, TaskItem } from '../../constants/farmerDashboardData';
import { SectionHeader } from './SectionHeader';

interface RowProps {
  item: TaskItem;
  onAction: (action: FarmerAction) => void;
}

const TaskRow = React.memo(({ item, onAction }: RowProps) => {
  const handlePress = useCallback(() => onAction(item.action), [onAction, item.action]);
  const t = tones[item.tone];
  return (
    <View style={[s.task, { backgroundColor: t.bg, borderColor: t.bg }]}>
      <View style={s.taskIcon}>
        <Ionicons name={item.icon} size={16} color={t.fg} />
      </View>
      <View style={s.flex1}>
        <Text style={[s.taskTitle, { color: t.strong }]}>{item.title}</Text>
        <Text style={[s.taskSub, { color: t.fg }]}>{item.sub}</Text>
      </View>
      <TouchableOpacity style={[s.taskBtn, { backgroundColor: t.fg }]} activeOpacity={0.85} onPress={handlePress}>
        <Text style={s.taskBtnText}>{item.actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
});

interface Props {
  items: readonly TaskItem[];
  onAction: (action: FarmerAction) => void;
  onViewAll: () => void;
}

function TasksSectionBase({ items, onAction, onViewAll }: Props) {
  return (
    <View style={s.section}>
      <SectionHeader icon="checkmark-done" title="Today's tasks" linkLabel="View all" onLink={onViewAll} />
      {items.map(item => (
        <TaskRow key={item.id} item={item} onAction={onAction} />
      ))}
    </View>
  );
}

export const TasksSection = React.memo(TasksSectionBase);
