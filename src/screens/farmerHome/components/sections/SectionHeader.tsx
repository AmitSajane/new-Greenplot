import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { farmerHomeStyles as s } from '../../styles/farmerHome.styles';

interface Props {
  icon: string;
  title: string;
  linkLabel?: string;
  onLink?: () => void;
}

/** Shared "icon + title …… link" row used by every section. */
function SectionHeaderBase({ icon, title, linkLabel, onLink }: Props) {
  return (
    <View style={s.sectionHead}>
      <View style={s.sectionTitleRow}>
        <Ionicons name={icon} size={16} color="#1A6B3A" />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {!!linkLabel && (
        <Text style={s.sectionLink} onPress={onLink} suppressHighlighting>
          {linkLabel}
        </Text>
      )}
    </View>
  );
}

export const SectionHeader = React.memo(SectionHeaderBase);
