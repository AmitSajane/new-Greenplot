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
import RequestLeaseClosureScreen from '../screens/leaseClosure/RequestLeaseClosureScreen';
import LeaseClosureScreen from '../screens/leaseClosure/LeaseClosureScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import SatelliteMapScreen from '../screens/satelliteMap';
import WeatherDetailScreen from '../screens/WeatherDetailScreen';
import LaborConnectStack from '../modules/labor/navigation/LaborConnectStack';
import OwnerWorkReportScreen from '../screens/owner/OwnerWorkReportScreen';
import NotificationsCenterScreen from '../screens/NotificationsCenterScreen';
import SoilTestScreen from '../screens/SoilTestScreen';
import AddLeaseOfferScreen from '../screens/owner/AddLeaseOfferScreen';
import LeaseRequestsScreen from '../screens/owner/LeaseRequestsScreen';
import AgreementScreen from '../screens/AgreementScreen';
import ArticleScreen from '../screens/ArticleScreen';
import MandiPricesScreen from '../screens/MandiPricesScreen';
import SoilAdvisoryScreen from '../screens/SoilAdvisoryScreen';
import SchemesNewsListScreen from '../screens/farmerHome/SchemesNewsListScreen';
import type { NewsItem } from '../screens/farmerHome/constants/farmerDashboardData';
import type { SchemeCategory } from '../screens/farmerHome/constants/schemeCatalog';
import type { FarmListing } from '../context/FarmListingsContext';
import SettingsStack from './SettingsStack';

export type OwnerHomeStackParamList = {
  OwnerHome: undefined;
  Article: { url: string; title?: string };
  MandiPrices: undefined;
  SoilAdvisory: undefined;
  NotificationsCenter: undefined;
  SoilTest: undefined;
  // Either an existing land (`landId`) gets a new offer added to it, or — the
  // "Continue with Lease Offer" path from AddFarmScreen — a not-yet-created
  // land (`draftLand`) is created together with the offer once published.
  AddLeaseOffer:
    | { landId: string; landTitle?: string; draftLand?: undefined }
    | { draftLand: Omit<FarmListing, 'id' | 'createdAt'>; landTitle?: string; landId?: undefined };
  LeaseRequests: undefined;
  AgreementSign: { agreementId: string };
  AddFarm:
    | {
        acres?: string;
        plotGeoJSON?: any;
        location?: string;
        district?: string;
        state?: string;
        editListingId?: string;
      }
    | undefined;
  BudgetApprovals: undefined;
  MyCrops: undefined;
  CropDetails: { cropCycleId: string };
  CreateWork: { cropCycleId?: string };
  LeaseLand: undefined;
  LeaseAgreements: undefined;
  AgreementDetails: { agreementId: string };
  LeaseClosureRequest: { leaseId: string };
  LeaseClosure: { closureId: string };
  AIAssistant: undefined;
  SatelliteMap: { returnTo?: string } | undefined;
  WeatherDetail: undefined;
  LaborConnect: undefined;
  OwnerWorkReport: undefined;
  SchemesNewsList:
    | { items?: readonly NewsItem[]; initialTab?: 'schemes' | 'news'; initialCategory?: SchemeCategory | 'all' }
    | undefined;
  Settings: undefined;
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
      <Stack.Screen name="Article" component={ArticleScreen} />
      <Stack.Screen name="MandiPrices" component={MandiPricesScreen} />
      <Stack.Screen name="SoilAdvisory" component={SoilAdvisoryScreen} />
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
        name="LeaseClosureRequest"
        component={RequestLeaseClosureScreen}
        options={{ title: 'Request Lease Closure' }}
      />
      <Stack.Screen
        name="LeaseClosure"
        component={LeaseClosureScreen}
        options={{ title: 'Lease Closure' }}
      />
      <Stack.Screen
        name="SatelliteMap"
        component={SatelliteMapScreen}
        options={{
          title: 'Satellite Monitoring',
        }}
      />
      <Stack.Screen
        name="WeatherDetail"
        component={WeatherDetailScreen}
        options={{
          title: 'Weather & Farm Advisory',
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
      <Stack.Screen name="AddLeaseOffer" component={AddLeaseOfferScreen} />
      <Stack.Screen name="LeaseRequests" component={LeaseRequestsScreen} options={{ title: 'Lease Requests' }} />
      <Stack.Screen name="AgreementSign" component={AgreementScreen} />
      <Stack.Screen
        name="SchemesNewsList"
        component={SchemesNewsListScreen}
        options={{ title: 'Schemes & Subsidies' }}
      />
      <Stack.Screen name="Settings" component={SettingsStack} />
    </Stack.Navigator>
  );
}
