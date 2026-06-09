import { ForecastWeek, AiAction } from '../types';

export const MOCK_FORECAST_WEEKS: ForecastWeek[] = [
  { label: 'Week 1', price: 16, change: -2, pct: 78, tone: 'amber' },
  { label: 'Week 2', price: 13, change: -3, pct: 65, tone: 'red' },
  { label: 'Week 3', price: 11, change: -2, pct: 56, tone: 'red' },
  { label: 'Week 4', price: 12, change: 1, pct: 60, tone: 'amber' },
];

export const MOCK_AI_ACTIONS: AiAction[] = [
  {
    icon: '❄️',
    title: 'Consider cold storage',
    text: 'Store for 12–15 days. Price recovery to ₹26/kg expected. Net gain: +₹9,600 for 1,200 kg.',
  },
  {
    icon: '🚛',
    title: 'Best mandi: Belagavi APMC',
    text: 'Offers ₹4/kg more than Dharwad. Transport ~₹1.4/kg. Net positive if selling >500 kg.',
  },
  {
    icon: '📱',
    title: 'Set price alert at ₹21',
    text: "We'll notify you when the price hits the optimal selling signal.",
  },
];

export const AI_INSIGHT_TEXT =
  'Oversupply of 38% detected across 6 districts. Prices expected to fall ₹7 more in 18 days. Sell 40% now at Belagavi APMC, store 60% for 15 days.';
