/**
 * "Recent activity" home-screen feed — shared between OwnerHome and
 * FarmerHome (each home merges its own real, timestamped events on top of
 * the same `notifications` table).
 */

export interface ActivityItem {
  id: string;
  icon: string;
  tone: 'green' | 'blue' | 'amber' | 'red';
  title: string;
  sub: string;
  time: string;
  onPress: () => void;
  /** Label for the trailing action button (e.g. "View", "Manage"). Defaults
   *  to "View" wherever a home renders these as action-card style rows. */
  actionLabel?: string;
}

// Icon + tone per notification type — mirrors NotificationsCenterScreen's
// own `getIcon`, just also picking a tone since the home tile is colour-coded.
export function activityVisual(type: string): { icon: string; tone: ActivityItem['tone'] } {
  if (type === 'payment') return { icon: 'cash', tone: 'green' };
  if (type === 'lease') return { icon: 'document-attach', tone: 'blue' };
  if (type === 'job') return { icon: 'people', tone: 'blue' };
  if (type === 'disease') return { icon: 'warning', tone: 'amber' };
  return { icon: 'notifications', tone: 'green' };
}

export function relativeTime(createdAt: string): string {
  const ts = new Date(createdAt).getTime();
  if (!Number.isFinite(ts)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
