import React, { useMemo, useState } from 'react';
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { useAuth } from '../../../../context/AuthContext';
import { CategoryDef, CategoryKey, PostType } from '../../constants/communityData';
import { MediaSource, PostDraft } from '../../hooks/useCommunityHub';
import { PHOTO_SOURCES, VIDEO_SOURCES } from '../../constants/mediaSources';
import { Avatar } from './Avatar';
import { CategoryChips } from './CategoryChips';
import { MediaSourceSheet } from './MediaSourceSheet';

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
  /** Compose screen's attach box opens this when postType is 'voice' —
   * mirrors how the Photo/Video attach box opens MediaSourceSheet. */
  onOpenVoiceRecorder: () => void;
  onBackToPicker: () => void;
  onChangeTitle: (title: string) => void;
  onChangeText: (text: string) => void;
  onChangeCategory: (category: CategoryKey) => void;
  onPickMedia: (source: MediaSource) => void;
  onClearMedia: () => void;
  onChangePollOption: (index: number, value: string) => void;
  onAddPollOption: () => void;
  onRemovePollOption: (index: number) => void;
  onSubmit: () => void;
}

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
      <TouchableOpacity style={s.composerTypeCard} activeOpacity={0.8} onPress={() => onSelectType('poll')}>
        <View style={[s.composerTypeIconWrap, { backgroundColor: '#D4E8FC' }]}>
          <Ionicons name="bar-chart" size={22} color="#1A5299" />
        </View>
        <View style={s.flex1}>
          <Text style={s.composerTypeCardTitle}>Poll</Text>
          <Text style={s.composerTypeCardDesc}>Ask a question, let the community vote</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9AA79E" />
      </TouchableOpacity>
      <TouchableOpacity style={s.composerTypeCard} activeOpacity={0.8} onPress={() => onSelectType('voice')}>
        <View style={[s.composerTypeIconWrap, { backgroundColor: '#EDE8FD' }]}>
          <Ionicons name="mic" size={22} color="#4B2EA8" />
        </View>
        <View style={s.flex1}>
          <Text style={s.composerTypeCardTitle}>Voice note</Text>
          <Text style={s.composerTypeCardDesc}>Record and share a spoken tip</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9AA79E" />
      </TouchableOpacity>
    </View>
  );
}

