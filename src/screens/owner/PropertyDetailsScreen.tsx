import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';
import { useFarmListings } from '../../context/FarmListingsContext';
import MediaCarousel from '../../components/MediaCarousel';
import { useLeases } from '../../context/LeaseContext';
import { useCropCycles } from '../../context/CropCycleContext';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { getManagementStatus, MANAGEMENT_STATUS_LABEL, FARM_MANAGEMENT_STAGE_LABEL, isFarmManagementStage } from '../../utils/farmManagementStatus';
import { CROP_STAGE_LABEL, relativeDayLabel, stageProgressPercent } from '../../utils/cropStages';
import { CROP_HEALTH_LABEL, deriveCropHealth } from '../../utils/cropHealth';
import { profilesApi } from '../../services/profilesApi';
import { cropActivityApi } from '../../services/cropActivityApi';
import { farmActivityApi } from '../../services/farmActivityApi';
import { farmObservationApi } from '../../services/farmObservationApi';
import { fetchSoilData } from '../../services/soilService';
import { fetchWeatherByLocation } from '../../services/weatherApi';
import { harvestApi } from '../../services/harvestApi';
import { resolveFarmCoordinates } from '../../utils/geo/farmLocation';
import type { SoilResponse } from '../../types/soil';
import type { WeatherInfo } from '../farmerHome/constants/farmerDashboardData';
import type { CropActivity, FarmActivity, FarmObservation, HarvestRecord } from '../../modules/work/types';
import type { MyPropertiesStackParamList } from '../../navigation/MyPropertiesStack';
import { formatArea } from '../../utils/geo';

type LandDetailsTab = 'management' | 'crop' | 'labor' | 'revenue';

const HEALTH_LABEL: Record<string, string> = {
  healthy: 'Good',
  needs_water: 'Needs Water',
  pest_alert: 'Pest Alert',
};

const CROP_CYCLE_STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  harvest_ready: 'Ready for Harvest',
  harvested: 'Harvested',
  completed: 'Completed',
  fallow: 'Fallow',
};

type NavigationProp = NativeStackNavigationProp<MyPropertiesStackParamList, 'PropertyDetails'>;
type PropertyDetailsRoute = RouteProp<MyPropertiesStackParamList, 'PropertyDetails'>;

// Best crops by soil type for suggestions
const BEST_CROPS_BY_SOIL: Record<string, string[]> = {
  'Alluvial Soil': ['Wheat', 'Paddy', 'Sugarcane', 'Cotton', 'Maize'],
  'Clay Soil': ['Paddy', 'Wheat', 'Sugarcane', 'Jute', 'Mustard'],
  'Black Soil': ['Cotton', 'Soybean', 'Sugarcane', 'Wheat', 'Groundnut'],
  'Red Soil': ['Groundnut', 'Millets', 'Pulses', 'Cotton', 'Tobacco'],
  'Loam Soil': ['Wheat', 'Vegetables', 'Fruits', 'Pulses', 'Maize'],
};

function getBestCrops(soilType: string): string[] {
  return BEST_CROPS_BY_SOIL[soilType] ?? ['Wheat', 'Paddy', 'Pulses', 'Vegetables'];
}

