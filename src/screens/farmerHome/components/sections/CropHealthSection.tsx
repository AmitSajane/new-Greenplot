import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { farmerHomeStyles as s, tones } from '../../styles/farmerHome.styles';
import { CropHealth } from '../../constants/farmerDashboardData';
import { SectionHeader } from './SectionHeader';

interface RowProps {
  item: CropHealth;
  isLast: boolean;
  onPress: () => void;
}

const CropRow = React.memo(({ item, isLast, onPress }: RowProps) => {
  const status = tones[item.statusTone];
  const health = tones[item.healthTone];
  return (
    <TouchableOpacity
      style={[s.crop, isLast && s.noBottomBorder]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[s.cropImg, { backgroundColor: status.bg }]}>
        <Text style={s.cropEmoji}>{item.emoji}</Text>
      </View>
      <View style={s.flex1}>
        <View style={s.cropNameRow}>
          <Text style={s.cropName}>{item.name}</Text>
          <View style={[s.cropTag, { backgroundColor: status.bg }]}>
            <Text style={[s.cropTagText, { color: status.fg }]}>{item.statusLabel}</Text>
          </View>
        </View>
        <Text style={s.cropStage}>{item.stage}</Text>
        <View style={s.hbar}>
          <View style={[s.hfill, { width: `${item.healthPct}%`, backgroundColor: health.fg }]} />
        </View>
      </View>
      <View style={s.cropRight}>
        <Text style={[s.cropHealth, { color: health.fg }]}>{item.healthPct}%</Text>
        <Text style={s.cropHealthLabel}>health</Text>
      </View>
    </TouchableOpacity>
  );
});

interface Props {
  items: readonly CropHealth[];
  onPress: () => void;
  onViewAll: () => void;
}

function CropHealthSectionBase({ items, onPress, onViewAll }: Props) {
  const handlePress = useCallback(() => onPress(), [onPress]);
  return (
    <View style={s.section}>
      <SectionHeader icon="leaf" title="My crops · health" linkLabel="All ›" onLink={onViewAll} />
      <View style={s.card}>
        {items.map((item, i) => (
          <CropRow key={item.id} item={item} isLast={i === items.length - 1} onPress={handlePress} />
        ))}
      </View>
    </View>
  );
}

export const CropHealthSection = React.memo(CropHealthSectionBase);
