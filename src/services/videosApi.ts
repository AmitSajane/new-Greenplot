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

export type VideoCategory = 'news' | 'technology' | 'training';

export interface VideoItem {
  id: string; // YouTube videoId
  title: string;
  channel: string;
  publishedAt: string;
  thumbnail: string; // hqdefault image
  watchUrl: string; // youtube.com/watch?v=...
  embedUrl: string; // youtube.com/embed/... (inline player)
}

/** Curated, verified Indian agriculture channels per category (RSS, no key). */
const CHANNELS: Record<VideoCategory, string[]> = {
  news: ['UCnDfmcUyhgJp6xC1LmBLfUg'], // DD Kisan (Govt of India)
  technology: ['UCrqpSH1UygFf4WqyaaA4LvA'], // Kisan of India
  training: ['UCy5uIHLkQrHYd6Dj8CsqHrw', 'UCZjZpssoa3OIiERKbtIKzWg'], // Krishi Jagran, KVK
};

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
    });
  }
  return out;
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
  /** Latest videos for a category, merged across its channels, newest first. */
  async fetchByCategory(category: VideoCategory, limit = 10, signal?: AbortSignal): Promise<VideoItem[]> {
    const lists = await Promise.all(CHANNELS[category].map(c => fetchChannel(c, signal)));
    return lists
      .flat()
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
      .slice(0, limit);
  },

  /**
   * Free-text video search via YouTube Data API v3 (India-focused).
   * Returns [] when no key is configured (caller can keep category feeds).
   */
  async search(query: string, limit = 10, signal?: AbortSignal): Promise<VideoItem[]> {
    if (!isYoutubeConfigured || !query.trim()) return [];
    const params = new URLSearchParams({
      key: ENV.youtubeApiKey,
      part: 'snippet',
      type: 'video',
      q: `${query} agriculture farming`,
      regionCode: 'IN',
      relevanceLanguage: 'hi',
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
          } as VideoItem;
        });
    } catch {
      return [];
    }
  },
};
