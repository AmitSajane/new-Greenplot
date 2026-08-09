import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/molecules/AppHeader';
import { LANGUAGE_SHORT_LABELS } from '../../../localization/i18n';
import { LanguagePickerModal } from '../../../screens/farmerHome/components/LanguagePickerModal';
import { MarketStackParamList } from '../navigation/marketRoutes';

type Navigation = NativeStackNavigationProp<MarketStackParamList>;

interface Props {
  feature: 'storage' | 'storageDetails' | 'storageBooking';
  subtitle?: string;
}

/** Safe-area app header shared by every screen in the cold-storage flow. */
export default function ColdStorageAppHeader({ feature, subtitle }: Props) {
  const navigation = useNavigation<Navigation>();
  const { i18n, t } = useTranslation();
  const [languageOpen, setLanguageOpen] = useState(false);

  return (
    <>
      <AppHeader
        data={{
          variant: 'default',
          showBack: true,
          title: t(`market.features.${feature}.title`),
          subtitle,
          languageShort: LANGUAGE_SHORT_LABELS[i18n.language] || 'EN',
          hasNotificationDot: true,
        }}
        handler={{
          onBackPress: navigation.goBack,
          onLanguagePress: () => setLanguageOpen(true),
          onNotificationPress: () => navigation.navigate('NotificationsCenter'),
        }}
      />
      <LanguagePickerModal visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </>
  );
}