function PollOptionsEditor({
  options,
  onChangePollOption,
  onAddPollOption,
  onRemovePollOption,
}: {
  options: string[];
  onChangePollOption: (index: number, value: string) => void;
  onAddPollOption: () => void;
  onRemovePollOption: (index: number) => void;
}) {
  return (
    <>
      <Text style={s.composerOptionsLabel}>Options</Text>
      {options.map((opt, i) => (
        <View key={i} style={s.composerOptionRow}>
          <View style={s.composerOptionDot} />
          <TextInput
            style={s.composerOptionInput}
            placeholder={`Option ${i + 1}`}
            placeholderTextColor="#9EB8A8"
            value={opt}
            onChangeText={v => onChangePollOption(i, v)}
          />
          {options.length > 2 && (
            <TouchableOpacity style={s.composerOptionRemove} onPress={() => onRemovePollOption(i)} hitSlop={8}>
              <Ionicons name="close" size={16} color="#9EB8A8" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      {options.length < 4 && (
        <TouchableOpacity style={s.composerAddOption} activeOpacity={0.7} onPress={onAddPollOption}>
          <Ionicons name="add-circle-outline" size={16} color="#1A6B3A" />
          <Text style={s.composerAddOptionText}>Add option (up to 4)</Text>
        </TouchableOpacity>
      )}
    </>
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
    onOpenVoiceRecorder,
    onChangeTitle,
    onChangeText,
    onChangeCategory,
    onPickMedia,
    onClearMedia,
    onChangePollOption,
    onAddPollOption,
    onRemovePollOption,
    onSubmit,
  }: Props) => {
    const { user } = useAuth();
    const [sourceSheetVisible, setSourceSheetVisible] = useState(false);
    const postable = categories.filter(c => c.key !== 'all');
    const isBlog = draft.postType === 'blog';
    const isPoll = draft.postType === 'poll';
    const isVideo = draft.postType === 'video';
    const isVoice = draft.postType === 'voice';
    const filledPollOptions = draft.pollOptions.filter(o => o.trim()).length;
    const canSubmit =
      (isBlog
        ? !!draft.title.trim() || !!draft.text.trim()
        : isPoll
          ? !!draft.title.trim() && filledPollOptions >= 2
          : !!draft.text.trim() || !!draft.media) && !submitting;
    const initials = useMemo(() => (user?.name || 'You').trim().slice(0, 2).toUpperCase(), [user?.name]);
    // Blog covers are photos too, so blog + photo share the same source pair.
    const mediaSources = isVideo ? VIDEO_SOURCES : PHOTO_SOURCES;
    const attachLabel = isBlog
      ? 'Add cover'
      : isVideo
        ? 'Add video'
        : isVoice
          ? 'Add voice note'
          : 'Add photo';
    const attachIcon = isVoice ? 'mic' : isVideo ? 'videocam' : 'camera';
    const attachIconColor = isVoice ? '#4B2EA8' : isVideo ? '#C02828' : '#1A6B3A';
    const handlePickSource = (source: MediaSource) => {
      setSourceSheetVisible(false);
      onPickMedia(source);
    };
    const handleAttachPress = () => {
      if (isVoice) onOpenVoiceRecorder();
      else setSourceSheetVisible(true);
    };

    return (
      <>
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={s.safeAreaModal} edges={['top']}>
          <View style={s.composerHeader}>
            <TouchableOpacity onPress={onClose} disabled={submitting} hitSlop={8}>
              <Ionicons name="arrow-back" size={20} color="#1C2E18" />
            </TouchableOpacity>
            <Text style={s.composerTitle}>Create Post</Text>
          </View>

          <ScrollView style={s.composerBody} keyboardShouldPersistTaps="handled">
            {screen === 'picker' ? (
              <TypePicker onSelectType={onSelectType} />
            ) : (
              <>
                <View style={s.composerAuthorRow}>
                  <Avatar initials={initials} tone="green" />
                  <View>
                    <Text style={s.composerAuthorName}>{user?.name || 'You'}</Text>
                    <View style={s.composerAudiencePill}>
                      <Ionicons name="earth" size={12} color="#3A5040" />
                      <Text style={s.composerAudiencePillText}>Public</Text>
                    </View>
                  </View>
                </View>

                {(isBlog || isPoll) && (
                  <TextInput
                    style={s.composerTitleInput}
                    placeholder={isPoll ? 'Ask a question' : 'Add a title'}
                    placeholderTextColor="#9EB8A8"
                    value={draft.title}
                    onChangeText={onChangeTitle}
                  />
                )}

                {!isBlog && !isPoll && (
                  <TextInput
                    style={s.composerInput}
                    placeholder="Share what's happening on your farm..."
                    placeholderTextColor="#9EB8A8"
                    multiline
                    value={draft.text}
                    onChangeText={onChangeText}
                  />
                )}

                {isPoll && (
                  <PollOptionsEditor
                    options={draft.pollOptions}
                    onChangePollOption={onChangePollOption}
                    onAddPollOption={onAddPollOption}
                    onRemovePollOption={onRemovePollOption}
                  />
                )}

                {!isPoll && (draft.media ? (
                  <View style={s.composerMediaWrap}>
                    {draft.media.mediaType === 'image' ? (
                      <Image source={{ uri: draft.media.uri }} style={s.composerMediaImg} resizeMode="cover" />
                    ) : draft.media.mediaType === 'audio' ? (
                      <View style={s.composerVoiceCard}>
                        <Ionicons name="mic" size={28} color="#fff" />
                        <Text style={s.previewVideoText}>
                          Voice note{draft.media.durationSec != null ? ` · ${draft.media.durationSec}s` : ''}
                        </Text>
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
                  <TouchableOpacity
                    style={[s.composerBigAttachBox, isBlog && s.composerBigAttachBoxSmall]}
                    activeOpacity={0.8}
                    disabled={busy}
                    onPress={handleAttachPress}
                  >
                    <Ionicons name={attachIcon} size={isBlog ? 20 : 26} color={attachIconColor} />
                    <Text style={s.composerBigAttachText}>{busy ? 'Preparing…' : attachLabel}</Text>
                  </TouchableOpacity>
                ))}

                {isBlog && (
                  <TextInput
                    style={[s.composerInput, { minHeight: 160, marginTop: 14 }]}
                    placeholder="Write your story. Start a new paragraph for each section — it'll be laid out like an article automatically."
                    placeholderTextColor="#9EB8A8"
                    multiline
                    value={draft.text}
                    onChangeText={onChangeText}
                  />
                )}

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
        </SafeAreaView>
      </Modal>

      <MediaSourceSheet
        visible={sourceSheetVisible}
        title={attachLabel}
        subtitle={isVideo ? "Choose how you'd like to add your video." : "Choose how you'd like to add your photo."}
        sources={mediaSources}
        busy={busy}
        onPick={handlePickSource}
        onClose={() => setSourceSheetVisible(false)}
      />
      </>
    );
  },
);
