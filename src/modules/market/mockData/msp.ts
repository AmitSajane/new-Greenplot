import { MspCrop } from '../types';

export const MOCK_MSP_CROPS: MspCrop[] = [
  { emoji: '🌾', name: 'Jowar', msp: '₹3,180/qt', market: '₹2,200', status: '▼ Below MSP', tone: 'red' },
  { emoji: '☁️', name: 'Cotton', msp: '₹6,620/qt', market: '₹6,800', status: '▲ Above MSP', tone: 'green' },
  { emoji: '🌱', name: 'Groundnut', msp: '₹6,377/qt', market: '₹6,100', status: '▼ Below MSP', tone: 'red' },
  { emoji: '🟡', name: 'Soybean', msp: '₹4,892/qt', market: '₹4,900', status: '✓ Near MSP', tone: 'amber' },
  { emoji: '🌽', name: 'Maize', msp: '₹2,225/qt', market: '₹2,180', status: '▼ Below MSP', tone: 'red' },
];
