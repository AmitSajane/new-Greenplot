import { Mandi } from '../types';

export const MOCK_MANDIS: Mandi[] = [
  { id: 'belagavi', name: 'Belagavi APMC', location: '74 km · Best price', distanceKm: 74, price: 22, changeToday: 1, emoji: '🏆', rank: 'best' },
  { id: 'hubli', name: 'Hubli APMC', location: '22 km · 2nd best', distanceKm: 22, price: 20, changeToday: -2, emoji: '🍅', rank: null },
  { id: 'dharwad', name: 'Dharwad APMC', location: '0 km · Your nearest', distanceKm: 0, price: 18, changeToday: -3, emoji: '🍅', rank: 'nearest' },
  { id: 'davangere', name: 'Davangere', location: '88 km away', distanceKm: 88, price: 17, changeToday: -5, emoji: '🍅', rank: null },
  { id: 'gadag', name: 'Gadag APMC', location: '45 km away', distanceKm: 45, price: 16, changeToday: -4, emoji: '🍅', rank: 'lowest' },
];
