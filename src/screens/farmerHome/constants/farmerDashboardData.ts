/**
 * Declarative mock data for the redesigned Farmer Home.
 *
 * Pure content only — every actionable item carries an `action` discriminator
 * that the view-model hook (`useFarmerHome`) resolves to a navigation handler.
 * Keeping data free of closures makes it serialisable, testable, and cheap to
 * memoise (stable references → no needless re-renders downstream).
 */

export type FarmerAction =
  | 'leases'
  | 'crops'
  | 'tasks'
  | 'satellite'
  | 'labor'
  | 'soil'
  | 'market'
  | 'marketAlert'
  | 'leaseStatus'
  | 'aiAssistant'
  | 'addCrop'
  | 'createWork'
  | 'allLands'
  | 'notifications'
  | 'hub'
  | 'settings'
  | 'mandiCompare'
  | 'soilAdvisory';

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'neutral';

export interface ForecastDay {
  id: string;
  day: string;
  emoji: string;
  temp: string;
}

export interface WeatherInfo {
  emoji: string;
  tempC: number;
  condition: string;
  advice: string;
  humidityPct: number;
  windKmh: number;
  location: string;
  forecast: ForecastDay[];
  advisory: string;
}

export interface SnapStat {
  id: string;
  emoji: string;
  value: string;
  label: string;
  tone?: Tone;
  action: FarmerAction;
}

export interface TickerItem {
  id: string;
  cropId: string;
  name: string;
  emoji: string;
  price: number;
  unit: string;
  change: number;
}

export interface TaskItem {
  id: string;
  tone: Tone;
  icon: string;
  title: string;
  sub: string;
  actionLabel: string;
  action: FarmerAction;
}

export interface CropHealth {
  id: string;
  name: string;
  emoji: string;
  stage: string;
  statusLabel: string;
  statusTone: Tone;
  healthPct: number;
  healthTone: Tone;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  tone: Tone;
  action: FarmerAction;
}

export interface NewsItem {
  id: string;
  icon: string;
  tone: Tone;
  title: string;
  sub: string;
  action: FarmerAction;
  /** Optional external article link (present for live NewsData.io items). */
  url?: string;
}

export interface BrowseCrop {
  id: string;
  label: string;
  emoji: string;
}

export const FARMER_SNAPSHOT: readonly SnapStat[] = [
  { id: 's1', emoji: '📄', value: '-', label: 'Active leases', action: 'leases' },
  { id: 's2', emoji: '🌾', value: '-', label: 'Acres farmed', action: 'satellite' },
  { id: 's3', emoji: '🌱', value: '-', label: 'Crops', action: 'crops' },
  { id: 's4', emoji: '✅', value: '-', label: 'Tasks due', tone: 'amber', action: 'tasks' },
];

export const FARMER_AI_ADVISORY = {
  badge: '✦ FARM AI · SELL SIGNAL',
  text:
    'Tomato prices falling ₹18 → ₹11/kg in 18 days. Sell within 4 days, or book cold storage to store 60%.',
  cta: 'See AI plan & storage',
  action: 'marketAlert' as FarmerAction,
};

export const FARMER_TICKER: readonly TickerItem[] = [
  { id: 't1', cropId: 'tomato', name: 'Tomato', emoji: '🍅', price: 18, unit: 'kg', change: -3 },
  { id: 't2', cropId: 'onion', name: 'Onion', emoji: '🧅', price: 24, unit: 'kg', change: 2 },
  { id: 't3', cropId: 'chilli', name: 'Chilli', emoji: '🌶', price: 96, unit: 'kg', change: 4 },
  { id: 't4', cropId: 'cotton', name: 'Cotton', emoji: '☁️', price: 6800, unit: 'qt', change: 60 },
];

// Static mock rows for the "Today's tasks" home section. Each `action` maps to
// a real screen via the `onAction` resolver in useFarmerHome.ts.
export const FARMER_TASKS: readonly TaskItem[] = [
  { id: 'tk1', tone: 'blue', icon: 'water', title: 'Irrigation due · North plot', sub: 'Best before 9 AM', actionLabel: 'Schedule', action: 'satellite' },
  { id: 'tk2', tone: 'amber', icon: 'people', title: 'Confirm 3 laborers · Harvest', sub: 'Applied for tomorrow', actionLabel: 'Confirm', action: 'labor' },
  { id: 'tk3', tone: 'red', icon: 'document-text', title: 'Lease expiring · Suresh', sub: 'In 20 days · renew now', actionLabel: 'Renew', action: 'leases' },
  { id: 'tk4', tone: 'green', icon: 'flask', title: 'Soil test result ready', sub: 'AgriLab · pH & NPK report', actionLabel: 'View', action: 'soil' },
];

export const FARMER_QUICK_ACTIONS: readonly QuickAction[] = [
  { id: 'q1', label: 'Add Crop', icon: 'add-circle', tone: 'green', action: 'addCrop' },
  //{ id: 'q2', label: 'Create Work', icon: 'create', tone: 'blue', action: 'createWork' },
  //{ id: 'q3', label: 'Hire Labor', icon: 'people', tone: 'amber', action: 'labor' },
  //{ id: 'q4', label: 'Lease Status', icon: 'document-text', tone: 'purple', action: 'leaseStatus' },
  { id: 'q5', label: 'Satellite', icon: 'globe', tone: 'green', action: 'satellite' },
  { id: 'q6', label: 'Soil Test', icon: 'flask', tone: 'amber', action: 'soil' },
  //{ id: 'q7', label: 'Mandi Prices', icon: 'pricetags', tone: 'green', action: 'mandiCompare' },
  { id: 'q8', label: 'Soil Advisory', icon: 'leaf', tone: 'green', action: 'soilAdvisory' },
  //{ id: 'q9', label: 'Kisan Mitra', icon: 'mic', tone: 'blue', action: 'aiAssistant' },
];

export const FARMER_CROP_HEALTH: readonly CropHealth[] = [
  { id: 'ch1', name: 'Wheat · North plot', emoji: '🌾', stage: 'Flowering stage · harvest in 8 days', statusLabel: 'Healthy', statusTone: 'green', healthPct: 78, healthTone: 'green' },
  { id: 'ch2', name: 'Tomato · East plot', emoji: '🍅', stage: 'Fruiting · early blight detected', statusLabel: 'Disease risk', statusTone: 'red', healthPct: 62, healthTone: 'amber' },
];

export const FARMER_NEWS: readonly NewsItem[] = [
  { id: 'nw1', icon: 'business', tone: 'blue', title: 'New Govt. Subsidy Scheme', sub: '50% subsidy on solar pumps for farmers', action: 'hub' },
  { id: 'nw2', icon: 'trending-up', tone: 'green', title: 'Crop Price Alert', sub: 'Wheat prices expected to rise next week', action: 'market' },
];

export const FARMER_BROWSE_CROPS: readonly BrowseCrop[] = [
  { id: 'b1', label: 'Wheat', emoji: '🌾' },
  { id: 'b2', label: 'Rice', emoji: '🍚' },
  { id: 'b3', label: 'Vegetables', emoji: '🥬' },
  { id: 'b4', label: 'Orchard', emoji: '🍊' },
  { id: 'b5', label: 'Chilli', emoji: '🌶' },
  { id: 'b6', label: 'Cotton', emoji: '☁️' },
];

export const FARMER_NEARBY_CHIPS = ['Nearby', 'Purnea', 'Katihar'] as const;
export type NearbyChip = (typeof FARMER_NEARBY_CHIPS)[number];
