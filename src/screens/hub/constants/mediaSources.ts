import type { MediaSource } from '../hooks/useCommunityHub';

export interface MediaSourceOption {
  source: MediaSource;
  icon: string;
  label: string;
  color: string;
}

const CAMERA_PHOTO: MediaSourceOption = { source: 'camera-photo', icon: 'camera', label: 'Take Photo', color: '#1A6B3A' };
const CAMERA_VIDEO: MediaSourceOption = { source: 'camera-video', icon: 'videocam', label: 'Take Video', color: '#C02828' };
const GALLERY_PHOTO: MediaSourceOption = { source: 'gallery-photo', icon: 'image', label: 'Photo from Gallery', color: '#1A6B3A' };
const GALLERY_VIDEO: MediaSourceOption = { source: 'gallery-video', icon: 'film', label: 'Video from Gallery', color: '#C02828' };

// Single source of truth for the "capture vs choose from gallery" options
// shown by MediaSourceSheet. The post composer picks whichever pair matches
// the post type already chosen (photo or video); the story composer shows
// all four since it lets the user pick the kind at capture time.
export const PHOTO_SOURCES: MediaSourceOption[] = [CAMERA_PHOTO, GALLERY_PHOTO];
export const VIDEO_SOURCES: MediaSourceOption[] = [CAMERA_VIDEO, GALLERY_VIDEO];
export const STORY_SOURCES: MediaSourceOption[] = [CAMERA_PHOTO, CAMERA_VIDEO, GALLERY_PHOTO, GALLERY_VIDEO];
