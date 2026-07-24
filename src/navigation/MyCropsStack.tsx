import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyCropsScreen from '../screens/farmer/MyCropsScreen';
import CropDetailsScreen from '../modules/work/screens/CropDetailsScreen';
import CreateWorkScreen from '../modules/work/screens/CreateWorkScreen';
import WorkListScreen from '../modules/work/screens/WorkListScreen';
import WorkDetailsScreen from '../modules/work/screens/WorkDetailsScreen';
import AddFarmScreen from '../screens/owner/AddFarmScreen';

export type MyCropsStackParamList = {
  MyCrops: undefined;
  CropDetails: { cropCycleId: string };
  CreateWork: { cropCycleId?: string };
  WorkList: undefined;
  WorkDetails: { jobId: string };
  AddLand: { selfFarmed: true } | undefined;
};

const Stack = createNativeStackNavigator<MyCropsStackParamList>();

export default function MyCropsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MyCrops" component={MyCropsScreen} />
      <Stack.Screen name="CropDetails" component={CropDetailsScreen} />
      <Stack.Screen name="CreateWork" component={CreateWorkScreen} />
      <Stack.Screen name="WorkList" component={WorkListScreen} />
      <Stack.Screen name="WorkDetails" component={WorkDetailsScreen} />
      <Stack.Screen name="AddLand" component={AddFarmScreen} />
    </Stack.Navigator>
  );
}
