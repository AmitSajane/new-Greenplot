/**
 * Agriculture news & schemes feed (NewsData.io).
 *
 * Free tier: 200 requests/day. Country = India, keyworded to farming/schemes.
 * Requires NEWS_API_KEY in .env; when absent (or on any error), callers fall
 * back to the bundled mock so the UI never shows an empty section.
 *
 * Docs: https://newsdata.io/documentation
 */
import { ENV, isNewsConfigured } from '../config/env';
import type { NewsItem, Tone } from '../screens/farmerHome/constants/farmerDashboardData';

/** Raw shape of a NewsData.io article (only the fields we use). */
interface NewsDataArticle {
  article_id?: string;
  title?: string;
  description?: string;
  link?: string;
  source_id?: string;
  pubDate?: string;
}

interface NewsDataResponse {
  status?: string;
  results?: NewsDataArticle[];
  message?: string;
}

// Rotate icon/tone so the list looks varied without per-article metadata.
const ROTATION: ReadonlyArray<{ icon: string; tone: Tone }> = [
  { icon: 'business', tone: 'blue' },
  { icon: 'trending-up', tone: 'green' },
  { icon: 'leaf', tone: 'green' },
  { icon: 'rainy', tone: 'blue' },
  { icon: 'cash', tone: 'amber' },
];

/** Map a NewsData.io article → the app's NewsItem (used by the Home news card). */
function toNewsItem(a: NewsDataArticle, i: number): NewsItem {
  const r = ROTATION[i % ROTATION.length];
  return {
    id: a.article_id || `news-${i}`,
    icon: r.icon,
    tone: r.tone,
    title: (a.title || 'Agriculture update').trim(),
    sub: (a.description || a.source_id || 'Tap to read more').trim().slice(0, 120),
    action: 'hub',
    // Carried through for an external "read full article" link if the UI wants it.
    url: a.link,
  };
}

export const newsApi = {
  /**
   * Fetch India agriculture news + scheme updates.
   * @param limit  max items to return (default 6)
   * @param signal optional AbortSignal for cancellation on unmount
   * @returns mapped NewsItem[]; empty array on failure (caller keeps fallback)
   */
  async fetchAgriNews(limit = 6, signal?: AbortSignal): Promise<NewsItem[]> {
    if (!isNewsConfigured) return [];

    const params = new URLSearchParams({
      apikey: ENV.newsApiKey,
      country: 'in',
      language: 'en',
      // Match the headline (qInTitle) — far more agriculture-relevant than a
      // full-text `q`, which leaks unrelated India news on the free tier.
      qInTitle: 'farmer OR agriculture OR kisan OR crop OR mandi OR subsidy',
    });

    try {
      const res = await fetch(`${ENV.newsApiBaseUrl}/news?${params.toString()}`, { signal });
      if (!res.ok) return [];
      const json = (await res.json()) as NewsDataResponse;
      if (json.status !== 'success' || !Array.isArray(json.results)) return [];
      return json.results
        .filter(a => a.title)
        .slice(0, limit)
        .map(toNewsItem);
    } catch {
      // Network error / aborted / bad JSON → let caller fall back to mock.
      return [];
    }
  },
};
