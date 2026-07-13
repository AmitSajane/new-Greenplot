import React, { useMemo } from 'react';
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { useAuth } from '../../../../context/AuthContext';
import { CategoryDef, CategoryKey, PostType } from '../../constants/communityData';
import { MediaSource, PostDraft } from '../../hooks/useCommunityHub';
import { Avatar } from './Avatar';
import { CategoryChips } from './CategoryChips';

const SUBMIT_BAR_STYLE = {
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderTopWidth: 1,
  borderTopColor: '#E4F4EC',
};

const SUBMIT_BTN_STYLE = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  backgroundColor: '#0F4A28',
  borderRadius: 14,
  paddingVertical: 13,
};

const SUBMIT_BTN_DISABLED_STYLE = { opacity: 0.45 };
const SUBMIT_BTN_TEXT_STYLE = { color: '#fff', fontSize: 14, fontWeight: '800' as const };

interface Props {
  visible: boolean;
  screen: 'picker' | 'compose';
  draft: PostDraft;
  categories: readonly CategoryDef[];
  busy: boolean;
  submitting: boolean;
  onClose: () => void;
  onSelectType: (type: PostType) => void;
  onBackToPicker: () => void;
  onChangeTitle: (title: string) => void;
  onChangeText: (text: string) => void;
  onChangeCategory: (category: CategoryKey) => void;
  onPickMedia: (source: MediaSource) => void;
  onClearMedia: () => void;
  onSubmit: () => void;
}

const TYPE_LABEL: Record<PostType, string> = { photo: 'Photo post', video: 'Video post', blog: 'Blog post' };

function TypePicker({ onSelectType }: { onSelectType: (type: PostType) => void }) {
  return (
    <View>
      <Text style={s.composerPickerTitle}>What do you want to share?</Text>
      <TouchableOpacity style={s.composerTypeCard} activeOpacity={0.8} onPress={() => onSelectType('photo')}>
        <View style={[s.composerTypeIconWrap, { backgroundColor: '#E4F4EC' }]}>
          <Ionicons name="camera" size={22} color="#1A6B3A" />
        </View>
        <View style={s.flex1}>
          <Text style={s.composerTypeCardTitle}>Photo</Text>
          <Text style={s.composerTypeCardDesc}>Share a picture with a short description</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9AA79E" />
      </TouchableOpacity>
      <TouchableOpacity style={s.composerTypeCard} activeOpacity={0.8} onPress={() => onSelectType('video')}>
        <View style={[s.composerTypeIconWrap, { backgroundColor: '#FDD0D0' }]}>
          <Ionicons name="videocam" size={22} color="#C02828" />
        </View>
        <View style={s.flex1}>
          <Text style={s.composerTypeCardTitle}>Video</Text>
          <Text style={s.composerTypeCardDesc}>Share a video with a short description</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9AA79E" />
      </TouchableOpacity>
      <TouchableOpacity style={s.composerTypeCard} activeOpacity={0.8} onPress={() => onSelectType('blog')}>
        <View style={[s.composerTypeIconWrap, { backgroundColor: '#FDF5E0' }]}>
          <Ionicons name="newspaper" size={22} color="#B87214" />
        </View>
        <View style={s.flex1}>
          <Text style={s.composerTypeCardTitle}>Blog</Text>
          <Text style={s.composerTypeCardDesc}>Write a full story with a title and sections</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9AA79E" />
      </TouchableOpacity>
    </View>
  );
}

/** Full-screen post composer. Opens on a type picker (Photo/Video/Blog);
 * picking a type swaps in that type's fields. The bottom Post button is the
 * single submit action. */
