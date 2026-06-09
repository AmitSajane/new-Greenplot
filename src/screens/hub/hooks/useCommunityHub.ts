import { useCallback, useMemo, useState } from 'react';
import { Alert, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HubStackParamList } from '../../../navigation/HubStack';
import {
  CATEGORIES,
  COMMUNITY_STATS,
  FEED_POSTS,
  GUIDES,
  KISAN_REWARD,
  REFERRAL,
  SPOTLIGHT,
  TOP_CONTRIBUTORS,
  type CategoryKey,
  type FeedPost,
  type MediaType,
} from '../constants/communityData';

type NavigationProp = NativeStackNavigationProp<HubStackParamList>;

// Defensive optional require — matches the pattern used in AIAssistantScreen.
let ImagePicker: { launchImageLibrary?: Function } | null;
try {
  ImagePicker = require('react-native-image-picker');
} catch {
  ImagePicker = null;
}

const INVITE_MESSAGE =
  'Join me on GreenPlot — the community where farmers share tips, success stories & earn rewards. Download now! 🌱';

export function useCommunityHub() {
  const navigation = useNavigation<NavigationProp>();

  const [posts, setPosts] = useState<FeedPost[]>(() => FEED_POSTS.map(p => ({ ...p })));
  const [category, setCategory] = useState<CategoryKey>('all');

  const visiblePosts = useMemo(
    () => (category === 'all' ? posts : posts.filter(p => p.category === category)),
    [posts, category],
  );

  // ── engagement (immutable, only the touched post gets a new reference) ──────
  const onToggleLike = useCallback((id: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
      ),
    );
  }, []);

  const onToggleSave = useCallback((id: string) => {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, saved: !p.saved } : p)));
  }, []);

  const onSharePost = useCallback(async (id: string) => {
    const post = posts.find(p => p.id === id);
    try {
      await Share.share({ message: `${post?.authorName} on GreenPlot:\n\n${post?.text}` });
    } catch {
      /* user dismissed share sheet */
    }
  }, [posts]);

  const onComment = useCallback(() => navigation.navigate('CommunityQuestions'), [navigation]);

  // ── create / upload ────────────────────────────────────────────────────────
  const prependPost = useCallback((uri: string, mediaType: MediaType) => {
    setPosts(prev => [
      {
        id: `local-${Date.now()}`,
        authorName: 'You',
        authorInitials: 'YO',
        avatarTone: 'green',
        role: 'farmer',
        verified: false,
        location: 'Your farm',
        time: 'Just now',
        category: 'success',
        categoryLabel: 'My Post',
        categoryEmoji: '🌱',
        text: 'Shared from my farm 🌱',
        media: { type: mediaType, uris: [uri] },
        likes: 0,
        comments: 0,
        liked: false,
        saved: false,
      },
      ...prev,
    ]);
  }, []);

  const pickMedia = useCallback(
    (kind: 'photo' | 'video') => {
      if (!ImagePicker?.launchImageLibrary) {
        // Picker unavailable → fall back to the full create-post screen.
        navigation.navigate('CreatePost', { from: 'hub' });
        return;
      }
      ImagePicker.launchImageLibrary(
        { mediaType: kind, selectionLimit: 1 },
        (response: { didCancel?: boolean; assets?: { uri?: string }[] }) => {
          if (response.didCancel) return;
          const uri = response.assets?.[0]?.uri;
          if (uri) prependPost(uri, kind === 'video' ? 'video' : 'image');
        },
      );
    },
    [navigation, prependPost],
  );

  const onAddPhoto = useCallback(() => pickMedia('photo'), [pickMedia]);
  const onAddVideo = useCallback(() => pickMedia('video'), [pickMedia]);
  const onWriteStory = useCallback(() => navigation.navigate('CreatePost', { from: 'hub' }), [navigation]);

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

    // handlers
    setCategory,
    onToggleLike,
    onToggleSave,
    onSharePost,
    onComment,
    onAddPhoto,
    onAddVideo,
    onWriteStory,
    onReferEarn,
    onRewards,
    onLeaderboard,
    onSpotlight,
    onGuidesAll,
    onGuidePress,
    onSearch,
  };
}

export type CommunityHubViewModel = ReturnType<typeof useCommunityHub>;
