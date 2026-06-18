/**
 * Agriculture videos (YouTube) — news, technology & training.
 *
 * Two free sources, no paid tier:
 *  1. RSS feeds of curated Indian agri channels — no API key, no quota, used
 *     for the category feeds (News / Technology / Training).
 *  2. YouTube Data API v3 search — optional, only when YOUTUBE_API_KEY is set,
 *     used for free-text search. Free 10k units/day (search = 100 units).
 *
 * Everything degrades gracefully: a failed fetch returns [] so the UI keeps
 * whatever it already had (and the section is hidden if nothing loads).
 */
import { ENV, isYoutubeConfigured } from '../config/env';

export type VideoCategory = 'news' | 'technology' | 'training' | 'innovations';

export interface VideoItem {
  id: string; // provider video id
  title: string;
  channel: string;
  publishedAt: string;
  thumbnail: string;
  watchUrl: string; // canonical watch page
  embedUrl: string; // inline player URL
  provider: 'youtube' | 'dailymotion';
}

// Verified Indian agriculture channels (RSS, no key).
const CH = {
  DD_KISAN: 'UCnDfmcUyhgJp6xC1LmBLfUg', // DD Kisan (Govt, Hindi)
  KISAN_OF_INDIA: 'UCrqpSH1UygFf4WqyaaA4LvA', // Kisan of India (Hindi/Eng)
  KJ: 'UCy5uIHLkQrHYd6Dj8CsqHrw', // Krishi Jagran (Eng/Hindi)
  KVK: 'UCZjZpssoa3OIiERKbtIKzWg', // Krishi Vigyan Kendra
  KJ_KN: 'UC04Q0MV695st8ZVFWS9EXBQ', // Krishi Jagran ಕನ್ನಡ
  KJ_MR: 'UC3ZYxSSgb8LbjBLijqk-_CQ', // Krishi Jagran मराठी
  KJ_TA: 'UCd4YyLKIyvGUyriBKfBrC7A', // Krishi Jagran தமிழ்
  KJ_TE: 'UCDTRyq1uVOBmj5Cgnnig2uA', // Krishi Jagran తెలుగు
  AGROWON: 'UC-sr8hmR882HCdFxRLAy12g', // Agrowon (Marathi)
};

/**
 * Channels per (language → category). Regional languages use that language's
 * Krishi Jagran channel for all categories (no category-split regional channels
 * exist); en/hi split across DD Kisan / Kisan of India / Krishi Jagran.
 */
// YouTube-backed categories only ('innovations' uses Dailymotion, no channels).
type YtCategory = Exclude<VideoCategory, 'innovations'>;

const LANG_CHANNELS: Record<string, Record<YtCategory, string[]>> = {
  en: { news: [CH.DD_KISAN], technology: [CH.KISAN_OF_INDIA], training: [CH.KJ, CH.KVK] },
  hi: { news: [CH.DD_KISAN], technology: [CH.KISAN_OF_INDIA], training: [CH.KJ, CH.KVK] },
  kn: { news: [CH.KJ_KN], technology: [CH.KJ_KN], training: [CH.KJ_KN] },
  mr: { news: [CH.AGROWON], technology: [CH.KJ_MR], training: [CH.KJ_MR, CH.AGROWON] },
  ta: { news: [CH.KJ_TA], technology: [CH.KJ_TA], training: [CH.KJ_TA] },
  te: { news: [CH.KJ_TE], technology: [CH.KJ_TE], training: [CH.KJ_TE] },
};

const channelsFor = (language: string, category: YtCategory): string[] =>
  (LANG_CHANNELS[language] || LANG_CHANNELS.en)[category];

const RSS_BASE = 'https://www.youtube.com/feeds/videos.xml?channel_id=';

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const watch = (id: string) => `https://www.youtube.com/watch?v=${id}`;
const embed = (id: string) => `https://www.youtube.com/embed/${id}?playsinline=1&rel=0`;

/** Minimal HTML-entity decode for feed titles. */
function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function pick(block: string, re: RegExp): string {
  const m = block.match(re);
  return m ? m[1] : '';
}

