import { MEDIA_RULES, StoryItem } from '../constants/communityData';

export interface MediaCheck {
  ok: boolean;
  message?: string;
  sizeLabel?: string;
}

export interface PickedAssetInfo {
  fileSize?: number;
  duration?: number; // seconds, video only
}

export const formatBytes = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Photos are already downscaled/compressed at pick-time (quality + max
 * dimensions); this only catches the rare source image still over budget. */
export const checkPhoto = (asset: PickedAssetInfo): MediaCheck => {
  const { maxBytes } = MEDIA_RULES.photo;
  if (asset.fileSize && asset.fileSize > maxBytes) {
    return {
      ok: false,
      message: `This photo is ${formatBytes(asset.fileSize)} even after compression. Please choose a smaller image.`,
    };
  }
  return { ok: true, sizeLabel: formatBytes(asset.fileSize) };
};

/** Videos can't be trimmed/compressed client-side yet, so duration and size
 * are hard limits enforced at selection time. */
export const checkVideo = (asset: PickedAssetInfo): MediaCheck => {
  const { minSec, maxSec, maxBytes } = MEDIA_RULES.video;
  const duration = asset.duration != null ? Math.round(asset.duration) : undefined;
  if (duration != null && (duration < minSec || duration > maxSec)) {
    return {
      ok: false,
      message: `This video is ${duration}s. It must be ${minSec}–${maxSec} seconds long.`,
    };
  }
  if (asset.fileSize && asset.fileSize > maxBytes) {
    return {
      ok: false,
      message: `This video is ${formatBytes(asset.fileSize)}. Please choose a shorter or lower-resolution clip (max ${formatBytes(maxBytes)}).`,
    };
  }
  return { ok: true, sizeLabel: formatBytes(asset.fileSize) };
};

export const activeStories = (stories: readonly StoryItem[], now = Date.now()): StoryItem[] =>
  stories.filter(story => story.expiresAt > now);

export const storiesInLast24h = (stories: readonly StoryItem[], now = Date.now()): number => {
  const since = now - MEDIA_RULES.story.expiryHours * 60 * 60 * 1000;
  return stories.filter(story => story.createdAt > since).length;
};
