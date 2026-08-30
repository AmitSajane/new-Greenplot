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
export type MediaType = 'image' | 'video' | 'grid' | 'text' | 'audio' | 'blog' | 'poll';
export type PostType = 'photo' | 'video' | 'blog' | 'poll' | 'voice';

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  emoji: string;
}

export interface PostMedia {
  type: MediaType;
  uris: string[];
  durationLabel?: string; // for video/audio
  earnedLabel?: string; // optional "₹ earned" badge
}

/** One poll option with its live vote tally, as rendered in the feed. */
export interface PollOptionResult {
  label: string;
  votes: number;
  pct: number;
}

/** Live poll state for a post — only set when media.type === 'poll'. */
export interface PollResult {
  options: PollOptionResult[];
  totalVotes: number;
  /** Index of the option the current user voted for, or null if they haven't voted. */
  myVote: number | null;
}

export interface FeedPost {
  id: string;
  authorId: string;
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
  /** Blog headline or poll question — set when media.type is 'blog' or 'poll'. */
  title?: string;
  text: string;
  media: PostMedia;
  likes: number;
  comments: number;
  liked: boolean;
  saved: boolean;
  /** Only set when media.type === 'poll'. */
  poll?: PollResult;
}

/** A single comment on a post — flat (no replies/threading). */
export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  avatarTone: AvatarTone;
  text: string;
  time: string;
}

/** A single 24h-ephemeral story. Only the current user's own stories exist
 * pre-backend — there is no multi-author feed yet, so no author field. */
export interface StoryItem {
  id: string;
  mediaType: 'image' | 'video';
  uri: string;
  durationSec?: number;
  createdAt: number;
  expiresAt: number;
}

/** Storage-conscious upload limits (see product rules). Sizes are upper
 * bounds enforced after auto-resize/compression, not hard minimums.
 * No file-size ceiling on any media type — our storage bucket has no
 * per-file cap set (it falls back to Supabase's project-wide default,
 * 50 MB/file), so there's nothing client-side worth rejecting on size
 * alone. Duration limits (video/voice) are unrelated and still enforced. */
export const MEDIA_RULES = {
  photo: { maxBytes: Infinity },
  video: { minSec: 10, maxSec: 15, maxBytes: Infinity },
  voice: { maxSec: 60, maxBytes: Infinity },
  story: { expiryHours: 24, maxPerDay: 3 },
} as const;

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
  content: string;
}

export interface Guide {
  id: string;
  title: string;
  tag: string;
  image: string;
  readMins: number;
  summary: string;
  content: string;
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
  content:
    'The problem\n\nRamesh grows tomatoes on a small family farm in Purnea, Bihar. In an earlier season, uneven flood irrigation left some rows waterlogged while plants at the far end remained dry. Weed growth increased labour costs, fruit quality became inconsistent and a weak market price turned the crop into an estimated ₹40,000 loss. This is an illustrative case study based on common challenges faced by small vegetable growers.\n\n' +
    'What changed\n\nBefore planting again, he divided the field into smaller irrigation zones and installed a basic drip line close to each tomato row. The system allowed him to water the root area instead of soaking the entire plot. He also covered the beds with locally available organic mulch, leaving space around each stem to reduce the risk of rot.\n\n' +
    'Ramesh began checking soil moisture by hand before irrigating instead of following a fixed daily schedule. He inspected emitters every week, flushed blocked lines and recorded irrigation time, labour and harvest weight in a notebook. Fertilizer was applied in smaller planned doses after advice from a local agriculture worker.\n\n' +
    'Costs and trade-offs\n\nThe drip system required an upfront investment and regular filter cleaning. Mulching also took extra labour at the beginning of the season. To control risk, he first installed the system on part of the plot and expanded it only after confirming that water reached the end of every line. Actual costs vary by field size, water source, material and available subsidy.\n\n' +
    'The outcome\n\nCompared with the previous season, the demonstration reduced irrigation water use by roughly 40%. Weed pressure and watering labour fell, while more uniform moisture helped improve marketable tomato yield. In this example, better yield and lower recurring costs produced about ₹1.2 lakh in net seasonal profit. The result should not be treated as a guaranteed return because weather, disease, input prices and local market rates can change substantially.\n\n' +
    'Practical lessons\n\nStart with a small section, use a good filter and verify pressure at the last emitter. Mulch should suppress weeds without touching the plant stem. Keep simple records of water hours, input costs, rejected produce and selling price so the result can be compared fairly with the previous crop. Farmers considering drip irrigation should ask their local horticulture office about system design and current subsidy eligibility.',
};

