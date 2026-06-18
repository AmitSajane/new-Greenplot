/**
 * Live agriculture news/schemes with graceful fallback.
 *
 * Returns the bundled `fallback` immediately (so the section is never empty),
 * then swaps in live NewsData.io results once they arrive. Aborts the in-flight
 * request on unmount to avoid setState-after-unmount leaks.
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { newsApi } from '../../../services/newsApi';
import { isNewsConfigured } from '../../../config/env';
import type { NewsItem } from '../constants/farmerDashboardData';

export function useAgriNews(fallback: readonly NewsItem[]): readonly NewsItem[] {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const [news, setNews] = useState<readonly NewsItem[]>(fallback);

  useEffect(() => {
    // No key configured → keep mock, skip the network entirely.
    if (!isNewsConfigured) return;

    const controller = new AbortController();
    let active = true;

    newsApi
      .fetchAgriNews(language, 6, controller.signal)
      .then(items => {
        if (active && items.length > 0) setNews(items);
      })
      .catch(() => {
        /* keep fallback */
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [language]);

  return news;
}
