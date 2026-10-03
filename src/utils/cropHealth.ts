import { FarmActivity } from '../modules/work/types';

/** Derived Crop Health for Step 7 — GOOD with no overdue pending activities,
 *  ATTENTION_REQUIRED with any overdue, AT_RISK with an overdue HIGH-priority
 *  one. Deliberately simple (not an automated diagnosis): a snapshot of
 *  whether scheduled tasks are being kept up with, per the spec's own note
 *  that health starts out based on farmer activity/observations, not
 *  disease detection. */
export type CropHealthLevel = 'GOOD' | 'ATTENTION_REQUIRED' | 'AT_RISK';

export const CROP_HEALTH_LABEL: Record<CropHealthLevel, string> = {
  GOOD: 'Good',
  ATTENTION_REQUIRED: 'Attention Required',
  AT_RISK: 'At Risk',
};

export function deriveCropHealth(activities: FarmActivity[]): CropHealthLevel {
  const todayIso = new Date().toISOString().slice(0, 10);
  const overdue = activities.filter((a) => a.status === 'PENDING' && a.scheduledDate < todayIso);
  if (overdue.length === 0) return 'GOOD';
  if (overdue.some((a) => a.priority === 'HIGH')) return 'AT_RISK';
  return 'ATTENTION_REQUIRED';
}
