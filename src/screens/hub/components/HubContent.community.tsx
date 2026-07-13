import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { CommunityHubViewModel } from '../hooks/useCommunityHub';
import { FeedPost } from '../constants/communityData';
import { hubStyles as s } from '../styles/hub.styles';
import {
  BlogReaderModal,
  CategoryChips,
  CreatePostRow,
  // Top contributors feature hidden for now — kept for future use.
  // ContributorsStrip,
  HubHeader,
  LearnStrip,
  PostCard,
  PostComposerModal,
  ReferEarnBanner,
  RewardsStrip,
  SectionHeader,
  SpotlightCard,
  // Story feature hidden for now — kept for future use.
  // StoriesTray,
  // StoryComposerModal,
  // StoryViewerModal,
} from './community';

export const CommunityHubContent: React.FC<CommunityHubViewModel> = vm => {
  const { user } = useAuth();
  const [readingPost, setReadingPost] = useState<FeedPost | null>(null);
  const {
    stats, reward, referral, spotlight, guides, categories, posts, category,
    // Top contributors feature hidden for now — kept for future use.
    // contributors, onLeaderboard,
    setCategory, onToggleLike, onToggleSave, onSharePost, onComment, onDeletePost,
    onWritePost, onOpenMyPosts, onReferEarn, onRewards,
    onSpotlight, onGuidesAll, onGuidePress, onSearch,
    postComposerVisible, postComposerScreen, postDraft, postMediaBusy, postSubmitting, closePostComposer,
    selectPostType, backToPostTypePicker, setPostTitle, setPostText, setPostCategory, pickPostMedia, clearPostMedia, submitPost,
    // Story feature hidden for now — kept for future use.
    // stories, storyComposerVisible, pendingStory, storyMediaBusy, storySubmitting, viewerOpen, viewerIndex, setViewerIndex,
    // onStoryTrayPress, openStoryComposer, closeStoryComposer, pickStoryMedia, discardPendingStory, confirmStory,
    // closeStoryViewer,
  } = vm;

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
        {/* Story feature hidden for now — kept for future use. */}
        {/* <StoriesTray stories={stories} onPress={onStoryTrayPress} onAdd={openStoryComposer} /> */}
        <RewardsStrip reward={reward} onPress={onRewards} />
        <CreatePostRow onPress={onWritePost} onPressMyPosts={onOpenMyPosts} />
        <CategoryChips categories={categories} selected={category} onSelect={setCategory} />
        <SpotlightCard spotlight={spotlight} onPress={onSpotlight} />
        {/* Top contributors feature hidden for now — kept for future use. */}
        {/* <ContributorsStrip contributors={contributors} onSeeAll={onLeaderboard} /> */}
        <ReferEarnBanner coinsPerInvite={referral.coinsPerInvite} onRefer={onReferEarn} />
        <LearnStrip guides={guides} onPress={onGuidePress} onSeeAll={onGuidesAll} />
        <View style={s.sectionFeed}>
          <SectionHeader icon="newspaper" title="Community feed" />
        </View>
      </>
    ),
    [
      stats, reward, referral, spotlight, guides, categories, category,
      // stories, onStoryTrayPress, openStoryComposer,
      // contributors, onLeaderboard,
      setCategory, onSearch, onRewards, onWritePost, onOpenMyPosts,
      onSpotlight, onReferEarn, onGuidePress, onGuidesAll,
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

  return (
    <View style={s.safeArea}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
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
      <BlogReaderModal post={readingPost} onClose={() => setReadingPost(null)} />
    </View>
  );
};
