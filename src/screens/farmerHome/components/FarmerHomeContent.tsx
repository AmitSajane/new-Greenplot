import React, { useCallback, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/molecules/AppHeader';
import { LANGUAGE_SHORT_LABELS } from '../../../localization/i18n';
import { FarmerHomeViewModel } from '../hooks/useFarmerHome';
import useCurrentLocation from '../hooks/useCurrentLocation';
import useWeather from '../../../hooks/useWeather';
import { farmerHomeStyles as s } from '../styles/farmerHome.styles';
import { LanguagePickerModal } from './LanguagePickerModal';
import {
  AiAdvisoryCard,
  BrowseByCropSection,
  CropHealthSection,
  FarmSnapshot,
  FindLandSection,
  MarketTicker,
  QuickActionsSection,
  SchemesNewsSection,
  // TasksSection, // Today's tasks — hidden from the farmer home page for now.
  VideosSection,
  WeatherHero,
} from './sections';

export const FarmerHomeContent: React.FC<FarmerHomeViewModel> = vm => {
  const { onAction } = vm;
  const { address, loading } = useCurrentLocation();
  const weatherLocation = vm.locationLabel || address || '';
  const liveWeather = useWeather(weatherLocation);
  const [langOpen, setLangOpen] = useState(false);
  const { i18n } = useTranslation();
  const languageShort = LANGUAGE_SHORT_LABELS[i18n.language] || 'EN';

  // Derived, stable handlers (onAction is memoised in the hook, so these are too).
  const onSettings = useCallback(() => onAction('settings'), [onAction]);
  const onLanguage = useCallback(() => setLangOpen(true), []);
  const onNotifications = useCallback(() => onAction('notifications'), [onAction]);
  const onWeather = useCallback(() => onAction('satellite'), [onAction]);
  const onAi = useCallback(() => onAction(vm.aiAdvisory.action), [onAction, vm.aiAdvisory.action]);
  const onMarket = useCallback(() => onAction('market'), [onAction]);
  const onMandi = useCallback(() => onAction('mandiCompare'), [onAction]);
  //Today's tasks — hidden from the farmer home page for now.
  // const onTasksViewAll = useCallback(() => onAction('notifications'), [onAction]);
  const onCrops = useCallback(() => onAction('crops'), [onAction]);
  const onAllLands = useCallback(() => onAction('allLands'), [onAction]);
  const onMic = useCallback(() => onAction('aiAssistant'), [onAction]);

  return (
    <View style={s.safeArea}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <AppHeader
          data={{
            variant: 'home',
            name: vm.userName,
            location: vm.locationLabel || address,
            loading,
            languageShort,
          }}
          handler={{
            onProfilePress: onSettings,
            onLanguagePress: onLanguage,
            onNotificationPress: onNotifications,
          }}
        />
        <WeatherHero
          weather={liveWeather.weather}
          loading={liveWeather.loading}
          location={weatherLocation}
          onPress={onWeather}
        />
        <FarmSnapshot items={vm.snapshot} onAction={onAction} />
        <AiAdvisoryCard
          badge={vm.aiAdvisory.badge}
          text={vm.aiAdvisory.text}
          cta={vm.aiAdvisory.cta}
          onPress={onAi}
        />
        <MarketTicker items={vm.ticker} onPressItem={vm.onTickerPress} onSeeAll={onMandi} />
        {/* <TasksSection items={vm.tasks} onAction={onAction} onViewAll={onTasksViewAll} /> */}
        <QuickActionsSection items={vm.quickActions} onAction={onAction} />
        {/* <CropHealthSection items={vm.cropHealth} onPress={onCrops} onViewAll={onCrops} /> */}
        <FindLandSection
          listings={vm.featuredListings}
          onListingPress={vm.onListingPress}
          onViewAll={onAllLands}
        />
        <SchemesNewsSection
          items={vm.news}
          onAction={onAction}
          onOpenArticle={vm.onOpenArticle}
          onMore={vm.onSchemesMore}
        />
        <VideosSection onOpenVideo={vm.onOpenVideo} />
     {/* <BrowseByCropSection items={vm.browseCrops} onPress={onAllLands} /> */}
      </ScrollView>

      <TouchableOpacity style={s.fab} activeOpacity={0.85} onPress={onMic}>
        <Ionicons name="mic" size={24} color="#fff" />
      </TouchableOpacity>

      <LanguagePickerModal visible={langOpen} onClose={() => setLangOpen(false)} />
    </View>
  );
};
