import React, { useEffect } from 'react';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { StoryItem } from '../../constants/communityData';

interface Props {
  visible: boolean;
  stories: StoryItem[];
  index: number;
  setIndex: (index: number) => void;
  onClose: () => void;
}

const IMAGE_DURATION_MS = 5000;

/** Full-screen story playback: one segment per story, auto-advances, tap the
 * left/right half to go back/forward. No in-app video player is wired up
 * yet, so videos show a placeholder card for their duration instead. */
export const StoryViewerModal = React.memo(({ visible, stories, index, setIndex, onClose }: Props) => {
  const current = stories[index];

  useEffect(() => {
    if (!visible || !current) return;
    const durationMs = current.mediaType === 'video' ? (current.durationSec ?? 10) * 1000 : IMAGE_DURATION_MS;
    const timer = setTimeout(() => {
      if (index + 1 < stories.length) setIndex(index + 1);
      else onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [visible, current, index, stories.length, setIndex, onClose]);

  if (!current) return null;

  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };
  const goNext = () => {
    if (index + 1 < stories.length) setIndex(index + 1);
    else onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={s.viewerRoot}>
        <View style={s.viewerProgressRow}>
          {stories.map((story, i) => (
            <View key={story.id} style={s.viewerProgressTrack}>
              <View style={[s.viewerProgressFill, { width: i <= index ? '100%' : '0%' }]} />
            </View>
          ))}
        </View>

        <View style={s.viewerHeaderRow}>
          <Ionicons name="leaf" size={16} color="#fff" />
          <Text style={s.viewerHeaderText}>Your Story</Text>
          <TouchableOpacity style={s.viewerClose} onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={s.viewerMediaWrap}>
          {current.mediaType === 'image' ? (
            <Image source={{ uri: current.uri }} style={s.viewerImage} resizeMode="contain" />
          ) : (
            <View style={s.viewerVideoWrap}>
              <Ionicons name="videocam" size={40} color="#fff" />
              <Text style={s.viewerVideoLabel}>Video · {current.durationSec ?? '—'}s</Text>
            </View>
          )}
          <View style={s.viewerTapZones}>
            <TouchableOpacity style={s.viewerTapZone} activeOpacity={1} onPress={goPrev} />
            <TouchableOpacity style={s.viewerTapZone} activeOpacity={1} onPress={goNext} />
          </View>
        </View>
      </View>
    </Modal>
  );
});
