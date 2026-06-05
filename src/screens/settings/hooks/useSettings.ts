import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../context/AuthContext';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { SettingsStackParamList } from '../../../navigation/SettingsStack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SettingsNavProp = NativeStackNavigationProp<SettingsStackParamList, 'SettingsMain'>;

export function useSettings() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const settingsNav = useNavigation<SettingsNavProp>();

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        },
      },
    ]);
  }, [logout, navigation]);

  const onLanguagePress = useCallback(
    () => settingsNav.navigate('LanguageSelection', { fromAuth: false }),
    [settingsNav]
  );

  return {
    user,
    onLogout: handleLogout,
    onLanguagePress,
  };
}

export type SettingsViewModel = ReturnType<typeof useSettings>;
