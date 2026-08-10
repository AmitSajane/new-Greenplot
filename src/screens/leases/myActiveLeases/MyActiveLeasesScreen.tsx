import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FarmerHomeStackParamList } from '../../../navigation/FarmerHomeStack';
import { MyActiveLeasesContent } from './components/MyActiveLeasesContent';
import { useMyActiveLeases } from './hooks/useMyActiveLeases';

type Props = NativeStackScreenProps<FarmerHomeStackParamList, 'MyActiveLeases'>;

export default function MyActiveLeasesScreen(props: Props) {
  const vm = useMyActiveLeases(props);
  return <MyActiveLeasesContent {...vm} />;
}
