import React, { useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { km } from '../kisanMitra.styles';

interface ChipProps {
  text: string;
  onPress: (text: string) => void;
}

const Chip = React.memo(({ text, onPress }: ChipProps) => {
  const handle = useCallback(() => onPress(text), [onPress, text]);
  return (
    <TouchableOpacity style={km.fuChip} activeOpacity={0.8} onPress={handle}>
      <Ionicons name="sparkles" size={12} color="#2D9B56" />
      <Text style={km.fuChipText}>{text}</Text>
    </TouchableOpacity>
  );
});

interface Props {
  label: string;
  suggestions: string[];
  onPick: (text: string) => void;
}

/** Context-aware follow-up questions surfaced after each answer. */
export const FollowUpChips = React.memo(({ label, suggestions, onPick }: Props) => {
  if (suggestions.length === 0) return null;
  return (
    <View style={km.followups}>
      <Text style={km.fuLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={km.fuStripContent}>
        {suggestions.map(s => (
          <Chip key={s} text={s} onPress={onPick} />
        ))}
      </ScrollView>
    </View>
  );
});
