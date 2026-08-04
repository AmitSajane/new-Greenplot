import React from 'react';
import { Image, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { MediaSource, PickedMedia } from '../../hooks/useCommunityHub';
import { STORY_SOURCES } from '../../constants/mediaSources';
import { MediaSourceSheet } from './MediaSourceSheet';

interface Props {
  visible: boolean;
  pendingStory: PickedMedia | null;
  busy: boolean;
  submitting: boolean;
  onPick: (source: MediaSource) => void;
  onConfirm: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

/** Choose a source (shared MediaSourceSheet), then preview + confirm before
 * it's added to "Your Story" (24h expiry, capped per day — enforced on
 * confirm). */
export const StoryComposerModal = React.memo(({ visible, pendingStory, busy, submitting, onPick, onConfirm, onDiscard, onClose }: Props) => {
  // Resizing happens silently — stay on the "choose" step until the media is
  // fully ready, then jump straight to the finished preview (no visible
  // loading/optimizing state).
  const showPreview = !!pendingStory;

  return (
    <>
      <MediaSourceSheet
        visible={visible && !showPreview}
        title="Add to Your Story"
        subtitle="Stories disappear after 24 hours."
        sources={STORY_SOURCES}
        busy={busy}
        onPick={onPick}
        onClose={onClose}
      />

      <Modal visible={visible && showPreview} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable style={s.modalBackdrop} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          {pendingStory && (
            <>
              <Text style={s.sheetTitle}>Preview</Text>
              {pendingStory.mediaType === 'image' ? (
                <Image source={{ uri: pendingStory.uri }} style={s.previewMediaImg} resizeMode="cover" />
              ) : (
                <View style={s.previewVideoCard}>
                  <Ionicons name="videocam" size={32} color="#fff" />
                  <Text style={s.previewVideoText}>Video · {pendingStory.durationSec ?? '—'}s</Text>
                </View>
              )}
              <Text style={s.previewMeta}>Visible for 24h</Text>
              <View style={s.previewActions}>
                <TouchableOpacity style={[s.previewBtn, s.previewDiscard]} disabled={submitting} onPress={onDiscard}>
                  <Text style={s.previewDiscardText}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.previewBtn, s.previewConfirm]} disabled={submitting} onPress={onConfirm}>
                  <Text style={s.previewConfirmText}>{submitting ? 'Adding…' : 'Add to Story'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </>
  );
});
