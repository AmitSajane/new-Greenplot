import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HubStackParamList } from '../../../navigation/HubStack';
import { useAuth } from '../../../context/AuthContext';
import {
  CATEGORIES,
  COMMUNITY_STATS,
  GUIDES,
  KISAN_REWARD,
  MEDIA_RULES,
  REFERRAL,
  SPOTLIGHT,
  TOP_CONTRIBUTORS,
  type CategoryKey,
  type FeedPost,
  type StoryItem,
} from '../constants/communityData';
import { activeStories, checkPhoto, checkVideo, storiesInLast24h } from '../utils/mediaRules';
import { communityApi } from '../utils/communityApi';

type NavigationProp = NativeStackNavigationProp<HubStackParamList>;
type MediaKind = 'image' | 'video';
export type MediaSource = 'camera-photo' | 'camera-video' | 'gallery-photo' | 'gallery-video';

export interface PickedMedia {
  uri: string;
  base64?: string;
  mediaType: MediaKind;
  durationSec?: number;
  sizeLabel?: string;
}

export interface PostDraft {
  text: string;
  category: CategoryKey;
  media: PickedMedia | null;
}

const EMPTY_DRAFT: PostDraft = { text: '', category: 'tips', media: null };

// Defensive optional require — matches the pattern used in AIAssistantScreen.
type PickerFn = (options: Record<string, unknown>) => Promise<{
  didCancel?: boolean;
  assets?: { uri?: string; base64?: string; fileSize?: number; duration?: number }[];
}>;
let ImagePicker: { launchImageLibrary?: PickerFn; launchCamera?: PickerFn } | null;
try {
  ImagePicker = require('react-native-image-picker');
} catch {
  ImagePicker = null;
}

/** Pick + validate a photo/video against the storage-conscious media rules.
 * Photos are downscaled/compressed at pick-time; videos are hard-limited on
 * duration and size (no client-side trim/compress available yet). */
async function pickAndValidateMedia(source: MediaSource): Promise<PickedMedia | null> {
  const isVideo = source.endsWith('video');
  const isCamera = source.startsWith('camera');
  const launch = isCamera ? ImagePicker?.launchCamera : ImagePicker?.launchImageLibrary;
  if (!launch) {
    Alert.alert('Not available', 'Camera/gallery access is not available on this device.');
    return null;
  }
  const options = isVideo
    ? { mediaType: 'video', videoQuality: 'low', durationLimit: MEDIA_RULES.video.maxSec, selectionLimit: 1, includeBase64: true }
    : { mediaType: 'photo', quality: 0.7, maxWidth: 1080, maxHeight: 1080, selectionLimit: 1, includeBase64: true };

  const response = await launch(options);
  const asset = response.assets?.[0];
  if (response.didCancel || !asset?.uri) return null;

  const check = isVideo ? checkVideo(asset) : checkPhoto(asset);
  if (!check.ok) {
    Alert.alert("Can't use this file", check.message);
    return null;
  }

  return {
    uri: asset.uri,
    base64: asset.base64,
    mediaType: isVideo ? 'video' : 'image',
    durationSec: asset.duration != null ? Math.round(asset.duration) : undefined,
    sizeLabel: check.sizeLabel,
  };
}

const INVITE_MESSAGE =
  'Join me on GreenPlot — the community where farmers share tips, success stories & earn rewards. Download now! 🌱';

