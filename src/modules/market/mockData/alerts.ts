import { MarketAlert } from '../types';

/** Compact alert strip shown on the Market home screen. */
export const MOCK_ALERT_STRIP: MarketAlert[] = [
  { id: 'a1', type: 'crash', title: 'Price crash alert', subtitle: 'Tomato · fall in 12 days', group: 'today', time: '2h ago', source: 'AI Prediction' },
  { id: 'a2', type: 'oversupply', title: 'Oversupply', subtitle: 'Arrivals +38% above avg', group: 'today', time: '4h ago', source: 'Market data' },
  { id: 'a3', type: 'rising', title: 'Chilli rising', subtitle: 'Export demand up', group: 'today', time: '5h ago', source: 'Market data' },
];

/** Full notification list for the Alerts Centre screen. */
export const MOCK_ALERTS: MarketAlert[] = [
  { id: 'n1', type: 'crash', title: 'Price crash alert: Tomato', subtitle: 'Expected 35% fall in 10 days. AI confidence: 87%. Sell or store recommendation ready.', group: 'today', time: '2h ago', source: 'AI Prediction' },
  { id: 'n2', type: 'oversupply', title: 'Oversupply: North Karnataka', subtitle: 'Tomato arrivals 38% above average. 6 districts contributing to heavy inflow.', group: 'today', time: '4h ago', source: 'Market data' },
  { id: 'n3', type: 'rising', title: 'Chilli prices rising', subtitle: 'Byadgi chilli up ₹4/kg. Export demand from Vietnam and South Korea strong.', group: 'today', time: '5h ago', source: 'Market data' },
  { id: 'n4', type: 'buyer', title: 'New buyer interest', subtitle: 'Sahyadri Agro wants 800 kg Tomato at ₹23/kg. Respond within 24h.', group: 'yesterday', time: 'Yesterday', source: 'Marketplace' },
  { id: 'n5', type: 'govt', title: 'PM-KISAN installment', subtitle: '₹2,000 credit in 18 days. Ensure Aadhaar-linked bank account is active.', group: 'yesterday', time: 'Yesterday', source: 'Govt scheme' },
];
