import React from 'react';
import { useTranslation } from 'react-i18next';
import { HomeHeader } from '../../../../components/organisms/HomeHeader';
import { FARMER_HEADER_GRADIENT } from '../../styles/farmerHome.styles';

/** Short label shown on the language button per selected language. */
const LANG_SHORT: Record<string, string> = {
  en: 'EN', hi: 'हि', kn: 'ಕ', mr: 'म', te: 'తె', ta: 'த',
};

interface Props {
  name: string;
  location: string;
  loading?: boolean;
  onAvatar: () => void;
  onLanguage: () => void;
  onNotifications: () => void;
}

function FarmerHeaderBase({ name, location, loading, onAvatar, onLanguage, onNotifications }: Props) {
  const { i18n } = useTranslation();
  const langShort = LANG_SHORT[i18n.language] || 'EN';
  return (
    <HomeHeader
      gradientColors={FARMER_HEADER_GRADIENT}
      name={name}
      location={location}
      locationLoading={loading}
      onAvatarPress={onAvatar}
      actions={[
        { label: langShort, onPress: onLanguage },
        { icon: 'notifications', onPress: onNotifications, showDot: true },
      ]}
    />
  );
}

export const FarmerHeader = React.memo(FarmerHeaderBase);