/** Parse a YouTube channel RSS feed (Atom XML) into VideoItem[]. */
function parseFeed(xml: string): VideoItem[] {
  const channel = decode(pick(xml, /<title>([^<]*)<\/title>/)); // first <title> = channel name
  const out: VideoItem[] = [];
  // Each <entry>…</entry> is one video.
  const entries = xml.split('<entry>').slice(1);
  for (const e of entries) {
    const id = pick(e, /<yt:videoId>([^<]+)<\/yt:videoId>/);
    if (!id) continue;
    out.push({
      id,
      title: decode(pick(e, /<title>([^<]*)<\/title>/)) || 'Agriculture video',
      channel: decode(pick(e, /<name>([^<]*)<\/name>/)) || channel,
      publishedAt: pick(e, /<published>([^<]+)<\/published>/),
      thumbnail: thumb(id),
      watchUrl: watch(id),
      embedUrl: embed(id),
      provider: 'youtube',
    });
  }
  return out;
}

// ── Dailymotion (free, no key) — modern/sustainable agriculture tech videos ──
const DM_API = 'https://api.dailymotion.com';
const dmEmbed = (id: string) => `https://geo.dailymotion.com/player.html?video=${id}`;
const dmWatch = (id: string) => `https://www.dailymotion.com/video/${id}`;

async function fetchDailymotion(query: string, limit: number, signal?: AbortSignal): Promise<VideoItem[]> {
  const params = new URLSearchParams({
    search: query,
    limit: String(limit),
    sort: 'relevance',
    fields: 'id,title,created_time,thumbnail_360_url,owner.screenname',
  });
  try {
    const res = await fetch(`${DM_API}/videos?${params.toString()}`, { signal });
    if (!res.ok) return [];
    const json = await res.json();
    const list: any[] = Array.isArray(json.list) ? json.list : [];
    return list
      .filter(v => v.id)
      .map(v => ({
        id: v.id as string,
        title: decode(v.title || 'Farming video'),
        channel: v['owner.screenname'] || 'Dailymotion',
        publishedAt: v.created_time ? new Date(v.created_time * 1000).toISOString() : '',
        thumbnail: v.thumbnail_360_url || '',
        watchUrl: dmWatch(v.id),
        embedUrl: dmEmbed(v.id),
        provider: 'dailymotion' as const,
      }));
  } catch {
    return [];
  }
}

async function fetchChannel(channelId: string, signal?: AbortSignal): Promise<VideoItem[]> {
  try {
    const res = await fetch(`${RSS_BASE}${channelId}`, { signal });
    if (!res.ok) return [];
    return parseFeed(await res.text());
  } catch {
    return [];
  }
}

export const videosApi = {
  /** Latest videos for a category in a language, merged across channels, newest first. */
  async fetchByCategory(
    category: VideoCategory,
    language = 'en',
    limit = 10,
    signal?: AbortSignal,
  ): Promise<VideoItem[]> {
    // "Innovations" = global modern-farming / sustainable-ag tech via Dailymotion
    // (free, no key) rather than the India-channel YouTube RSS feeds.
    if (category === 'innovations') {
      return fetchDailymotion('modern farming sustainable agriculture technology', limit, signal);
    }
    const lists = await Promise.all(channelsFor(language, category).map(c => fetchChannel(c, signal)));
    return lists
      .flat()
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
      .slice(0, limit);
  },

  /**
   * Free-text video search via YouTube Data API v3 (India-focused).
   * Returns [] when no key is configured (caller can keep category feeds).
   */
  async search(query: string, language = 'en', limit = 10, signal?: AbortSignal): Promise<VideoItem[]> {
    if (!isYoutubeConfigured || !query.trim()) return [];
    const params = new URLSearchParams({
      key: ENV.youtubeApiKey,
      part: 'snippet',
      type: 'video',
      q: `${query} agriculture farming`,
      regionCode: 'IN',
      relevanceLanguage: language,
      maxResults: String(limit),
    });
    try {
      const res = await fetch(`${ENV.youtubeApiBaseUrl}/search?${params.toString()}`, { signal });
      if (!res.ok) return [];
      const json = await res.json();
      const items: any[] = Array.isArray(json.items) ? json.items : [];
      return items
        .filter(it => it.id?.videoId)
        .map(it => {
          const id = it.id.videoId as string;
          const sn = it.snippet || {};
          return {
            id,
            title: decode(sn.title || 'Agriculture video'),
            channel: sn.channelTitle || '',
            publishedAt: sn.publishedAt || '',
            thumbnail: sn.thumbnails?.high?.url || sn.thumbnails?.medium?.url || thumb(id),
            watchUrl: watch(id),
            embedUrl: embed(id),
            provider: 'youtube',
          } as VideoItem;
        });
    } catch {
      return [];
    }
  },
};
