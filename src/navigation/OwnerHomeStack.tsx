import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OwnerHomeScreen from '../screens/owner/OwnerHomeScreen';
import AddFarmScreen from '../screens/owner/AddFarmScreen';
import LeaseLandScreen from '../screens/LeaseLandScreen';
import LeaseAgreementsScreen from '../screens/LeaseAgreementsScreen';
import AgreementDetailsScreen from '../screens/AgreementDetailsScreen';

export type OwnerHomeStackParamList = {
  OwnerHome: undefined;
  AddFarm: undefined;
  LeaseLand: undefined;
  LeaseAgreements: undefined;
  AgreementDetails: undefined;
};

const Stack = createNativeStackNavigator<OwnerHomeStackParamList>();

export default function OwnerHomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OwnerHome" component={OwnerHomeScreen} />
      <Stack.Screen
        name="AddFarm"
        component={AddFarmScreen}
        options={{
          title: 'Add Farm',
        }}
      />
      <Stack.Screen
        name="LeaseLand"
        component={LeaseLandScreen}
        options={{
          title: 'Lease Land',
        }}
      />
      <Stack.Screen
        name="LeaseAgreements"
        component={LeaseAgreementsScreen}
        options={{
          title: 'Lease Agreements',
        }}
      />
      <Stack.Screen
        name="AgreementDetails"
        component={AgreementDetailsScreen}
        options={{
          title: 'Agreement Details',
        }}
      />
    </Stack.Navigator>
  );
}
