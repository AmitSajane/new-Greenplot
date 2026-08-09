import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { farmerHomeStyles as s } from '../../styles/farmerHome.styles';
import { FarmerAction, SnapStat } from '../../constants/farmerDashboardData';

interface TileProps {
  item: SnapStat;
  onAction: (action: FarmerAction) => void;
}

const SnapTile = React.memo(({ item, onAction }: TileProps) => {
  const handlePress = useCallback(() => onAction(item.action), [onAction, item.action]);
  return (
    <TouchableOpacity
      style={[s.snapTile, item.disabled && { opacity: 0.75 }]}
      activeOpacity={item.disabled ? 1 : 0.8}
      onPress={item.disabled ? undefined : handlePress}
      disabled={item.disabled}
    >
      <Text style={s.snapEmoji}>{item.emoji}</Text>
      <Text style={[s.snapValue, item.tone === 'amber' && { color: '#B87214' }]}>{item.value}</Text>
      <Text style={s.snapLabel}>{item.label}</Text>
    </TouchableOpacity>
  );
});

interface Props {
  items: readonly SnapStat[];
  onAction: (action: FarmerAction) => void;
}

function FarmSnapshotBase({ items, onAction }: Props) {
  return (
    <View style={s.snapRow}>
      {items.map(item => (
        <SnapTile key={item.id} item={item} onAction={onAction} />
      ))}
    </View>
  );
}

export const FarmSnapshot = React.memo(FarmSnapshotBase);
