import { colors } from '../../theme/tokens';
import type { ManagementRequestStatus } from '../../services/managementRequestsApi';

export const MANAGEMENT_REQUEST_STATUS_META: Record<
  ManagementRequestStatus,
  { color: string; bg: string; icon: string }
> = {
  PENDING_REVIEW: { color: colors.warning, bg: colors.softOrange, icon: 'time-outline' },
  UNDER_REVIEW: { color: colors.info, bg: colors.softBlue, icon: 'eye-outline' },
  SHORTLISTED: { color: colors.primary, bg: colors.softGreen, icon: 'star-outline' },
  APPROVED: { color: colors.success, bg: colors.softGreen, icon: 'checkmark-circle-outline' },
  REJECTED: { color: colors.danger, bg: '#FDEBEB', icon: 'close-circle-outline' },
  WITHDRAWN: { color: colors.textMuted, bg: colors.border, icon: 'arrow-undo-outline' },
  CANCELLED: { color: colors.textMuted, bg: colors.border, icon: 'ban-outline' },
};
