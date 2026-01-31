import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import FarmDetailScreen from '../screens/farmer/FarmDetailScreen';
import AllAvailableLandsScreen from '../screens/farmer/AllAvailableLandsScreen';
import LeaseAgreementsScreen from '../screens/LeaseAgreementsScreen';
import AgreementDetailsScreen from '../screens/AgreementDetailsScreen';
import MyActiveLeasesScreen from '../screens/farmer/MyActiveLeasesScreen';
import LeaseTypeDetailsScreen from '../screens/LeaseTypeDetailsScreen';
import LeaseDetailViewScreen from '../screens/LeaseDetailViewScreen';
import LeaseConfirmationScreen from '../screens/LeaseConfirmationScreen';
import CompareLeasesScreen from '../screens/CompareLeasesScreen';

export type FarmerHomeStackParamList = {
  FarmerHome: undefined;
  FarmDetail: { farmId: string };
  AllAvailableLands: undefined;
  LeaseAgreements: undefined;
  AgreementDetails: undefined;
  MyActiveLeases: undefined;
  LeaseTypeDetails: { selectedLeaseType?: string };
  LeaseDetailView: { leaseTypeId: string; leaseTypeTitle: string };
  LeaseConfirmation: { leaseTypeId: string; leaseTypeTitle: string };
  CompareLeases: { selectedLeaseTypeId?: string };
};

const Stack = createNativeStackNavigator<FarmerHomeStackParamList>();

export default function FarmerHomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="FarmerHome" component={FarmerHomeScreen} />
      <Stack.Screen
        name="FarmDetail"
        component={FarmDetailScreen}
        options={{ title: 'Farm Details' }}
      />
      <Stack.Screen
        name="AllAvailableLands"
        component={AllAvailableLandsScreen}
        options={{ title: 'All Available Lands' }}
      />
      <Stack.Screen
        name="MyActiveLeases"
        component={MyActiveLeasesScreen}
        options={{ title: 'My Active Leases' }}
      />
      <Stack.Screen
        name="LeaseAgreements"
        component={LeaseAgreementsScreen}
        options={{
          title: 'My Lease Agreements',
        }}
      />
      <Stack.Screen
        name="AgreementDetails"
        component={AgreementDetailsScreen}
        options={{
          title: 'Agreement Details',
        }}
      />
      <Stack.Screen
        name="LeaseTypeDetails"
        component={LeaseTypeDetailsScreen}
        options={{
          title: 'Lease Type Details',
        }}
      />
      <Stack.Screen
        name="LeaseDetailView"
        component={LeaseDetailViewScreen}
        options={{
          title: 'Lease Details',
        }}
      />
      <Stack.Screen
        name="LeaseConfirmation"
        component={LeaseConfirmationScreen}
        options={{
          title: 'Lease Confirmation',
        }}
      />
      <Stack.Screen
        name="CompareLeases"
        component={CompareLeasesScreen}
        options={{
          title: 'Compare Leases',
        }}
      />
    </Stack.Navigator>
  );
}
