import { supabase } from '../../../services/supabase';
import { storageApi } from '../../../services/storageApi';
import { CATEGORIES, AvatarTone, CategoryKey, FeedPost, MEDIA_RULES, PostComment, StoryItem } from '../constants/communityData';

const AVATAR_TONES: readonly AvatarTone[] = ['green', 'amber', 'blue', 'red', 'purple'];

/** Deterministic, decorative avatar tone per author — no DB column for it.
 * Exported so callers building an optimistic row locally (e.g. a just-added
 * comment) can match the same tone the feed would render after a refetch. */
export function toneForId(id: string): AvatarTone {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

interface PostRow {
  id: string;
  author_id: string;
  category: CategoryKey;
  title: string | null;
  text: string | null;
  media_type: FeedPost['media']['type'];
  media_urls: string[] | null;
  poll_options: string[] | null;
  earned_label: string | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
}

interface ProfileRow {
  id: string;
  name: string | null;
  role: string | null;
  location: string | null;
}

/** Tallies raw poll_votes rows into per-option counts/percentages plus the
 * current viewer's own vote, so the feed can render live bars and a "you
 * voted" state without a second round trip. */
function buildPollResult(
  options: string[],
  votes: { optionIndex: number; userId: string }[],
  currentUserId: string | undefined,
): FeedPost['poll'] {
  const counts = options.map(() => 0);
  let myVote: number | null = null;
  for (const v of votes) {
    if (v.optionIndex >= 0 && v.optionIndex < counts.length) counts[v.optionIndex] += 1;
    if (currentUserId && v.userId === currentUserId) myVote = v.optionIndex;
  }
  const totalVotes = counts.reduce((a, b) => a + b, 0);
  return {
    options: options.map((label, i) => ({ label, votes: counts[i], pct: totalVotes ? Math.round((counts[i] / totalVotes) * 100) : 0 })),
    totalVotes,
    myVote,
  };
}

function mapPostRow(
  row: PostRow,
  author: ProfileRow | undefined,
  liked: boolean,
  saved: boolean,
  pollVotes: { optionIndex: number; userId: string }[] | undefined,
  currentUserId: string | undefined,
): FeedPost {
  const categoryDef = CATEGORIES.find(c => c.key === row.category) ?? CATEGORIES[0];
  const name = author?.name?.trim() || 'GreenPlot Farmer';
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: name,
    authorInitials: name.slice(0, 2).toUpperCase(),
    avatarTone: toneForId(row.author_id),
    role: author?.role === 'owner' ? 'owner' : 'farmer',
    verified: false,
    location: author?.location || '',
    time: relativeTime(row.created_at),
    category: row.category,
    categoryLabel: categoryDef.label,
    categoryEmoji: categoryDef.emoji,
    title: row.title || undefined,
    text: row.text || '',
    media: { type: row.media_type, uris: row.media_urls || [], earnedLabel: row.earned_label || undefined },
    likes: row.likes_count ?? 0,
    comments: row.comments_count ?? 0,
    liked,
    saved,
    poll: row.media_type === 'poll' && row.poll_options ? buildPollResult(row.poll_options, pollVotes || [], currentUserId) : undefined,
  };
}

interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  text: string;
  created_at: string;
}

function mapCommentRow(row: CommentRow, author: ProfileRow | undefined): PostComment {
  const name = author?.name?.trim() || 'GreenPlot Farmer';
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorName: name,
    authorInitials: name.slice(0, 2).toUpperCase(),
    avatarTone: toneForId(row.author_id),
    text: row.text,
    time: relativeTime(row.created_at),
  };
}

