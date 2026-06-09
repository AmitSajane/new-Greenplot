import React, { useCallback } from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { km } from '../kisanMitra.styles';
import { LanguageOption } from '../constants';
import { Language } from '../../../services/aiAssistantService';

interface RowProps {
  option: LanguageOption;
  active: boolean;
  onChoose: (code: Language) => void;
}

const Row = React.memo(({ option, active, onChoose }: RowProps) => {
  const handle = useCallback(() => onChoose(option.code), [onChoose, option.code]);
  return (
    <TouchableOpacity style={km.langOption} activeOpacity={0.7} onPress={handle}>
      <Text style={[km.langOptionText, active && km.langOptionActive]}>{option.label}</Text>
      {active && <Ionicons name="checkmark-circle" size={20} color="#1A6B3A" />}
    </TouchableOpacity>
  );
});

interface Props {
  visible: boolean;
  languages: LanguageOption[];
  current: Language;
  title: string;
  onChoose: (code: Language) => void;
  onClose: () => void;
}

export const LanguagePicker = React.memo(({ visible, languages, current, title, onChoose, onClose }: Props) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={km.sheetOverlay}>
        <TouchableWithoutFeedback>
          <View style={km.sheet}>
            <View style={km.sheetHandle} />
            <Text style={km.sheetTitle}>{title}</Text>
            {languages.map(l => (
              <Row key={l.code} option={l} active={l.code === current} onChoose={onChoose} />
            ))}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
));
