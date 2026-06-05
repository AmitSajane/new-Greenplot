export type OwnerActivity = {
  id: string;
  type: 'view' | 'call';
  title: string;
  description: string;
  time: string;
  avatarUrl?: string;
  phoneNumber?: string;
};

export const RECENT_ACTIVITIES: OwnerActivity[] = [
  {
    id: '1',
    type: 'view',
    title: 'Ramesh Kumar',
    description: 'Viewed your 2-acre Wheat plot...',
    time: '2 hours ago',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    type: 'call',
    title: 'Missed Call',
    description: 'From +91 98*** ***12 regardin...',
    time: 'Yesterday',
    phoneNumber: '+919876543212',
  },
];
