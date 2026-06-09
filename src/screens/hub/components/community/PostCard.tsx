import React, { useCallback } from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { FeedPost } from '../../constants/communityData';
import { Avatar } from './Avatar';

interface Props {
  post: FeedPost;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onShare: (id: string) => void;
  onComment: (id: string) => void;
}

const categoryTint: Record<string, { bg: string; fg: string }> = {
  success: { bg: '#E4F4EC', fg: '#0F4A28' },
  vermicompost: { bg: '#F0E6D2', fg: '#8A5200' },
  organic: { bg: '#E4F4EC', fg: '#0F4A28' },
  tips: { bg: '#FDF5E0', fg: '#B87214' },
  pest: { bg: '#FDD0D0', fg: '#C02828' },
  questions: { bg: '#D4E8FC', fg: '#1A5299' },
  all: { bg: '#E4F4EC', fg: '#0F4A28' },
};

function PostMediaView({ post }: { post: FeedPost }) {
  const { media } = post;
  if (media.type === 'text') return null;
  if (media.type === 'grid') {
    return (
      <View style={s.pGrid}>
        {media.uris.map(uri => (
          <ImageBackground key={uri} source={{ uri }} style={s.pGridCell} resizeMode="cover" />
        ))}
      </View>
    );
  }
  // image or video
  return (
    <ImageBackground source={{ uri: media.uris[0] }} style={s.pMedia} resizeMode="cover">
      {!!media.earnedLabel && (
        <View style={s.earnBadge}>
          <Ionicons name="cash" size={12} color="#fff" />
          <Text style={s.earnText}>{media.earnedLabel}</Text>
        </View>
      )}
      {media.type === 'video' && (
        <>
          <View style={s.playWrap}>
            <View style={s.playBtn}>
              <Ionicons name="play" size={24} color="#0F4A28" />
            </View>
          </View>
          {!!media.durationLabel && <Text style={s.vidDur}>{media.durationLabel}</Text>}
        </>
      )}
    </ImageBackground>
  );
}

function PostCardBase({ post, onToggleLike, onToggleSave, onShare, onComment }: Props) {
  const like = useCallback(() => onToggleLike(post.id), [onToggleLike, post.id]);
  const save = useCallback(() => onToggleSave(post.id), [onToggleSave, post.id]);
  const share = useCallback(() => onShare(post.id), [onShare, post.id]);
  const comment = useCallback(() => onComment(post.id), [onComment, post.id]);
  const tint = categoryTint[post.category] ?? categoryTint.all;

  return (
    <View style={s.post}>
      {/* author */}
      <View style={s.pHead}>
        <Avatar initials={post.authorInitials} tone={post.avatarTone} />
        <View style={s.flex1}>
          <View style={s.pNameRow}>
            <Text style={s.pName}>{post.authorName}</Text>
            {post.verified && <Ionicons name="checkmark-circle" size={13} color="#1A5299" />}
            <Text style={[s.role, post.role === 'owner' ? s.roleOwner : s.roleFarmer]}>
              {post.role === 'owner' ? 'Owner' : 'Farmer'}
            </Text>
          </View>
          <Text style={s.pMeta}>
            {post.location} · {post.time}
          </Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={18} color="#9EB8A8" />
      </View>

      {/* category tag */}
      <Text style={[s.pTag, { backgroundColor: tint.bg, color: tint.fg }]}>
        {post.categoryEmoji} {post.categoryLabel}
      </Text>

      {/* text */}
      {!!post.text && <Text style={s.pText}>{post.text}</Text>}

      {/* media */}
      <PostMediaView post={post} />

      {/* engagement bar */}
      <View style={s.pBar}>
        <TouchableOpacity style={s.pAct} activeOpacity={0.7} onPress={like} hitSlop={6}>
          <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={18} color={post.liked ? '#C02828' : '#6B8074'} />
          <Text style={[s.pActText, post.liked && s.pActTextLiked]}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.pAct} activeOpacity={0.7} onPress={comment} hitSlop={6}>
          <Ionicons name="chatbubble-outline" size={17} color="#6B8074" />
          <Text style={s.pActText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.pAct} activeOpacity={0.7} onPress={share} hitSlop={6}>
          <Ionicons name="share-social-outline" size={17} color="#6B8074" />
          <Text style={s.pActText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.pSave} activeOpacity={0.7} onPress={save} hitSlop={6}>
          <Ionicons name={post.saved ? 'bookmark' : 'bookmark-outline'} size={18} color={post.saved ? '#1A6B3A' : '#6B8074'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const PostCard = React.memo(PostCardBase);
