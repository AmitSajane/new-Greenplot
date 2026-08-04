import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { MediaSource } from '../../hooks/useCommunityHub';
import { MediaSourceOption } from '../../constants/mediaSources';

interface Props {
  visible: boolean;
  title: string;
  subtitle?: string;
  sources: MediaSourceOption[];
  busy?: boolean;
  onPick: (source: MediaSource) => void;
  onClose: () => void;
}

/** Bottom-sheet "capture with camera vs choose from gallery" chooser. Shared
 * by the story composer and the post composer so both ask the user which
 * source they want instead of jumping straight into the gallery picker. */
export const MediaSourceSheet = React.memo(({ visible, title, subtitle, sources, busy, onPick, onClose }: Props) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.modalBackdrop} onPress={onClose} />
    <View style={s.sheet}>
      <View style={s.sheetHandle} />
      <Text style={s.sheetTitle}>{title}</Text>
      {!!subtitle && <Text style={s.sheetSub}>{subtitle}</Text>}
      <View style={s.sourceGrid}>
        {sources.map(item => (
          <TouchableOpacity
            key={item.source}
            style={s.sourceBtn}
            activeOpacity={0.8}
            disabled={busy}
            onPress={() => onPick(item.source)}
          >
            <View style={s.sourceIcon}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={s.sourceLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={s.sheetCancel} onPress={onClose}>
        <Text style={s.sheetCancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </Modal>
));
