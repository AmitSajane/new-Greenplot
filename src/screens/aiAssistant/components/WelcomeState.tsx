import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { km, quickTones } from '../kisanMitra.styles';
import { QuickStart, quickMessage, quickSubtitle, quickTitle } from '../constants';
import { Language } from '../../../services/aiAssistantService';

interface CardProps {
  item: QuickStart;
  language: Language;
  onPress: (message: string) => void;
}

const QuickCard = React.memo(({ item, language, onPress }: CardProps) => {
  const handle = useCallback(() => onPress(quickMessage(item, language)), [onPress, item, language]);
  const c = quickTones[item.tone];
  return (
    <TouchableOpacity style={km.qCard} activeOpacity={0.85} onPress={handle}>
      <View style={[km.qIcon, { backgroundColor: c.bg }]}>
        <Text style={km.qIconEmoji}>{item.emoji}</Text>
      </View>
      <Text style={km.qTitle}>{quickTitle(item, language)}</Text>
      <Text style={km.qSub}>{quickSubtitle(item, language)}</Text>
    </TouchableOpacity>
  );
});

interface Props {
  ui: { welcomeTitle: string; welcomeSub: string; quickStartLabel: string; voiceTitle: string; voiceSub: string };
  quickStarts: QuickStart[];
  language: Language;
  onQuickStart: (message: string) => void;
  onVoice: () => void;
}

export const WelcomeState = React.memo(({ ui, quickStarts, language, onQuickStart, onVoice }: Props) => (
  <View>
    <View style={km.welcome}>
      <View style={km.welcomeAv}>
        <Text style={km.welcomeAvEmoji}>🌱</Text>
      </View>
      <Text style={km.welcomeTitle}>{ui.welcomeTitle}</Text>
      <Text style={km.welcomeSub}>{ui.welcomeSub}</Text>
    </View>

    <Text style={km.qLabel}>{ui.quickStartLabel}</Text>
    <View style={km.qGrid}>
      {quickStarts.map(q => (
        <QuickCard key={q.id} item={q} language={language} onPress={onQuickStart} />
      ))}
    </View>

    <TouchableOpacity style={km.voiceCta} activeOpacity={0.9} onPress={onVoice}>
      <View style={km.voiceIcon}>
        <Ionicons name="mic" size={20} color="#A8E6C0" />
      </View>
      <View style={km.flex1}>
        <Text style={km.voiceTitle}>{ui.voiceTitle}</Text>
        <Text style={km.voiceSub}>{ui.voiceSub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
    </TouchableOpacity>
  </View>
));
