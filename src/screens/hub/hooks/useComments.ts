import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { FeedPost, PostComment } from '../constants/communityData';
import { communityApi, toneForId } from '../utils/communityApi';

/** Comment thread for a single post at a time — shared by the main feed and
 * "My posts", both of which own their own FeedPost[] list and just need
 * their post's `comments` counter kept in sync as comments are added/removed. */
export function useComments(setPosts: React.Dispatch<React.SetStateAction<FeedPost[]>>) {
  const { user } = useAuth();
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const bumpCommentCount = useCallback(
    (postId: string, delta: number) => {
      setPosts(prev => prev.map(p => (p.id === postId ? { ...p, comments: Math.max(0, p.comments + delta) } : p)));
    },
    [setPosts],
  );

  const openComments = useCallback(async (postId: string) => {
    setActivePostId(postId);
    setCommentInput('');
    setEditingCommentId(null);
    if (!communityApi.enabled) {
      setComments([]);
      return;
    }
    setCommentsLoading(true);
    try {
      setComments(await communityApi.fetchComments(postId));
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const closeComments = useCallback(() => {
    setActivePostId(null);
    setComments([]);
    setCommentInput('');
    setEditingCommentId(null);
  }, []);

  const startEditComment = useCallback((comment: PostComment) => {
    setEditingCommentId(comment.id);
    setCommentInput(comment.text);
  }, []);

  const cancelEditComment = useCallback(() => {
    setEditingCommentId(null);
    setCommentInput('');
  }, []);

  const deleteComment = useCallback(
    (commentId: string) => {
      if (!user?.id || !activePostId) return;
      const postId = activePostId;
      Alert.alert('Delete comment', "This can't be undone.", [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const previous = comments;
            setComments(prev => prev.filter(c => c.id !== commentId));
            bumpCommentCount(postId, -1);
            if (editingCommentId === commentId) cancelEditComment();
            if (!communityApi.enabled) return;
            const ok = await communityApi.deleteComment(commentId, user.id);
            if (!ok) {
              setComments(previous);
              bumpCommentCount(postId, 1);
              Alert.alert("Couldn't delete", 'Please try again.');
            }
          },
        },
      ]);
    },
    [user?.id, activePostId, comments, editingCommentId, bumpCommentCount, cancelEditComment],
  );

  const submitComment = useCallback(async () => {
    const text = commentInput.trim();
    if (!text || !user?.id || !activePostId) return;
    const postId = activePostId;

    if (editingCommentId) {
      const commentId = editingCommentId;
      const previous = comments;
      setComments(prev => prev.map(c => (c.id === commentId ? { ...c, text } : c)));
      setEditingCommentId(null);
      setCommentInput('');
      if (!communityApi.enabled) return;
      setCommentSubmitting(true);
      try {
        const ok = await communityApi.updateComment(commentId, user.id, text);
        if (!ok) {
          setComments(previous);
          Alert.alert("Couldn't update", 'Please try again.');
        }
      } finally {
        setCommentSubmitting(false);
      }
      return;
    }

    setCommentInput('');
    if (!communityApi.enabled) return;
    setCommentSubmitting(true);
    try {
      const created = await communityApi.addComment(postId, user.id, text);
      if ('error' in created) {
        Alert.alert("Couldn't comment", created.error);
        return;
      }
      const newComment: PostComment = {
        id: created.id,
        postId,
        authorId: user.id,
        authorName: user.name || 'You',
        authorInitials: (user.name || 'You').trim().slice(0, 2).toUpperCase(),
        avatarTone: toneForId(user.id),
        text,
        time: 'Just now',
      };
      setComments(prev => [...prev, newComment]);
      bumpCommentCount(postId, 1);
    } finally {
      setCommentSubmitting(false);
    }
  }, [commentInput, user, activePostId, editingCommentId, comments, bumpCommentCount]);

  return {
    commentsVisible: activePostId !== null,
    comments,
    commentsLoading,
    commentInput,
    setCommentInput,
    commentSubmitting,
    editingCommentId,
    currentUserId: user?.id,
    openComments,
    closeComments,
    startEditComment,
    cancelEditComment,
    deleteComment,
    submitComment,
  };
}

export type CommentsController = ReturnType<typeof useComments>;
