import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
// @ts-ignore - react-native-vector-icons types may not be available
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../theme/tokens';
import { AppHeader } from '../components/molecules/AppHeader';
import { useAuth } from '../context/AuthContext';
import { LANGUAGE_SHORT_LABELS } from '../localization/i18n';
import { LanguagePickerModal } from './farmerHome/components/LanguagePickerModal';
import { MachineryStackParamList } from '../navigation/MachineryStack';

type Navigation = NativeStackNavigationProp<MachineryStackParamList, 'Machinery'>;

/**
 * Shared "Machinery" tab root — mounted (via MachineryStack) in both the
 * Farmer and Owner tab bars. Placeholder until the real equipment
 * rent-in/rent-out feature (listings, requests, etc. — mirroring how land
 * leasing works today) is built. Header matches every other tab root
 * (MyCrops, Hub, Market): AppHeader owns the top safe area, so this screen
 * only claims left/right/bottom.
 */
export default function MachineryScreen() {
  const navigation = useNavigation<Navigation>();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageShort = LANGUAGE_SHORT_LABELS[i18n.language] || 'EN';

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <AppHeader
        data={{ variant: 'default', title: 'Machinery', languageShort, name: user?.name }}
        handler={{
          onProfilePress: () => navigation.navigate('Settings'),
          onLanguagePress: () => setLanguageOpen(true),
          onNotificationPress: () => navigation.navigate('NotificationsCenter'),
        }}
      />
      <View style={styles.center}>
        <Icon name="tractor-variant" size={48} color={colors.textMuted} />
        <Text style={styles.title}>Coming soon</Text>
        <Text style={styles.subtitle}>
          Rent or list tractors, tillers, and other farm equipment right from the app.
        </Text>
      </View>
      <LanguagePickerModal visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.sm },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
