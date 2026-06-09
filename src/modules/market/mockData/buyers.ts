import { Buyer } from '../types';

export const MOCK_BUYERS: Buyer[] = [
  {
    id: 'b1',
    name: 'Ramesh Kumar Exports',
    initials: 'RK',
    crops: 'Tomato, Onion · 2.4 km',
    distanceKm: 2.4,
    price: 21,
    tags: [
      { label: 'Bulk', tone: 'green' },
      { label: 'Transport ✓', tone: 'blue' },
    ],
    tone: 'strong',
  },
  {
    id: 'b2',
    name: 'Sahyadri Agro Pvt Ltd',
    initials: 'SA',
    crops: 'All vegetables · 5.1 km',
    distanceKm: 5.1,
    price: 23,
    tags: [{ label: 'Export grade', tone: 'purple' }],
    tone: 'normal',
  },
  {
    id: 'b3',
    name: 'Modern Food Processing',
    initials: 'MF',
    crops: 'Tomato, Chilli · 8.6 km',
    distanceKm: 8.6,
    price: 17,
    tags: [{ label: 'Processing', tone: 'amber' }],
    tone: 'low',
  },
];
