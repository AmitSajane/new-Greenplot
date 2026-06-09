import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';

interface Props {
  icon: string;
  title: string;
  link?: string;
  onLink?: () => void;
}

export const SectionHeader = React.memo(({ icon, title, link, onLink }: Props) => (
  <View style={s.sectionHead}>
    <View style={s.sectionTitleRow}>
      <Ionicons name={icon} size={16} color="#1A6B3A" />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
    {!!link && (
      <Text style={s.sectionLink} onPress={onLink} suppressHighlighting>
        {link}
      </Text>
    )}
  </View>
));
