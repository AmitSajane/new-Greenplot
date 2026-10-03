import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FarmerHomeScreen from '../screens/farmerHome';
import FarmDetailScreen from '../screens/farmer/FarmDetailScreen';
import AllAvailableLandsScreen from '../screens/farmer/AllAvailableLandsScreen';
import FarmsAvailableForManagementScreen from '../screens/farmer/FarmsAvailableForManagementScreen';
import ManagementRequestFormScreen from '../screens/farmer/ManagementRequestFormScreen';
import ManagementRequestReviewScreen from '../screens/farmer/ManagementRequestReviewScreen';
import ManagementRequestSubmittedScreen from '../screens/farmer/ManagementRequestSubmittedScreen';
import MyManagementRequestsScreen from '../screens/farmer/MyManagementRequestsScreen';
import ManagementRequestDetailsScreen from '../screens/farmer/ManagementRequestDetailsScreen';
import MyManagedFarmsScreen from '../screens/farmer/MyManagedFarmsScreen';
import ManagedFarmDashboardScreen from '../screens/farmer/ManagedFarmDashboardScreen';
import SelectCropScreen from '../screens/farmer/SelectCropScreen';
import CropPlanFormScreen from '../screens/farmer/CropPlanFormScreen';
import CropPlanReviewScreen from '../screens/farmer/CropPlanReviewScreen';
import CropDetailsScreen from '../modules/work/screens/CropDetailsScreen';
import CreateWorkScreen from '../modules/work/screens/CreateWorkScreen';
import type { ManagementRequestDraft } from '../screens/farmer/managementRequestDraft';
import type { CropPlanDraft } from '../screens/farmer/cropPlanDraft';
import LeaseAgreementsScreen from '../screens/LeaseAgreementsScreen';
import AgreementDetailsScreen from '../screens/AgreementDetailsScreen';
import RequestLeaseClosureScreen from '../screens/leaseClosure/RequestLeaseClosureScreen';
import ClosureRequestedScreen from '../screens/leaseClosure/ClosureRequestedScreen';
import LeaseClosureScreen from '../screens/leaseClosure/LeaseClosureScreen';
import MyActiveLeasesScreen from '../screens/leases/myActiveLeases';
import LeaseTypeDetailsScreen from '../screens/LeaseTypeDetailsScreen';
import LeaseDetailViewScreen from '../screens/LeaseDetailViewScreen';
import LeaseConfirmationScreen from '../screens/LeaseConfirmationScreen';
import CompareLeasesScreen from '../screens/CompareLeasesScreen';
import LeaseApplicationScreen from '../screens/LeaseApplicationScreen';
import LeaseStatusScreen from '../screens/LeaseStatusScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import SatelliteMapScreen from '../screens/satelliteMap';
import WeatherDetailScreen from '../screens/WeatherDetailScreen';
import LaborConnectStack from '../modules/labor/navigation/LaborConnectStack';
import NotificationsCenterScreen from '../screens/NotificationsCenterScreen';
import SoilTestScreen from '../screens/SoilTestScreen';
import AgreementScreen from '../screens/AgreementScreen';
import ArticleScreen from '../screens/ArticleScreen';
import MandiPricesScreen from '../screens/MandiPricesScreen';
import SoilAdvisoryScreen from '../screens/SoilAdvisoryScreen';
import SchemesNewsListScreen from '../screens/farmerHome/SchemesNewsListScreen';
import type { NewsItem } from '../screens/farmerHome/constants/farmerDashboardData';
import type { SchemeCategory } from '../screens/farmerHome/constants/schemeCatalog';
import SettingsStack from './SettingsStack';

