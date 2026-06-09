/**
 * Community Hub — declarative mock data + domain types.
 *
 * Growth levers baked in (co-founder additions): Kisan Rewards (retention),
 * Top Contributors leaderboard (status), Refer & Earn (viral acquisition),
 * Story of the Week (aspiration). All data is pure/serialisable so it can be
 * swapped for a real API without touching the UI.
 */

export type CategoryKey =
  | 'all'
  | 'success'
  | 'vermicompost'
  | 'organic'
  | 'tips'
  | 'pest'
  | 'questions';

export type Role = 'farmer' | 'owner';
export type AvatarTone = 'green' | 'amber' | 'blue' | 'red' | 'purple';
export type MediaType = 'image' | 'video' | 'grid' | 'text';

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  emoji: string;
}

export interface PostMedia {
  type: MediaType;
  uris: string[];
  durationLabel?: string; // for video
  earnedLabel?: string; // optional "₹ earned" badge
}

export interface FeedPost {
  id: string;
  authorName: string;
  authorInitials: string;
  avatarTone: AvatarTone;
  role: Role;
  verified: boolean;
  location: string;
  time: string;
  category: CategoryKey;
  categoryLabel: string;
  categoryEmoji: string;
  text: string;
  media: PostMedia;
  likes: number;
  comments: number;
  liked: boolean;
  saved: boolean;
}

export interface KisanReward {
  coins: number;
  streakDays: number;
  level: number;
  levelLabel: string;
  nextLevelLabel: string;
  progressPct: number; // 0–100 toward next level
}

export interface Contributor {
  id: string;
  name: string;
  initials: string;
  tone: AvatarTone;
  points: number;
  badge: string; // e.g. "Expert", "Top helper"
  rank: number;
}

export interface Spotlight {
  title: string;
  author: string;
  location: string;
  earnedLabel: string;
  image: string;
  summary: string;
}

export interface Guide {
  id: string;
  title: string;
  tag: string;
  image: string;
  readMins: number;
}

export const CATEGORIES: readonly CategoryDef[] = [
  { key: 'all', label: 'All', emoji: '' },
  { key: 'success', label: 'Success', emoji: '🏆' },
  { key: 'vermicompost', label: 'Vermicompost', emoji: '🪱' },
  { key: 'organic', label: 'Organic', emoji: '🌿' },
  { key: 'tips', label: 'Tips', emoji: '💡' },
  { key: 'pest', label: 'Pest control', emoji: '🐛' },
  { key: 'questions', label: 'Questions', emoji: '❓' },
];

export const COMMUNITY_STATS = [
  { id: 'c1', value: '12.4k', label: 'Farmers' },
  { id: 'c2', value: '3,210', label: 'Stories' },
  { id: 'c3', value: '86', label: 'Tips today' },
  { id: 'c4', value: '↑ 24%', label: 'This week' },
];

export const KISAN_REWARD: KisanReward = {
  coins: 1240,
  streakDays: 6,
  level: 3,
  levelLabel: 'Krishi Expert',
  nextLevelLabel: 'Gold',
  progressPct: 65,
};

export const REFERRAL = {
  coinsPerInvite: 50,
  invited: 7,
};

export const TOP_CONTRIBUTORS: readonly Contributor[] = [
  { id: 'u1', name: 'Dr. Meena', initials: 'DM', tone: 'purple', points: 9820, badge: 'Agri Expert', rank: 1 },
  { id: 'u2', name: 'Ramesh K.', initials: 'RK', tone: 'blue', points: 7640, badge: 'Top helper', rank: 2 },
  { id: 'u3', name: 'Lakshmi B.', initials: 'LB', tone: 'amber', points: 6190, badge: 'Story star', rank: 3 },
  { id: 'u4', name: 'Anil K.', initials: 'AK', tone: 'green', points: 4870, badge: 'Mentor', rank: 4 },
  { id: 'u5', name: 'Vikram R.', initials: 'VR', tone: 'red', points: 3550, badge: 'Rising', rank: 5 },
];