export default function PropertyDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PropertyDetailsRoute>();
  const { propertyId, viewHistory } = route.params;
  const { getListingById } = useFarmListings();
  const { activeLeases } = useLeases();
  const { cropCycles, getCropCycleByLand } = useCropCycles();

  const property = getListingById(propertyId);

  // This land's current active lease (if leased) → the tenant's crop cycle and the
  // signed agreement, so the owner can view both. With no active lease, only
  // fall back to the most recently closed one when explicitly asked to via
  // `viewHistory` (set when opened from My Properties' Completed tab) — an
  // Available-tab open of the same (now-vacant) property should show nothing.
  const propertyLease =
    activeLeases.find((l) => l.landId === propertyId && l.status === 'active') ??
    (viewHistory
      ? activeLeases
          .filter((l) => l.landId === propertyId && l.status === 'closed')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : undefined);
  const tenantFarmerId = propertyLease?.farmerId;
  const leaseCropCycle = tenantFarmerId
    ? getCropCycleByLand(propertyId, tenantFarmerId, propertyLease?.id)
    : undefined;
  // Farm Management has no lease at all — resolve its crop cycle the same
  // way the farmer side does, via assignedFarmerId with no leaseId.
  const managementCropCycle = !leaseCropCycle && property?.assignedFarmerId
    ? getCropCycleByLand(propertyId, property.assignedFarmerId)
    : undefined;
  const cropCycle = leaseCropCycle || managementCropCycle;
  const cropCycleId = cropCycle?.cropCycleId;

  const [recentActivities, setRecentActivities] = useState<CropActivity[]>([]);
  useEffect(() => {
    if (!cropCycleId) {
      setRecentActivities([]);
      return;
    }
    let cancelled = false;
    cropActivityApi
      .fetchByCropCycle(cropCycleId)
      .then((activities) => {
        if (!cancelled) {
          setRecentActivities([...activities].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3));
        }
      })
      .catch(() => {
        // Supabase not configured (mock mode) or a network hiccup — leave empty.
        if (!cancelled) setRecentActivities([]);
      });
    return () => {
      cancelled = true;
    };
  }, [cropCycleId]);

  // Step 7 — read-only for the owner: scheduled activities + observations
  // for this crop cycle, same services the farmer's dashboard uses.
  const [farmActivities, setFarmActivities] = useState<FarmActivity[]>([]);
  const [recentObservations, setRecentObservations] = useState<FarmObservation[]>([]);
  useEffect(() => {
    if (!cropCycleId) {
      setFarmActivities([]);
      return;
    }
    let cancelled = false;
    farmActivityApi.fetchByCropCycle(cropCycleId).then((activities) => {
      if (!cancelled) setFarmActivities(activities);
    });
    return () => {
      cancelled = true;
    };
  }, [cropCycleId]);
  useEffect(() => {
    const ids = farmActivities.map((a) => a.activityId);
    if (ids.length === 0) {
      setRecentObservations([]);
      return;
    }
    let cancelled = false;
    farmObservationApi.fetchRecentForActivities(ids, 3).then((obs) => {
      if (!cancelled) setRecentObservations(obs);
    });
    return () => {
      cancelled = true;
    };
  }, [farmActivities]);
  const upcomingFarmActivities = farmActivities
    .filter((a) => a.status === 'PENDING' && a.scheduledDate > new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 3);
  const cropHealth = farmActivities.length > 0 ? deriveCropHealth(farmActivities) : undefined;
  const observationPhotos = recentObservations.filter((o) => o.photoUrl);

  // Step 8 — read-only Soil/Weather summary, same services + fallback
  // chain the farmer's Monitoring tab uses, fetched once per property.
  const [soilData, setSoilData] = useState<SoilResponse | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherInfo | null>(null);
  useEffect(() => {
    if (!property || !cropCycleId) return;
    let cancelled = false;
    resolveFarmCoordinates(property)
      .then((coords) => (coords ? fetchSoilData(coords.lat, coords.lon) : null))
      .then((data) => { if (!cancelled) setSoilData(data); })
      .catch(() => { if (!cancelled) setSoilData(null); });
    fetchWeatherByLocation(property.location)
      .then((data) => { if (!cancelled) setWeatherData(data); })
      .catch(() => { if (!cancelled) setWeatherData(null); });
    return () => {
      cancelled = true;
    };
  }, [property, cropCycleId]);
  const soilPh = soilData?.chemical?.ph_h2o;
  const soilStatusLabel = soilPh == null ? undefined : soilPh >= 5.5 && soilPh <= 8.0 ? 'Good' : 'Attention Required';

  // Step 9 — read-only Harvest / Crop History for the owner.
  const [harvestRecords, setHarvestRecords] = useState<HarvestRecord[]>([]);
  useEffect(() => {
    if (!cropCycleId) {
      setHarvestRecords([]);
      return;
    }
    let cancelled = false;
    harvestApi.fetchByCropCycle(cropCycleId).then((records) => {
      if (!cancelled) setHarvestRecords(records);
    });
    return () => {
      cancelled = true;
    };
  }, [cropCycleId]);
  const latestHarvest = harvestRecords[0];
  const latestYield =
    latestHarvest?.quantity && latestHarvest?.harvestedArea && latestHarvest.harvestedArea > 0
      ? Math.round((latestHarvest.quantity / latestHarvest.harvestedArea) * 100) / 100
      : undefined;
  const cropStartIso = cropCycle?.sownDate || cropCycle?.plannedPlantingDate;
  const cropDurationDays =
    latestHarvest && cropStartIso
      ? Math.max(
          0,
          Math.round(
            (new Date(latestHarvest.harvestDate + 'T00:00:00').getTime() - new Date(cropStartIso + 'T00:00:00').getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : undefined;

  const cropHistory = cropCycles
    .filter((c) => c.landId === propertyId && c.status !== 'active')
    .sort((a, b) => b.cropCycleId.localeCompare(a.cropCycleId));
  const [historyHarvests, setHistoryHarvests] = useState<Record<string, HarvestRecord[]>>({});
  useEffect(() => {
    const ids = cropHistory.map((c) => c.cropCycleId);
    if (ids.length === 0) {
      setHistoryHarvests({});
      return;
    }
    harvestApi.fetchByCropCycleIds(ids).then(setHistoryHarvests);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropHistory.map((c) => c.cropCycleId).join(',')]);

  // New Farm Management pipeline — Admin sets `assigned_farmer_id` directly
  // on `lands` (see supabase/add_farm_management_assigned_farmer.sql), with
  // no name attached. Resolve it via the same profiles directory the owner's
  // Tenants screen already uses, only when there's no legacy lease record to
  // read a name from instead.
  const [assignedFarmerName, setAssignedFarmerName] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!property?.assignedFarmerId || propertyLease?.farmerName) {
      setAssignedFarmerName(undefined);
      return;
    }
    let cancelled = false;
    profilesApi.fetchFarmersByIds([property.assignedFarmerId]).then(farmers => {
      if (!cancelled) setAssignedFarmerName(farmers[0]?.name);
    });
    return () => {
      cancelled = true;
    };
  }, [property?.assignedFarmerId, propertyLease?.farmerName]);

  const handleShare = async () => {
    if (!property) return;
    const managementStatus = getManagementStatus(property);
    const message = [
      `${property.title}`,
      `${formatArea(property.acres)} • ${property.soilType}`,
      `${property.location}, ${property.district}, ${property.state}`,
      `Status: ${MANAGEMENT_STATUS_LABEL[managementStatus]}`,
      property.description ? `\n${property.description}` : '',
    ].join('\n');
    try {
      await Share.share({
        message,
        title: `Property: ${property.title}`,
      });
    } catch (err: unknown) {
      if ((err as { message?: string })?.message !== 'User did not share') {
        Alert.alert('Error', 'Could not share property details.');
      }
    }
  };

  if (!property) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.errorText}>Property not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const bestCrops = getBestCrops(property.soilType);
  const [activeTab, setActiveTab] = useState<LandDetailsTab>('management');
  const managementStatus = getManagementStatus(property);

  const tabs: { key: LandDetailsTab; label: string; icon: string }[] = [
    { key: 'management', label: 'Management', icon: 'shield-checkmark-outline' },
    { key: 'crop', label: 'Crop grown', icon: 'leaf-outline' },
    { key: 'labor', label: 'Labor activity', icon: 'people-outline' },
    { key: 'revenue', label: 'Revenue', icon: 'bar-chart-outline' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Land Details"
        onBack={() => navigation.goBack()}
        rightAction={{ icon: 'share-outline', onPress: handleShare }}
        rightIconColor={colors.primary}
        buttonBackgroundColor="transparent"
        titleWeight="700"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photos / videos */}
        <MediaCarousel urls={property.mediaUrls?.length ? property.mediaUrls : [property.imageUrl]} height={240} />

        {/* Title & status */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{property.title}</Text>
          <View
            style={[
              styles.statusBadge,
              managementStatus === 'managed'
                ? styles.statusLeased
                : managementStatus === 'verified'
                ? styles.statusAvailable
                : styles.statusInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                managementStatus === 'managed'
                  ? styles.statusTextLeased
                  : managementStatus === 'verified'
                  ? styles.statusTextAvailable
                  : styles.statusTextInactive,
              ]}
            >
              {MANAGEMENT_STATUS_LABEL[managementStatus]}
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text style={styles.location}>
            {property.location}, {property.district}, {property.state}
          </Text>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? colors.primary : colors.textMuted} />
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab content */}
        {activeTab === 'management' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Management</Text>
            <DetailRow icon="shield-checkmark-outline" label="Status" value={MANAGEMENT_STATUS_LABEL[managementStatus]} />
            {managementStatus === 'pending_verification' && (
              <Text style={styles.noDataText}>
                Verification Pending — AgriArambh is reviewing this land. It isn't shown to farmers yet.
              </Text>
            )}
            {managementStatus === 'verified' && (
              <Text style={styles.noDataText}>
                Verified Land — available for Farm Management. AgriArambh will assign a farmer to manage it.
              </Text>
            )}
            {managementStatus === 'managed' && (
              <>
                {isFarmManagementStage(property.managementStatus) && (
                  <DetailRow
                    icon="shield-checkmark-outline"
                    label="Stage"
                    value={FARM_MANAGEMENT_STAGE_LABEL[property.managementStatus]}
                  />
                )}
                <DetailRow
                  icon="person-outline"
                  label="Assigned Farmer"
                  value={propertyLease?.farmerName || assignedFarmerName || 'Not available'}
                />
                <DetailRow icon="leaf-outline" label="Current Crop" value={cropCycle?.cropName || property.currentCrop || 'Not set'} />
                {!!cropCycle?.currentStage && (
                  <>
                    <DetailRow
                      icon="trending-up-outline"
                      label="Crop Stage"
                      value={CROP_STAGE_LABEL[cropCycle.currentStage as keyof typeof CROP_STAGE_LABEL] || cropCycle.currentStage}
                    />
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${stageProgressPercent(cropCycle.currentStage)}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{stageProgressPercent(cropCycle.currentStage)}% complete</Text>
                  </>
                )}
                <DetailRow
                  icon="pulse-outline"
                  label="Farm Health"
                  value={cropCycle?.healthStatus ? HEALTH_LABEL[cropCycle.healthStatus] : 'No crop cycle yet'}
                />
                {!!cropHealth && (
                  <DetailRow icon="heart-outline" label="Crop Health" value={CROP_HEALTH_LABEL[cropHealth]} />
                )}
                {!!cropCycle?.status && (
                  <DetailRow icon="flag-outline" label="Crop Cycle Status" value={CROP_CYCLE_STATUS_LABEL[cropCycle.status] || cropCycle.status} />
                )}
                <DetailRow icon="layers-outline" label="Soil Status" value={soilStatusLabel || 'Data not available'} />
                <DetailRow
                  icon="partly-sunny-outline"
                  label="Weather"
                  value={weatherData ? `${weatherData.condition}, ${weatherData.tempC}°C` : 'Data not available'}
                />

                <Text style={[styles.cardSubtitle, { marginTop: spacing.md }]}>Upcoming Activities</Text>
                {upcomingFarmActivities.length === 0 ? (
                  <Text style={styles.noDataText}>No upcoming activities yet.</Text>
                ) : (
                  upcomingFarmActivities.map((a) => (
                    <View key={a.activityId} style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailLabel}>{relativeDayLabel(a.scheduledDate)}:</Text>
                      <Text style={styles.detailValue}>{a.title}</Text>
                    </View>
                  ))
                )}

                <Text style={[styles.cardSubtitle, { marginTop: spacing.md }]}>Recent Observations</Text>
                {recentObservations.length === 0 ? (
                  <Text style={styles.noDataText}>No observations recorded yet.</Text>
                ) : (
                  recentObservations.map((o) => (
                    <View key={o.observationId} style={styles.detailRow}>
                      <Ionicons name="chatbox-ellipses-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailValue}>{o.observation || 'Photo added'}</Text>
                    </View>
                  ))
                )}

                {observationPhotos.length > 0 && (
                  <View style={styles.photoStripRow}>
                    {observationPhotos.map((o) => (
                      <Image key={o.observationId} source={{ uri: o.photoUrl }} style={styles.photoStripThumb} />
                    ))}
                  </View>
                )}

                <Text style={[styles.cardSubtitle, { marginTop: spacing.md }]}>Recent Activities</Text>
                {recentActivities.length === 0 ? (
                  <Text style={styles.noDataText}>No recent activity logged yet.</Text>
                ) : (
                  recentActivities.map((activity) => (
                    <View key={activity.activityId} style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailLabel}>{activity.date}:</Text>
                      <Text style={styles.detailValue}>{activity.title || activity.type}</Text>
                    </View>
                  ))
                )}

                {latestHarvest && (
                  <>
                    <Text style={[styles.cardSubtitle, { marginTop: spacing.md }]}>Harvest</Text>
                    <DetailRow icon="calendar-outline" label="Harvest Date" value={latestHarvest.harvestDate} />
                    <DetailRow
                      icon="basket-outline"
                      label="Quantity"
                      value={latestHarvest.quantity !== undefined ? `${latestHarvest.quantity} ${latestHarvest.unit || ''}`.trim() : 'Data not available'}
                    />
                    <DetailRow
                      icon="stats-chart-outline"
                      label="Yield"
                      value={latestYield !== undefined ? `${latestYield} ${latestHarvest.unit || ''} / Acre`.trim() : 'Yield data unavailable'}
                    />
                    <DetailRow
                      icon="time-outline"
                      label="Crop Duration"
                      value={cropDurationDays !== undefined ? `${cropDurationDays} Days` : 'Data not available'}
                    />
                  </>
                )}
              </>
            )}
          </View>
        )}

        {activeTab === 'management' && managementStatus === 'managed' && cropHistory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crop History</Text>
            {cropHistory.map((c) => {
              const harvest = historyHarvests[c.cropCycleId]?.[0];
              return (
                <View key={c.cropCycleId} style={styles.historyCard}>
                  <View style={styles.historyTopRow}>
                    <Text style={styles.detailValue}>{c.cropName}</Text>
                    <View style={styles.historyStatusPill}>
                      <Text style={styles.historyStatusText}>{CROP_CYCLE_STATUS_LABEL[c.status] || c.status}</Text>
                    </View>
                  </View>
                  {!!c.plannedPlantingDate && (
                    <Text style={styles.noDataText}>
                      {c.plannedPlantingDate}{harvest ? ` – ${harvest.harvestDate}` : ''}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
        {activeTab === 'crop' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crop grown</Text>
            <Text style={styles.cardSubtitle}>Suggested for {property.soilType}</Text>
            <View style={styles.chipRow}>
              {bestCrops.map((crop) => (
                <View key={crop} style={styles.chip}>
                  <Ionicons name="leaf" size={14} color={colors.primary} />
                  <Text style={styles.chipText}>{crop}</Text>
                </View>
              ))}
            </View>
            {property.lastYearCrop && (
              <>
                <DetailRow icon="leaf-outline" label="Last crop" value={property.lastYearCrop} />
                {property.lastYearYield && <DetailRow icon="stats-chart-outline" label="Yield" value={property.lastYearYield} />}
              </>
            )}
          </View>
        )}
        {activeTab === 'labor' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Labor activity</Text>
            <Text style={styles.noDataText}>No labor records for this property. Post work from Labor Connect.</Text>
          </View>
        )}
        {activeTab === 'revenue' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Revenue analytics</Text>
            {property.lastYearEarnings ? (
              <View style={styles.earningsRow}>
                <Ionicons name="wallet" size={20} color={colors.success} />
                <View style={styles.earningsContent}>
                  <Text style={styles.earningsLabel}>Earnings on this land</Text>
                  <Text style={styles.earningsValue}>{property.lastYearEarnings}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>No revenue recorded yet.</Text>
            )}
          </View>
        )}

        {/* Details card (summary) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <DetailRow icon="resize-outline" label="Area" value={formatArea(property.acres)} />
          <DetailRow icon="leaf-outline" label="Soil" value={property.soilType} />
          {property.waterSource && (
            <DetailRow icon="water-outline" label="Water" value={property.waterSource} />
          )}
          <DetailRow icon="leaf-outline" label="Current Crop" value={property.currentCrop || 'Not set'} />
          <DetailRow icon="shield-checkmark-outline" label="Verification" value={MANAGEMENT_STATUS_LABEL[managementStatus]} />
          {property.description ? (
            <View style={styles.descriptionRow}>
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.descriptionText}>{property.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Share button (full width) */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={22} color={colors.surface} />
          <Text style={styles.shareButtonText}>Share this property</Text>
        </TouchableOpacity>

        {!!cropCycleId && (
          <TouchableOpacity
            style={[styles.shareButton, styles.cropButton]}
            onPress={() => navigation.navigate('CropDetails', { cropCycleId })}
          >
            <Ionicons name="leaf-outline" size={22} color={colors.surface} />
            <Text style={styles.shareButtonText}>View Full Activity Log</Text>
          </TouchableOpacity>
        )}

        {managementStatus === 'managed' && (
          <TouchableOpacity
            style={[styles.shareButton, styles.cropButton]}
            onPress={() => navigation.navigate('SatelliteMap', { farmId: propertyId })}
          >
            <Ionicons name="map-outline" size={22} color={colors.surface} />
            <Text style={styles.shareButtonText}>View on Map</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  statusLeased: { backgroundColor: colors.softGreen },
  statusAvailable: { backgroundColor: colors.softOrange },
  statusInactive: { backgroundColor: colors.border },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusTextLeased: { color: colors.success },
  statusTextAvailable: { color: colors.warning },
  statusTextInactive: { color: colors.textMuted },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  tabActive: { backgroundColor: colors.softGreen },
  tabLabel: { fontSize: 12, color: colors.textMuted },
  tabLabelActive: { color: colors.primary, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    width: 90,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    gap: spacing.xs,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  earningsContent: {
    marginLeft: spacing.md,
  },
  earningsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  progressText: { fontSize: 11, color: colors.textMuted, marginTop: 4, marginBottom: spacing.sm },
  photoStripRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  photoStripThumb: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.border },
  historyCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  historyTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  historyStatusPill: {
    backgroundColor: colors.softGreen,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  historyStatusText: { fontSize: 10.5, fontWeight: '700', color: colors.success },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
  cropButton: {
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  backButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
});
