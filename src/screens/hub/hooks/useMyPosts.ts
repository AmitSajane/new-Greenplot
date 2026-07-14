import { useCallback, useEffect, useState } from 'react';
import { Alert, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HubStackParamList } from '../../../navigation/HubStack';
import { useAuth } from '../../../context/AuthContext';
import { FeedPost } from '../constants/communityData';
import { communityApi } from '../utils/communityApi';
import { useComments } from './useComments';

type NavigationProp = NativeStackNavigationProp<HubStackParamList>;

/** Posts authored by the logged-in user only. Fetches independently of the
 * main feed (own list, own lifecycle) rather than sharing state with
 * useCommunityHub, since the two screens mount/unmount separately. */
export function useMyPosts() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!communityApi.enabled || !user?.id) {
      setLoading(false);
      return;
    }
    communityApi.fetchPosts(user.id).then(all => {
      if (cancelled) return;
      setPosts(all.filter(p => p.authorId === user.id));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    if (!communityApi.enabled || !user?.id) return;
    setRefreshing(true);
    const all = await communityApi.fetchPosts(user.id);
    setPosts(all.filter(p => p.authorId === user.id));
    setRefreshing(false);
  }, [user?.id]);

  const onToggleLike = useCallback(
    (id: string) => {
      if (!user?.id) return;
      let wasLiked = false;
      setPosts(prev =>
        prev.map(p => {
          if (p.id !== id) return p;
          wasLiked = p.liked;
          return { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) };
        }),
      );
      if (!communityApi.enabled) return;
      communityApi.toggleLike(id).then(result => {
        if (result === null) {
          setPosts(prev =>
            prev.map(p => (p.id === id ? { ...p, liked: wasLiked, likes: p.likes + (wasLiked ? 1 : -1) } : p)),
          );
        }
      });
    },
    [user?.id],
  );

  const onToggleSave = useCallback(
    (id: string) => {
      if (!user?.id) return;
      let wasSaved = false;
      setPosts(prev =>
        prev.map(p => {
          if (p.id !== id) return p;
          wasSaved = p.saved;
          return { ...p, saved: !p.saved };
        }),
      );
      if (!communityApi.enabled) return;
      communityApi.toggleSave(id, user.id, wasSaved).then(ok => {
        if (!ok) setPosts(prev => prev.map(p => (p.id === id ? { ...p, saved: wasSaved } : p)));
      });
    },
    [user?.id],
  );

  const onSharePost = useCallback(
    async (id: string) => {
      const post = posts.find(p => p.id === id);
      try {
        await Share.share({ message: `${post?.authorName} on GreenPlot:\n\n${post?.text}` });
      } catch {
        /* user dismissed share sheet */
      }
    },
    [posts],
  );

  const commentsController = useComments(setPosts);
  const onComment = commentsController.openComments;

  const onDeletePost = useCallback(
    (id: string) => {
      if (!user?.id) return;
      Alert.alert('Delete post', "This can't be undone.", [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const previous = posts;
            setPosts(prev => prev.filter(p => p.id !== id));
            if (!communityApi.enabled) return;
            const ok = await communityApi.deletePost(id, user.id);
            if (!ok) {
              setPosts(previous);
              Alert.alert("Couldn't delete", 'Please try again.');
            }
          },
        },
      ]);
    },
    [posts, user?.id],
  );

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  return {
    posts,
    loading,
    refreshing,
    onRefresh,
    userId: user?.id,
    onBack,
    onToggleLike,
    onToggleSave,
    onSharePost,
    onComment,
    onDeletePost,

    // comments
    commentsVisible: commentsController.commentsVisible,
    comments: commentsController.comments,
    commentsLoading: commentsController.commentsLoading,
    commentInput: commentsController.commentInput,
    setCommentInput: commentsController.setCommentInput,
    commentSubmitting: commentsController.commentSubmitting,
    editingCommentId: commentsController.editingCommentId,
    commentsCurrentUserId: commentsController.currentUserId,
    closeComments: commentsController.closeComments,
    submitComment: commentsController.submitComment,
    startEditComment: commentsController.startEditComment,
    cancelEditComment: commentsController.cancelEditComment,
    deleteComment: commentsController.deleteComment,
  };
}

export type MyPostsViewModel = ReturnType<typeof useMyPosts>;
