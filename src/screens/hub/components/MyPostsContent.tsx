import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItemInfo, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../styles/hub.styles';
import { FeedPost } from '../constants/communityData';
import { BlogReaderModal } from './community/BlogReaderModal';
import { CommentsModal } from './community/CommentsModal';
import { PostCard } from './community/PostCard';
import { MyPostsViewModel } from '../hooks/useMyPosts';

export const MyPostsContent: React.FC<MyPostsViewModel> = vm => {
  const {
    posts, loading, refreshing, onRefresh, userId, onBack, onToggleLike, onToggleSave, onSharePost, onComment, onDeletePost,
    commentsVisible, comments, commentsLoading, commentInput, setCommentInput, commentSubmitting,
    editingCommentId, commentsCurrentUserId, closeComments, submitComment, startEditComment,
    cancelEditComment, deleteComment,
  } = vm;
  const [readingPost, setReadingPost] = useState<FeedPost | null>(null);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FeedPost>) => (
      <PostCard
        post={item}
        onToggleLike={onToggleLike}
        onToggleSave={onToggleSave}
        onShare={onSharePost}
        onComment={onComment}
        onDelete={item.authorId === userId ? onDeletePost : undefined}
        onReadStory={setReadingPost}
      />
    ),
    [onToggleLike, onToggleSave, onSharePost, onComment, onDeletePost, userId],
  );

  const keyExtractor = useCallback((item: FeedPost) => item.id, []);

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <View style={s.myPostsHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color="#1C2E18" />
        </TouchableOpacity>
        <Text style={s.myPostsTitle}>My posts</Text>
      </View>

      {loading ? (
        <View style={s.myPostsLoading}>
          <ActivityIndicator color="#1A6B3A" />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.listContent}
          ListEmptyComponent={
            <View style={s.section}>
              <Text style={s.pMeta}>You haven't posted anything yet.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A6B3A']} tintColor="#1A6B3A" />
          }
        />
      )}
      <BlogReaderModal post={readingPost} onClose={() => setReadingPost(null)} />
      <CommentsModal
        visible={commentsVisible}
        comments={comments}
        loading={commentsLoading}
        currentUserId={commentsCurrentUserId}
        input={commentInput}
        submitting={commentSubmitting}
        editingCommentId={editingCommentId}
        onChangeInput={setCommentInput}
        onClose={closeComments}
        onSubmit={submitComment}
        onEdit={startEditComment}
        onCancelEdit={cancelEditComment}
        onDelete={deleteComment}
      />
    </SafeAreaView>
  );
};
