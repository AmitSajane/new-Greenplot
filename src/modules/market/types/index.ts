/**
 * Market Intelligence module — domain types.
 */

export type PriceTrend = 'rising' | 'falling' | 'flat';
export type Sentiment = 'bullish' | 'bearish' | 'neutral';

export interface Crop {
  id: string;
  name: string;
  emoji: string;
  unit: string; // e.g. "kg", "qt", "ton"
}

export interface CropMarket {
  cropId: string;
  price: number; // current price in the unit
  unit: string;
  changeToday: number; // +/- amount today
  trend: PriceTrend;
  forecast30d: number;
  forecastConfidence: number; // 0–100
  week52Low: number;
  week52High: number;
  bestMandi: string;
  bestMandiPrice: number;
  todayArrivalMT: number;
  demandScore: number; // 0–100
  sentiment: Sentiment;
  oversupply: boolean;
  referenceMandi: string;
  /** weekly price points: 6 actual + forecast tail */
  history: number[];
  forecast: number[];
}

export interface Mandi {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  price: number;
  changeToday: number;
  emoji: string;
  rank?: 'best' | 'nearest' | 'lowest' | null;
}

export type AlertType = 'crash' | 'oversupply' | 'rising' | 'govt' | 'buyer';

export interface MarketAlert {
  id: string;
  type: AlertType;
  title: string;
  subtitle: string;
  group: 'today' | 'yesterday';
  time: string;
  source: string;
}

export interface Buyer {
  id: string;
  name: string;
  initials: string;
  crops: string;
  distanceKm: number;
  price: number;
  tags: { label: string; tone: 'green' | 'blue' | 'amber' | 'purple' }[];
  tone: 'strong' | 'normal' | 'low';
}

export interface ForecastWeek {
  label: string;
  price: number;
  change: number;
  pct: number; // bar width 0–100
  tone: 'amber' | 'red' | 'green';
}

export interface DemandRegion {
  label: string;
  pct: number;
  tone: 'green' | 'amber' | 'red';
}

export interface ArrivalSource {
  label: string;
  mt: number;
  pct: number;
}

export interface ArrivalDay {
  label: string;
  mt: number;
  level: 'low' | 'normal' | 'high' | 'peak';
}

export interface MspCrop {
  emoji: string;
  name: string;
  msp: string;
  market: string;
  status: string;
  tone: 'green' | 'amber' | 'red';
}

export interface AiAction {
  icon: string; // emoji
  title: string;
  text: string;
}

/** A single capability a cold storage offers (drives the detail + booking UI). */
export interface StorageFeature {
  /** Ionicons name. */
  icon: string;
  label: string;
  available: boolean;
}

export interface ColdStorage {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  verified: boolean;
  /** Free capacity available to book, in metric tonnes. */
  availableCapacityMT: number;
  totalCapacityMT: number;
  /** Storage tariff in ₹ per kg per day. */
  ratePerKgPerDay: number;
  tempRange: string; // e.g. "2°C – 8°C"
  commodities: string; // e.g. "Multi-commodity"
  openHours: string;
  image: string; // emoji used as a placeholder cover
  /** Accent colour for the cover tile. */
  tone: string;
  features: StorageFeature[];
  /** Highlight chips shown on the list card. */
  highlights: string[];
}

export interface StorageBooking {
  bookingId: string;
  storageId: string;
  storageName: string;
  cropName: string;
  quantityKg: number;
  durationDays: number;
  startDate: string;
  ratePerKgPerDay: number;
  storageCost: number;
  handlingFee: number;
  insuranceFee: number;
  total: number;
}
