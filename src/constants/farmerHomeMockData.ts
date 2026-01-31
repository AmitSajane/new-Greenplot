import { ImageSourcePropType } from 'react-native';

export type HomeFeaturedListing = {
  id: string;
  title: string;
  pricePerYear: string;
  locationLabel: string;
  acresLabel: string;
  image: ImageSourcePropType | { uri: string };
  leaseType?: string;
};

export type HomeNewsItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: 'campaign' | 'trending-up';
};

export type HomeActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  badge?: 'Active' | 'Pending' | 'Completed';
  image: ImageSourcePropType;
};

export type HomeCrop = {
  id: string;
  label: string;
  icon: 'leaf' | 'grain' | 'nutrition' | 'flower';
};

export const FEATURED_LISTINGS: HomeFeaturedListing[] = [
  {
    id: 'l1',
    acresLabel: '5 Acres',
    title: 'Fertile Wheat Land',
    pricePerYear: '₹12k',
    locationLabel: 'Kasba, Purnea (2km away)',
    image: require('../assets/images/farm2.png'),
  },
  {
    id: 'l2',
    acresLabel: '2.5 Acres',
    title: 'Paddy Land',
    pricePerYear: '₹9k',
    locationLabel: 'Banmankhi, Purnea (6km away)',
    image: require('../assets/images/farm3.png'),
  },
];

export const NEWS_UPDATES: HomeNewsItem[] = [
  {
    id: 'n1',
    icon: 'campaign',
    title: 'New Govt. Subsidy Scheme',
    subtitle: '50% subsidy on solar pumps for farmers.',
  },
  {
    id: 'n2',
    icon: 'trending-up',
    title: 'Crop Price Alert',
    subtitle: 'Wheat prices expected to rise next week.',
  },
];

export const YOUR_ACTIVITY: HomeActivityItem[] = [
  {
    id: 'a1',
    title: 'Lease with Suresh',
    subtitle: 'Expires in 20 days',
    badge: 'Active',
    image: require('../assets/images/landscape.jpg'),
  },
  {
    id: 'a2',
    title: 'Request for Soil Test',
    subtitle: 'From: AgriLab',
    badge: 'Pending',
    image: require('../assets/images/cultivated-field.jpg'),
  },
];

export const BROWSE_BY_CROP: HomeCrop[] = [
  { id: 'c1', label: 'Wheat', icon: 'leaf' },
  { id: 'c2', label: 'Rice', icon: 'grain' },
  { id: 'c3', label: 'Vegetables', icon: 'nutrition' },
  { id: 'c4', label: 'Orchard', icon: 'flower' },
];

