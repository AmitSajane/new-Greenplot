import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommunityHubViewModel } from '../hooks/useCommunityHub';
import {
  FeedPost,
  NEW_POST_TYPE_EXAMPLES,
  POST_TYPE_FILTERS,
  PostTypeFilterKey,
} from '../constants/communityData';
import { hubStyles as s } from '../styles/hub.styles';
import {
  BlogReaderModal,
  CategoryChips,
  CreatePostRow,
  // ContributorsStrip, // Top contributors — temporarily hidden from the feed (see below), not deleted.
  HubHeader,
  LearnStrip,
  NewPostTypeCard,
  PostCard,
  PostComposerModal,
  PostTypeFilterRow,
  ReferEarnBanner,
  RewardsStrip,
  SectionHeader,
  SpotlightCard,
  // StoriesTray, // Stories tray — commented out, not deleted. Low usage pre-launch;
  StoryComposerModal,
  StoryViewerModal,
  VoiceRecorderModal,
} from './community';
import { useAuth } from '../../../context/AuthContext';

/** Post-type filter → which real FeedPost media types it should match. */
function matchesPostType(post: FeedPost, filter: PostTypeFilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'photo') return post.media.type === 'image' || post.media.type === 'grid';
  if (filter === 'video') return post.media.type === 'video';
  if (filter === 'voice') return post.media.type === 'audio';
  // 'blog' / 'poll' have no real posts yet — only the example cards in the
  // footer represent them for now.
  return false;
}

export const CommunityHubContent: React.FC<CommunityHubViewModel> = vm => {
  const { user } = useAuth();
  const [readingPost, setReadingPost] = useState<FeedPost | null>(null);
  const {
    stats, reward, referral, spotlight, guides, categories, posts, category,
    setCategory, onToggleLike, onToggleSave, onSharePost, onComment,
    onAddPhoto, onAddVideo, onAddVoice, onWritePost, onReferEarn, onRewards,
    onSpotlight, onGuidesAll, onGuidePress, onSearch, onDeletePost, onOpenMyPosts,
    postComposerVisible, postComposerScreen, postDraft, postMediaBusy, postSubmitting, closePostComposer,
    selectPostType, backToPostTypePicker, setPostTitle,
    setPostText, setPostCategory, pickPostMedia, clearPostMedia, submitPost,
    voiceRecorderVisible, closeVoiceRecorder, onVoiceRecorded,
    stories, storyComposerVisible, pendingStory, storyMediaBusy, storySubmitting, viewerOpen, viewerIndex, setViewerIndex,
    closeStoryComposer, pickStoryMedia, discardPendingStory, confirmStory,
    closeStoryViewer,
  } = vm;

  // Post-type filter (Photo/Video/Blog/Poll/Voice) — separate from the topic
  // category chips above the feed. UI-only for now: narrows the real posts
  // list and/or the "new formats" example cards below it.
  const [postTypeFilter, setPostTypeFilter] = useState<PostTypeFilterKey>('all');

  const filteredPosts = useMemo(
    () => (postTypeFilter === 'all' ? posts : posts.filter(p => matchesPostType(p, postTypeFilter))),
    [posts, postTypeFilter],
  );

  const visibleExamples = useMemo(
    () =>
      postTypeFilter === 'all'
        ? NEW_POST_TYPE_EXAMPLES
        : NEW_POST_TYPE_EXAMPLES.filter(e => e.filterKey === postTypeFilter),
    [postTypeFilter],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FeedPost>) => (
      <PostCard
        post={item}
        onToggleLike={onToggleLike}
        onToggleSave={onToggleSave}
        onShare={onSharePost}
        onComment={onComment}
        onDelete={item.authorId === user?.id ? onDeletePost : undefined}
        onReadStory={setReadingPost}
      />
    ),
    [onToggleLike, onToggleSave, onSharePost, onComment, onDeletePost, user?.id],
  );

  const keyExtractor = useCallback((item: FeedPost) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <>
        <HubHeader stats={stats} onSearch={onSearch} onRewards={onRewards} />
        {/*
          Stories tray — commented out, not deleted. Low daily usage
          pre-launch; swapped for the richer post formats below.
          <StoriesTray stories={stories} onPress={onStoryTrayPress} onAdd={openStoryComposer} />
        */}
        <RewardsStrip reward={reward} onPress={onRewards} />
        <CreatePostRow onPress={onWritePost} onPressMyPosts={onOpenMyPosts} />
        <CategoryChips categories={categories} selected={category} onSelect={setCategory} />
        <SpotlightCard spotlight={spotlight} onPress={onSpotlight} />
        {/*
          Top contributors — commented out, not deleted.
          <ContributorsStrip contributors={contributors} onSeeAll={onLeaderboard} />
        */}
        <ReferEarnBanner coinsPerInvite={referral.coinsPerInvite} onRefer={onReferEarn} />
        <LearnStrip guides={guides} onPress={onGuidePress} onSeeAll={onGuidesAll} />
        <View style={s.sectionFeed}>
          <SectionHeader icon="newspaper" title="Community feed" />
        </View>
        <PostTypeFilterRow filters={POST_TYPE_FILTERS} selected={postTypeFilter} onSelect={setPostTypeFilter} />
      </>
    ),
    [
      stats, reward, referral, spotlight, guides, categories, category,
      setCategory, onSearch, onRewards, onAddPhoto, onAddVideo, onAddVoice, onWritePost,
      onSpotlight, onReferEarn, onGuidePress, onGuidesAll,
      postTypeFilter,
    ],
  );

  const ListEmpty = useMemo(
    () => (
      <View style={s.section}>
        <Text style={s.pMeta}>No posts in this category yet. Be the first to share! 🌱</Text>
      </View>
    ),
    [],
  );

  const ListFooter = useMemo(() => {
    if (!visibleExamples.length) return null;
    return (
      <View style={s.newTypeSection}>
        <Text style={s.newTypeSectionTitle}>Try these new ways to post</Text>
        {visibleExamples.map(example => (
          <NewPostTypeCard key={example.id} item={example} />
        ))}
      </View>
    );
  }, [visibleExamples]);

  return (
    <View style={s.safeArea}>
      <FlatList
        data={filteredPosts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={9}
        removeClippedSubviews
      />

      {/* Story feature hidden for now — kept for future use. */}
      {/* <StoryComposerModal
        visible={storyComposerVisible}
        pendingStory={pendingStory}
        busy={storyMediaBusy}
        submitting={storySubmitting}
        onPick={pickStoryMedia}
        onConfirm={confirmStory}
        onDiscard={discardPendingStory}
        onClose={closeStoryComposer}
      />
      <StoryViewerModal
        visible={viewerOpen}
        stories={stories}
        index={viewerIndex}
        setIndex={setViewerIndex}
        onClose={closeStoryViewer}
      /> */}
      <PostComposerModal
        visible={postComposerVisible}
        screen={postComposerScreen}
        draft={postDraft}
        categories={categories}
        busy={postMediaBusy}
        submitting={postSubmitting}
        onClose={closePostComposer}
        onSelectType={selectPostType}
        onBackToPicker={backToPostTypePicker}
        onChangeTitle={setPostTitle}
        onChangeText={setPostText}
        onChangeCategory={setPostCategory}
        onPickMedia={pickPostMedia}
        onClearMedia={clearPostMedia}
        onSubmit={submitPost}
      />
      <VoiceRecorderModal
        visible={voiceRecorderVisible}
        busy={false}
        onClose={closeVoiceRecorder}
        onConfirm={onVoiceRecorded}
      />
    </View>
  );
};
