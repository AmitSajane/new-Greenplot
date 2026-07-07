import React, { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommunityHubViewModel } from '../hooks/useCommunityHub';
import { FeedPost } from '../constants/communityData';
import { hubStyles as s } from '../styles/hub.styles';
import {
  CategoryChips,
  Composer,
  ContributorsStrip,
  HubHeader,
  LearnStrip,
  PostCard,
  PostComposerModal,
  ReferEarnBanner,
  RewardsStrip,
  SectionHeader,
  SpotlightCard,
  StoriesTray,
  StoryComposerModal,
  StoryViewerModal,
} from './community';

export const CommunityHubContent: React.FC<CommunityHubViewModel> = vm => {
  const {
    stats, reward, referral, contributors, spotlight, guides, categories, posts, category,
    setCategory, onToggleLike, onToggleSave, onSharePost, onComment,
    onAddPhoto, onAddVideo, onWritePost, onReferEarn, onRewards, onLeaderboard,
    onSpotlight, onGuidesAll, onGuidePress, onSearch,
    postComposerVisible, postDraft, postMediaBusy, postSubmitting, closePostComposer, onPostComposerShown,
    setPostText, setPostCategory, pickPostMedia, clearPostMedia, submitPost,
    stories, storyComposerVisible, pendingStory, storyMediaBusy, storySubmitting, viewerOpen, viewerIndex, setViewerIndex,
    onStoryTrayPress, openStoryComposer, closeStoryComposer, pickStoryMedia, discardPendingStory, confirmStory,
    closeStoryViewer,
  } = vm;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FeedPost>) => (
      <PostCard
        post={item}
        onToggleLike={onToggleLike}
        onToggleSave={onToggleSave}
        onShare={onSharePost}
        onComment={onComment}
      />
    ),
    [onToggleLike, onToggleSave, onSharePost, onComment],
  );

  const keyExtractor = useCallback((item: FeedPost) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <>
        <HubHeader stats={stats} onSearch={onSearch} onRewards={onRewards} />
        <StoriesTray stories={stories} onPress={onStoryTrayPress} onAdd={openStoryComposer} />
        <RewardsStrip reward={reward} onPress={onRewards} />
        <Composer onAddPhoto={onAddPhoto} onAddVideo={onAddVideo} onWritePost={onWritePost} />
        <CategoryChips categories={categories} selected={category} onSelect={setCategory} />
        <SpotlightCard spotlight={spotlight} onPress={onSpotlight} />
        <ContributorsStrip contributors={contributors} onSeeAll={onLeaderboard} />
        <ReferEarnBanner coinsPerInvite={referral.coinsPerInvite} onRefer={onReferEarn} />
        <LearnStrip guides={guides} onPress={onGuidePress} onSeeAll={onGuidesAll} />
        <View style={s.sectionFeed}>
          <SectionHeader icon="newspaper" title="Community feed" />
        </View>
      </>
    ),
    [
      stats, reward, referral, contributors, spotlight, guides, categories, category,
      stories, onStoryTrayPress, openStoryComposer,
      setCategory, onSearch, onRewards, onAddPhoto, onAddVideo, onWritePost,
      onSpotlight, onLeaderboard, onReferEarn, onGuidePress, onGuidesAll,
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
      <TouchableOpacity style={s.fab} activeOpacity={0.85} onPress={onWritePost}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      <StoryComposerModal
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
      />
      <PostComposerModal
        visible={postComposerVisible}
        draft={postDraft}
        categories={categories}
        busy={postMediaBusy}
        submitting={postSubmitting}
        onClose={closePostComposer}
        onShown={onPostComposerShown}
        onChangeText={setPostText}
        onChangeCategory={setPostCategory}
        onPickMedia={pickPostMedia}
        onClearMedia={clearPostMedia}
        onSubmit={submitPost}
      />
    </View>
  );
};