export const SPOTLIGHT: Spotlight = {
  title: 'From ₹40k loss to ₹1.2L profit in one season',
  author: 'Ramesh Kumar',
  location: 'Purnea, Bihar',
  earnedLabel: '₹1.2L earned',
  image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600',
  summary:
    'Switched to drip + mulching on tomato, cut water 40% and doubled yield. Read how he did it step by step.',
};

export const GUIDES: readonly Guide[] = [
  { id: 'g1', title: 'Vermicompost at home', tag: '🪱 Guide', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300', readMins: 5 },
  { id: 'g2', title: 'Drip irrigation basics', tag: '💧 Guide', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300', readMins: 4 },
  { id: 'g3', title: 'Organic pest control', tag: '🌿 Guide', image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=300', readMins: 6 },
];

export const FEED_POSTS: readonly FeedPost[] = [
  {
    id: 'p1',
    authorName: 'Ramesh Kumar',
    authorInitials: 'RK',
    avatarTone: 'blue',
    role: 'farmer',
    verified: true,
    location: 'Purnea, Bihar',
    time: '2h ago',
    category: 'success',
    categoryLabel: 'Success Story',
    categoryEmoji: '🏆',
    text:
      'Doubled my tomato yield this season using drip irrigation + mulching. Spent ₹20k, earned ₹1.2L! Happy to guide anyone in my village. 🍅🙏',
    media: { type: 'image', uris: ['https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600'], earnedLabel: '₹1.2L earned' },
    likes: 124,
    comments: 18,
    liked: true,
    saved: false,
  },
  {
    id: 'p2',
    authorName: 'Lakshmi Bai',
    authorInitials: 'LB',
    avatarTone: 'amber',
    role: 'farmer',
    verified: false,
    location: 'Dharwad, Karnataka',
    time: '5h ago',
    category: 'vermicompost',
    categoryLabel: 'Vermicompost',
    categoryEmoji: '🪱',
    text:
      'How I make vermicompost at home in 30 days — cuts my fertilizer cost by half. Full method in this video 👇',
    media: { type: 'video', uris: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'], durationLabel: '4:12' },
    likes: 208,
    comments: 42,
    liked: false,
    saved: true,
  },
  {
    id: 'p3',
    authorName: 'Anil K.',
    authorInitials: 'AK',
    avatarTone: 'green',
    role: 'owner',
    verified: false,
    location: 'Hubli',
    time: 'Yesterday',
    category: 'organic',
    categoryLabel: 'Organic',
    categoryEmoji: '🌿',
    text: 'Neem oil + garlic spray kept my crop pest-free without chemicals. Before / after 👇',
    media: {
      type: 'grid',
      uris: [
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300',
        'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=300',
      ],
    },
    likes: 76,
    comments: 11,
    liked: false,
    saved: false,
  },
  {
    id: 'p4',
    authorName: 'Vikram R.',
    authorInitials: 'VR',
    avatarTone: 'red',
    role: 'farmer',
    verified: false,
    location: 'Gadag',
    time: '1d ago',
    category: 'questions',
    categoryLabel: 'Question',
    categoryEmoji: '❓',
    text:
      'Yellow spots on my chilli leaves 🌶 — is it a fungus or nutrient problem? Any organic fix? Please help 🙏',
    media: { type: 'text', uris: [] },
    likes: 9,
    comments: 23,
    liked: false,
    saved: false,
  },
  {
    id: 'p5',
    authorName: 'Sunita Devi',
    authorInitials: 'SD',
    avatarTone: 'purple',
    role: 'farmer',
    verified: true,
    location: 'Nashik, Maharashtra',
    time: '1d ago',
    category: 'tips',
    categoryLabel: 'Tip',
    categoryEmoji: '💡',
    text:
      'Tip: soak seeds in cow urine + water (1:10) overnight before sowing — better germination and natural pest resistance. Tried & tested for 3 years! 🌱',
    media: { type: 'image', uris: ['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600'] },
    likes: 312,
    comments: 54,
    liked: false,
    saved: false,
  },
];
