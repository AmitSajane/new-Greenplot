import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FarmerHomeScreen from '../screens/farmerHome';
import FarmDetailScreen from '../screens/farmer/FarmDetailScreen';
import AllAvailableLandsScreen from '../screens/farmer/AllAvailableLandsScreen';
import LeaseAgreementsScreen from '../screens/LeaseAgreementsScreen';
import AgreementDetailsScreen from '../screens/AgreementDetailsScreen';
import MyActiveLeasesScreen from '../screens/leases/myActiveLeases';
import LeaseTypeDetailsScreen from '../screens/LeaseTypeDetailsScreen';
import LeaseDetailViewScreen from '../screens/LeaseDetailViewScreen';
import LeaseConfirmationScreen from '../screens/LeaseConfirmationScreen';
import CompareLeasesScreen from '../screens/CompareLeasesScreen';
import LeaseApplicationScreen from '../screens/LeaseApplicationScreen';
import LeaseStatusScreen from '../screens/LeaseStatusScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import SatelliteMapScreen from '../screens/satelliteMap';
import LaborConnectStack from '../modules/labor/navigation/LaborConnectStack';
import NotificationsCenterScreen from '../screens/NotificationsCenterScreen';
import SoilTestScreen from '../screens/SoilTestScreen';

export type FarmerHomeStackParamList = {
  FarmerHome: undefined;
  NotificationsCenter: undefined;
  FarmDetail: { farmId: string };
  AllAvailableLands: undefined;
  LandListing: undefined;
  LeaseApplication: { propertyId?: string; leaseTypeId?: string; leaseTypeTitle?: string } | undefined;
  LeaseStatus: undefined;
  LeaseAgreements: undefined;
  AgreementDetails: undefined;
  MyActiveLeases: undefined;
  LeaseTypeDetails: { selectedLeaseType?: string; propertyId?: string };
  LeaseDetailView: { leaseTypeId: string; leaseTypeTitle: string; propertyId?: string };
  LeaseConfirmation: { leaseTypeId: string; leaseTypeTitle: string };
  CompareLeases: { selectedLeaseTypeId?: string; propertyId?: string };
  AIAssistant: undefined;
  SatelliteMap: undefined;
  LaborConnect: undefined;
  SoilTest: undefined;
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
      <Stack.Screen name="NotificationsCenter" component={NotificationsCenterScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{ title: 'AI Assistant' }}
      />
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
      <Stack.Screen name="LeaseApplication" component={LeaseApplicationScreen} options={{ title: 'Lease Application' }} />
      <Stack.Screen name="LeaseStatus" component={LeaseStatusScreen} options={{ title: 'Lease Status' }} />
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
      <Stack.Screen
        name="SatelliteMap"
        component={SatelliteMapScreen}
        options={{
          title: 'Satellite Monitoring',
        }}
      />
      <Stack.Screen
        name="LaborConnect"
        component={LaborConnectStack}
        options={{ title: 'Labor Connect' }}
      />
      <Stack.Screen
        name="SoilTest"
        component={SoilTestScreen}
        options={{ title: 'Soil Test' }}
      />
    </Stack.Navigator>
  );
}
