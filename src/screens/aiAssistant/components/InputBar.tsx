import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { km } from '../kisanMitra.styles';
import { LanguageOption } from '../constants';
import { Language } from '../../../services/aiAssistantService';

interface PillProps {
  option: LanguageOption;
  active: boolean;
  onPress: (code: Language) => void;
}

const LangPill = React.memo(({ option, active, onPress }: PillProps) => {
  const handle = useCallback(() => onPress(option.code), [onPress, option.code]);
  return (
    <TouchableOpacity style={[km.langPill, active && km.langPillActive]} activeOpacity={0.8} onPress={handle}>
      <Text style={[km.langPillText, active && km.langPillTextActive]}>{option.label}</Text>
    </TouchableOpacity>
  );
});

interface Props {
  placeholder: string;
  listeningLabel: string;
  listening: boolean;
  languages: LanguageOption[];
  currentLanguage: Language;
  onChooseLanguage: (code: Language) => void;
  onSend: (text: string) => void;
  onMic: () => void;
  onAttach: () => void;
  disabled: boolean;
}

export const InputBar = React.memo(
  ({ placeholder, listeningLabel, listening, languages, currentLanguage, onChooseLanguage, onSend, onMic, onAttach, disabled }: Props) => {
    const [text, setText] = useState('');
    const canSend = text.trim().length > 0 && !disabled;
    const submit = useCallback(() => {
      const v = text.trim();
      if (!v || disabled) return;
      onSend(v);
      setText('');
    }, [text, disabled, onSend]);

    return (
      <View style={km.inputBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={km.langStripContent}>
          {languages.map(l => (
            <LangPill key={l.code} option={l} active={l.code === currentLanguage} onPress={onChooseLanguage} />
          ))}
        </ScrollView>
        <View style={km.inRow}>
          <TouchableOpacity style={km.inBtn} activeOpacity={0.8} onPress={onAttach}>
            <Ionicons name="camera" size={18} color="#6B8074" />
          </TouchableOpacity>
          <TextInput
            style={km.inField}
            value={text}
            onChangeText={setText}
            placeholder={listening ? listeningLabel : placeholder}
            placeholderTextColor="#9EB8A8"
            multiline
            returnKeyType="send"
            onSubmitEditing={submit}
            blurOnSubmit={false}
          />
          <TouchableOpacity style={[km.inBtn, km.inMic, listening && km.inMicActive]} activeOpacity={0.8} onPress={onMic}>
            <Ionicons name={listening ? 'stop' : 'mic'} size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[km.inSend, !canSend && km.inSendDisabled]}
            activeOpacity={0.85}
            onPress={submit}
            disabled={!canSend}
          >
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);
