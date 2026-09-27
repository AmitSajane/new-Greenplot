import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/molecules/AppHeader';
import { LANGUAGE_SHORT_LABELS } from '../../../localization/i18n';
import { OwnerHomeViewModel } from '../hooks/useOwnerHome';
import { ownerHomeStyles as s, tone } from '../styles/ownerHome.styles';
import { SchemesNewsSection, VideosSection, WeatherHero } from '../../farmerHome/components/sections';
import { LanguagePickerModal } from '../../farmerHome/components/LanguagePickerModal';
import useCurrentLocation from '../../../hooks/useCurrentLocation';
import useWeather from '../../../hooks/useWeather';

export const OwnerHomeContent: React.FC<OwnerHomeViewModel> = vm => {
  const { address, loading } = useCurrentLocation();
  const headerLocation = vm.locationLabel || address || '';
  const liveWeather = useWeather(headerLocation);
  const [langOpen, setLangOpen] = useState(false);
  const { i18n } = useTranslation();
  const languageShort = LANGUAGE_SHORT_LABELS[i18n.language] || 'EN';

  return (
    <View style={s.safeArea}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ───────── Header + portfolio ───────── */}
        <AppHeader
          style={{ container: { paddingBottom: 18 } }}
          data={{
            variant: 'home',
            name: vm.userName,
            location: headerLocation,
            loading,
            languageShort,
          }}
          handler={{
            onProfilePress: vm.onAvatar,
            onLanguagePress: () => setLangOpen(true),
            onNotificationPress: vm.onBell,
          }}
        >
          <TouchableOpacity style={s.port} onPress={vm.onPortfolioPress} activeOpacity={0.9}>
            <Text style={s.portLabel}>Farm Management overview</Text>
            <View style={s.portStats}>
              {[
                ['Lands', vm.portfolio.lands],
                ['Verified', vm.portfolio.verified],
                ['Managed', vm.portfolio.managed],
                ['Acres', vm.portfolio.acresDisplay],
              ].map(([label, value], i, arr) => (
                <View key={label as string} style={[s.pst, i === arr.length - 1 && s.pstLast]}>
                  <Text style={s.pstV}>{value}</Text>
                  <Text style={s.pstL}>{label}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </AppHeader>

        <WeatherHero
          weather={liveWeather.weather}
          loading={liveWeather.loading}
          location={headerLocation}
          onPress={vm.onWeatherPress}
        />

        {/* ───────── Key metrics ───────── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View style={s.sectionTitleRow}>
              <Ionicons name="stats-chart" size={16} color="#1A6B3A" />
              <Text style={s.sectionTitle}>Key metrics</Text>
            </View>
          </View>
          <View style={s.tilesWrap}>
            <MetricTile
              icon="shield-checkmark"
              t="green"
              value={String(vm.metrics.verifiedCount)}
              label="Verified lands"
              onPress={vm.onVerifiedPress}
            />
            <MetricTile
              icon="people"
              t="blue"
              value={String(vm.metrics.managedCount)}
              label="Managed farms"
              onPress={vm.onManagedPress}
            />
            <MetricTile
              icon="time"
              t="amber"
              value={String(vm.metrics.pendingCount)}
              label="Pending verification"
              onPress={vm.onPendingPress}
            />
          </View>
        </View>

        {/* ───────── Action required ───────── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View style={s.sectionTitleRow}>
              <Ionicons name="flash" size={16} color="#1A6B3A" />
              <Text style={s.sectionTitle}>Action required</Text>
            </View>
            <Text style={s.sectionLink} onPress={vm.onActionViewAll}>View all</Text>
          </View>
          {vm.actionItems.map(item => {
            const c = tone[item.tone];
            return (
              <View key={item.id} style={[s.alertRow, { backgroundColor: c.bg, borderColor: c.bg }]}>
                <View style={s.alertIcon}>
                  <Ionicons name={item.icon} size={16} color={c.fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.alertTitle, { color: c.strong }]}>{item.title}</Text>
                  <Text style={[s.alertSub, { color: c.fg }]}>{item.sub}</Text>
                </View>
                <TouchableOpacity style={[s.alertBtn, { backgroundColor: c.fg }]} onPress={item.onPress} activeOpacity={0.85}>
                  <Text style={s.alertBtnText}>{item.actionLabel}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* ───────── My properties ───────── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View style={s.sectionTitleRow}>
              <Ionicons name="map" size={16} color="#1A6B3A" />
              <Text style={s.sectionTitle}>My Lands</Text>
            </View>
            <Text style={s.sectionLink} onPress={vm.onPropertiesViewAll}>
              All {vm.properties.length} ›
            </Text>
          </View>
          <View style={s.card}>
            {vm.properties.slice(0, 3).map((p, i, arr) => (
              <TouchableOpacity
                key={p.id}
                style={[s.propRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => vm.onPropertyPress(p.id)}
                activeOpacity={0.8}
              >
                <View style={s.propImg}>
                  <Text style={s.propEmoji}>{p.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.propNameRow}>
                    <Text style={s.propName}>{p.name}</Text>
                    <View
                      style={[
                        s.statusChip,
                        { backgroundColor: p.status === 'managed' ? tone.green.bg : tone.amber.bg },
                      ]}
                    >
                      <Text style={[s.statusText, { color: p.status === 'managed' ? tone.green.fg : tone.amber.fg }]}>
                        {p.statusLabel}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.propMeta}>{p.meta}</Text>
                  {!!p.assignedFarmerName && (
                    <Text style={s.propMeta}>Assigned: {p.assignedFarmerName}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ───────── Farm tools ───────── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View style={s.sectionTitleRow}>
              <Ionicons name="construct" size={16} color="#1A6B3A" />
              <Text style={s.sectionTitle}>Farm tools</Text>
            </View>
          </View>
          <View style={s.toolsGrid}>
            {vm.tools.map(t => {
              const c = tone[t.tone];
              return (
                <TouchableOpacity key={t.key} style={s.tool} onPress={t.onPress} activeOpacity={0.8}>
                  <View style={[s.toolIcon, { backgroundColor: c.bg }]}>
                    <Ionicons name={t.icon} size={18} color={c.fg} />
                  </View>
                  <Text style={s.toolLabel}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ───────── Recent activity ───────── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View style={s.sectionTitleRow}>
              <Ionicons name="time" size={16} color="#1A6B3A" />
              <Text style={s.sectionTitle}>Recent activity</Text>
            </View>
            <Text style={s.sectionLink} onPress={vm.onActivityViewAll}>View all</Text>
          </View>
          {vm.activities.length === 0 ? (
            <View style={[s.card, s.actEmpty]}>
              <Ionicons name="time-outline" size={20} color="#9EB8A8" />
              <Text style={s.actEmptyText}>No recent activity yet</Text>
            </View>
          ) : (
            vm.activities.map(a => {
              const c = tone[a.tone];
              return (
                <View key={a.id} style={[s.alertRow, { backgroundColor: c.bg, borderColor: c.bg }]}>
                  <View style={s.alertIcon}>
                    <Ionicons name={a.icon} size={16} color={c.fg} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.alertTitle, { color: c.strong }]}>{a.title}</Text>
                    <Text style={[s.alertSub, { color: c.fg }]}>{a.sub}</Text>
                  </View>
                  <TouchableOpacity style={[s.alertBtn, { backgroundColor: c.fg }]} onPress={a.onPress} activeOpacity={0.85}>
                    <Text style={s.alertBtnText}>{a.actionLabel || 'View'}</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* ───────── Schemes & news ───────── */}
        <SchemesNewsSection
          items={vm.news}
          onAction={() => undefined}
          onOpenArticle={vm.onOpenArticle}
          onMore={vm.onNewsMore}
        />

        {/* ───────── Learn · Videos ───────── */}
        <VideosSection onOpenVideo={vm.onOpenVideo} />
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={vm.onMicPress} activeOpacity={0.85}>
        <Ionicons name="mic" size={24} color="#fff" />
      </TouchableOpacity>

      <LanguagePickerModal visible={langOpen} onClose={() => setLangOpen(false)} />
    </View>
  );
};

interface MetricTileProps {
  icon: string;
  t: 'green' | 'blue' | 'red' | 'amber';
  value: string;
  valueColor?: string;
  label: string;
  sub?: string;
  subColor?: string;
  onPress: () => void;
}

const MetricTile: React.FC<MetricTileProps> = ({ icon, t, value, valueColor, label, sub, subColor, onPress }) => {
  const c = tone[t];
  return (
    <TouchableOpacity style={s.tile} onPress={onPress} activeOpacity={0.8}>
      <View style={s.tileHead}>
        <View style={[s.tileIcon, { backgroundColor: c.bg }]}>
          <Ionicons name={icon} size={14} color={c.fg} />
        </View>
        <Text style={s.tileLabel} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={[s.tileVal, valueColor ? { color: valueColor } : null]}>{value}</Text>
      {!!sub && <Text style={[s.tileSub, { color: subColor }]}>{sub}</Text>}
    </TouchableOpacity>
  );
};
