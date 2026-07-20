import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { OwnerHomeViewModel } from '../hooks/useOwnerHome';
import { ownerHomeStyles as s, OWNER_HEADER_GRADIENT, tone } from '../styles/ownerHome.styles';
import { SchemesNewsSection, VideosSection, WeatherHero } from '../../farmerHome/components/sections';
import useCurrentLocation from '../../../hooks/useCurrentLocation';
import useWeather from '../../../hooks/useWeather';

function initials(name: string) {
  return name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const OwnerHomeContent: React.FC<OwnerHomeViewModel> = vm => {
  const { address, loading } = useCurrentLocation();
  const headerLocation = vm.locationLabel || address || '';
  const liveWeather = useWeather(headerLocation);

  return (
    <View style={s.safeArea}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ───────── Header + portfolio ───────── */}
        <LinearGradient colors={OWNER_HEADER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <SafeAreaView edges={['top']}>
            <View style={s.header}>
              <View style={s.headerTop}>
                <TouchableOpacity style={s.avatar} onPress={vm.onAvatar} activeOpacity={0.8}>
                  <Text style={s.avatarText}>{initials(vm.userName)}</Text>
                </TouchableOpacity>
                <View>
                 <Text style={s.hi}>Namaste 🙏</Text>
                  <Text style={s.name}>{vm.userName}</Text>
                  <View style={s.locRow}>
                    <Ionicons name="location" size={11} color="rgba(255,255,255,0.55)" />
                    <Text style={s.locText}>{headerLocation}</Text>
                    {loading ? (
                      <ActivityIndicator style={{ marginLeft: 8 }} size="small" color="rgba(255,255,255,0.9)" />
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity style={s.bell} onPress={vm.onBell} activeOpacity={0.8}>
                  <Ionicons name="notifications" size={18} color="#fff" />
                  {vm.hasNotifications && <View style={s.bellDot} />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={s.port} onPress={vm.onPortfolioPress} activeOpacity={0.9}>
                <Text style={s.portLabel}>Total portfolio value</Text>
                <Text style={s.portVal}>{vm.portfolio.valueDisplay}</Text>
                <View style={s.portChip}>
                  <Ionicons name="trending-up" size={12} color="#CFEFDB" />
                  <Text style={s.portChipText}>+{vm.portfolio.changePct}% this year</Text>
                </View>
                <View style={s.portStats}>
                  {[
                    ['Lands', vm.portfolio.lands],
                    ['Leased', vm.portfolio.leased],
                    ['Vacant', vm.portfolio.vacant],
                    ['Acres', vm.portfolio.acresDisplay],
                  ].map(([label, value], i, arr) => (
                    <View key={label as string} style={[s.pst, i === arr.length - 1 && s.pstLast]}>
                      <Text style={s.pstV}>{value}</Text>
                      <Text style={s.pstL}>{label}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <WeatherHero
          weather={liveWeather.weather}
          loading={liveWeather.loading}
          location={headerLocation}
          onPress={vm.onWeatherPress}
        />

        {/* ───────── Revenue ───────── */}
        <View style={s.section}>
          <View style={s.card}>
            <TouchableOpacity style={s.revRow} onPress={vm.onRevenuePress} activeOpacity={0.8}>
              <View>
                <Text style={s.revLabel}>Revenue · this month</Text>
                <Text style={s.revVal}>{vm.revenue.thisMonthDisplay}</Text>
                <Text style={s.revChip}>▲ {vm.revenue.changePct}% vs last month</Text>
              </View>
              <View style={s.spark}>
                {vm.revenue.sparkline.map((h, i) => (
                  <View
                    key={i}
                    style={[
                      s.sparkBar,
                      { height: `${h}%` },
                      i === vm.revenue.sparkline.length - 1 && s.sparkBarHi,
                    ]}
                  />
                ))}
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={s.payoutRow} onPress={vm.onPayoutPress} activeOpacity={0.8}>
              <Ionicons name="calendar" size={16} color="#B87214" />
              <Text style={s.payoutText}>
                Next payout{' '}
                <Text style={{ fontWeight: '800', color: '#0D1509' }}>{vm.revenue.payoutAmountDisplay}</Text>
                {' '}· due {vm.revenue.payoutDate}
              </Text>
              <Text style={s.payoutGo}>Details ›</Text>
            </TouchableOpacity>
          </View>
        </View>

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
              icon="pie-chart"
              t="green"
              value={`${vm.metrics.occupancyPct}%`}
              label="Occupancy"
              sub={vm.metrics.occupancySub}
              subColor={tone.green.fg}
              onPress={vm.onOccupancyPress}
            />
            <MetricTile
              icon="document-text"
              t="blue"
              value={String(vm.metrics.activeLeases)}
              label="Active leases"
              sub={vm.metrics.activeLeasesSub}
              subColor={tone.blue.fg}
              onPress={vm.onActiveLeasesPress}
            />
            <MetricTile
              icon="alert-circle"
              t="red"
              value={vm.metrics.pendingDuesDisplay}
              valueColor={tone.red.fg}
              label="Pending dues"
              sub={vm.metrics.pendingDuesSub}
              subColor={tone.red.fg}
              onPress={vm.onDuesPress}
            />
            <MetricTile
              icon="cash"
              t="amber"
              value={vm.metrics.avgRentDisplay}
              label="Avg rent / acre"
              sub="per year"
              subColor="#6B8074"
              onPress={vm.onAvgRentPress}
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
              <Text style={s.sectionTitle}>My properties</Text>
            </View>
            <Text style={s.sectionLink} onPress={vm.onPropertiesViewAll}>
              All {vm.properties.length} ›
            </Text>
          </View>
          <View style={s.card}>
            {vm.properties.map((p, i) => (
              <TouchableOpacity
                key={p.id}
                style={[s.propRow, i === vm.properties.length - 1 && { borderBottomWidth: 0 }]}
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
                        { backgroundColor: p.status === 'leased' ? tone.green.bg : tone.amber.bg },
                      ]}
                    >
                      <Text style={[s.statusText, { color: p.status === 'leased' ? tone.green.fg : tone.amber.fg }]}>
                        {p.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.propMeta}>{p.meta}</Text>
                </View>
                <View style={s.propRight}>
                  {p.status === 'leased' ? (
                    <>
                      <Text style={s.propRent}>{p.rentDisplay}</Text>
                      <Text style={s.propNext}>Next: {p.nextPayment}</Text>
                    </>
                  ) : (
                    <Text style={s.propCta}>{p.ctaLabel} ›</Text>
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
          <View style={[s.card, { paddingHorizontal: 12 }]}>
            {vm.activities.map((a, i) => {
              const c = tone[a.tone];
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[s.actRow, i === vm.activities.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={a.onPress}
                  activeOpacity={0.8}
                >
                  <View style={[s.actDot, { backgroundColor: c.bg }]}>
                    <Ionicons name={a.icon} size={15} color={c.fg} />
                  </View>
                  <View>
                    <Text style={s.actTitle}>{a.title}</Text>
                    <Text style={s.actSub}>{a.sub}</Text>
                  </View>
                  <Text style={s.actTime}>{a.time}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
    </View>
  );
};

interface MetricTileProps {
  icon: string;
  t: 'green' | 'blue' | 'red' | 'amber';
  value: string;
  valueColor?: string;
  label: string;
  sub: string;
  subColor: string;
  onPress: () => void;
}

const MetricTile: React.FC<MetricTileProps> = ({ icon, t, value, valueColor, label, sub, subColor, onPress }) => {
  const c = tone[t];
  return (
    <TouchableOpacity style={s.tile} onPress={onPress} activeOpacity={0.8}>
      <View style={[s.tileIcon, { backgroundColor: c.bg }]}>
        <Ionicons name={icon} size={14} color={c.fg} />
      </View>
      <Text style={[s.tileVal, valueColor ? { color: valueColor } : null]}>{value}</Text>
      <Text style={s.tileLabel}>{label}</Text>
      <Text style={[s.tileSub, { color: subColor }]}>{sub}</Text>
    </TouchableOpacity>
  );
};
