import { ArrivalDay, ArrivalSource, DemandRegion } from '../types';

export const MOCK_ARRIVAL_WEEK: ArrivalDay[] = [
  { label: 'Mon', mt: 1240, level: 'normal' },
  { label: 'Tue', mt: 1480, level: 'high' },
  { label: 'Wed', mt: 1620, level: 'high' },
  { label: 'Thu', mt: 980, level: 'low' },
  { label: 'Fri', mt: 1850, level: 'high' },
  { label: 'Sat', mt: 2100, level: 'peak' },
];

export const MOCK_ARRIVAL_SOURCES: ArrivalSource[] = [
  { label: 'Dharwad', mt: 320, pct: 34 },
  { label: 'Belagavi', mt: 206, pct: 22 },
  { label: 'Haveri', mt: 169, pct: 18 },
  { label: 'Gadag', mt: 132, pct: 14 },
  { label: 'Others', mt: 113, pct: 12 },
];

/** Regional demand intensity for the heatmap screen. */
export const MOCK_DEMAND_REGIONS: { label: string; pct: number }[] = [
  { label: 'North\nKA', pct: 32 },
  { label: 'South\nKA', pct: 62 },
  { label: 'Maha-\nrashtra', pct: 71 },
  { label: 'Andhra\nPradesh', pct: 84 },
];

export const MOCK_DEMAND_DRIVERS: DemandRegion[] = [
  { label: 'Industrial (processing)', pct: 72, tone: 'green' },
  { label: 'Export (Middle East)', pct: 45, tone: 'amber' },
  { label: 'Retail / household', pct: 65, tone: 'green' },
  { label: 'Festive season boost', pct: 58, tone: 'amber' },
];
