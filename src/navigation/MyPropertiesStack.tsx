import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPropertiesScreen from '../screens/owner/MyPropertiesScreen';
import PropertyDetailsScreen from '../screens/owner/PropertyDetailsScreen';
import LeaseTypeDetailsScreen from '../screens/LeaseTypeDetailsScreen';
import LeaseDetailViewScreen from '../screens/LeaseDetailViewScreen';
import CompareLeasesScreen from '../screens/CompareLeasesScreen';
import AddLeaseOfferScreen from '../screens/owner/AddLeaseOfferScreen';
import AddFarmScreen from '../screens/owner/AddFarmScreen';

export type MyPropertiesStackParamList = {
  MyPropertiesList: undefined;
  PropertyDetails: { propertyId: string };
  LeaseTypeDetails: { propertyId: string; selectedLeaseType?: string };
  LeaseDetailView: { leaseTypeId: string; leaseTypeTitle: string; propertyId?: string };
  CompareLeases: { selectedLeaseTypeId?: string; propertyId?: string };
  AddLeaseOffer: { landId: string; landTitle?: string };
  AddFarm: { editListingId: string };
};

const Stack = createNativeStackNavigator<MyPropertiesStackParamList>();

export default function MyPropertiesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MyPropertiesList" component={MyPropertiesScreen} />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <Stack.Screen name="LeaseTypeDetails" component={LeaseTypeDetailsScreen} />
      <Stack.Screen name="LeaseDetailView" component={LeaseDetailViewScreen} />
      <Stack.Screen name="CompareLeases" component={CompareLeasesScreen} />
      <Stack.Screen name="AddLeaseOffer" component={AddLeaseOfferScreen} />
      <Stack.Screen name="AddFarm" component={AddFarmScreen} />
    </Stack.Navigator>
  );
}
