import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LeaseLandScreen from '../screens/LeaseLandScreen';
import LeaseAgreementsScreen from '../screens/LeaseAgreementsScreen';
import AgreementDetailsScreen from '../screens/AgreementDetailsScreen';
import { colors } from '../theme/tokens';

export type HomeStackParamList = {
  Home: undefined;
  LeaseLand: undefined;
  LeaseAgreements: undefined;
  AgreementDetails: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home"  component={HomeScreen} />
      <Stack.Screen
        name="LeaseLand"
        component={LeaseLandScreen}
        // screenOptions={{
        //   headerShown: false,
        // }}
        options={{
          // headerShown: true,
          title: 'Lease Land',
        //   headerStyle: {
        //     // backgroundColor: colors.background,
        //     // backgroundColor: 'transparent',
        //     backgroundColor: 'red',

        //   },
        //   headerTintColor: colors.textPrimary,
        //   // headerTitleStyle: {
        //   //   fontWeight: '600',
        //   // },
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

