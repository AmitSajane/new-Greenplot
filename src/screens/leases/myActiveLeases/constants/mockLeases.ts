import { LeaseListItem } from '../../../../components/leases/LeaseCard';

export const MOCK_ACTIVE_LEASES: LeaseListItem[] = [
  {
    id: 'la1',
    title: 'Lease with Suresh',
    ownerName: 'Suresh Kumar',
    locationLabel: 'Kasba, Purnea',
    acresLabel: '5 Acres',
    rentLabel: '₹12k / year',
    status: 'Active',
    expiresInLabel: '20 days left',
    image: require('../../../../assets/images/farm1.png'),
  },
  {
    id: 'la2',
    title: 'Ramgarh Plot A',
    ownerName: 'Rajesh Singh',
    locationLabel: 'Ramgarh, Purnea',
    acresLabel: '2.5 Acres',
    rentLabel: '₹9k / year',
    status: 'Active',
    expiresInLabel: '3 months left',
    image: require('../../../../assets/images/cultivated-field.jpg'),
  },
  {
    id: 'la3',
    title: 'Sitapur Farm (Draft)',
    ownerName: 'Amit Kumar',
    locationLabel: 'Sitapur',
    acresLabel: '5 Acres',
    rentLabel: '₹30k / year',
    status: 'Pending',
    image: require('../../../../assets/images/farm2.png'),
  },
];
