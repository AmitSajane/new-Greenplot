import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { useFarmListings } from '../../context/FarmListingsContext';
import { useCropCycles } from '../../context/CropCycleContext';
import { CURRENT_STATUSES } from '../../services/cropCycleApi';
import { useAuth } from '../../context/AuthContext';
import { FARM_MANAGEMENT_STAGE_LABEL, isFarmManagementStage } from '../../utils/farmManagementStatus';
import {
  CROP_STAGE_LABEL,
  CROP_STAGES,
  CropStage,
  daysRemaining,
  daysSince,
  isCropStage,
  isHarvestStage,
  laterStage,
  relativeDayLabel,
  requiresPlanting,
  stageIndex,
  stageProgressPercent,
} from '../../utils/cropStages';
import { CROP_HEALTH_LABEL, deriveCropHealth } from '../../utils/cropHealth';
import { resolveFarmCoordinates } from '../../utils/geo/farmLocation';
import { buildTimeline } from '../../utils/monitoringTimeline';
import { farmActivityApi } from '../../services/farmActivityApi';
import { farmObservationApi } from '../../services/farmObservationApi';
import { cropActivityApi } from '../../services/cropActivityApi';
import { cropGuidanceApi } from '../../services/cropGuidanceApi';
import { harvestApi } from '../../services/harvestApi';
import { storageApi } from '../../services/storageApi';
import { fetchSoilData } from '../../services/soilService';
import { fetchWeatherByLocation } from '../../services/weatherApi';
import type { SoilResponse } from '../../types/soil';
import type { WeatherInfo } from '../farmerHome/constants/farmerDashboardData';
import type { CropActivity, FarmActivity, FarmActivityPriority, FarmObservation, HarvestRecord } from '../../modules/work/types';
import type { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';
import { formatArea } from '../../utils/geo';

// Defensive optional require, same guard as AddFarmScreen.tsx.
let ImagePicker: { launchImageLibrary?: Function } | null;
try {
  ImagePicker = require('react-native-image-picker');
} catch {
  ImagePicker = null;
}

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'ManagedFarmDashboard'>;
type Route = RouteProp<FarmerHomeStackParamList, 'ManagedFarmDashboard'>;

type TabKey = 'overview' | 'cropPlan' | 'activities' | 'monitoring' | 'photos';
type MonitoringSubTab = 'overview' | 'satellite' | 'soil' | 'weather' | 'observations';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline' },
  { key: 'cropPlan', label: 'Crop Plan', icon: 'leaf-outline' },
  { key: 'activities', label: 'Activities', icon: 'time-outline' },
  { key: 'monitoring', label: 'Monitoring', icon: 'pulse-outline' },
  { key: 'photos', label: 'Photos', icon: 'image-outline' },
];

const MONITORING_SUB_TABS: { key: MonitoringSubTab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline' },
  { key: 'satellite', label: 'Satellite', icon: 'globe-outline' },
  { key: 'soil', label: 'Soil', icon: 'layers-outline' },
  { key: 'weather', label: 'Weather', icon: 'partly-sunny-outline' },
  { key: 'observations', label: 'Observations', icon: 'chatbox-ellipses-outline' },
];

const ACTIVITY_TYPE_ICON: Record<string, string> = {
  IRRIGATION: 'water-outline',
  FERTILIZATION: 'flask-outline',
  WEED_MANAGEMENT: 'cut-outline',
  PEST_INSPECTION: 'bug-outline',
  DISEASE_INSPECTION: 'medkit-outline',
  SPRAYING: 'color-wand-outline',
  PRUNING: 'cut-outline',
  EARTHING_UP: 'layers-outline',
  HARVESTING: 'basket-outline',
  OTHER: 'ellipsis-horizontal-outline',
};

const PRIORITY_META: Record<FarmActivityPriority, { label: string; color: string }> = {
  LOW: { label: 'Low', color: colors.textMuted },
  MEDIUM: { label: 'Medium', color: colors.warning },
  HIGH: { label: 'High', color: colors.danger },
};

const RAIN_EMOJI = ['🌧', '⛈'];
const HARVEST_UNITS = ['kg', 'Quintal', 'Tonnes'];
const HARVEST_GRADES = ['Grade A', 'Grade B', 'Grade C', 'Ungraded'];
const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  harvest_ready: 'Ready for Harvest',
  harvested: 'Harvested',
  completed: 'Completed',
  fallow: 'Fallow',
};

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Supabase throws plain PostgrestError objects, not Error instances — an
 *  `e instanceof Error` check alone always misses the real message and
 *  falls back to a generic "check your connection" text. */
function getErrorMessage(e: unknown): string | undefined {
  if (e instanceof Error) return e.message;
  if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') {
    return (e as any).message;
  }
  return undefined;
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

/** Never fabricates a value — shows "Data not available" instead of a fake
 *  default when `value` is missing (Step 8's explicit rule). */
