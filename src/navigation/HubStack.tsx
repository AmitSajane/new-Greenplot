import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/tokens';
import HubScreen from '../screens/hub';
import MyPostsScreen from '../screens/hub/MyPostsScreen';
import FilterByCropScreen from '../screens/FilterByCropScreen';
import LatestNewsScreen from '../screens/LatestNewsScreen';
import ModernFarmingTechScreen from '../screens/ModernFarmingTechScreen';
import CommunityQuestionsScreen from '../screens/CommunityQuestionsScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import QuestionDetailScreen from '../screens/QuestionDetailScreen';
import NotificationsCenterScreen from '../screens/NotificationsCenterScreen';
import SettingsStack from './SettingsStack';

export type HubStackParamList = {
  Hub: undefined;
  MyPosts: undefined;
  FilterByCrop: undefined;
  LatestNews: undefined;
  NewsDetail: { id: string; title: string };
  ModernFarmingTech: undefined;
  CommunityQuestions: undefined;
  QuestionDetail: { id: string };
  CreatePost: { from?: 'hub' | 'community' } | undefined;
  NotificationsCenter: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<HubStackParamList>();

export default function HubStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontWeight: '600', color: colors.textPrimary },
        headerTintColor: colors.textPrimary,
        headerShown: false,
      }}
      
    >
      <Stack.Screen
        name="Hub"
        component={HubScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyPosts"
        component={MyPostsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FilterByCrop"
        component={FilterByCropScreen}
        options={{ title: 'Filter by Crop' }}
      />
      <Stack.Screen
        name="LatestNews"
        component={LatestNewsScreen}
        options={{ title: 'Latest News' }}
      />
      <Stack.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={({ route }) => ({
          title: route.params.title,
        })}
      />
      <Stack.Screen
        name="ModernFarmingTech"
        component={ModernFarmingTechScreen}
        options={{ title: 'Modern Farming Tech' }}
      />
      <Stack.Screen
        name="CommunityQuestions"
        component={CommunityQuestionsScreen}
        options={{ title: 'Community Questions' }}
      />
      <Stack.Screen
        name="QuestionDetail"
        component={QuestionDetailScreen}
        options={{ title: 'Question' }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'Create Post' }}
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


