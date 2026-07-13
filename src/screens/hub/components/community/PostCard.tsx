import React, { useCallback, useState } from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { FeedPost } from '../../constants/communityData';
import { Avatar } from './Avatar';
import { Linkify } from './Linkify';
import { InlineMediaPlayer } from './InlineMediaPlayer';

interface Props {
  post: FeedPost;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onShare: (id: string) => void;
  onComment: (id: string) => void;
  /** Only passed by the caller for the viewer's own posts — when present,
   * the "…" button opens a menu with a delete option. */
  onDelete?: (id: string) => void;
  /** Only meaningful for blog posts — shows a "Read story" button that opens
   * the full, untruncated post. */
  onReadStory?: (post: FeedPost) => void;
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

// Deterministic pseudo-random bar heights so a voice post's waveform doesn't
// jitter on re-render (no real waveform analysis of the audio itself).
const WAVEFORM_HEIGHTS = [8, 16, 11, 22, 14, 26, 18, 10, 20, 24, 12, 17, 22, 9, 26, 15, 11, 21, 24, 13];

const TEXT_TRUNCATE_LENGTH = 220;

function PostMediaView({ post }: { post: FeedPost }) {
  const { media } = post;
  const [playing, setPlaying] = useState(false);
  const play = useCallback(() => setPlaying(true), []);
  const stop = useCallback(() => setPlaying(false), []);

  if (media.type === 'text' || media.type === 'audio') return null;

  if (media.type === 'grid') {
    return (
      <View style={s.pGrid}>
        {media.uris.map(uri => (
          <ImageBackground key={uri} source={{ uri }} style={s.pGridCell} resizeMode="cover" />
        ))}
      </View>
    );
  }

  if (media.type === 'video' && playing) {
    return (
      <View style={s.pVideoPlayerWrap}>
        <InlineMediaPlayer uri={media.uris[0]} kind="video" autoPlay />
        <TouchableOpacity style={s.pVideoCloseBtn} activeOpacity={0.8} onPress={stop} hitSlop={8}>
          <Ionicons name="close" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  // image, or video thumbnail before playback starts
  const thumbnail = (
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

  if (media.type !== 'video') return thumbnail;
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={play}>
      {thumbnail}
    </TouchableOpacity>
  );
}

function AudioPostView({ post }: { post: FeedPost }) {
  const { media } = post;
  const [playing, setPlaying] = useState(false);
  if (media.type !== 'audio' || !media.uris[0]) return null;

  return (
    <View style={s.audioCard}>
      <TouchableOpacity
        style={s.audioPlayBtn}
        activeOpacity={0.8}
        onPress={() => setPlaying(p => !p)}
        hitSlop={6}
      >
        <Ionicons name={playing ? 'pause' : 'play'} size={18} color="#fff" />
      </TouchableOpacity>
      <View style={s.audioBody}>
        {playing ? (
          <InlineMediaPlayer uri={media.uris[0]} kind="audio" autoPlay style={s.audioInlinePlayer} />
        ) : (
          <View style={s.audioWaveform}>
            {WAVEFORM_HEIGHTS.map((h, i) => (
              <View key={i} style={[s.audioWaveBar, { height: h }]} />
            ))}
          </View>
        )}
        {!!media.durationLabel && <Text style={s.audioDuration}>{media.durationLabel}</Text>}
      </View>
    </View>
  );
}

function PostText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > TEXT_TRUNCATE_LENGTH;
  const shown = expanded || !isLong ? text : `${text.slice(0, TEXT_TRUNCATE_LENGTH).trimEnd()}…`;

  return (
    <View>
      <Linkify text={shown} style={s.pText} linkStyle={s.pLink} />
      {isLong && (
        <TouchableOpacity onPress={() => setExpanded(e => !e)} hitSlop={4}>
          <Text style={s.pReadMore}>{expanded ? 'Show less' : 'Read more'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function PostCardBase({ post, onToggleLike, onToggleSave, onShare, onComment, onDelete, onReadStory }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const like = useCallback(() => onToggleLike(post.id), [onToggleLike, post.id]);
  const save = useCallback(() => onToggleSave(post.id), [onToggleSave, post.id]);
  const share = useCallback(() => onShare(post.id), [onShare, post.id]);
  const comment = useCallback(() => onComment(post.id), [onComment, post.id]);
  const toggleMenu = useCallback(() => setMenuOpen(open => !open), []);
  const deletePost = useCallback(() => {
    setMenuOpen(false);
    onDelete?.(post.id);
  }, [onDelete, post.id]);
  const readStory = useCallback(() => onReadStory?.(post), [onReadStory, post]);
  const tint = categoryTint[post.category] ?? categoryTint.all;
  const showReadStory = !!post.title && !!onReadStory;

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
        {onDelete ? (
          <TouchableOpacity onPress={toggleMenu} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#9EB8A8" />
          </TouchableOpacity>
        ) : (
          <Ionicons name="ellipsis-horizontal" size={18} color="#9EB8A8" />
        )}
      </View>

      {menuOpen && onDelete && (
        <View style={s.postMenu}>
          <TouchableOpacity style={s.postMenuItem} activeOpacity={0.7} onPress={deletePost}>
            <Ionicons name="trash-outline" size={15} color="#C02828" />
            <Text style={s.postMenuItemDangerText}>Delete post</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* category tag */}
      <Text style={[s.pTag, { backgroundColor: tint.bg, color: tint.fg }]}>
        {post.categoryEmoji} {post.categoryLabel}
      </Text>

      {/* text (links tappable, long posts collapsible) */}
      <PostText text={post.text} />

      {/* media */}
      <PostMediaView post={post} />
      <AudioPostView post={post} />

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
        <TouchableOpacity style={showReadStory ? undefined : s.pSave} activeOpacity={0.7} onPress={save} hitSlop={6}>
          <Ionicons name={post.saved ? 'bookmark' : 'bookmark-outline'} size={18} color={post.saved ? '#1A6B3A' : '#6B8074'} />
        </TouchableOpacity>
        {showReadStory && (
          <TouchableOpacity style={s.pReadStory} activeOpacity={0.7} onPress={readStory} hitSlop={6}>
            <Text style={s.pReadStoryText}>Read story</Text>
            <Ionicons name="arrow-forward" size={14} color="#1A6B3A" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export const PostCard = React.memo(PostCardBase);
