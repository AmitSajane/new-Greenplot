import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { farmerHomeStyles as s } from '../../styles/farmerHome.styles';

interface Props {
  badge: string;
  text: string;
  cta: string;
  onPress: () => void;
}

function AiAdvisoryCardBase({ badge, text, cta, onPress }: Props) {
  return (
    <View style={s.section}>
      <TouchableOpacity style={s.ai} activeOpacity={0.9} onPress={onPress}>
        <View style={s.aiGlow} pointerEvents="none" />
        <View style={s.aiBadge}>
          <Text style={s.aiBadgeText}>{badge}</Text>
        </View>
        <Text style={s.aiText}>"{text}"</Text>
        <View style={s.aiCta}>
          <Ionicons name="arrow-forward" size={13} color="#fff" />
          <Text style={s.aiCtaText}>{cta}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export const AiAdvisoryCard = React.memo(AiAdvisoryCardBase);
