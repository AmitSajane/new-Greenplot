import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPropertiesScreen from '../screens/owner/MyPropertiesScreen';
import PropertyDetailsScreen from '../screens/owner/PropertyDetailsScreen';
import LeaseTypeDetailsScreen from '../screens/LeaseTypeDetailsScreen';
import LeaseDetailViewScreen from '../screens/LeaseDetailViewScreen';
import CompareLeasesScreen from '../screens/CompareLeasesScreen';
import AddLeaseOfferScreen from '../screens/owner/AddLeaseOfferScreen';
import AddFarmScreen from '../screens/owner/AddFarmScreen';
import CropDetailsScreen from '../modules/work/screens/CropDetailsScreen';
import AgreementDetailsScreen from '../screens/AgreementDetailsScreen';
import RequestLeaseClosureScreen from '../screens/leaseClosure/RequestLeaseClosureScreen';
import ClosureRequestedScreen from '../screens/leaseClosure/ClosureRequestedScreen';
import LeaseClosureScreen from '../screens/leaseClosure/LeaseClosureScreen';
import NotificationsCenterScreen from '../screens/NotificationsCenterScreen';
import type { FarmListing } from '../context/FarmListingsContext';
import SettingsStack from './SettingsStack';

export type MyPropertiesStackParamList = {
  MyPropertiesList: undefined;
  PropertyDetails: { propertyId: string };
  LeaseTypeDetails: { propertyId: string; selectedLeaseType?: string };
  LeaseDetailView: { leaseTypeId: string; leaseTypeTitle: string; propertyId?: string };
  CompareLeases: { selectedLeaseTypeId?: string; propertyId?: string };
  // See OwnerHomeStack's AddLeaseOffer — same draft-land-vs-existing-land shape.
  AddLeaseOffer:
    | { landId: string; landTitle?: string; draftLand?: undefined; initialAvailableFrom?: string }
    | { draftLand: Omit<FarmListing, 'id' | 'createdAt'>; landTitle?: string; landId?: undefined; initialAvailableFrom?: string };
  AddFarm: { editListingId: string };
  CropDetails: { cropCycleId: string };
  AgreementDetails: { agreementId: string };
  LeaseClosureRequest: { leaseId: string };
  // Step 1 (request + owner response) — every entry point lands here first.
  ClosureRequested: { closureId: string };
  // Step 2 (settlement onward) — reached only by pushing forward from
  // ClosureRequested, so back always returns there, not to whatever opened it.
  LeaseClosure: { closureId: string };
  NotificationsCenter: undefined;
  Settings: undefined;
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
      <Stack.Screen name="CropDetails" component={CropDetailsScreen} options={{ title: 'Crop Details' }} />
      <Stack.Screen
        name="AgreementDetails"
        component={AgreementDetailsScreen}
        options={{ title: 'Agreement Details' }}
      />
      <Stack.Screen
        name="LeaseClosureRequest"
        component={RequestLeaseClosureScreen}
        options={{ title: 'Request Lease Closure' }}
      />
      <Stack.Screen
        name="ClosureRequested"
        component={ClosureRequestedScreen}
        options={{ title: 'Closure Requested' }}
      />
      <Stack.Screen
        name="LeaseClosure"
        component={LeaseClosureScreen}
        options={{ title: 'Lease Closure' }}
      />
      <Stack.Screen
        name="NotificationsCenter"
        component={NotificationsCenterScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen name="Settings" component={SettingsStack} />
    </Stack.Navigator>
  );
}
