/**
 * Loads agriculture videos for a category (RSS feeds, no key needed).
 * Refetches when the category changes; aborts in-flight requests on change /
 * unmount to avoid setState-after-unmount leaks.
 */
import { useEffect, useState } from 'react';
import { videosApi, VideoCategory, VideoItem } from '../../../services/videosApi';

interface State {
  videos: VideoItem[];
  loading: boolean;
}

export function useAgriVideos(category: VideoCategory): State {
  const [state, setState] = useState<State>({ videos: [], loading: true });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState(s => ({ videos: s.videos, loading: true }));

    videosApi
      .fetchByCategory(category, 10, controller.signal)
      .then(videos => {
        if (active) setState({ videos, loading: false });
      })
      .catch(() => {
        if (active) setState(s => ({ videos: s.videos, loading: false }));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [category]);

  return state;
}
