/** Shared crop-growth stages for Farm Management crop plans (Step 6/7).
 *  One stage list for every crop for now — a per-crop `crop_stages` master
 *  table is explicitly deferred to a later step. */
export const CROP_STAGES = [
  'LAND_PREPARATION',
  'SEED_SEEDLING',
  'PLANTING',
  'EARLY_GROWTH',
  'VEGETATIVE_GROWTH',
  'FLOWERING',
  'FRUIT_DEVELOPMENT',
  'MATURITY',
  'HARVEST',
  'POST_HARVEST',
] as const;

export type CropStage = (typeof CROP_STAGES)[number];

export const CROP_STAGE_LABEL: Record<CropStage, string> = {
  LAND_PREPARATION: 'Land Preparation',
  SEED_SEEDLING: 'Seed / Seedling',
  PLANTING: 'Planting',
  EARLY_GROWTH: 'Early Growth',
  VEGETATIVE_GROWTH: 'Vegetative Growth',
  FLOWERING: 'Flowering',
  FRUIT_DEVELOPMENT: 'Fruit Development',
  MATURITY: 'Maturity',
  HARVEST: 'Harvest',
  POST_HARVEST: 'Post-Harvest',
};

export function isCropStage(value: string | undefined): value is CropStage {
  return !!value && (CROP_STAGES as readonly string[]).includes(value);
}

export function stageIndex(stage: string | undefined): number {
  if (!isCropStage(stage)) return 0;
  return CROP_STAGES.indexOf(stage);
}

/** The later of two stages in the fixed sequence — a stage never moves backward. */
export function laterStage(a: string | undefined, b: CropStage): CropStage {
  return stageIndex(a) >= stageIndex(b) ? (isCropStage(a) ? a : b) : b;
}

/** True once a stage is past sowing — Early Growth onward needs a real planting date. */
export function requiresPlanting(stage: CropStage): boolean {
  return stageIndex(stage) >= CROP_STAGES.indexOf('EARLY_GROWTH');
}

/** Maturity/Harvest are where a crop becomes ready for the Record Harvest flow. */
export function isHarvestStage(stage: CropStage): boolean {
  return stage === 'MATURITY' || stage === 'HARVEST';
}

/** Minimum stage a free-text Log Activity entry implies (others don't imply one). */
export const LOG_ACTIVITY_STAGE: Partial<Record<string, CropStage>> = {
  sowing: 'PLANTING',
  harvest: 'HARVEST',
};

/** 0-100, where the first stage is 0% and the last is 100%. */
export function stageProgressPercent(stage: string | undefined): number {
  return Math.round((stageIndex(stage) / (CROP_STAGES.length - 1)) * 100);
}

export function daysSince(dateIso: string | undefined): number | undefined {
  if (!dateIso) return undefined;
  const start = new Date(dateIso + 'T00:00:00');
  if (Number.isNaN(start.getTime())) return undefined;
  const diffMs = Date.now() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function daysRemaining(expectedHarvestIso: string | undefined): number | undefined {
  if (!expectedHarvestIso) return undefined;
  const end = new Date(expectedHarvestIso + 'T00:00:00');
  if (Number.isNaN(end.getTime())) return undefined;
  const diffMs = end.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/** "Tomorrow" / "In 3 Days" label for a future ISO date, relative to today. */
export function relativeDayLabel(dateIso: string): string {
  const days = daysRemaining(dateIso) ?? 0;
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} Days`;
}
