import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../context/AuthContext';
import { SettingsStackParamList } from '../../../navigation/SettingsStack';

type SettingsNavProp = NativeStackNavigationProp<SettingsStackParamList, 'SettingsMain'>;

export function useSettings() {
  const { user, logout, isLoading } = useAuth();
  const settingsNav = useNavigation<SettingsNavProp>();

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        // Just clear the session — AppNavigator swaps to the onboarding/login
        // screen automatically when `user` becomes null (no manual reset).
        // `isLoading` (exposed below) drives the button's spinner while this
        // is in flight, and `logout()` itself now always resolves — even on
        // a hung/failed network call — so this can never leave the button
        // stuck showing a spinner forever.
        onPress: () => logout(),
      },
    ]);
  }, [logout]);

  const onLanguagePress = useCallback(
    () => settingsNav.navigate('LanguageSelection', { fromAuth: false }),
    [settingsNav]
  );

  const onWebsitePress = useCallback(
    (title: string, url: string) => settingsNav.navigate('SettingsWebView', { title, url }),
    [settingsNav]
  );

  const onLegalPress = useCallback(
    (document: 'privacy' | 'terms') => settingsNav.navigate('LegalDocument', { document }),
    [settingsNav]
  );

  const onEditProfilePress = useCallback(
    () => settingsNav.navigate('EditProfile'),
    [settingsNav]
  );

  const onBack = useCallback(() => settingsNav.getParent()?.goBack(), [settingsNav]);

  return {
    user,
    onLogout: handleLogout,
    loggingOut: isLoading,
    onLanguagePress,
    onWebsitePress,
    onLegalPress,
    onEditProfilePress,
    onBack,
  };
}

export type SettingsViewModel = ReturnType<typeof useSettings>;
