import React, { useMemo } from 'react';
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { useAuth } from '../../../../context/AuthContext';
import { CategoryDef, CategoryKey } from '../../constants/communityData';
import { MediaSource, PostDraft } from '../../hooks/useCommunityHub';
import { Avatar } from './Avatar';
import { CategoryChips } from './CategoryChips';

interface Props {
  visible: boolean;
  draft: PostDraft;
  categories: readonly CategoryDef[];
  busy: boolean;
  submitting: boolean;
  onClose: () => void;
  onShown: () => void;
  onChangeText: (text: string) => void;
  onChangeCategory: (category: CategoryKey) => void;
  onPickMedia: (source: MediaSource) => void;
  onClearMedia: () => void;
  onSubmit: () => void;
}

/** Full-screen post composer: caption, category, optional photo/video
 * (gallery-only — the spontaneous camera-first flow lives in Stories). */
export const PostComposerModal = React.memo(
  ({ visible, draft, categories, busy, submitting, onClose, onShown, onChangeText, onChangeCategory, onPickMedia, onClearMedia, onSubmit }: Props) => {
    const { user } = useAuth();
    const postable = categories.filter(c => c.key !== 'all');
    const canSubmit = (!!draft.text.trim() || !!draft.media) && !submitting;
    const initials = useMemo(() => (user?.name || 'You').trim().slice(0, 2).toUpperCase(), [user?.name]);

    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose} onShow={onShown}>
        <View style={s.safeAreaModal}>
          <View style={s.composerHeader}>
            <TouchableOpacity onPress={onClose} disabled={submitting}>
              <Text style={s.composerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.composerHeaderTitle}>Create post</Text>
            <TouchableOpacity
              style={[s.composerPostBtn, !canSubmit && s.composerPostBtnDisabled]}
              disabled={!canSubmit}
              onPress={onSubmit}
            >
              <Text style={s.composerPostBtnText}>{submitting ? 'Posting…' : 'Post'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.composerBody} keyboardShouldPersistTaps="handled">
            <View style={s.composerAuthorRow}>
              <Avatar initials={initials} tone="green" />
              <Text style={s.composerAuthorName}>{user?.name || 'You'}</Text>
            </View>

            <TextInput
              style={s.composerInput}
              placeholder="Share a success story, tip, or question…"
              placeholderTextColor="#9EB8A8"
              multiline
              value={draft.text}
              onChangeText={onChangeText}
            />

            <Text style={s.composerCategoryLabel}>Category</Text>
            <CategoryChips categories={postable} selected={draft.category} onSelect={onChangeCategory} />

            {/* Resizing happens silently — the attach row just stays put
                until the processed media is ready, then swaps straight to
                the preview below (no visible loading/optimizing state). */}
            {draft.media && (
              <View style={s.composerMediaWrap}>
                {draft.media.mediaType === 'image' ? (
                  <Image source={{ uri: draft.media.uri }} style={s.composerMediaImg} resizeMode="cover" />
                ) : (
                  <View style={s.composerVideoCard}>
                    <Ionicons name="videocam" size={28} color="#fff" />
                    <Text style={s.previewVideoText}>Video · {draft.media.durationSec ?? '—'}s</Text>
                  </View>
                )}
                <TouchableOpacity style={s.composerMediaRemove} onPress={onClearMedia} hitSlop={8}>
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {!draft.media && (
              <View style={s.composerAttachRow}>
                <TouchableOpacity
                  style={s.composerAttachBtn}
                  activeOpacity={0.8}
                  disabled={busy}
                  onPress={() => onPickMedia('gallery-photo')}
                >
                  <Ionicons name="image" size={16} color="#1A6B3A" />
                  <Text style={s.composerAttachText}>Add Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.composerAttachBtn}
                  activeOpacity={0.8}
                  disabled={busy}
                  onPress={() => onPickMedia('gallery-video')}
                >
                  <Ionicons name="videocam" size={16} color="#1A6B3A" />
                  <Text style={s.composerAttachText}>Add Video</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  },
);
