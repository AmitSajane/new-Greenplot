import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';

type NavigationProps = NativeStackScreenProps<AuthStackParamList, 'Splash'>;
type Props = Partial<Pick<NavigationProps, 'navigation'>> & {
  /** AppNavigator owns routing when the splash is used as the global launch gate. */
  autoNavigate?: boolean;
};

export default function SplashScreen({ navigation, autoNavigate = true }: Props) {
  useEffect(() => {
    if (!autoNavigate || !navigation) return;
    const t = setTimeout(() => {
      navigation.replace('ProfileSetup');
    }, 1200);
    return () => clearTimeout(t);
  }, [autoNavigate, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AgriArambh</Text>
      <Text style={styles.subtitle}>Loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 8, color: '#666' },
});
