import { statusTones } from '../theme/tokens';

export type StatusTone = keyof typeof statusTones;

/**
 * Maps the various status strings used across lands/leases/labor jobs/
 * applications/attendance/payments to one shared semantic tone. Backs the
 * Badge atom so status→color logic lives in exactly one place instead of
 * being redeclared per screen (ActivityCard.badgeConfig(), LeaseCard.
 * statusStyle(), WorkListScreen.getStatusStyle(), etc.).
 *
 * Unrecognized statuses fall back to 'neutral' rather than throwing, since
 * this is presentation logic, not validation.
 */
const STATUS_TONE_MAP: Record<string, StatusTone> = {
  // success — the thing happened / is in good standing
  accepted: 'success',
  active: 'success',
  completed: 'success',
  paid: 'success',
  verified: 'success',
  approved: 'success',
  present: 'success',

  // warning — waiting on someone / something
  pending: 'warning',
  awaiting: 'warning',
  in_progress: 'warning',

  // danger — the thing did not happen / went wrong
  rejected: 'danger',
  cancelled: 'danger',
  expired: 'danger',
  failed: 'danger',
  absent: 'danger',

  // info — open, informational, inviting action
  open: 'info',
};

export function getStatusTone(status: string | null | undefined): { bg: string; fg: string } {
  const key = (status ?? '').toLowerCase().trim();
  const tone = STATUS_TONE_MAP[key] ?? 'neutral';
  return statusTones[tone];
}