export const communityApi = {
  get enabled() {
    return !!supabase;
  },

  /** Upload a picked photo/video or recorded voice note to Supabase Storage.
   * Returns the public URL and bucket-relative path (the latter needed later
   * to delete the file), or the actual failure reason so it can be shown to
   * the user. Prefers base64 — the path that actually works reliably in React
   * Native for photos/audio — but falls back to a URI/blob upload when it's
   * missing, which is always the case for picked video assets (the picker
   * library doesn't produce base64 for multi-MB video files). `mime` is
   * required for audio since the recorder's output codec varies by platform
   * (webm on Android, mp4/aac on iOS) and can't be assumed like it can for
   * photo/video. */
  async uploadMedia(
    base64: string | undefined,
    mediaType: 'image' | 'video' | 'audio',
    userId: string,
    bucket: 'post-media' | 'stories',
    mime?: string,
    uri?: string,
  ): Promise<{ url: string; path: string } | { error: string }> {
    if (!supabase) return { error: 'Backend not configured' };
    const resolvedMime = mime || (mediaType === 'video' ? 'video/mp4' : mediaType === 'audio' ? 'audio/m4a' : 'image/jpeg');
    if (base64) return storageApi.uploadBase64Detailed(base64, resolvedMime, userId, bucket);
    if (uri) return storageApi.uploadFromUriDetailed(uri, resolvedMime, userId, bucket);
    return { error: 'Could not read the selected file. Please try a different one.' };
  },

  async fetchPosts(currentUserId?: string): Promise<FeedPost[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('posts')
      .select('id, author_id, category, title, text, media_type, media_urls, poll_options, earned_label, likes_count, comments_count, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !data?.length) return [];

    // Fetch authors separately rather than via an embedded join — PostgREST's
    // implicit embeds act like an inner join, so if it can't resolve for any
    // reason it silently drops the whole post row, not just the author info.
    const authorIds = [...new Set(data.map(row => row.author_id))];
    const { data: profileRows } = await supabase.from('profiles').select('id, name, role, location').in('id', authorIds);
    const profileById = new Map((profileRows as ProfileRow[] | null || []).map(p => [p.id, p]));

    const postIds = data.map(row => row.id);
    let likedIds = new Set<string>();
    let savedIds = new Set<string>();
    if (currentUserId) {
      const [{ data: likes }, { data: saves }] = await Promise.all([
        supabase.from('post_likes').select('post_id').eq('user_id', currentUserId).in('post_id', postIds),
        supabase.from('post_saves').select('post_id').eq('user_id', currentUserId).in('post_id', postIds),
      ]);
      likedIds = new Set((likes || []).map(l => l.post_id));
      savedIds = new Set((saves || []).map(s => s.post_id));
    }

    // Poll vote tallies — fetched once for every poll post on this page and
    // grouped client-side, same batching approach as likes/saves above.
    const pollPostIds = (data as PostRow[]).filter(row => row.media_type === 'poll').map(row => row.id);
    const votesByPost = new Map<string, { optionIndex: number; userId: string }[]>();
    if (pollPostIds.length) {
      const { data: voteRows } = await supabase.from('poll_votes').select('post_id, user_id, option_index').in('post_id', pollPostIds);
      for (const v of voteRows || []) {
        const arr = votesByPost.get(v.post_id) || [];
        arr.push({ optionIndex: v.option_index, userId: v.user_id });
        votesByPost.set(v.post_id, arr);
      }
    }

    return (data as PostRow[]).map(row =>
      mapPostRow(row, profileById.get(row.author_id), likedIds.has(row.id), savedIds.has(row.id), votesByPost.get(row.id), currentUserId),
    );
  },

  /** Atomically like/unlike a post (also updates posts.likes_count). Returns
   * the new liked state, or null if the call failed (caller should revert
   * its optimistic UI update). */
  async toggleLike(postId: string): Promise<boolean | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.rpc('toggle_post_like', { p_post_id: postId });
    if (error) return null;
    return !!data;
  },

  /** Save/unsave has no shared counter, so a plain insert/delete under RLS
   * (auth.uid() = user_id) is enough — no RPC needed. */
  async toggleSave(postId: string, userId: string, currentlySaved: boolean): Promise<boolean> {
    if (!supabase) return false;
    if (currentlySaved) {
      const { error } = await supabase.from('post_saves').delete().eq('post_id', postId).eq('user_id', userId);
      return !error;
    }
    const { error } = await supabase.from('post_saves').insert({ post_id: postId, user_id: userId });
    return !error;
  },

  async createPost(input: {
    authorId: string;
    category: CategoryKey;
    title?: string;
    text: string;
    mediaType: FeedPost['media']['type'];
    mediaUrl?: string;
    pollOptions?: string[];
  }): Promise<{ id: string; createdAt: string } | { error: string }> {
    if (!supabase) return { error: 'Backend not configured' };
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: input.authorId,
        category: input.category,
        title: input.title || null,
        text: input.text,
        media_type: input.mediaType,
        media_urls: input.mediaUrl ? [input.mediaUrl] : [],
        poll_options: input.pollOptions?.length ? input.pollOptions : null,
      })
      .select('id, created_at')
      .single();
    if (error || !data) return { error: error?.message || 'Insert failed' };
    return { id: data.id, createdAt: data.created_at };
  },

  /** Cast/change this user's vote on a poll post — one vote per user,
   * upserted server-side (see cast_poll_vote in supabase/add_poll_posts.sql). */
  async castPollVote(postId: string, optionIndex: number): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.rpc('cast_poll_vote', { p_post_id: postId, p_option_index: optionIndex });
    return !error;
  },

  /** Delete a post — scoped to the author via the query itself (belt and
   * braces alongside the RLS policy), so a stray id can't delete someone
   * else's post. */
  async deletePost(postId: string, authorId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('posts').delete().eq('id', postId).eq('author_id', authorId);
    return !error;
  },

  async fetchComments(postId: string): Promise<PostComment[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('comments')
      .select('id, post_id, author_id, text, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error || !data) return [];

    const authorIds = [...new Set(data.map(row => row.author_id))];
    const { data: profileRows } = await supabase.from('profiles').select('id, name, role, location').in('id', authorIds);
    const profileById = new Map((profileRows as ProfileRow[] | null || []).map(p => [p.id, p]));

    return (data as CommentRow[]).map(row => mapCommentRow(row, profileById.get(row.author_id)));
  },

  async addComment(postId: string, authorId: string, text: string): Promise<{ id: string; createdAt: string } | { error: string }> {
    if (!supabase) return { error: 'Backend not configured' };
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: authorId, text })
      .select('id, created_at')
      .single();
    if (error || !data) return { error: error?.message || 'Insert failed' };
    return { id: data.id, createdAt: data.created_at };
  },

  /** Edit/delete are both scoped to the author via the query itself (belt and
   * braces alongside the RLS policy), matching the deletePost pattern. */
  async updateComment(commentId: string, authorId: string, text: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('comments').update({ text }).eq('id', commentId).eq('author_id', authorId);
    return !error;
  },

  async deleteComment(commentId: string, authorId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('author_id', authorId);
    return !error;
  },

  async fetchMyStories(userId: string): Promise<StoryItem[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('stories')
      .select('id, media_type, media_url, duration_sec, created_at, expires_at')
      .eq('author_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map(row => ({
      id: row.id,
      mediaType: row.media_type as 'image' | 'video',
      uri: row.media_url,
      durationSec: row.duration_sec ?? undefined,
      createdAt: new Date(row.created_at).getTime(),
      expiresAt: new Date(row.expires_at).getTime(),
    }));
  },

  async createStory(input: {
    authorId: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    mediaPath: string;
    durationSec?: number;
  }): Promise<StoryItem | { error: string }> {
    if (!supabase) return { error: 'Backend not configured' };
    const expiresAt = new Date(Date.now() + MEDIA_RULES.story.expiryHours * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('stories')
      .insert({
        author_id: input.authorId,
        media_type: input.mediaType,
        media_url: input.mediaUrl,
        media_path: input.mediaPath,
        duration_sec: input.durationSec ?? null,
        expires_at: expiresAt,
      })
      .select('id, created_at, expires_at')
      .single();
    if (error || !data) return { error: error?.message || 'Insert failed' };
    return {
      id: data.id,
      mediaType: input.mediaType,
      uri: input.mediaUrl,
      durationSec: input.durationSec,
      createdAt: new Date(data.created_at).getTime(),
      expiresAt: new Date(data.expires_at).getTime(),
    };
  },

  /** Delete this user's already-expired stories — both the DB row and the
   * underlying storage file, so expiry actually frees up storage instead of
   * just hiding the row. Runs opportunistically (on mount / periodically)
   * rather than via a server-side scheduled job. */
  async purgeExpiredStories(userId: string): Promise<void> {
    if (!supabase) return;
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('stories')
      .select('id, media_path')
      .eq('author_id', userId)
      .lt('expires_at', nowIso);
    if (error || !data?.length) return;
    await Promise.all(data.map(row => storageApi.remove(row.media_path, 'stories')));
    await supabase.from('stories').delete().eq('author_id', userId).lt('expires_at', nowIso);
  },
};
