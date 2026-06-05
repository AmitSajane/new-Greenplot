import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LaborDashboardScreen from '../screens/LaborDashboardScreen';
import PostJobScreen from '../screens/PostJobScreen';
import JobListScreen from '../screens/JobListScreen';
import ApplicationsScreen from '../screens/ApplicationsScreen';
import MyJobsScreen from '../screens/MyJobsScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import FindLaborMapScreen from '../screens/FindLaborMapScreen';
import LaborDetailsScreen from '../screens/LaborDetailsScreen';
import PaymentSummaryScreen from '../screens/PaymentSummaryScreen';
import { Labor } from '../types';

export type LaborConnectStackParamList = {
  LaborDashboard: undefined;
  PostJob: undefined;
  JobList: undefined;
  Applications: undefined;
  MyJobs: undefined;
  Attendance: undefined;
  FindLaborMap: { focusJobId?: string } | undefined;
  LaborDetails: { labor: Labor };
  PaymentSummary: { jobId?: string } | undefined;
};

const Stack = createNativeStackNavigator<LaborConnectStackParamList>();

export default function LaborConnectStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="LaborDashboard"
    >
      <Stack.Screen name="LaborDashboard" component={LaborDashboardScreen} />
      <Stack.Screen name="PostJob" component={PostJobScreen} />
      <Stack.Screen name="JobList" component={JobListScreen} />
      <Stack.Screen name="Applications" component={ApplicationsScreen} />
      <Stack.Screen name="MyJobs" component={MyJobsScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="FindLaborMap" component={FindLaborMapScreen} />
      <Stack.Screen name="LaborDetails" component={LaborDetailsScreen} />
      <Stack.Screen name="PaymentSummary" component={PaymentSummaryScreen} />
    </Stack.Navigator>
  );
}