export const GUIDES: readonly Guide[] = [
  {
    id: 'g1',
    title: 'Vermicompost at home',
    tag: '🪱 Guide',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900',
    readMins: 5,
    summary: 'Turn crop residue and household organic waste into nutrient-rich compost using earthworms.',
    content:
      'Choose a shaded, well-drained place and prepare a raised bed or ventilated container. Add a base layer of dry leaves or chopped straw, followed by partially decomposed cow dung and farm waste. Avoid plastic, glass, meat, oily food and recently sprayed crop material.\n\n' +
      'Introduce composting earthworms after the material has cooled. Keep the bed moist like a squeezed sponge, but never waterlog it. Cover it with moist gunny sacks or straw and turn only the upper layer gently. Protect the bed from direct sun, heavy rain, ants and poultry.\n\n' +
      'The compost is usually ready when it becomes dark, loose and earthy-smelling. Stop watering for a few days, move the material into small heaps and let the worms travel downward. Collect the upper compost, sieve it and store it in shade. Apply it near the root zone and mix lightly with soil.',
  },
  {
    id: 'g2',
    title: 'Drip irrigation basics',
    tag: '💧 Guide',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900',
    readMins: 4,
    summary: 'Understand the essential parts of a drip system and deliver water directly to crop roots.',
    content:
      'A basic drip system contains a water source, pump or elevated tank, filter, mainline, sub-main pipes, lateral tubes and emitters. Good filtration is essential because sand, algae and fertilizer particles can block the small emitter openings.\n\n' +
      'Lay laterals along crop rows and place emitters close to the active root zone. Spacing depends on the crop and soil: sandy soil generally needs closer emitters, while clay soil spreads water farther sideways. Run the system long enough to wet the root depth without creating runoff or standing water.\n\n' +
      'Check the last emitter on each line to confirm even flow. Flush mainlines and laterals regularly, clean filters and repair leaks immediately. Irrigate during cooler hours where practical, and adjust duration as the crop grows, rainfall changes and temperatures rise.',
  },
  {
    id: 'g3',
    title: 'Organic pest control',
    tag: '🌿 Guide',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=900',
    readMins: 6,
    summary: 'Control common crop pests through monitoring, prevention and low-residue treatments.',
    content:
      'Inspect crops at least twice a week, including the underside of leaves and field borders. Identify the pest before treating it, because beneficial insects such as ladybirds, lacewings and parasitoid wasps should be protected. Remove badly affected plant parts and weeds that host pests.\n\n' +
      'Use prevention first: rotate crops, select healthy seed, maintain recommended spacing and avoid excess nitrogen, which encourages soft growth and sucking pests. Pheromone traps can monitor moth activity, while yellow or blue sticky traps help track selected flying insects.\n\n' +
      'When intervention is needed, use a locally recommended neem-based or biological product at the labelled dose. Spray only the affected crop, preferably during cooler hours when pollinators are less active. Wear protective equipment even with organic products, observe the harvest interval and seek local agricultural advice when damage continues.',
  },
];

/**
 * Post-type filter (Community feed) — separate dimension from `CategoryKey`
 * (topic). Lets a user narrow the feed to a specific post format.
 */
export type PostTypeFilterKey = 'all' | 'photo' | 'video' | 'blog' | 'poll' | 'voice';

export interface PostTypeFilterDef {
  key: PostTypeFilterKey;
  label: string;
}

export const POST_TYPE_FILTERS: readonly PostTypeFilterDef[] = [
  { key: 'all', label: 'All' },
  { key: 'photo', label: 'Photo' },
  { key: 'video', label: 'Video' },
  { key: 'blog', label: 'Blog' },
  { key: 'poll', label: 'Poll' },
  { key: 'voice', label: 'Voice' },
];
