import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { PostComment } from '../../constants/communityData';
import { Avatar } from './Avatar';

interface Props {
  visible: boolean;
  comments: PostComment[];
  loading: boolean;
  currentUserId?: string;
  input: string;
  submitting: boolean;
  editingCommentId: string | null;
  onChangeInput: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onEdit: (comment: PostComment) => void;
  onCancelEdit: () => void;
  onDelete: (commentId: string) => void;
}

function CommentRow({
  comment,
  isOwn,
  onEdit,
  onDelete,
}: {
  comment: PostComment;
  isOwn: boolean;
  onEdit: (comment: PostComment) => void;
  onDelete: (commentId: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen(open => !open), []);
  const edit = useCallback(() => {
    setMenuOpen(false);
    onEdit(comment);
  }, [onEdit, comment]);
  const del = useCallback(() => {
    setMenuOpen(false);
    onDelete(comment.id);
  }, [onDelete, comment.id]);

  return (
    <View style={s.commentRow}>
      <Avatar initials={comment.authorInitials} tone={comment.avatarTone} />
      <View style={s.flex1}>
        <View style={s.commentBody}>
          <View style={s.commentNameRow}>
            <Text style={s.commentName}>{comment.authorName}</Text>
            {isOwn && (
              <TouchableOpacity style={s.commentMenuBtn} onPress={toggleMenu} hitSlop={8}>
                <Ionicons name="ellipsis-horizontal" size={14} color="#9EB8A8" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={s.commentText}>{comment.text}</Text>
        </View>
        <Text style={s.commentTime}>{comment.time}</Text>

        {menuOpen && (
          <View style={s.commentMenu}>
            <TouchableOpacity style={s.commentMenuItem} activeOpacity={0.7} onPress={edit}>
              <Ionicons name="pencil-outline" size={14} color="#1C2E18" />
              <Text style={s.commentMenuItemText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.commentMenuItem} activeOpacity={0.7} onPress={del}>
              <Ionicons name="trash-outline" size={14} color="#C02828" />
              <Text style={s.commentMenuItemDangerText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

/** Flat comment thread for a single post — works the same for image, video,
 * blog and audio posts since comments only ever reference a post id. */
export const CommentsModal = React.memo(
  ({
    visible,
    comments,
    loading,
    currentUserId,
    input,
    submitting,
    editingCommentId,
    onChangeInput,
    onClose,
    onSubmit,
    onEdit,
    onCancelEdit,
    onDelete,
  }: Props) => {
    const renderItem = useCallback(
      ({ item }: ListRenderItemInfo<PostComment>) => (
        <CommentRow comment={item} isOwn={item.authorId === currentUserId} onEdit={onEdit} onDelete={onDelete} />
      ),
      [currentUserId, onEdit, onDelete],
    );
    const keyExtractor = useCallback((item: PostComment) => item.id, []);
    const canSend = !!input.trim() && !submitting;

    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={s.safeAreaModal}>
          <View style={s.commentsHeader}>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="arrow-back" size={20} color="#1C2E18" />
            </TouchableOpacity>
            <Text style={s.commentsTitle}>Comments</Text>
          </View>

          <KeyboardAvoidingView style={s.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {loading ? (
              <View style={s.commentsLoading}>
                <ActivityIndicator color="#1A6B3A" />
              </View>
            ) : (
              <FlatList
                style={s.commentsList}
                data={comments}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={s.commentsListContent}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={s.commentsEmpty}>
                    <Ionicons name="chatbubble-outline" size={28} color="#C8D8CC" />
                    <Text style={s.commentsEmptyText}>No comments yet. Be the first to share your thoughts!</Text>
                  </View>
                }
              />
            )}

            {editingCommentId && (
              <View style={s.commentEditingBanner}>
                <Text style={s.commentEditingText}>Editing comment</Text>
                <TouchableOpacity onPress={onCancelEdit} hitSlop={8}>
                  <Text style={s.commentEditingCancel}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            <SafeAreaView edges={['bottom']}>
              <View style={s.commentInputBar}>
                <TextInput
                  style={s.commentInput}
                  placeholder="Add a comment..."
                  placeholderTextColor="#9EB8A8"
                  multiline
                  value={input}
                  onChangeText={onChangeInput}
                />
                <TouchableOpacity
                  style={[s.commentSendBtn, !canSend && s.commentSendBtnDisabled]}
                  disabled={!canSend}
                  onPress={onSubmit}
                >
                  <Ionicons name={editingCommentId ? 'checkmark' : 'send'} size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  },
);