function DataRow({ icon, label, value }: { icon: string; label: string; value?: string | number | null }) {
  const hasValue = value !== undefined && value !== null && value !== '';
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, !hasValue && styles.notAvailableText]}>
        {hasValue ? String(value) : 'Data not available'}
      </Text>
    </View>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, percent))}%` }]} />
    </View>
  );
}

function ComingSoonCard({ icon, title, note }: { icon: string; title: string; note: string }) {
  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.comingSoonHeader}>
        <Ionicons name={icon as any} size={20} color={colors.textMuted} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.comingSoonText}>{note}</Text>
    </View>
  );
}

interface HistoryTrailEntry {
  key: string;
  date: string;
  label: string;
  note?: string;
  state: 'done' | 'skipped' | 'notDone';
}

/** A past crop's whole activity trail, oldest first: every scheduled activity
 *  (with its outcome) plus free-form log entries not already mirrored from one. */
function buildHistoryTrail(scheduled: FarmActivity[], free: CropActivity[]): HistoryTrailEntry[] {
  const entries: HistoryTrailEntry[] = scheduled.map((a) => ({
    key: `s_${a.activityId}`,
    date: (a.status === 'COMPLETED' && a.completedDate) || a.scheduledDate,
    label: a.title,
    note: a.farmerNotes,
    state: a.status === 'COMPLETED' ? 'done' : a.status === 'SKIPPED' ? 'skipped' : 'notDone',
  }));
  const freeLabel = (a: CropActivity) =>
    a.type === 'other' && a.title ? a.title : a.type === 'sowing' ? 'Sowing / Transplanting' : a.type.charAt(0).toUpperCase() + a.type.slice(1);
  free.forEach((a) => {
    const label = freeLabel(a);
    const mirrored = scheduled.some((sa) => sa.status === 'COMPLETED' && sa.completedDate === a.date && sa.title === label);
    if (!mirrored) entries.push({ key: `f_${a.activityId}`, date: a.date, label, note: a.note, state: 'done' });
  });
  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

function ActivityCard({
  activity,
  overdue,
  stageLabel,
  onComplete,
}: {
  activity: FarmActivity;
  overdue: boolean;
  stageLabel?: string;
  onComplete: () => void;
}) {
  const priorityMeta = PRIORITY_META[activity.priority];
  return (
    <View style={[styles.activityCard, shadow.card]}>
      <View style={styles.activityHeaderRow}>
        <View style={styles.activityIconBox}>
          <Ionicons name={(ACTIVITY_TYPE_ICON[activity.activityType] || 'ellipse-outline') as any} size={18} color={colors.primary} />
        </View>
        <View style={styles.activityTitleCol}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityDate}>
            {stageLabel ? `${stageLabel} · ` : ''}
            {overdue ? 'Overdue' : relativeDayLabel(activity.scheduledDate) === 'Today' ? 'Today' : activity.scheduledDate}
          </Text>
        </View>
        <View style={[styles.priorityPill, { borderColor: priorityMeta.color }]}>
          <Text style={[styles.priorityPillText, { color: priorityMeta.color }]}>{priorityMeta.label}</Text>
        </View>
      </View>
      {!!activity.description && <Text style={styles.activityDescription}>{activity.description}</Text>}
      <View style={styles.activityActionsRow}>
        <TouchableOpacity style={[styles.completeBtn, styles.activityActionFlex]} onPress={onComplete} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.surface} />
          <Text style={styles.completeBtnText}>Mark as Completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function healthColorStyle(level: 'GOOD' | 'ATTENTION_REQUIRED' | 'AT_RISK') {
  if (level === 'GOOD') return { color: colors.success };
  if (level === 'ATTENTION_REQUIRED') return { color: colors.warning };
  return { color: colors.danger };
}

function deriveSoilStatus(soil: SoilResponse | null): 'GOOD' | 'ATTENTION_REQUIRED' | undefined {
  const ph = soil?.chemical?.ph_h2o;
  if (ph === null || ph === undefined) return undefined;
  return ph >= 5.5 && ph <= 8.0 ? 'GOOD' : 'ATTENTION_REQUIRED';
}

export default function ManagedFarmDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const { farmId } = route.params;
  const { getListingById } = useFarmListings();
  const { cropCycles, getCropCycleByLand, saveCropCycle, updateCropCycle } = useCropCycles();
  const { user } = useAuth();
  const farm = getListingById(farmId);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [monitoringSubTab, setMonitoringSubTab] = useState<MonitoringSubTab>('overview');

  const cropCycle = user?.id ? getCropCycleByLand(farmId, user.id) : undefined;
  const cropCycleId = cropCycle?.cropCycleId;

  const [activities, setActivities] = useState<FarmActivity[]>([]);
  const [observations, setObservations] = useState<FarmObservation[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  // Scheduled activities don't store their stage; it lives on the crop_guidance
  // row they were generated from. Load it once so the Activities tab can be
  // ordered/labelled by the same stage sequence the Crop Plan's Advance uses.
  const [guidanceStages, setGuidanceStages] = useState<Record<string, CropStage>>({});
  const guidanceCropId = cropCycle?.cropId;
  useEffect(() => {
    if (!guidanceCropId) {
      setGuidanceStages({});
      return;
    }
    cropGuidanceApi.fetchForCrop(guidanceCropId).then((rows) => {
      const map: Record<string, CropStage> = {};
      rows.forEach((g) => {
        if (isCropStage(g.cropStage)) map[`${g.title}|${g.activityType}`] = g.cropStage;
      });
      setGuidanceStages(map);
    });
  }, [guidanceCropId]);
  const stageOfActivity = (a: FarmActivity): CropStage | undefined => guidanceStages[`${a.title}|${a.activityType}`];
  const stageLabelFor = (a: FarmActivity): string | undefined => {
    const st = stageOfActivity(a);
    return st ? CROP_STAGE_LABEL[st] : undefined;
  };

  const refetchActivities = useCallback(() => {
    if (!cropCycleId) return;
    setLoadingActivities(true);
    farmActivityApi
      .fetchByCropCycle(cropCycleId)
      .then(setActivities)
      .finally(() => setLoadingActivities(false));
  }, [cropCycleId]);

  useEffect(() => {
    if (!cropCycleId) {
      setActivities([]);
      return;
    }
    refetchActivities();
    return farmActivityApi.subscribe(cropCycleId, refetchActivities);
  }, [cropCycleId, refetchActivities]);

  const refetchObservations = useCallback(() => {
    if (!cropCycleId) {
      setObservations([]);
      return;
    }
    farmObservationApi.fetchByCropCycle(cropCycleId).then(setObservations);
  }, [cropCycleId]);

  useEffect(() => {
    refetchObservations();
  }, [refetchObservations]);

  // ── Monitoring: Soil / Weather — fetched once per farm, lazily, and
  // cached so switching sub-tabs doesn't re-fetch (spec §2: never guess a
  // summary from a source that hasn't actually loaded). ───────────────────
  const [soilData, setSoilData] = useState<SoilResponse | null>(null);
  const [soilLoading, setSoilLoading] = useState(false);
  const [soilFetched, setSoilFetched] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherFetched, setWeatherFetched] = useState(false);

  useEffect(() => {
    if (activeTab !== 'monitoring' || !farm || soilFetched) return;
    setSoilFetched(true);
    setSoilLoading(true);
    resolveFarmCoordinates(farm)
      .then((coords) => (coords ? fetchSoilData(coords.lat, coords.lon) : null))
      .then(setSoilData)
      .catch(() => setSoilData(null))
      .finally(() => setSoilLoading(false));
  }, [activeTab, farm, soilFetched]);

  useEffect(() => {
    if (activeTab !== 'monitoring' || !farm || weatherFetched) return;
    setWeatherFetched(true);
    setWeatherLoading(true);
    fetchWeatherByLocation(farm.location)
      .then(setWeatherData)
      .catch(() => setWeatherData(null))
      .finally(() => setWeatherLoading(false));
  }, [activeTab, farm, weatherFetched]);

  // ── Complete Activity sheet ──────────────────────────────────────────────
  const [completingActivity, setCompletingActivity] = useState<FarmActivity | null>(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeObservation, setCompleteObservation] = useState('');
  const [completeDate, setCompleteDate] = useState(new Date());
  const [showCompleteDatePicker, setShowCompleteDatePicker] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [photoMime, setPhotoMime] = useState<string | undefined>(undefined);
  const [submittingComplete, setSubmittingComplete] = useState(false);

  const openCompleteSheet = (activity: FarmActivity) => {
    setCompletingActivity(activity);
    setCompleteNotes('');
    setCompleteObservation('');
    setCompleteDate(new Date());
    setPhotoUri(undefined);
    setPhotoBase64(undefined);
    setPhotoMime(undefined);
  };
  const closeCompleteSheet = () => {
    if (submittingComplete) return;
    setCompletingActivity(null);
  };

  const pickPhoto = (onPicked: (uri: string, base64?: string, mime?: string) => void) => {
    if (!ImagePicker?.launchImageLibrary) {
      Alert.alert('Gallery', 'Image picker not available in this build.');
      return;
    }
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', includeBase64: true, maxWidth: 1600, maxHeight: 1600, quality: 0.8 },
      (res: { didCancel?: boolean; assets?: any[] }) => {
        if (res.didCancel) return;
        const a = res.assets?.[0];
        if (a?.uri) onPicked(a.uri, a.base64, a.type);
      },
    );
  };

  /** Stage a scheduled activity belongs to, via the crop_guidance row it was generated from. */
  const resolveActivityStage = async (activity: FarmActivity): Promise<CropStage | undefined> => {
    const cached = stageOfActivity(activity);
    if (cached) return cached;
    if (!cropCycle?.cropId) return undefined;
    const guidance = await cropGuidanceApi.fetchForCrop(cropCycle.cropId);
    const match = guidance.find((g) => g.title === activity.title && g.activityType === activity.activityType);
    return match && isCropStage(match.cropStage) ? match.cropStage : undefined;
  };

  /** Advance the crop plan to `stage` (if ahead of the current one). Best-effort. */
  const syncStageFromActivity = async (stage: CropStage, completedDateIso: string) => {
    if (!cropCycle || !user?.id) return;
    try {
      const newStage = laterStage(cropCycle.currentStage, stage);
      if (stage === 'PLANTING' && !cropCycle.sownDate) {
        await saveCropCycle({
          landId: cropCycle.landId,
          leaseId: cropCycle.leaseId,
          farmerId: cropCycle.farmerId,
          ownerId: cropCycle.ownerId,
          plotName: cropCycle.plotName,
          areaAcres: cropCycle.areaAcres,
          landlord: cropCycle.landlord,
          cropName: cropCycle.cropName,
          sownDate: completedDateIso,
          healthStatus: cropCycle.healthStatus || 'healthy',
          healthNote: cropCycle.healthNote,
          cropId: cropCycle.cropId,
          variety: cropCycle.variety,
          plannedPlantingDate: cropCycle.plannedPlantingDate,
          expectedHarvestDate: cropCycle.expectedHarvestDate,
          currentStage: newStage,
        });
      } else if (newStage !== cropCycle.currentStage) {
        await updateCropCycle(cropCycle.cropCycleId, {
          currentStage: newStage,
          status: isHarvestStage(newStage) && cropCycle.status === 'active' ? 'harvest_ready' : undefined,
        });
      }
    } catch {
      // The activity is already marked complete; stage sync is best-effort.
    }
  };

  const handleSubmitComplete = async () => {
    if (!completingActivity || !user?.id || submittingComplete) return;
    setSubmittingComplete(true);
    try {
      let photoUrl: string | null = null;
      if (photoBase64) {
        photoUrl = await storageApi.uploadImage(photoBase64, photoMime || 'image/jpeg', user.id);
      }
      const completedDateIso = completeDate.toISOString().slice(0, 10);
      await farmActivityApi.markCompleted(completingActivity.activityId, {
        completedDate: completedDateIso,
        farmerNotes: completeNotes.trim() || undefined,
      });
      if (completeObservation.trim() || photoUrl) {
        await farmObservationApi.add({
          activityId: completingActivity.activityId,
          cropCycleId,
          farmerId: user.id,
          ownerId: farm?.ownerId,
          observation: completeObservation.trim() || undefined,
          photoUrl: photoUrl || undefined,
          cropStage: cropCycle?.currentStage,
        });
      }
      // Mirror into the free-text Activity Log so the completion shows up in
      // the existing CropDetailsScreen timeline too (see cropActivityApi) —
      // additive, not a replacement for either table.
      // Completing a scheduled activity belongs to a crop stage (looked up from
      // the guidance it was generated from). Move the plan forward to that
      // stage — never backward — so Advance/Crop Plan follow the work done.
      const completedStage = await resolveActivityStage(completingActivity);
      if (cropCycleId) {
        await cropActivityApi
          .add({
            cropCycleId,
            farmerId: user.id,
            ownerId: farm?.ownerId,
            type: completedStage === 'PLANTING' ? 'sowing' : 'other',
            title: completingActivity.title,
            note: completeNotes.trim() || undefined,
            date: completedDateIso,
          })
          .catch(() => {});
      }
      if (completedStage) await syncStageFromActivity(completedStage, completedDateIso);
      setCompletingActivity(null);
      refetchActivities();
      refetchObservations();
    } catch (e) {
      const reason = getErrorMessage(e);
      Alert.alert('Could not complete activity', reason || 'Please check your connection and try again.');
    } finally {
      setSubmittingComplete(false);
    }
  };

  // ── Add Observation sheet (Monitoring > Observations) ───────────────────
  const [addingObservation, setAddingObservation] = useState(false);
  const [obsText, setObsText] = useState('');
  const [obsDate, setObsDate] = useState(new Date());
  const [showObsDatePicker, setShowObsDatePicker] = useState(false);
  const [obsStage, setObsStage] = useState<string | undefined>(undefined);
  const [obsPhotoUri, setObsPhotoUri] = useState<string | undefined>(undefined);
  const [obsPhotoBase64, setObsPhotoBase64] = useState<string | undefined>(undefined);
  const [obsPhotoMime, setObsPhotoMime] = useState<string | undefined>(undefined);
  const [submittingObs, setSubmittingObs] = useState(false);

  const openAddObservation = () => {
    setObsText('');
    setObsDate(new Date());
    setObsStage(cropCycle?.currentStage);
    setObsPhotoUri(undefined);
    setObsPhotoBase64(undefined);
    setObsPhotoMime(undefined);
    setAddingObservation(true);
  };
  const closeAddObservation = () => {
    if (submittingObs) return;
    setAddingObservation(false);
  };

  const handleSubmitObservation = async () => {
    if (!user?.id || !cropCycleId || submittingObs) return;
    if (!obsText.trim() && !obsPhotoBase64) {
      Alert.alert('Add something first', 'Enter an observation or add a photo.');
      return;
    }
    setSubmittingObs(true);
    try {
      let photoUrl: string | null = null;
      if (obsPhotoBase64) {
        photoUrl = await storageApi.uploadImage(obsPhotoBase64, obsPhotoMime || 'image/jpeg', user.id);
      }
      await farmObservationApi.add({
        cropCycleId,
        farmerId: user.id,
        ownerId: farm?.ownerId,
        observation: obsText.trim() || undefined,
        photoUrl: photoUrl || undefined,
        cropStage: obsStage,
      });
      setAddingObservation(false);
      refetchObservations();
    } catch (e) {
      const reason = getErrorMessage(e);
      Alert.alert('Could not add observation', reason || 'Please check your connection and try again.');
    } finally {
      setSubmittingObs(false);
    }
  };

  // ── Step 9: Harvest / Farm Performance / Crop Cycle Completion ──────────
  const [harvestRecords, setHarvestRecords] = useState<HarvestRecord[]>([]);
  const [advancingStage, setAdvancingStage] = useState(false);
  const [completingCycle, setCompletingCycle] = useState(false);

  const refetchHarvests = useCallback(() => {
    if (!cropCycleId) {
      setHarvestRecords([]);
      return;
    }
    harvestApi.fetchByCropCycle(cropCycleId).then(setHarvestRecords);
  }, [cropCycleId]);

  useEffect(() => {
    refetchHarvests();
  }, [refetchHarvests]);

  const cropHistory = user?.id
    ? cropCycles
        .filter((c) => c.landId === farmId && c.farmerId === user.id && !c.leaseId && !CURRENT_STATUSES.includes(c.status))
        .sort((a, b) => b.cropCycleId.localeCompare(a.cropCycleId))
    : [];
  const [historyHarvests, setHistoryHarvests] = useState<Record<string, HarvestRecord[]>>({});
  // View-only drill-down: tapping a past crop loads its full activity trail
  // (scheduled + free-form log) once, then just toggles it open/closed.
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [historyTrails, setHistoryTrails] = useState<Record<string, HistoryTrailEntry[] | 'loading'>>({});
  const toggleHistoryTrail = async (cycleId: string) => {
    if (expandedHistoryId === cycleId) {
      setExpandedHistoryId(null);
      return;
    }
    setExpandedHistoryId(cycleId);
    if (historyTrails[cycleId] && historyTrails[cycleId] !== 'loading') return;
    setHistoryTrails((p) => ({ ...p, [cycleId]: 'loading' }));
    const [scheduled, free] = await Promise.all([
      farmActivityApi.fetchByCropCycle(cycleId),
      cropActivityApi.fetchByCropCycle(cycleId).catch((): CropActivity[] => []),
    ]);
    setHistoryTrails((p) => ({ ...p, [cycleId]: buildHistoryTrail(scheduled, free) }));
  };
  useEffect(() => {
    const ids = cropHistory.map((c) => c.cropCycleId);
    if (ids.length === 0) {
      setHistoryHarvests({});
      return;
    }
    harvestApi.fetchByCropCycleIds(ids).then(setHistoryHarvests);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropHistory.map((c) => c.cropCycleId).join(',')]);

  const handleAdvanceStage = async () => {
    if (!cropCycle || advancingStage) return;
    const currentIndex = stageIndex(cropCycle.currentStage);
    const nextStage = CROP_STAGES[currentIndex + 1];
    if (!nextStage) return;
    // Growth stages can't start before the crop is actually planted — keeps the
    // stage, the "Planted" date and the activity log in the same order.
    if (requiresPlanting(nextStage) && !cropCycle.sownDate) {
      Alert.alert(
        'Log sowing first',
        `Record the Sowing activity (View / Log Activity) before advancing to ${CROP_STAGE_LABEL[nextStage]}.`,
      );
      return;
    }
    if (pendingInCurrentStage.length > 0) {
      const proceed = await new Promise<boolean>((resolve) =>
        Alert.alert(
          `${pendingInCurrentStage.length} activit${pendingInCurrentStage.length === 1 ? 'y' : 'ies'} still pending`,
          `${pendingInCurrentStage.map((a) => a.title).join(', ')} ${pendingInCurrentStage.length === 1 ? 'belongs' : 'belong'} to ${stageLabelText || 'the current stage'} or earlier. Advance to ${CROP_STAGE_LABEL[nextStage]} anyway?`,
          [
            { text: 'Not yet', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Advance', onPress: () => resolve(true) },
          ],
          { cancelable: true, onDismiss: () => resolve(false) },
        ),
      );
      if (!proceed) return;
    }
    setAdvancingStage(true);
    try {
      await updateCropCycle(cropCycle.cropCycleId, {
        currentStage: nextStage,
        status: isHarvestStage(nextStage) && cropCycle.status === 'active' ? 'harvest_ready' : undefined,
      });
    } catch (e) {
      const reason = getErrorMessage(e);
      Alert.alert('Could not advance stage', reason || 'Please check your connection and try again.');
    } finally {
      setAdvancingStage(false);
    }
  };

  const handleCompleteCycle = () => {
    if (!cropCycle) return;
    Alert.alert(
      'Complete this crop cycle?',
      "Completing this crop cycle will move it to your farm history. The Managed Farm will remain available for the next crop cycle.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setCompletingCycle(true);
            try {
              await updateCropCycle(cropCycle.cropCycleId, { status: 'completed' });
            } catch (e) {
              const reason = getErrorMessage(e);
              Alert.alert('Could not complete crop cycle', reason || 'Please check your connection and try again.');
            } finally {
              setCompletingCycle(false);
            }
          },
        },
      ],
    );
  };

  // ── Record Harvest sheet ─────────────────────────────────────────────────
  const [recordingHarvest, setRecordingHarvest] = useState(false);
  const [harvestDate, setHarvestDate] = useState(new Date());
  const [showHarvestDatePicker, setShowHarvestDatePicker] = useState(false);
  const [harvestedArea, setHarvestedArea] = useState('');
  const [harvestQuantity, setHarvestQuantity] = useState('');
  const [harvestUnit, setHarvestUnit] = useState('');
  const [harvestGrade, setHarvestGrade] = useState('');
  const [harvestNotes, setHarvestNotes] = useState('');
  const [harvestPhotos, setHarvestPhotos] = useState<{ uri: string; base64?: string; mime?: string }[]>([]);
  const [submittingHarvest, setSubmittingHarvest] = useState(false);

  const openRecordHarvest = () => {
    setHarvestDate(new Date());
    setHarvestedArea(cropCycle ? String(cropCycle.areaAcres) : '');
    setHarvestQuantity('');
    setHarvestUnit('');
    setHarvestGrade('');
    setHarvestNotes('');
    setHarvestPhotos([]);
    setRecordingHarvest(true);
  };
  const closeRecordHarvest = () => {
    if (submittingHarvest) return;
    setRecordingHarvest(false);
  };

  const handleSubmitHarvest = async () => {
    if (!cropCycle || !user?.id || submittingHarvest) return;
    setSubmittingHarvest(true);
    try {
      const photoUrls: string[] = [];
      for (const photo of harvestPhotos) {
        if (!photo.base64) continue;
        const url = await storageApi.uploadImage(photo.base64, photo.mime || 'image/jpeg', user.id);
        if (url) photoUrls.push(url);
      }
      await harvestApi.record({
        cropCycleId: cropCycle.cropCycleId,
        landId: farmId,
        farmerId: user.id,
        ownerId: farm?.ownerId,
        harvestDate: harvestDate.toISOString().slice(0, 10),
        harvestedArea: harvestedArea.trim() ? parseFloat(harvestedArea) : undefined,
        quantity: harvestQuantity.trim() ? parseFloat(harvestQuantity) : undefined,
        unit: harvestUnit || undefined,
        qualityGrade: harvestGrade || undefined,
        notes: harvestNotes.trim() || undefined,
        photoUrls,
      });
      await updateCropCycle(cropCycle.cropCycleId, { status: 'harvested' });
      setRecordingHarvest(false);
      refetchHarvests();
    } catch (e) {
      const reason = getErrorMessage(e);
      Alert.alert('Could not record harvest', reason || 'Please check your connection and try again.');
    } finally {
      setSubmittingHarvest(false);
    }
  };

  if (!farm) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Managed Farm" onBack={() => navigation.goBack()} />
        <View style={styles.centerFill}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={styles.missingText}>Farm not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stageLabel = farm.selfFarmed
    ? 'Own Farm'
    : isFarmManagementStage(farm.managementStatus)
      ? FARM_MANAGEMENT_STAGE_LABEL[farm.managementStatus]
      : 'Active Management';
  const currentCropName = cropCycle?.cropName || farm.currentCrop || 'Not set yet';
  const progressPercent = cropCycle ? stageProgressPercent(cropCycle.currentStage) : 0;
  const stageLabelText = cropCycle?.currentStage
    ? CROP_STAGE_LABEL[cropCycle.currentStage as keyof typeof CROP_STAGE_LABEL] || cropCycle.currentStage
    : undefined;
  const plantedIso = cropCycle?.sownDate;
  const daysSincePlanting = daysSince(plantedIso);
  const daysUntilHarvest = daysRemaining(cropCycle?.expectedHarvestDate);

  const today = todayIso();
  const pendingActivities = activities.filter((a) => a.status === 'PENDING');
  // Stage sequence first, then date — so the list reads in the same order as
  // the Crop Plan's stages (activities with no known stage sort last).
  const bySequence = (a: FarmActivity, b: FarmActivity) => {
    const sa = stageOfActivity(a);
    const sb = stageOfActivity(b);
    const ia = sa ? stageIndex(sa) : CROP_STAGES.length;
    const ib = sb ? stageIndex(sb) : CROP_STAGES.length;
    return ia - ib || a.scheduledDate.localeCompare(b.scheduledDate);
  };
  const dueTodayOrOverdue = pendingActivities.filter((a) => a.scheduledDate <= today).sort(bySequence);
  const upcomingActivities = pendingActivities.filter((a) => a.scheduledDate > today).sort(bySequence);
  // Pending work that belongs to the current stage or an earlier one — what
  // "Advance to <next stage>" would leave behind.
  const currentStageIdx = stageIndex(cropCycle?.currentStage);
  const pendingInCurrentStage = pendingActivities.filter((a) => {
    const st = stageOfActivity(a);
    return !!st && stageIndex(st) <= currentStageIdx;
  });
  const cropHealth = deriveCropHealth(activities);
  const soilStatus = deriveSoilStatus(soilData);
  const lastObservation = observations[0];
  const timeline = buildTimeline(activities, observations);

  // ── Step 9 derived values ────────────────────────────────────────────────
  const nextStage = cropCycle ? CROP_STAGES[stageIndex(cropCycle.currentStage) + 1] : undefined;
  // The stage follows completed activities automatically (see
  // syncStageFromActivity), so manual Advance only remains for a custom crop
  // with no guidance — it has no scheduled activities to drive the stage.
  const canAdvanceStage = cropCycle?.status === 'active' && !!nextStage && !cropCycle.cropId;
  const isHarvestReady = cropCycle?.status === 'harvest_ready';
  const isHarvested = cropCycle?.status === 'harvested';
  const showHarvestReadiness = cropCycle?.status === 'harvest_ready' || cropCycle?.status === 'harvested';
  const latestHarvest = harvestRecords[0];
  const cropStartIso = plantedIso || cropCycle?.plannedPlantingDate;
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
  const yieldPerAcre =
    latestHarvest?.quantity && latestHarvest?.harvestedArea && latestHarvest.harvestedArea > 0
      ? Math.round((latestHarvest.quantity / latestHarvest.harvestedArea) * 100) / 100
      : undefined;
  const activitiesCompletedCount = activities.filter((a) => a.status === 'COMPLETED').length;

  const rainForecastSoon = (weatherData?.forecast || [])
    .slice(0, 2)
    .some((f) => RAIN_EMOJI.includes(f.emoji));
  const irrigationDueSoon = [...dueTodayOrOverdue, ...upcomingActivities.filter((a) => (daysRemaining(a.scheduledDate) ?? 99) <= 2)].some(
    (a) => a.activityType === 'IRRIGATION',
  );
  const showIrrigationWeatherAdvisory = rainForecastSoon && irrigationDueSoon;

  const openActivityLog = () => {
    if (!cropCycle) return;
    navigation.navigate('CropDetails', { cropCycleId: cropCycle.cropCycleId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title={farm.title} onBack={() => navigation.goBack()} />
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabRow}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons name={tab.icon as any} size={15} color={active ? colors.surface : colors.textSecondary} />
                <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]} numberOfLines={1}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusBanner}>
          <Ionicons name="shield-checkmark" size={18} color={colors.success} />
          <Text style={styles.statusBannerText}>{stageLabel}</Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.locationText}>{farm.location}, {farm.district}, {farm.state}</Text>
        </View>

        {activeTab === 'overview' && (
          <>
            <View style={[styles.card, shadow.card]}>
              <Text style={styles.cardTitle}>Farm Overview</Text>
              <InfoRow icon="resize-outline" label="Area" value={formatArea(farm.acres)} />
              <InfoRow icon="leaf-outline" label="Current Crop" value={currentCropName} />
              {!!farm.waterSource && <InfoRow icon="water-outline" label="Water Source" value={farm.waterSource} />}
            </View>

            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => navigation.navigate('SatelliteMap', { farmId })}
              activeOpacity={0.8}
            >
              <Ionicons name="map" size={20} color={colors.surface} />
              <Text style={styles.mapButtonText}>View Farm Boundary on Map</Text>
            </TouchableOpacity>

            {cropCycle ? (
              <View style={[styles.card, shadow.card]}>
                <Text style={styles.cardTitle}>Crop Plan</Text>
                <InfoRow icon="leaf-outline" label="Crop" value={cropCycle.cropName} />
                <InfoRow icon="trending-up-outline" label="Stage" value={stageLabelText || 'Land Preparation'} />
                <ProgressBar percent={progressPercent} />
                <Text style={styles.progressText}>{progressPercent}% complete</Text>
                {!!cropCycle.cropId && cropCycle.status === 'active' && (
                  <Text style={styles.plantingNote}>
                    Stage updates automatically as you complete activities.
                  </Text>
                )}
              </View>
            ) : (
              <ComingSoonCard
                icon="leaf-outline"
                title="Crop Plan"
                note="No crop plan yet — open the Crop Plan tab to create one."
              />
            )}

            {cropCycle && (
              <View style={[styles.card, shadow.card]}>
                <Text style={styles.cardTitle}>Today's Guidance</Text>
                {dueTodayOrOverdue.length === 0 ? (
                  <Text style={styles.comingSoonText}>Nothing due today.</Text>
                ) : (
                  dueTodayOrOverdue.slice(0, 4).map((a) => (
                    <View key={a.activityId} style={styles.bulletRow}>
                      <Ionicons name={(ACTIVITY_TYPE_ICON[a.activityType] || 'ellipse') as any} size={13} color={colors.primary} />
                      <Text style={styles.bulletText}>{a.title}</Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {cropCycle && (
              <View style={[styles.card, shadow.card]}>
                <Text style={styles.cardTitle}>Upcoming</Text>
                {upcomingActivities.length === 0 ? (
                  <Text style={styles.comingSoonText}>No upcoming activities yet.</Text>
                ) : (
                  upcomingActivities.slice(0, 4).map((a) => (
                    <View key={a.activityId} style={styles.bulletRow}>
                      <Ionicons name="ellipse" size={6} color={colors.textMuted} />
                      <Text style={styles.bulletText}>
                        {stageLabelFor(a) ? `${stageLabelFor(a)} · ` : ''}
                        {relativeDayLabel(a.scheduledDate)} · {a.title}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {cropCycle && (
              <View style={[styles.card, shadow.card]}>
                <Text style={styles.cardTitle}>Crop Health</Text>
                <Text style={[styles.healthValue, healthColorStyle(cropHealth)]}>{CROP_HEALTH_LABEL[cropHealth]}</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'cropPlan' && (
          cropCycle ? (
            <>
              <View style={[styles.card, shadow.card]}>
                <Text style={styles.cardTitle}>{cropCycle.cropName}</Text>
                {!!cropCycle.variety && <InfoRow icon="pricetag-outline" label="Variety" value={cropCycle.variety} />}
                <InfoRow
                  icon="calendar-outline"
                  label="Planted"
                  value={plantedIso ? plantedIso : 'Planting Not Started'}
                />
                {!!cropCycle.expectedHarvestDate && (
                  <InfoRow icon="calendar-outline" label="Expected Harvest" value={cropCycle.expectedHarvestDate} />
                )}
                <InfoRow icon="trending-up-outline" label="Current Stage" value={stageLabelText || 'Land Preparation'} />
                <ProgressBar percent={progressPercent} />
                <Text style={styles.progressText}>{progressPercent}% complete</Text>
                {plantedIso ? (
                  <>
                    {daysSincePlanting !== undefined && (
                      <InfoRow icon="time-outline" label="Days Since Planting" value={String(daysSincePlanting)} />
                    )}
                    {daysUntilHarvest !== undefined && (
                      <InfoRow icon="hourglass-outline" label="Expected Days Remaining" value={String(daysUntilHarvest)} />
                    )}
                  </>
                ) : (
                  <Text style={styles.plantingNote}>
                    Planting Not Started — log a "Sowing" activity once you actually plant.
                  </Text>
                )}
              </View>

              {canAdvanceStage && (
                <TouchableOpacity
                  style={[styles.mapButton, advancingStage && styles.disabledBtn]}
                  onPress={handleAdvanceStage}
                  activeOpacity={0.85}
                  disabled={advancingStage}
                >
                  <Ionicons name="arrow-forward-circle-outline" size={20} color={colors.surface} />
                  <Text style={styles.mapButtonText}>
                    {advancingStage ? 'Advancing…' : `Advance to ${nextStage ? CROP_STAGE_LABEL[nextStage] : ''}`}
                  </Text>
                </TouchableOpacity>
              )}
              {canAdvanceStage && pendingInCurrentStage.length > 0 && (
                <Text style={styles.plantingNote}>
                  {pendingInCurrentStage.length} pending in {stageLabelText || 'the current stage'} — complete
                  {pendingInCurrentStage.length === 1 ? ' it' : ' them'} in Activities first.
                </Text>
              )}

              {showHarvestReadiness && (
                <View style={[styles.card, shadow.card]}>
                  <Text style={styles.cardTitle}>Harvest Readiness</Text>
                  {isHarvestReady && (
                    <View style={styles.readyBanner}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={styles.readyBannerText}>Ready for Harvest</Text>
                    </View>
                  )}
                  <InfoRow icon="leaf-outline" label="Crop" value={cropCycle.cropName} />
                  {!!cropCycle.variety && <InfoRow icon="pricetag-outline" label="Variety" value={cropCycle.variety} />}
                  <InfoRow icon="trending-up-outline" label="Current Stage" value={stageLabelText || ''} />
                  <InfoRow icon="calendar-outline" label="Planting Date" value={plantedIso || cropCycle.plannedPlantingDate || 'Not set'} />
                  <InfoRow icon="calendar-outline" label="Expected Harvest" value={cropCycle.expectedHarvestDate || 'Not set'} />
                  {daysSincePlanting !== undefined && (
                    <InfoRow icon="time-outline" label="Days Since Planting" value={String(daysSincePlanting)} />
                  )}
                  <InfoRow icon="stats-chart-outline" label="Crop Progress" value={`${progressPercent}%`} />
                  <InfoRow icon="pulse-outline" label="Farm Health" value={CROP_HEALTH_LABEL[cropHealth]} />

                  {isHarvestReady && (
                    <TouchableOpacity style={[styles.mapButton, styles.recordHarvestBtn]} onPress={openRecordHarvest} activeOpacity={0.85}>
                      <Ionicons name="basket-outline" size={20} color={colors.surface} />
                      <Text style={styles.mapButtonText}>Record Harvest</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {latestHarvest && (
                <View style={[styles.card, shadow.card]}>
                  <Text style={styles.cardTitle}>Farm Performance</Text>
                  <InfoRow icon="leaf-outline" label="Crop" value={cropCycle.cropName} />
                  <InfoRow
                    icon="resize-outline"
                    label="Cultivated Area"
                    value={latestHarvest.harvestedArea ? formatArea(latestHarvest.harvestedArea) : formatArea(cropCycle.areaAcres)}
                  />
                  <DataRow icon="time-outline" label="Crop Duration" value={cropDurationDays !== undefined ? `${cropDurationDays} Days` : undefined} />
                  <DataRow
                    icon="basket-outline"
                    label="Harvest Quantity"
                    value={latestHarvest.quantity !== undefined ? `${latestHarvest.quantity} ${latestHarvest.unit || ''}`.trim() : undefined}
                  />
                  <InfoRow
                    icon="stats-chart-outline"
                    label="Yield"
                    value={yieldPerAcre !== undefined ? `${yieldPerAcre} ${latestHarvest.unit || ''} / Acre`.trim() : 'Yield data unavailable'}
                  />
                  <InfoRow icon="checkmark-done-outline" label="Activities Completed" value={String(activitiesCompletedCount)} />
                </View>
              )}

              {isHarvested && (
                <TouchableOpacity
                  style={[styles.mapButton, completingCycle && styles.disabledBtn]}
                  onPress={handleCompleteCycle}
                  activeOpacity={0.85}
                  disabled={completingCycle}
                >
                  <Ionicons name="flag-outline" size={20} color={colors.surface} />
                  <Text style={styles.mapButtonText}>{completingCycle ? 'Completing…' : 'Complete Crop Cycle'}</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.disclaimer}>
                Guidance below is a general recommendation, not a guaranteed outcome — consult a local agricultural
                expert before applying fertilizer, pesticide, or other chemical treatments.
              </Text>

              <TouchableOpacity style={styles.mapButton} onPress={openActivityLog} activeOpacity={0.85}>
                <Ionicons name="list-outline" size={20} color={colors.surface} />
                <Text style={styles.mapButtonText}>View / Log Activity</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.card, shadow.card]}>
              <Text style={styles.cardTitle}>Create Crop Plan</Text>
              <Text style={styles.comingSoonText}>This farm doesn't have a crop plan yet.</Text>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => navigation.navigate('SelectCrop', { farmId })}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.surface} />
                <Text style={styles.mapButtonText}>Select Crop</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        {activeTab === 'cropPlan' && (
          <View style={[styles.card, shadow.card]}>
            <Text style={styles.cardTitle}>Crop History</Text>
            {cropHistory.length === 0 ? (
              <Text style={styles.comingSoonText}>Past crop cycles for this farm will appear here.</Text>
            ) : (
              cropHistory.map((c) => {
                const harvest = historyHarvests[c.cropCycleId]?.[0];
                const historyYield =
                  harvest?.quantity && harvest?.harvestedArea && harvest.harvestedArea > 0
                    ? Math.round((harvest.quantity / harvest.harvestedArea) * 100) / 100
                    : undefined;
                const expanded = expandedHistoryId === c.cropCycleId;
                const trail = historyTrails[c.cropCycleId];
                return (
                  <TouchableOpacity
                    key={c.cropCycleId}
                    style={styles.historyCard}
                    activeOpacity={0.85}
                    onPress={() => toggleHistoryTrail(c.cropCycleId)}
                  >
                    <View style={styles.historyTopRow}>
                      <Text style={styles.historyCropName}>{c.cropName}</Text>
                      <View style={styles.historyStatusPill}>
                        <Text style={styles.historyStatusText}>{STATUS_LABEL[c.status] || c.status}</Text>
                      </View>
                    </View>
                    {!!c.plannedPlantingDate && (
                      <Text style={styles.historyMeta}>
                        {c.plannedPlantingDate}{harvest ? ` – ${harvest.harvestDate}` : ''}
                      </Text>
                    )}
                    {harvest && (
                      <>
                        <Text style={styles.historyMeta}>
                          Harvest: {harvest.quantity !== undefined ? `${harvest.quantity} ${harvest.unit || ''}`.trim() : 'Data not available'}
                        </Text>
                        <Text style={styles.historyMeta}>
                          Yield: {historyYield !== undefined ? `${historyYield} ${harvest.unit || ''} / Acre`.trim() : 'Yield data unavailable'}
                        </Text>
                      </>
                    )}
                    <Text style={styles.historyToggleHint}>
                      {expanded ? 'Hide activities ▴' : 'View activities ▾'}
                    </Text>
                    {expanded && (
                      <View style={styles.historyTrail}>
                        {trail === 'loading' || !trail ? (
                          <ActivityIndicator color={colors.primary} style={styles.loadingSpinner} />
                        ) : trail.length === 0 ? (
                          <Text style={styles.historyMeta}>No activities were recorded for this crop.</Text>
                        ) : (
                          trail.map((e) => (
                            <View key={e.key} style={styles.bulletRow}>
                              <Ionicons
                                name={(e.state === 'done' ? 'checkmark-circle' : e.state === 'skipped' ? 'remove-circle-outline' : 'ellipse-outline') as any}
                                size={14}
                                color={e.state === 'done' ? colors.success : colors.textMuted}
                              />
                              <Text style={styles.bulletText}>
                                {e.date} · {e.label}
                                {e.state === 'skipped' ? ' (skipped)' : e.state === 'notDone' ? ' (not done)' : ''}
                                {e.note ? ` — ${e.note}` : ''}
                              </Text>
                            </View>
                          ))
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'activities' && (
          cropCycle ? (
            <>
              <Text style={styles.sectionLabel}>Today's Activities</Text>
              {loadingActivities ? (
                <ActivityIndicator color={colors.primary} style={styles.loadingSpinner} />
              ) : dueTodayOrOverdue.length === 0 ? (
                <View style={[styles.card, shadow.card]}>
                  <Text style={styles.comingSoonText}>Nothing due today.</Text>
                </View>
              ) : (
                dueTodayOrOverdue.map((a) => (
                  <ActivityCard
                    key={a.activityId}
                    activity={a}
                    overdue={a.scheduledDate < today}
                    stageLabel={stageLabelFor(a)}
                    onComplete={() => openCompleteSheet(a)}
                  />
                ))
              )}

              <Text style={styles.sectionLabel}>Upcoming Activities</Text>
              {upcomingActivities.length === 0 ? (
                <View style={[styles.card, shadow.card]}>
                  <Text style={styles.comingSoonText}>No upcoming activities yet.</Text>
                </View>
              ) : (
                <View style={[styles.card, shadow.card]}>
                  {upcomingActivities.map((a) => (
                    <View key={a.activityId} style={styles.bulletRow}>
                      <Ionicons name={(ACTIVITY_TYPE_ICON[a.activityType] || 'ellipse') as any} size={13} color={colors.textSecondary} />
                      <Text style={styles.bulletText}>
                        {stageLabelFor(a) ? `${stageLabelFor(a)} · ` : ''}
                        {relativeDayLabel(a.scheduledDate)} · {a.title}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.freeLogLink} onPress={openActivityLog} activeOpacity={0.7}>
                <Ionicons name="document-text-outline" size={15} color={colors.primary} />
                <Text style={styles.freeLogLinkText}>View Free-form Activity Log</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ComingSoonCard
              icon="time-outline"
              title="Activities"
              note="Create a crop plan first — activities are generated against it."
            />
          )
        )}

        {activeTab === 'monitoring' && (
          <>
            <View style={styles.subTabRow}>
              {MONITORING_SUB_TABS.map((tab) => {
                const active = monitoringSubTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.subTabBtn, active && styles.subTabBtnActive]}
                    onPress={() => setMonitoringSubTab(tab.key)}
                  >
                    <Ionicons name={tab.icon as any} size={13} color={active ? colors.surface : colors.textSecondary} />
                    <Text style={[styles.subTabBtnText, active && styles.subTabBtnTextActive]} numberOfLines={1}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {monitoringSubTab === 'overview' && (
              <>
                <View style={[styles.card, shadow.card]}>
                  <Text style={styles.cardTitle}>Overall Farm Health</Text>
                  <Text style={[styles.healthValue, healthColorStyle(cropHealth)]}>{CROP_HEALTH_LABEL[cropHealth]}</Text>
                  <Text style={styles.comingSoonText}>Based on scheduled-task follow-through — not a diagnosis from any single source.</Text>
                </View>
                <View style={[styles.card, shadow.card]}>
                  <DataRow icon="leaf-outline" label="Crop" value={cropCycle?.cropName} />
                  <DataRow icon="trending-up-outline" label="Crop Stage" value={stageLabelText} />
                  <DataRow icon="stats-chart-outline" label="Crop Progress" value={cropCycle ? `${progressPercent}%` : undefined} />
                  <DataRow icon="chatbox-ellipses-outline" label="Last Observation" value={lastObservation?.observation || (lastObservation ? 'Photo added' : undefined)} />
                  <DataRow icon="globe-outline" label="Last Satellite Update" value={undefined} />
                  <DataRow icon="layers-outline" label="Soil Status" value={soilFetched ? (soilStatus ? (soilStatus === 'GOOD' ? 'Good' : 'Attention Required') : undefined) : undefined} />
                  <DataRow icon="partly-sunny-outline" label="Weather Summary" value={weatherData ? `${weatherData.condition}, ${weatherData.tempC}°C` : undefined} />
                </View>
              </>
            )}

            {monitoringSubTab === 'satellite' && (
              <>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => navigation.navigate('SatelliteMap', { farmId })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="map" size={20} color={colors.surface} />
                  <Text style={styles.mapButtonText}>Open Satellite Map</Text>
                </TouchableOpacity>
                <View style={[styles.card, shadow.card]}>
                  <Text style={styles.cardTitle}>Satellite Monitoring</Text>
                  <DataRow icon="leaf-outline" label="Vegetation Condition" value={undefined} />
                  <DataRow icon="trending-up-outline" label="Vegetation Change" value={undefined} />
                  <DataRow icon="grid-outline" label="Field Coverage" value={undefined} />
                  <DataRow icon="time-outline" label="Recent Update" value={undefined} />
                  <Text style={styles.comingSoonText}>
                    Showing the latest available satellite view only — history isn't available yet.
                  </Text>
                </View>
              </>
            )}

            {monitoringSubTab === 'soil' && (
              <>
                <View style={[styles.card, shadow.card]}>
                  <Text style={styles.cardTitle}>Soil Health</Text>
                  {soilLoading ? (
                    <ActivityIndicator color={colors.primary} style={styles.loadingSpinner} />
                  ) : (
                    <>
                      <Text style={[styles.healthValue, soilStatus ? healthColorStyle(soilStatus === 'GOOD' ? 'GOOD' : 'ATTENTION_REQUIRED') : styles.notAvailableText]}>
                        {soilStatus ? (soilStatus === 'GOOD' ? 'Good' : 'Attention Required') : 'Data not available'}
                      </Text>
                      <DataRow icon="water-outline" label="pH" value={soilData?.chemical?.ph_h2o ?? undefined} />
                      <DataRow icon="leaf-outline" label="Organic Matter %" value={soilData?.chemical?.organic_matter_pct ?? undefined} />
                      <DataRow icon="flask-outline" label="Nitrogen (g/kg)" value={soilData?.chemical?.nitrogen_g_kg ?? undefined} />
                      <DataRow icon="cube-outline" label="Phosphorus" value={undefined} />
                      <DataRow icon="cube-outline" label="Potassium" value={undefined} />
                      <DataRow icon="rainy-outline" label="Soil Moisture" value={soilData?.water?.capacity_field_vol_pct ?? undefined} />
                    </>
                  )}
                </View>

                <View style={[styles.card, shadow.card]}>
                  <Text style={styles.cardTitle}>Soil + Crop Context</Text>
                  <DataRow icon="leaf-outline" label="Current Crop" value={cropCycle?.cropName || farm.currentCrop} />
                  <DataRow icon="layers-outline" label="Soil Type" value={farm.soilType} />
                  <DataRow icon="water-outline" label="pH" value={soilData?.chemical?.ph_h2o ?? undefined} />
                  <DataRow icon="rainy-outline" label="Soil Moisture" value={soilData?.water?.capacity_field_vol_pct ?? undefined} />
                </View>
              </>
            )}

            {monitoringSubTab === 'weather' && (
              <View style={[styles.card, shadow.card]}>
                <Text style={styles.cardTitle}>Weather — {farm.location}</Text>
                {weatherLoading ? (
                  <ActivityIndicator color={colors.primary} style={styles.loadingSpinner} />
                ) : weatherData ? (
                  <>
                    <DataRow icon="thermometer-outline" label="Temperature" value={`${weatherData.tempC}°C`} />
                    <DataRow icon="cloud-outline" label="Condition" value={weatherData.condition} />
                    <DataRow icon="water-outline" label="Humidity" value={`${weatherData.humidityPct}%`} />
                    <DataRow icon="rainy-outline" label="Rainfall" value={undefined} />
                    <DataRow icon="navigate-outline" label="Wind" value={`${weatherData.windKmh} km/h`} />
                    <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>Forecast</Text>
                    <View style={styles.forecastRow}>
                      {weatherData.forecast.map((f) => (
                        <View key={f.id} style={styles.forecastCard}>
                          <Text style={styles.forecastDay}>{f.day}</Text>
                          <Text style={styles.forecastEmoji}>{f.emoji}</Text>
                          <Text style={styles.forecastTemp}>{f.temp}</Text>
                        </View>
                      ))}
                    </View>
                    {showIrrigationWeatherAdvisory && (
                      <View style={styles.advisoryBanner}>
                        <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
                        <Text style={styles.advisoryText}>
                          Review today's irrigation plan — rainfall is forecast. You decide whether to proceed.
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={styles.notAvailableText}>Data not available</Text>
                )}
              </View>
            )}

            {monitoringSubTab === 'observations' && (
              <>
                <TouchableOpacity style={styles.mapButton} onPress={openAddObservation} activeOpacity={0.85}>
                  <Ionicons name="add-circle-outline" size={20} color={colors.surface} />
                  <Text style={styles.mapButtonText}>Add Observation</Text>
                </TouchableOpacity>

                <View style={[styles.card, shadow.card]}>
                  <Text style={styles.cardTitle}>Observations</Text>
                  {observations.length === 0 ? (
                    <Text style={styles.comingSoonText}>No observations recorded yet.</Text>
                  ) : (
                    observations.map((o) => (
                      <View key={o.observationId} style={styles.observationRow}>
                        <Ionicons name="chatbox-ellipses-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.observationText}>
                          {o.observation || 'Photo added'}{o.cropStage ? ` · ${CROP_STAGE_LABEL[o.cropStage as keyof typeof CROP_STAGE_LABEL] || o.cropStage}` : ''}
                        </Text>
                      </View>
                    ))
                  )}
                </View>

                <View style={[styles.card, shadow.card]}>
                  <Text style={styles.cardTitle}>Farm Monitoring Timeline</Text>
                  {timeline.length === 0 ? (
                    <Text style={styles.comingSoonText}>Nothing recorded yet.</Text>
                  ) : (
                    timeline.map((entry, i) => (
                      <View key={entry.key} style={styles.timelineRow}>
                        <View style={styles.timelineRail}>
                          <View style={styles.timelineDot}>
                            <Ionicons name={entry.icon as any} size={13} color="#fff" />
                          </View>
                          {i < timeline.length - 1 && <View style={styles.timelineLine} />}
                        </View>
                        <View style={styles.timelineCard}>
                          <View style={styles.timelineTopRow}>
                            <Text style={styles.timelineTitle}>{entry.title}</Text>
                            <Text style={styles.timelineDate}>{entry.date}</Text>
                          </View>
                          {!!entry.note && <Text style={styles.timelineNote}>{entry.note}</Text>}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </>
            )}
          </>
        )}

        {activeTab === 'photos' && (
          observations.filter((o) => o.photoUrl).length === 0 ? (
            <ComingSoonCard icon="image-outline" title="Photos" note="Photos you add while completing activities or recording observations will appear here." />
          ) : (
            <View style={styles.photoGrid}>
              {observations
                .filter((o) => o.photoUrl)
                .map((o) => (
                  <Image key={o.observationId} source={{ uri: o.photoUrl }} style={styles.photoThumb} />
                ))}
            </View>
          )
        )}
      </ScrollView>

      <Modal visible={!!completingActivity} transparent animationType="slide" onRequestClose={closeCompleteSheet}>
        <View style={sheetStyles.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeCompleteSheet} />
          <View style={sheetStyles.sheet}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={sheetStyles.head}>
                <Text style={sheetStyles.headTitle}>Complete Activity</Text>
                <TouchableOpacity onPress={closeCompleteSheet} style={sheetStyles.closeBtn}>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={sheetStyles.subTitle}>{completingActivity?.title}</Text>

              <Text style={sheetStyles.label}>Actual Date</Text>
              <TouchableOpacity style={sheetStyles.input} onPress={() => setShowCompleteDatePicker(true)}>
                <Text style={sheetStyles.inputText}>{completeDate.toISOString().slice(0, 10)}</Text>
              </TouchableOpacity>
              {showCompleteDatePicker && (
                <DateTimePicker
                  value={completeDate}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowCompleteDatePicker(false);
                    if (event.type !== 'dismissed' && selectedDate) setCompleteDate(selectedDate);
                  }}
                />
              )}

              <Text style={sheetStyles.label}>Completion Notes (optional)</Text>
              <TextInput
                style={[sheetStyles.input, sheetStyles.textarea]}
                value={completeNotes}
                onChangeText={setCompleteNotes}
                placeholder="What did you do?"
                placeholderTextColor={colors.textMuted}
                multiline
              />

              <Text style={sheetStyles.label}>Observation (optional)</Text>
              <TextInput
                style={[sheetStyles.input, sheetStyles.textarea]}
                value={completeObservation}
                onChangeText={setCompleteObservation}
                placeholder="e.g. Leaves showing slight yellowing"
                placeholderTextColor={colors.textMuted}
                multiline
              />

              <Text style={sheetStyles.label}>Photo (optional)</Text>
              {photoUri ? (
                <View style={sheetStyles.photoPreviewRow}>
                  <Image source={{ uri: photoUri }} style={sheetStyles.photoPreview} />
                  <TouchableOpacity onPress={() => { setPhotoUri(undefined); setPhotoBase64(undefined); }}>
                    <Ionicons name="close-circle" size={22} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={sheetStyles.photoBtn}
                  onPress={() => pickPhoto((uri, base64, mime) => { setPhotoUri(uri); setPhotoBase64(base64); setPhotoMime(mime); })}
                >
                  <Ionicons name="camera-outline" size={18} color={colors.primary} />
                  <Text style={sheetStyles.photoBtnText}>Add Photo</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[sheetStyles.saveBtn, submittingComplete && sheetStyles.saveBtnDisabled]}
                onPress={handleSubmitComplete}
                disabled={submittingComplete}
              >
                <Text style={sheetStyles.saveBtnText}>{submittingComplete ? 'Saving…' : 'Mark Completed'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={addingObservation} transparent animationType="slide" onRequestClose={closeAddObservation}>
        <View style={sheetStyles.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeAddObservation} />
          <View style={sheetStyles.sheet}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={sheetStyles.head}>
                <Text style={sheetStyles.headTitle}>Add Observation</Text>
                <TouchableOpacity onPress={closeAddObservation} style={sheetStyles.closeBtn}>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={sheetStyles.label}>Observation</Text>
              <TextInput
                style={[sheetStyles.input, sheetStyles.textarea]}
                value={obsText}
                onChangeText={setObsText}
                placeholder="e.g. Leaves showing yellowing"
                placeholderTextColor={colors.textMuted}
                multiline
              />

              <Text style={sheetStyles.label}>Date</Text>
              <TouchableOpacity style={sheetStyles.input} onPress={() => setShowObsDatePicker(true)}>
                <Text style={sheetStyles.inputText}>{obsDate.toISOString().slice(0, 10)}</Text>
              </TouchableOpacity>
              {showObsDatePicker && (
                <DateTimePicker
                  value={obsDate}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowObsDatePicker(false);
                    if (event.type !== 'dismissed' && selectedDate) setObsDate(selectedDate);
                  }}
                />
              )}

              <Text style={sheetStyles.label}>Crop Stage</Text>
              <View style={sheetStyles.stageChipRow}>
                {CROP_STAGES.map((stage) => {
                  const active = obsStage === stage;
                  return (
                    <TouchableOpacity
                      key={stage}
                      style={[sheetStyles.stageChip, active && sheetStyles.stageChipActive]}
                      onPress={() => setObsStage(stage)}
                    >
                      <Text style={[sheetStyles.stageChipText, active && sheetStyles.stageChipTextActive]}>
                        {CROP_STAGE_LABEL[stage]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={sheetStyles.label}>Photo (optional)</Text>
              {obsPhotoUri ? (
                <View style={sheetStyles.photoPreviewRow}>
                  <Image source={{ uri: obsPhotoUri }} style={sheetStyles.photoPreview} />
                  <TouchableOpacity onPress={() => { setObsPhotoUri(undefined); setObsPhotoBase64(undefined); }}>
                    <Ionicons name="close-circle" size={22} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={sheetStyles.photoBtn}
                  onPress={() => pickPhoto((uri, base64, mime) => { setObsPhotoUri(uri); setObsPhotoBase64(base64); setObsPhotoMime(mime); })}
                >
                  <Ionicons name="camera-outline" size={18} color={colors.primary} />
                  <Text style={sheetStyles.photoBtnText}>Add Photo</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[sheetStyles.saveBtn, submittingObs && sheetStyles.saveBtnDisabled]}
                onPress={handleSubmitObservation}
                disabled={submittingObs}
              >
                <Text style={sheetStyles.saveBtnText}>{submittingObs ? 'Saving…' : 'Save Observation'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={recordingHarvest} transparent animationType="slide" onRequestClose={closeRecordHarvest}>
        <View style={sheetStyles.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeRecordHarvest} />
          <View style={sheetStyles.sheet}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={sheetStyles.head}>
                <Text style={sheetStyles.headTitle}>Record Harvest</Text>
                <TouchableOpacity onPress={closeRecordHarvest} style={sheetStyles.closeBtn}>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={sheetStyles.subTitle}>{cropCycle?.cropName}</Text>

              <Text style={sheetStyles.label}>Harvest Date</Text>
              <TouchableOpacity style={sheetStyles.input} onPress={() => setShowHarvestDatePicker(true)}>
                <Text style={sheetStyles.inputText}>{harvestDate.toISOString().slice(0, 10)}</Text>
              </TouchableOpacity>
              {showHarvestDatePicker && (
                <DateTimePicker
                  value={harvestDate}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowHarvestDatePicker(false);
                    if (event.type !== 'dismissed' && selectedDate) setHarvestDate(selectedDate);
                  }}
                />
              )}

              <Text style={sheetStyles.label}>Harvested Area (Acres)</Text>
              <TextInput
                style={sheetStyles.input}
                value={harvestedArea}
                onChangeText={setHarvestedArea}
                keyboardType="numeric"
                placeholder="e.g. 5"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={sheetStyles.label}>Quantity Harvested</Text>
              <TextInput
                style={sheetStyles.input}
                value={harvestQuantity}
                onChangeText={setHarvestQuantity}
                keyboardType="numeric"
                placeholder="e.g. 12500"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={sheetStyles.label}>Unit</Text>
              <View style={sheetStyles.stageChipRow}>
                {HARVEST_UNITS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[sheetStyles.stageChip, harvestUnit === u && sheetStyles.stageChipActive]}
                    onPress={() => setHarvestUnit(u)}
                  >
                    <Text style={[sheetStyles.stageChipText, harvestUnit === u && sheetStyles.stageChipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={sheetStyles.label}>Quality / Grade</Text>
              <View style={sheetStyles.stageChipRow}>
                {HARVEST_GRADES.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[sheetStyles.stageChip, harvestGrade === g && sheetStyles.stageChipActive]}
                    onPress={() => setHarvestGrade(g)}
                  >
                    <Text style={[sheetStyles.stageChipText, harvestGrade === g && sheetStyles.stageChipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={sheetStyles.label}>Farmer Notes (optional)</Text>
              <TextInput
                style={[sheetStyles.input, sheetStyles.textarea]}
                value={harvestNotes}
                onChangeText={setHarvestNotes}
                placeholder="Anything worth noting about this harvest"
                placeholderTextColor={colors.textMuted}
                multiline
              />

              <Text style={sheetStyles.label}>Photos (optional)</Text>
              {harvestPhotos.length > 0 && (
                <View style={sheetStyles.photoGridRow}>
                  {harvestPhotos.map((p, i) => (
                    <View key={p.uri} style={sheetStyles.photoGridItem}>
                      <Image source={{ uri: p.uri }} style={sheetStyles.photoPreview} />
                      <TouchableOpacity
                        style={sheetStyles.photoRemoveBtn}
                        onPress={() => setHarvestPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <Ionicons name="close-circle" size={20} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity
                style={sheetStyles.photoBtn}
                onPress={() => pickPhoto((uri, base64, mime) => setHarvestPhotos((prev) => [...prev, { uri, base64, mime }]))}
              >
                <Ionicons name="camera-outline" size={18} color={colors.primary} />
                <Text style={sheetStyles.photoBtnText}>Add Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[sheetStyles.saveBtn, submittingHarvest && sheetStyles.saveBtnDisabled]}
                onPress={handleSubmitHarvest}
                disabled={submittingHarvest}
              >
                <Text style={sheetStyles.saveBtnText}>{submittingHarvest ? 'Saving…' : 'Record Harvest'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  missingText: { fontSize: 15, color: colors.textPrimary, textAlign: 'center' },
  // Fixed-height wrapper the tab ScrollView lives in — this is what actually
  // pins the tab row's vertical position: no child (active or not) can ever
  // change how tall this box is, because its height is set here, not derived
  // from content.
  tabBarWrapper: {
    height: 60,
    justifyContent: 'center',
  },
  tabScroll: {
    flexGrow: 0,
    height: 44,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: spacing.lg,
    gap: 6,
  },
  // One shape for every tab, active or not — only tabBtnActive's colors are
  // allowed to differ (background/border/icon/text color). Nothing here
  // touches width, height, padding, radius, or transform.
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    flexGrow: 0,
    width: 106,
    height: 36,
    gap: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabBtnText: { fontSize: 11.5, fontWeight: '700', color: colors.textSecondary, flexShrink: 1 },
  tabBtnTextActive: { color: colors.surface },
  // Monitoring's inner sub-tab row — same fixed-size-pill convention as the
  // main tab bar, a second independent instance (own state), just smaller.
  subTabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    flexGrow: 0,
    height: 30,
    paddingHorizontal: spacing.sm,
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subTabBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  subTabBtnText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  subTabBtnTextActive: { color: colors.surface },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.softGreen,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statusBannerText: { fontSize: 14, fontWeight: '700', color: colors.success },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  locationText: { fontSize: 13, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  infoLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  notAvailableText: { fontStyle: 'italic', color: colors.textMuted, fontWeight: '400' },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  progressText: { fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'right' },
  plantingNote: { fontSize: 12, color: colors.warning, marginTop: spacing.sm, fontStyle: 'italic' },
  disclaimer: { fontSize: 11, color: colors.textMuted, lineHeight: 16, marginBottom: spacing.md, fontStyle: 'italic' },
  historyToggleHint: { fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
  historyTrail: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 3 },
  bulletText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  healthValue: { fontSize: 18, fontWeight: '800', marginBottom: spacing.xs },
  observationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: 4 },
  observationText: { fontSize: 12, color: colors.textSecondary, flex: 1, lineHeight: 17 },
  mapButton: {
    backgroundColor: colors.map,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mapButtonText: { fontSize: 15, fontWeight: '700', color: colors.surface },
  comingSoonHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  comingSoonText: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', lineHeight: 18 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.xs },
  loadingSpinner: { marginVertical: spacing.lg },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  activityHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  activityIconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitleCol: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  activityDate: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  priorityPill: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  priorityPillText: { fontSize: 10.5, fontWeight: '700' },
  activityDescription: { fontSize: 12.5, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 17 },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  completeBtnText: { fontSize: 12.5, fontWeight: '700', color: colors.surface },
  activityActionsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  activityActionFlex: { flex: 1, marginTop: 0 },
  disabledBtn: { opacity: 0.6 },
  readyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.softGreen,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  readyBannerText: { fontSize: 13, fontWeight: '800', color: colors.success },
  recordHarvestBtn: { marginTop: spacing.md, marginBottom: 0 },
  historyCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  historyTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  historyCropName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  historyStatusPill: {
    backgroundColor: colors.softGreen,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  historyStatusText: { fontSize: 10.5, fontWeight: '700', color: colors.success },
  historyMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  freeLogLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md },
  freeLogLinkText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoThumb: { width: 104, height: 104, borderRadius: radius.md, backgroundColor: colors.border },
  forecastRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  forecastCard: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 64,
  },
  forecastDay: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  forecastEmoji: { fontSize: 20, marginVertical: 2 },
  forecastTemp: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  advisoryBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.softOrange,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  advisoryText: { fontSize: 12, color: colors.textPrimary, flex: 1, lineHeight: 17 },
  timelineRow: { flexDirection: 'row', marginTop: spacing.sm },
  timelineRail: { width: 26, alignItems: 'center' },
  timelineDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2, minHeight: 14 },
  timelineCard: { flex: 1, marginLeft: spacing.sm, paddingBottom: spacing.md },
  timelineTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  timelineTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  timelineDate: { fontSize: 11, color: colors.textMuted },
  timelineNote: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
});

const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,20,15,0.42)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.xl, maxHeight: '88%' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  headTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  subTitle: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.lg },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase', color: colors.textMuted, marginBottom: spacing.sm },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  inputText: { fontSize: 14, color: colors.textPrimary },
  textarea: { minHeight: 64, textAlignVertical: 'top' },
  stageChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.lg },
  stageChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  stageChipActive: { borderColor: colors.primary, backgroundColor: colors.softGreen },
  stageChipText: { fontSize: 11.5, fontWeight: '700', color: colors.textSecondary },
  stageChipTextActive: { color: colors.primaryDark },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  photoBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  photoPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  photoPreview: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.border },
  photoGridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  photoGridItem: { position: 'relative' },
  photoRemoveBtn: { position: 'absolute', top: -6, right: -6 },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