export function useCommunityHub() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [category, setCategory] = useState<CategoryKey>('all');

  // Load the real feed once the user is known (falls back to an empty feed in
  // mock mode). Refetches on user change so liked/saved flags match whoever
  // is actually logged in.
  useEffect(() => {
    if (!communityApi.enabled) return;
    communityApi.fetchPosts(user?.id).then(setPosts);
  }, [user?.id]);

  const visiblePosts = useMemo(
    () => (category === 'all' ? posts : posts.filter(p => p.category === category)),
    [posts, category],
  );

  // ── engagement (immutable, only the touched post gets a new reference) ──────
  // Optimistic update first, then persisted via RPC/table write; reverted if
  // the write fails.
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

  const onSharePost = useCallback(async (id: string) => {
    const post = posts.find(p => p.id === id);
    try {
      await Share.share({ message: `${post?.authorName} on GreenPlot:\n\n${post?.text}` });
    } catch {
      /* user dismissed share sheet */
    }
  }, [posts]);

  const onComment = useCallback(() => navigation.navigate('CommunityQuestions'), [navigation]);

  // ── post composer ────────────────────────────────────────────────────────
  const [postComposerVisible, setPostComposerVisible] = useState(false);
  const [postDraft, setPostDraft] = useState<PostDraft>(EMPTY_DRAFT);
  const [postMediaBusy, setPostMediaBusy] = useState(false);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [pendingAutoPick, setPendingAutoPick] = useState<'photo' | 'video' | null>(null);

  const pickPostMedia = useCallback(async (source: MediaSource) => {
    setPostMediaBusy(true);
    try {
      const media = await pickAndValidateMedia(source);
      if (media) setPostDraft(prev => ({ ...prev, media }));
    } finally {
      setPostMediaBusy(false);
    }
  }, []);

  const openPostComposer = useCallback((autoPick?: 'photo' | 'video') => {
    setPostDraft(EMPTY_DRAFT);
    setPostComposerVisible(true);
    // Don't launch the native picker yet — the modal's slide-in animation is
    // still playing, and presenting a second full-screen picker mid-transition
    // makes it silently fail or stall on iOS/Android. Wait for onShow instead.
    setPendingAutoPick(autoPick ?? null);
  }, []);

  const onPostComposerShown = useCallback(() => {
    if (!pendingAutoPick) return;
    pickPostMedia(pendingAutoPick === 'photo' ? 'gallery-photo' : 'gallery-video');
    setPendingAutoPick(null);
  }, [pendingAutoPick, pickPostMedia]);

  const closePostComposer = useCallback(() => setPostComposerVisible(false), []);
  const setPostText = useCallback((text: string) => setPostDraft(prev => ({ ...prev, text })), []);
  const setPostCategory = useCallback((cat: CategoryKey) => setPostDraft(prev => ({ ...prev, category: cat })), []);
  const clearPostMedia = useCallback(() => setPostDraft(prev => ({ ...prev, media: null })), []);

  const submitPost = useCallback(async () => {
    const draftMedia = postDraft.media;
    if (!postDraft.text.trim() && !draftMedia) {
      Alert.alert('Nothing to post', 'Add a photo/video or write something first.');
      return;
    }
    if (!user?.id) {
      Alert.alert('Not signed in', 'Please sign in again and retry.');
      return;
    }

    const categoryDef = CATEGORIES.find(c => c.key === postDraft.category) ?? CATEGORIES[0];
    const mediaType: FeedPost['media']['type'] = draftMedia ? draftMedia.mediaType : 'text';

    setPostSubmitting(true);
    try {
      let mediaUrl: string | undefined;
      if (communityApi.enabled && draftMedia) {
        const uploaded = await communityApi.uploadMedia(draftMedia.base64, draftMedia.mediaType, user.id, 'post-media');
        if ('error' in uploaded) {
          Alert.alert("Couldn't upload", uploaded.error);
          return;
        }
        mediaUrl = uploaded.url;
      }

      let postId = `local-${Date.now()}`;
      if (communityApi.enabled) {
        const created = await communityApi.createPost({
          authorId: user.id,
          category: postDraft.category,
          text: postDraft.text.trim(),
          mediaType,
          mediaUrl,
        });
        if ('error' in created) {
          Alert.alert("Couldn't post", created.error);
          return;
        }
        postId = created.id;
      }

      setPosts(prev => [
        {
          id: postId,
          authorName: user.name || 'You',
          authorInitials: (user.name || 'You').slice(0, 2).toUpperCase(),
          avatarTone: 'green',
          role: user.role || 'farmer',
          verified: false,
          location: user.location || 'Your farm',
          time: 'Just now',
          category: postDraft.category,
          categoryLabel: categoryDef.label,
          categoryEmoji: categoryDef.emoji,
          text: postDraft.text.trim(),
          media: draftMedia ? { type: mediaType, uris: [mediaUrl || draftMedia.uri] } : { type: 'text', uris: [] },
          likes: 0,
          comments: 0,
          liked: false,
          saved: false,
        },
        ...prev,
      ]);
      setPostComposerVisible(false);
    } finally {
      setPostSubmitting(false);
    }
  }, [postDraft, user]);

  const onAddPhoto = useCallback(() => openPostComposer('photo'), [openPostComposer]);
  const onAddVideo = useCallback(() => openPostComposer('video'), [openPostComposer]);
  const onWritePost = useCallback(() => openPostComposer(), [openPostComposer]);

  // ── stories (24h ephemeral, persisted + auto-purged once Supabase is on) ────
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [storyComposerVisible, setStoryComposerVisible] = useState(false);
  const [pendingStory, setPendingStory] = useState<PickedMedia | null>(null);
  const [storyMediaBusy, setStoryMediaBusy] = useState(false);
  const [storySubmitting, setStorySubmitting] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const visibleStories = useMemo(() => activeStories(stories), [stories]);

  const loadStories = useCallback(async () => {
    if (!communityApi.enabled || !user?.id) return;
    await communityApi.purgeExpiredStories(user.id); // deletes the row + storage file, not just hides it
    setStories(await communityApi.fetchMyStories(user.id));
  }, [user?.id]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  // Hide expired stories instantly client-side, and re-sync with the server
  // periodically so the underlying files actually get deleted while the app
  // stays open (not just on the next cold start).
  useEffect(() => {
    const id = setInterval(() => {
      setStories(prev => activeStories(prev));
      loadStories();
    }, 60_000);
    return () => clearInterval(id);
  }, [loadStories]);

  const openStoryComposer = useCallback(() => {
    setPendingStory(null);
    setStoryComposerVisible(true);
  }, []);
  const closeStoryComposer = useCallback(() => {
    setStoryComposerVisible(false);
    setPendingStory(null);
  }, []);

  const pickStoryMedia = useCallback(async (source: MediaSource) => {
    setStoryMediaBusy(true);
    try {
      const media = await pickAndValidateMedia(source);
      if (media) setPendingStory(media);
    } finally {
      setStoryMediaBusy(false);
    }
  }, []);

  const discardPendingStory = useCallback(() => setPendingStory(null), []);

  const confirmStory = useCallback(async () => {
    if (!pendingStory) return;
    if (storiesInLast24h(stories) >= MEDIA_RULES.story.maxPerDay) {
      Alert.alert(
        'Daily limit reached',
        `You can share up to ${MEDIA_RULES.story.maxPerDay} stories a day. Try again tomorrow!`,
      );
      return;
    }
    if (!user?.id) {
      Alert.alert('Not signed in', 'Please sign in again and retry.');
      return;
    }

    setStorySubmitting(true);
    try {
      if (communityApi.enabled) {
        const uploaded = await communityApi.uploadMedia(pendingStory.base64, pendingStory.mediaType, user.id, 'stories');
        if ('error' in uploaded) {
          Alert.alert("Couldn't upload", uploaded.error);
          return;
        }
        const created = await communityApi.createStory({
          authorId: user.id,
          mediaType: pendingStory.mediaType,
          mediaUrl: uploaded.url,
          mediaPath: uploaded.path,
          durationSec: pendingStory.durationSec,
        });
        if ('error' in created) {
          Alert.alert("Couldn't post", created.error);
          return;
        }
        setStories(prev => [...prev, created]);
      } else {
        const now = Date.now();
        setStories(prev => [
          ...prev,
          {
            id: `story-${now}`,
            mediaType: pendingStory.mediaType,
            uri: pendingStory.uri,
            durationSec: pendingStory.durationSec,
            createdAt: now,
            expiresAt: now + MEDIA_RULES.story.expiryHours * 60 * 60 * 1000,
          },
        ]);
      }

      setPendingStory(null);
      setStoryComposerVisible(false);
    } finally {
      setStorySubmitting(false);
    }
  }, [pendingStory, stories, user]);

  const openStoryViewer = useCallback(() => {
    if (!visibleStories.length) return;
    setViewerIndex(0);
    setViewerOpen(true);
  }, [visibleStories.length]);

  const closeStoryViewer = useCallback(() => setViewerOpen(false), []);

  const onStoryTrayPress = useCallback(() => {
    if (visibleStories.length) openStoryViewer();
    else openStoryComposer();
  }, [visibleStories.length, openStoryViewer, openStoryComposer]);

  // ── growth features ────────────────────────────────────────────────────────
  const onReferEarn = useCallback(async () => {
    try {
      await Share.share({ message: INVITE_MESSAGE });
    } catch {
      /* dismissed */
    }
  }, []);

  const onRewards = useCallback(
    () =>
      Alert.alert(
        '🪙 Kisan Rewards',
        `You have ${KISAN_REWARD.coins} coins and a ${KISAN_REWARD.streakDays}-day streak!\nKeep posting & helping to reach ${KISAN_REWARD.nextLevelLabel} level.`,
      ),
    [],
  );

  const onLeaderboard = useCallback(() => navigation.navigate('CommunityQuestions'), [navigation]);
  const onSpotlight = useCallback(
    () => navigation.navigate('NewsDetail', { id: 'spotlight', title: 'Story of the Week' }),
    [navigation],
  );
  const onGuidesAll = useCallback(() => navigation.navigate('ModernFarmingTech'), [navigation]);
  const onGuidePress = useCallback(
    (id: string, title: string) => navigation.navigate('NewsDetail', { id, title }),
    [navigation],
  );
  const onSearch = useCallback(() => navigation.navigate('FilterByCrop'), [navigation]);

  return {
    // data
    stats: COMMUNITY_STATS,
    reward: KISAN_REWARD,
    referral: REFERRAL,
    contributors: TOP_CONTRIBUTORS,
    spotlight: SPOTLIGHT,
    guides: GUIDES,
    categories: CATEGORIES,
    posts: visiblePosts,
    category,

    // engagement handlers
    setCategory,
    onToggleLike,
    onToggleSave,
    onSharePost,
    onComment,
    onAddPhoto,
    onAddVideo,
    onWritePost,
    onReferEarn,
    onRewards,
    onLeaderboard,
    onSpotlight,
    onGuidesAll,
    onGuidePress,
    onSearch,

    // post composer
    postComposerVisible,
    postDraft,
    postMediaBusy,
    postSubmitting,
    closePostComposer,
    onPostComposerShown,
    setPostText,
    setPostCategory,
    pickPostMedia,
    clearPostMedia,
    submitPost,

    // stories
    stories: visibleStories,
    storyComposerVisible,
    pendingStory,
    storyMediaBusy,
    storySubmitting,
    viewerOpen,
    viewerIndex,
    setViewerIndex,
    onStoryTrayPress,
    openStoryComposer,
    closeStoryComposer,
    pickStoryMedia,
    discardPendingStory,
    confirmStory,
    closeStoryViewer,
  };
}

export type CommunityHubViewModel = ReturnType<typeof useCommunityHub>;
