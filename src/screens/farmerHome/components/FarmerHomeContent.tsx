import React, { useCallback } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FarmerHomeViewModel } from '../hooks/useFarmerHome';
import { farmerHomeStyles as s } from '../styles/farmerHome.styles';
import {
  AiAdvisoryCard,
  BrowseByCropSection,
  CropHealthSection,
  FarmerHeader,
  FarmSnapshot,
  FindLandSection,
  MarketTicker,
  QuickActionsSection,
  SchemesNewsSection,
  TasksSection,
  VideosSection,
  WeatherHero,
} from './sections';

export const FarmerHomeContent: React.FC<FarmerHomeViewModel> = vm => {
  const { onAction } = vm;

  // Derived, stable handlers (onAction is memoised in the hook, so these are too).
  const onSettings = useCallback(() => onAction('settings'), [onAction]);
  const onNotifications = useCallback(() => onAction('notifications'), [onAction]);
  const onWeather = useCallback(() => onAction('satellite'), [onAction]);
  const onAi = useCallback(() => onAction(vm.aiAdvisory.action), [onAction, vm.aiAdvisory.action]);
  const onMarket = useCallback(() => onAction('market'), [onAction]);
  const onTasksViewAll = useCallback(() => onAction('notifications'), [onAction]);
  const onCrops = useCallback(() => onAction('crops'), [onAction]);
  const onAllLands = useCallback(() => onAction('allLands'), [onAction]);
  const onNewsMore = useCallback(() => onAction('hub'), [onAction]);
  const onMic = useCallback(() => onAction('aiAssistant'), [onAction]);

  return (
    <View style={s.safeArea}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <FarmerHeader
          name={vm.userName}
          location={vm.locationLabel}
          onAvatar={onSettings}
          onLanguage={onSettings}
          onNotifications={onNotifications}
        />
        <WeatherHero weather={vm.weather} onPress={onWeather} />
        <FarmSnapshot items={vm.snapshot} onAction={onAction} />
        <AiAdvisoryCard
          badge={vm.aiAdvisory.badge}
          text={vm.aiAdvisory.text}
          cta={vm.aiAdvisory.cta}
          onPress={onAi}
        />
        <MarketTicker items={vm.ticker} onPressItem={vm.onTickerPress} onSeeAll={onMarket} />
        <TasksSection items={vm.tasks} onAction={onAction} onViewAll={onTasksViewAll} />
        <QuickActionsSection items={vm.quickActions} onAction={onAction} />
        <CropHealthSection items={vm.cropHealth} onPress={onCrops} onViewAll={onCrops} />
        <FindLandSection
          listings={vm.featuredListings}
          chips={vm.nearbyChips}
          selected={vm.selectedNearby}
          onSelectChip={vm.setSelectedNearby}
          onListingPress={vm.onListingPress}
          onSearch={onAllLands}
          onViewAll={onAllLands}
        />
        <SchemesNewsSection
          items={vm.news}
          onAction={onAction}
          onOpenArticle={vm.onOpenArticle}
          onMore={onNewsMore}
        />
        <VideosSection onOpenVideo={vm.onOpenVideo} />
        <BrowseByCropSection items={vm.browseCrops} onPress={onAllLands} />
      </ScrollView>

      <TouchableOpacity style={s.fab} activeOpacity={0.85} onPress={onMic}>
        <Ionicons name="mic" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};
