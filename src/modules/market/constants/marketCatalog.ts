import { Crop } from '../types';

/** Supported commodity shortcuts. Prices and intelligence are never stored here. */
export const MARKET_CROPS: Crop[] = [
  { id: 'tomato', name: 'Tomato', emoji: '🍅', unit: 'quintal' },
  { id: 'onion', name: 'Onion', emoji: '🧅', unit: 'quintal' },
  { id: 'chilli', name: 'Chilli', emoji: '🌶', unit: 'quintal' },
  { id: 'jowar', name: 'Jowar', emoji: '🌾', unit: 'quintal' },
  { id: 'cotton', name: 'Cotton', emoji: '☁️', unit: 'quintal' },
];

export const DEFAULT_MARKET_CROP = MARKET_CROPS[0];

export const marketCropForId = (cropId?: string) =>
  MARKET_CROPS.find(crop => crop.id === cropId) ?? DEFAULT_MARKET_CROP;