export type FarmerHomeStackParamList = {
  FarmerHome: undefined;
  NotificationsCenter: undefined;
  FarmDetail: { farmId: string };
  AgreementSign: { agreementId: string };
  AllAvailableLands: undefined;
  FarmsAvailableForManagement: undefined;
  ManagementRequestForm: { farmId: string };
  ManagementRequestReview: { farmId: string; draft: ManagementRequestDraft };
  ManagementRequestSubmitted: { requestId: string };
  MyManagementRequests: undefined;
  ManagementRequestDetails: { requestId: string };
  MyManagedFarms: undefined;
  ManagedFarmDashboard: { farmId: string };
  SelectCrop: { farmId: string };
  CropPlanForm: { farmId: string; cropId: string; cropName: string };
  CropPlanReview: { farmId: string; draft: CropPlanDraft };
  CreateWork: { cropCycleId?: string };
  CropDetails: {
    cropCycleId?: string;
    landId?: string;
    farmerId?: string;
    leaseId?: string;
    ownerId?: string;
    plotName?: string;
    ownerLabel?: string;
    areaAcres?: number;
  };
  LandListing: undefined;
  LeaseApplication: { propertyId?: string; leaseTypeId?: string; leaseTypeTitle?: string } | undefined;
  LeaseStatus: undefined;
  LeaseAgreements: undefined;
  AgreementDetails: { agreementId: string };
  LeaseClosureRequest: { leaseId: string };
  // Step 1 (request + owner response) — every entry point lands here first.
  ClosureRequested: { closureId: string };
  // Step 2 (settlement onward) — reached only by pushing forward from
  // ClosureRequested, so back always returns there, not to whatever opened it.
  LeaseClosure: { closureId: string };
  MyActiveLeases: undefined;
  LeaseTypeDetails: { selectedLeaseType?: string; propertyId?: string };
  LeaseDetailView: { leaseTypeId: string; leaseTypeTitle: string; propertyId?: string };
  LeaseConfirmation: { leaseTypeId: string; leaseTypeTitle: string };
  CompareLeases: { selectedLeaseTypeId?: string; propertyId?: string };
  AIAssistant: undefined;
  SatelliteMap: { farmId?: string; returnTo?: string } | undefined;
  WeatherDetail: undefined;
  LaborConnect: undefined;
  SoilTest: undefined;
  Article: { url: string; title?: string };
  MandiPrices: undefined;
  SoilAdvisory: undefined;
  SchemesNewsList:
    | { items?: readonly NewsItem[]; initialTab?: 'schemes' | 'news'; initialCategory?: SchemeCategory | 'all' }
    | undefined;
  Settings: undefined;
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
        options={{ title: 'Kisan Mitra' }}
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
      <Stack.Screen
        name="FarmsAvailableForManagement"
        component={FarmsAvailableForManagementScreen}
        options={{ title: 'Farms Available for Management' }}
      />
      <Stack.Screen
        name="ManagementRequestForm"
        component={ManagementRequestFormScreen}
        options={{ title: 'Request Farm Management' }}
      />
      <Stack.Screen
        name="ManagementRequestReview"
        component={ManagementRequestReviewScreen}
        options={{ title: 'Review Request' }}
      />
      <Stack.Screen
        name="ManagementRequestSubmitted"
        component={ManagementRequestSubmittedScreen}
        options={{ title: 'Request Submitted' }}
      />
      <Stack.Screen
        name="MyManagementRequests"
        component={MyManagementRequestsScreen}
        options={{ title: 'My Management Requests' }}
      />
      <Stack.Screen
        name="ManagementRequestDetails"
        component={ManagementRequestDetailsScreen}
        options={{ title: 'Request Details' }}
      />
      <Stack.Screen
        name="MyManagedFarms"
        component={MyManagedFarmsScreen}
        options={{ title: 'My Managed Farms' }}
      />
      <Stack.Screen
        name="ManagedFarmDashboard"
        component={ManagedFarmDashboardScreen}
        options={{ title: 'Managed Farm' }}
      />
      <Stack.Screen name="SelectCrop" component={SelectCropScreen} options={{ title: 'Select Crop' }} />
      <Stack.Screen name="CropPlanForm" component={CropPlanFormScreen} options={{ title: 'Crop Plan' }} />
      <Stack.Screen name="CropPlanReview" component={CropPlanReviewScreen} options={{ title: 'Review Crop Plan' }} />
      <Stack.Screen name="CropDetails" component={CropDetailsScreen} options={{ title: 'Crop Details' }} />
      <Stack.Screen name="CreateWork" component={CreateWorkScreen} options={{ title: 'Create Work' }} />
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
        name="SoilTest"
        component={SoilTestScreen}
        options={{ title: 'Soil Test' }}
      />
      <Stack.Screen name="AgreementSign" component={AgreementScreen} />
      <Stack.Screen name="Article" component={ArticleScreen} />
      <Stack.Screen name="MandiPrices" component={MandiPricesScreen} />
      <Stack.Screen name="SoilAdvisory" component={SoilAdvisoryScreen} />
      <Stack.Screen
        name="SchemesNewsList"
        component={SchemesNewsListScreen}
        options={{ title: 'Schemes & Subsidies' }}
      />
      <Stack.Screen name="Settings" component={SettingsStack} />
    </Stack.Navigator>
  );
}
