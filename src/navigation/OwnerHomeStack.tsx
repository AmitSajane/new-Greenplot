import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OwnerHomeScreen from '../screens/ownerHome';
import AddFarmScreen from '../screens/owner/AddFarmScreen';
import BudgetApprovalsScreen from '../screens/owner/BudgetApprovalsScreen';
import MyCropsScreen from '../screens/farmer/MyCropsScreen';
import CropDetailsScreen from '../modules/work/screens/CropDetailsScreen';
import CreateWorkScreen from '../modules/work/screens/CreateWorkScreen';
import LeaseLandScreen from '../screens/LeaseLandScreen';
import LeaseAgreementsScreen from '../screens/LeaseAgreementsScreen';
import AgreementDetailsScreen from '../screens/AgreementDetailsScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import SatelliteMapScreen from '../screens/satelliteMap';
import LaborConnectStack from '../modules/labor/navigation/LaborConnectStack';
import OwnerWorkReportScreen from '../screens/owner/OwnerWorkReportScreen';
import NotificationsCenterScreen from '../screens/NotificationsCenterScreen';
import SoilTestScreen from '../screens/SoilTestScreen';

export type OwnerHomeStackParamList = {
  OwnerHome: undefined;
  NotificationsCenter: undefined;
  SoilTest: undefined;
  AddFarm:
    | {
        acres?: string;
        plotGeoJSON?: any;
      }
    | undefined;
  BudgetApprovals: undefined;
  MyCrops: undefined;
  CropDetails: { cropCycleId: string };
  CreateWork: { cropCycleId?: string };
  LeaseLand: undefined;
  LeaseAgreements: undefined;
  AgreementDetails: undefined;
  AIAssistant: undefined;
  SatelliteMap: undefined;
  LaborConnect: undefined;
  OwnerWorkReport: undefined;
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
      <Stack.Screen name="NotificationsCenter" component={NotificationsCenterScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{ title: 'Kisan Mitra' }}
      />
      <Stack.Screen
        name="AddFarm"
        component={AddFarmScreen}
        options={{
          title: 'Add Farm',
        }}
      />
      <Stack.Screen
        name="BudgetApprovals"
        component={BudgetApprovalsScreen}
        options={{ title: 'Budget & Approvals' }}
      />
      <Stack.Screen
        name="MyCrops"
        component={MyCropsScreen}
        options={{ title: 'My Crops' }}
      />
      <Stack.Screen
        name="CropDetails"
        component={CropDetailsScreen}
        options={{ title: 'Crop Details' }}
      />
      <Stack.Screen
        name="CreateWork"
        component={CreateWorkScreen}
        options={{ title: 'Create Work' }}
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
        name="OwnerWorkReport"
        component={OwnerWorkReportScreen}
        options={{ title: 'Work Report' }}
      />
      <Stack.Screen
        name="SoilTest"
        component={SoilTestScreen}
        options={{ title: 'Soil Test' }}
      />
    </Stack.Navigator>
  );
}
