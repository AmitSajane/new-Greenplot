/**
 * Lease Closure / Early Termination — static option lists + the settlement
 * math. Pure data/functions only (no React, no navigation), same spirit as
 * leaseTypes.ts, so both the request form and the closure hub screen read
 * from one place.
 */
import type {
  LeaseClosure,
  LeaseClosureStatus,
  OwnerClosureResponse,
  StandingCropOption,
} from '../types/lease';

export const DEFAULT_NOTICE_PERIOD_DAYS = 30;

export const NOTICE_PERIOD_OPTIONS = [30, 60, 90] as const;

export const CLOSURE_REASONS = [
  'End of season / crop cycle complete',
  'Relocating',
  'Financial difficulty',
  'Dispute with land owner',
  'Land no longer suitable',
  'Better opportunity elsewhere',
  'Other',
] as const;

export const STANDING_CROP_OPTIONS: { id: StandingCropOption; label: string; help: string }[] = [
  {
    id: 'continue_until_harvest',
    label: 'Farmer continues until harvest',
    help: 'Lease stays open on this plot until the current crop is fully harvested, then closes.',
  },
  {
    id: 'harvest_by_deadline',
    label: 'Farmer harvests within an agreed deadline',
    help: 'Farmer commits to harvesting by a specific date; closure proceeds once done or the deadline passes.',
  },
  {
    id: 'owner_takes_possession',
    label: 'Land owner takes possession before harvest',
    help: 'Owner takes the land back with the crop still standing — any compensation is agreed separately.',
  },
  {
    id: 'mutual_agreement',
    label: 'Mutually agree on crop ownership and compensation',
    help: 'Both parties record a custom arrangement for the standing crop below.',
  },
];

export const OWNER_RESPONSE_LABELS: Record<OwnerClosureResponse, string> = {
  accepted: 'Accepted',
  rejected: 'Rejected',
  proposed_new_date: 'Proposed a different date',
  accepted_with_settlement: 'Accepted — settlement required first',
};

export const CLOSURE_STATUS_LABELS: Record<LeaseClosureStatus, string> = {
  requested: 'Closure requested',
  under_review: 'Under review',
  settlement_pending: 'Settlement pending',
  handover_pending: 'Handover pending',
  ready_for_closure: 'Ready for closure',
  closed: 'Closed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const CLOSURE_STATUS_TONE: Record<LeaseClosureStatus, 'green' | 'amber' | 'red' | 'blue'> = {
  requested: 'blue',
  under_review: 'blue',
  settlement_pending: 'amber',
  handover_pending: 'amber',
  ready_for_closure: 'green',
  closed: 'green',
  rejected: 'red',
  cancelled: 'red',
};

/** requested_at + notice_period_days, unless the owner has waived it. */
export function computeEligibleClosureDate(requestedAt: string, noticePeriodDays: number): string {
  const d = new Date(requestedAt);
  d.setDate(d.getDate() + noticePeriodDays);
  return d.toISOString().slice(0, 10);
}

export function isNoticeSatisfied(closure: LeaseClosure): boolean {
  if (closure.noticeWaived) return true;
  if (!closure.eligibleClosureDate) return false;
  return new Date().toISOString().slice(0, 10) >= closure.eligibleClosureDate;
}

export interface SettlementResult {
  totalPending: number;
  totalDeductions: number;
  depositRefund: number;
  /** Positive = owner owes farmer this much; negative = farmer owes the owner this much. */
  finalAmount: number;
  payer: 'owner' | 'farmer' | 'none';
}

/** Pure calculation — never mutates or auto-applies anything. The settlement
 *  is only "confirmed" (see LeaseClosure.settlementConfirmed) once both
 *  figures are agreed, matching "do not automatically deduct money unless
 *  mutually confirmed" from the spec. */
export function computeSettlement(closure: LeaseClosure): SettlementResult {
  const otherExpenses = closure.otherExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalPending =
    (Number(closure.pendingRent) || 0) +
    (Number(closure.pendingWater) || 0) +
    (Number(closure.pendingElectricity) || 0) +
    otherExpenses;
  const totalDeductions = closure.deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const deposit = Number(closure.securityDeposit) || 0;
  const depositRefund = Math.max(0, deposit - totalDeductions);
  const finalAmount = depositRefund - totalPending;
  return {
    totalPending,
    totalDeductions,
    depositRefund,
    finalAmount,
    payer: finalAmount > 0 ? 'owner' : finalAmount < 0 ? 'farmer' : 'none',
  };
}
