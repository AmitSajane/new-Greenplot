import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyActiveLeasesScreen from '../screens/leases/myActiveLeases';
import AgreementDetailsScreen from '../screens/AgreementDetailsScreen';
import AgreementScreen from '../screens/AgreementScreen';

export type MyLeasesStackParamList = {
  MyActiveLeases: undefined;
  AgreementDetails: undefined;
  AgreementSign: { agreementId: string };
};

const Stack = createNativeStackNavigator<MyLeasesStackParamList>();

export default function MyLeasesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MyActiveLeases"
        component={MyActiveLeasesScreen}
        options={{ title: 'My Active Leases' }}
      />
      <Stack.Screen
        name="AgreementDetails"
        component={AgreementDetailsScreen}
        options={{ title: 'Agreement Details' }}
      />
      <Stack.Screen name="AgreementSign" component={AgreementScreen} />
    </Stack.Navigator>
  );
}