export const PostComposerModal = React.memo(
  ({
    visible,
    screen,
    draft,
    categories,
    busy,
    submitting,
    onClose,
    onSelectType,
    onBackToPicker,
    onChangeTitle,
    onChangeText,
    onChangeCategory,
    onPickMedia,
    onClearMedia,
    onSubmit,
  }: Props) => {
    const { user } = useAuth();
    const postable = categories.filter(c => c.key !== 'all');
    const isBlog = draft.postType === 'blog';
    const canSubmit = (isBlog ? !!draft.title.trim() || !!draft.text.trim() : !!draft.text.trim() || !!draft.media) && !submitting;
    const initials = useMemo(() => (user?.name || 'You').trim().slice(0, 2).toUpperCase(), [user?.name]);
    const mediaSource: MediaSource = draft.postType === 'video' ? 'gallery-video' : 'gallery-photo';
    const attachLabel = isBlog
      ? 'Add cover'
      : draft.postType === 'video'
        ? 'Add video'
        : 'Add photo';

    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={s.safeAreaModal}>
          <View style={s.composerHeader}>
            {screen === 'picker' ? (
              <TouchableOpacity onPress={onClose} disabled={submitting}>
                <Text style={s.composerCancelText}>Cancel</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity onPress={onBackToPicker} disabled={submitting} hitSlop={8}>
                  <Ionicons name="arrow-back" size={18} color="#1C2E18" />
                </TouchableOpacity>
                <Text style={s.composerBackTitle}>{TYPE_LABEL[draft.postType]}</Text>
              </>
            )}
          </View>

          <ScrollView style={s.composerBody} keyboardShouldPersistTaps="handled">
            {screen === 'picker' ? (
              <TypePicker onSelectType={onSelectType} />
            ) : (
              <>
                <View style={s.composerAuthorRow}>
                  <Avatar initials={initials} tone="green" />
                  <Text style={s.composerAuthorName}>{user?.name || 'You'}</Text>
                </View>

                {isBlog && (
                  <TextInput
                    style={[s.composerInput, { minHeight: 44, fontSize: 18, fontWeight: '800' }]}
                    placeholder="Add a title"
                    placeholderTextColor="#9EB8A8"
                    value={draft.title}
                    onChangeText={onChangeTitle}
                  />
                )}

                {draft.media ? (
                  <View style={s.composerMediaWrap}>
                    {draft.media.mediaType === 'image' ? (
                      <Image source={{ uri: draft.media.uri }} style={s.composerMediaImg} resizeMode="cover" />
                    ) : draft.media.mediaType === 'audio' ? (
                      <View style={s.composerVoiceCard}>
                        <Ionicons name="mic" size={28} color="#fff" />
                        <Text style={s.previewVideoText}>Voice note · {draft.media.durationSec ?? '—'}s</Text>
                      </View>
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
                ) : (
                  <View style={s.composerAttachRow}>
                    <TouchableOpacity
                      style={s.composerAttachBtn}
                      activeOpacity={0.8}
                      disabled={busy}
                      onPress={() => onPickMedia(mediaSource)}
                    >
                      <Ionicons
                        name={draft.postType === 'video' ? 'videocam' : 'camera'}
                        size={18}
                        color={draft.postType === 'video' ? '#C02828' : '#1A6B3A'}
                      />
                      <Text style={s.composerAttachText}>{busy ? 'Preparing…' : attachLabel}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TextInput
                  style={[s.composerInput, isBlog && { minHeight: 160, marginTop: 14 }]}
                  placeholder={
                    isBlog
                      ? 'Write your story. Start a new paragraph for each section.'
                      : "Share what's happening on your farm..."
                  }
                  placeholderTextColor="#9EB8A8"
                  multiline
                  value={draft.text}
                  onChangeText={onChangeText}
                />

                <Text style={s.composerCategoryLabel}>Category</Text>
                <CategoryChips categories={postable} selected={draft.category} onSelect={onChangeCategory} />
              </>
            )}
          </ScrollView>

          {screen === 'compose' && (
            <View style={SUBMIT_BAR_STYLE}>
              <TouchableOpacity
                style={[SUBMIT_BTN_STYLE, !canSubmit && SUBMIT_BTN_DISABLED_STYLE]}
                disabled={!canSubmit}
                onPress={onSubmit}
              >
                <Text style={SUBMIT_BTN_TEXT_STYLE}>{submitting ? 'Posting…' : 'Post'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    );
  },
);
