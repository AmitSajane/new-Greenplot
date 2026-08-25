import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type { MyCropsStackParamList } from '../../navigation/MyCropsStack';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { AppHeader } from '../../components/molecules/AppHeader';
import { LANGUAGE_SHORT_LABELS } from '../../localization/i18n';
import { LanguagePickerModal } from '../farmerHome/components/LanguagePickerModal';
import { useAuth } from '../../context/AuthContext';
import { useLeases } from '../../context/LeaseContext';
import { useFarmListings } from '../../context/FarmListingsContext';
import { useCropCycles } from '../../context/CropCycleContext';
import type { CropHealthStatus } from '../../modules/work/types';

const DARK = '#153D26';
const OWN_COLOR = colors.primary;
const LEASED_COLOR = '#2D6CDF';

const CROP_OPTIONS = ['Sugarcane', 'Wheat', 'Paddy', 'Cotton', 'Soybean', 'Other'];
const KNOWN_CROPS = CROP_OPTIONS.slice(0, -1);

const STATUS_META: Record<CropHealthStatus, { label: string; color: string; bg: string; icon: string }> = {
  healthy: { label: 'Healthy', color: colors.success, bg: colors.softGreen, icon: 'leaf-outline' },
  needs_water: { label: 'Needs Water', color: colors.warning, bg: colors.softOrange, icon: 'water-outline' },
  pest_alert: { label: 'Pest Alert', color: colors.danger, bg: '#FDEBEB', icon: 'bug-outline' },
};

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/** Parses the "24 Jul 2026" labels this screen writes back into a Date. */
const parseDateLabel = (label?: string): Date => {
  const match = label?.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!match) return new Date();
  const monthIndex = MONTH_ABBR.indexOf(match[2]);
  if (monthIndex === -1) return new Date();
  return new Date(parseInt(match[3], 10), monthIndex, parseInt(match[1], 10));
};

interface PlotTarget {
  landId: string;
  plotName: string;
  ownerId: string;
  ownerLabel: string;
}

export default function MyCropsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MyCropsStackParamList, 'MyCrops'>>();
  const { user } = useAuth();
  const { activeLeases } = useLeases();
  const { listings, getListingById } = useFarmListings();
  const { getCropCycleByLand, saveCropCycle, removeCropCycle } = useCropCycles();
  const { i18n } = useTranslation();
  const languageShort = LANGUAGE_SHORT_LABELS[i18n.language] || 'EN';
  const [langOpen, setLangOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'own' | 'leased'>('own');

  const myOwnLands = useMemo(
    () => listings.filter((l) => l.selfFarmed && l.ownerId === user?.id),
    [listings, user?.id],
  );
  const myLeases = useMemo(
    () => activeLeases.filter((l) => l.farmerId === user?.id),
    [activeLeases, user?.id],
  );

  const overview = useMemo(() => {
    const ownArea = myOwnLands.reduce((sum, l) => sum + (parseFloat(l.acres) || 0), 0);
    const leasedArea = myLeases.reduce((sum, l) => {
      const listing = getListingById(l.landId);
      return sum + (listing ? parseFloat(listing.acres) || 0 : 0);
    }, 0);
    return {
      totalPlots: myOwnLands.length + myLeases.length,
      totalArea: ownArea + leasedArea,
    };
  }, [myOwnLands, myLeases, getListingById]);

  // ── crop sheet state ──────────────────────────────────────────────────────
  const [sheetTarget, setSheetTarget] = useState<PlotTarget | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftCrop, setDraftCrop] = useState('Paddy');
  const [draftCustomCrop, setDraftCustomCrop] = useState('');
  const [draftStatus, setDraftStatus] = useState<CropHealthStatus>('healthy');
  const [draftNote, setDraftNote] = useState('');
  const [draftSownDate, setDraftSownDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  const openCropSheet = (target: PlotTarget) => {
    const existing = user ? getCropCycleByLand(target.landId, user.id) : undefined;
    if (existing) {
      const known = KNOWN_CROPS.includes(existing.cropName);
      setIsEditing(true);
      setDraftCrop(known ? existing.cropName : 'Other');
      setDraftCustomCrop(known ? '' : existing.cropName);
      setDraftStatus(existing.healthStatus ?? 'healthy');
      setDraftNote(existing.healthNote ?? '');
      setDraftSownDate(parseDateLabel(existing.sownDate));
    } else {
      setIsEditing(false);
      setDraftCrop('Paddy');
      setDraftCustomCrop('');
      setDraftStatus('healthy');
      setDraftNote('');
      setDraftSownDate(new Date());
    }
    setSheetTarget(target);
  };
  const closeCropSheet = () => {
    setSheetTarget(null);
    setShowDatePicker(false);
  };

  const handleSaveCrop = () => {
    if (!sheetTarget || !user) return;
    const listing = getListingById(sheetTarget.landId);
    const cropName = draftCrop === 'Other' ? draftCustomCrop.trim() || 'Other' : draftCrop;
    saveCropCycle({
      landId: sheetTarget.landId,
      farmerId: user.id,
      ownerId: sheetTarget.ownerId,
      plotName: sheetTarget.plotName,
      areaAcres: listing ? parseFloat(listing.acres) || 0 : 0,
      landlord: sheetTarget.ownerLabel,
      cropName,
      sownDate: formatDateLabel(draftSownDate),
      healthStatus: draftStatus,
      healthNote: draftNote.trim() || undefined,
    });
    closeCropSheet();
    showToast(isEditing ? 'Crop updated' : 'Crop saved');
  };

  const handleEditCropPress = (target: PlotTarget) => {
    Alert.alert(
      'Edit this crop?',
      `You're about to change the crop details for ${target.plotName}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => openCropSheet(target) },
      ],
    );
  };

  const handleRemoveCropPress = (target: PlotTarget) => {
    if (!user) return;
    Alert.alert(
      'Remove this crop?',
      `The crop on ${target.plotName} will be removed. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeCropCycle(target.landId, user.id);
            showToast('Crop removed');
          },
        },
      ],
    );
  };

  // Own-land registration reuses AddFarmScreen (pincode lookup, description,
  // photos, geo boundary, survey verification) in self-farmed mode, rather
  // than duplicating that intake logic here.
  const openLandSheet = () => navigation.navigate('AddLand', { selfFarmed: true });

  // Editing reuses the same screen in edit mode, mirroring the owner's
  // MyPropertiesScreen -> AddFarm edit entry point.
  const openEditLandSheet = (landId: string) =>
    navigation.navigate('AddLand', { selfFarmed: true, editListingId: landId });

  // ── plot card (shared between own-land and leased-land tabs) ─────────────
  const renderPlotCard = (opts: {
    landId: string;
    plotName: string;
    areaAcres: number;
    metaLine1: string;
    metaLine2: string;
    ownerId: string;
    ownerLabel: string;
    imageUrl?: string;
    onEditPress?: () => void;
  }) => {
    const crop = user ? getCropCycleByLand(opts.landId, user.id) : undefined;
    const statusMeta = crop ? STATUS_META[crop.healthStatus ?? 'healthy'] : null;
    const target: PlotTarget = {
      landId: opts.landId,
      plotName: opts.plotName,
      ownerId: opts.ownerId,
      ownerLabel: opts.ownerLabel,
    };

    return (
      <View key={opts.landId} style={[styles.plotCard, shadow.card]}>
        {!!opts.imageUrl && <Image source={{ uri: opts.imageUrl }} style={styles.plotImage} />}
        <View style={styles.plotCardBody}>
        <View style={styles.plotHeaderRow}>
          <View style={styles.plotHeaderText}>
            <Text style={styles.plotName}>{opts.plotName}</Text>
            <Text style={styles.plotLandlord}>{opts.metaLine1}</Text>
            <Text style={styles.plotLeaseMeta}>{opts.metaLine2}</Text>
          </View>
          <View style={styles.plotHeaderActions}>
            <View style={styles.areaPill}>
              <Text style={styles.areaPillText}>{opts.areaAcres.toFixed(1)} Acres</Text>
            </View>
            {opts.onEditPress && (
              <TouchableOpacity
                style={styles.editLandBtn}
                onPress={opts.onEditPress}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${opts.plotName}`}
              >
                <Icon name="pencil-outline" size={15} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {crop && statusMeta ? (
          <>
            <View style={[styles.cropPanel, { backgroundColor: statusMeta.bg }]}>
              <View style={styles.cropIconBox}>
                <Icon name={statusMeta.icon} size={24} color={colors.primary} />
              </View>

              <View style={styles.cropTextCol}>
                <Text style={styles.cropLabel} numberOfLines={1}>CURRENT CROP</Text>
                <Text style={styles.cropName} numberOfLines={1} ellipsizeMode="tail">
                  {crop.cropName}
                </Text>
              </View>

              <View style={styles.statusCol}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
                  <Text style={[styles.statusText, { color: statusMeta.color }]} numberOfLines={1}>
                    {statusMeta.label}
                  </Text>
                </View>
                <Text style={styles.statusNote} numberOfLines={1} ellipsizeMode="tail">
                  {crop.healthNote || `Sown ${crop.sownDate}`}
                </Text>
              </View>

              <View style={styles.panelActions}>
                <TouchableOpacity
                  style={styles.panelIconBtn}
                  onPress={() => handleEditCropPress(target)}
                  accessibilityRole="button"
                  accessibilityLabel="Edit crop"
                >
                  <Icon name="pencil-outline" size={15} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.panelIconBtn}
                  onPress={() => handleRemoveCropPress(target)}
                  accessibilityRole="button"
                  accessibilityLabel="Remove crop"
                >
                  <Icon name="trash-outline" size={15} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewDetailsBtn}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${opts.plotName}`}
              onPress={() => navigation.navigate('CropDetails', { cropCycleId: crop.cropCycleId })}
            >
              <Text style={styles.viewDetailsText}>VIEW DETAILS</Text>
              <Icon name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyCrop}>
            <Text style={styles.emptyCropText}>
              <Text style={styles.emptyCropBold}>No crop added</Text> for this plot yet
            </Text>
            <TouchableOpacity
              style={styles.addCropBtn}
              onPress={() => openCropSheet(target)}
              accessibilityRole="button"
              accessibilityLabel={`Add crop for ${opts.plotName}`}
            >
              <Icon name="add" size={17} color="#FFFFFF" />
              <Text style={styles.addCropBtnText}>ADD CROP</Text>
            </TouchableOpacity>
          </View>
        )}
        </View>
      </View>
    );
  };

  const isOwn = activeTab === 'own';
  const activeList = isOwn ? myOwnLands : myLeases;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <AppHeader
        data={{
          variant: 'default',
          title: 'My Crops & Plots',
          // showBack: navigation.canGoBack(),
          languageShort,
          name: user?.name,
        }}
        handler={{
          // onBackPress: () => navigation.goBack(),
          onProfilePress: () => navigation.navigate('Settings'),
          onLanguagePress: () => setLangOpen(true),
          onNotificationPress: () => navigation.navigate('NotificationsCenter'),
        }}
      />

      {toastMsg && (
        <View style={styles.toast} pointerEvents="none">
          <Icon name="checkmark-circle" size={16} color="#27E36C" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.overviewCard, shadow.card]}>
          <View style={styles.overviewBgGrid}>
            <View style={styles.overviewGridSquare} />
            <View style={styles.overviewGridSquare} />
            <View style={styles.overviewGridSquare} />
            <View style={styles.overviewGridSquare} />
          </View>

          <View style={styles.overviewTopRow}>
            <View style={styles.overviewIcon}>
              <Icon name="bar-chart" size={17} color="#0B1A0F" />
            </View>
            <Text style={styles.overviewTitle}>FARM OVERVIEW</Text>
          </View>

          <View style={styles.overviewStatsRow}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatLabel}>TOTAL PLOTS</Text>
              <Text style={styles.overviewStatValue}>{String(overview.totalPlots).padStart(2, '0')}</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatLabel}>TOTAL AREA</Text>
              <View style={styles.overviewAreaRow}>
                <Text style={styles.overviewStatValue}>{overview.totalArea.toFixed(1)}</Text>
                <Text style={styles.overviewStatUnit}> Acres</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, isOwn && styles.tabBtnActive]}
            onPress={() => setActiveTab('own')}
          >
            <Icon name="home-outline" size={18} color={isOwn ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.tabBtnText, isOwn && styles.tabBtnTextActive]}>My Own Land</Text>
            <View style={[styles.tabCountBadge, isOwn && styles.tabCountBadgeActive]}>
              <Text style={[styles.tabCountText, isOwn && styles.tabCountTextActive]}>{myOwnLands.length}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, !isOwn && styles.tabBtnActive]}
            onPress={() => setActiveTab('leased')}
          >
            <Icon name="document-text-outline" size={18} color={!isOwn ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.tabBtnText, !isOwn && styles.tabBtnTextActive]}>Leased Land</Text>
            <View style={[styles.tabCountBadge, !isOwn && styles.tabCountBadgeActive]}>
              <Text style={[styles.tabCountText, !isOwn && styles.tabCountTextActive]}>{myLeases.length}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIcon, { backgroundColor: isOwn ? OWN_COLOR : LEASED_COLOR }]}>
              <Icon name={isOwn ? 'home-outline' : 'document-text-outline'} size={17} color="#FFFFFF" />
            </View>
            <Text style={styles.sectionTitle}>{isOwn ? 'My Own Land' : 'Leased Land'}</Text>
            <Text style={styles.sectionCount}>({activeList.length})</Text>
          </View>
          {isOwn ? (
            <TouchableOpacity style={styles.addLandBtn} onPress={openLandSheet}>
              <Icon name="add" size={15} color="#FFFFFF" />
              <Text style={styles.addLandBtnText}>ADD LAND</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.syncChip}>
              <Icon name="sync-outline" size={11} color={LEASED_COLOR} />
              <Text style={styles.syncChipText}>LEASE-SYNCED</Text>
            </View>
          )}
        </View>

        {activeList.length === 0 && (
          <View style={[styles.emptyState, shadow.card]}>
            <Icon name={isOwn ? 'home-outline' : 'document-text-outline'} size={28} color={colors.textMuted} />
            <Text style={styles.emptyStateTitle}>
              {isOwn ? "You haven't added any land you own yet" : 'No active leases yet'}
            </Text>
            <Text style={styles.emptyStateBody}>
              {isOwn
                ? 'Add land you farm yourself to start tracking crops on it.'
                : "Once a lease you've signed becomes active, it'll show up here."}
            </Text>
            {isOwn && (
              <TouchableOpacity style={[styles.addCropBtn, styles.emptyStateAddBtn]} onPress={openLandSheet}>
                <Icon name="add" size={17} color="#FFFFFF" />
                <Text style={styles.addCropBtnText}>ADD LAND</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isOwn &&
          myOwnLands.map((land) =>
            renderPlotCard({
              landId: land.id,
              plotName: land.title,
              areaAcres: parseFloat(land.acres) || 0,
              metaLine1: `Soil: ${land.soilType}`,
              metaLine2: `Survey No. ${land.surveyNumber || '—'} · Owned by you`,
              ownerId: land.ownerId,
              ownerLabel: 'Owned by you',
              imageUrl: land.imageUrl || undefined,
              onEditPress: () => openEditLandSheet(land.id),
            }),
          )}

        {!isOwn &&
          myLeases.map((lease) => {
            const listing = getListingById(lease.landId);
            return renderPlotCard({
              landId: lease.landId,
              plotName: lease.landTitle,
              areaAcres: listing ? parseFloat(listing.acres) || 0 : 0,
              metaLine1: `Landlord: ${lease.ownerName}`,
              metaLine2: `${lease.typeName} Lease · since ${lease.startDate}`,
              ownerId: lease.ownerId,
              ownerLabel: lease.ownerName,
              imageUrl: listing?.imageUrl || undefined,
            });
          })}
      </ScrollView>

      {/* ── Add/Edit Crop sheet ──────────────────────────────────────────── */}
      <Modal visible={!!sheetTarget} transparent animationType="slide" onRequestClose={closeCropSheet}>
        <View style={styles.modalRoot}>
          <TouchableWithoutFeedback onPress={closeCropSheet}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.sheet}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.sheetTopRow}>
                <View style={styles.sheetTopTextCol}>
                  <Text style={styles.sheetTitle}>{isEditing ? 'Edit Crop' : 'Add Crop'}</Text>
                  <Text style={styles.sheetSub}>
                    {sheetTarget?.plotName} · {sheetTarget?.ownerLabel}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.sheetCloseBtn}
                  onPress={closeCropSheet}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Icon name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>WHAT ARE YOU GROWING?</Text>
              <View style={styles.chipRow}>
                {CROP_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, draftCrop === opt && styles.chipSelected]}
                    onPress={() => setDraftCrop(opt)}
                  >
                    <Text style={[styles.chipText, draftCrop === opt && styles.chipTextSelected]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {draftCrop === 'Other' && (
                <TextInput
                  style={styles.otherInputSpaced}
                  placeholder="Type crop name, e.g. Maize, Turmeric"
                  placeholderTextColor={colors.textMuted}
                  value={draftCustomCrop}
                  onChangeText={setDraftCustomCrop}
                  maxLength={30}
                />
              )}

              <Text style={styles.fieldLabel}>SOWN ON</Text>
              <TouchableOpacity
                style={styles.inputRow}
                onPress={() => setShowDatePicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Choose sowing date"
              >
                <Icon name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.inputRowText}>{formatDateLabel(draftSownDate)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={draftSownDate}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type !== 'dismissed' && selectedDate) setDraftSownDate(selectedDate);
                  }}
                />
              )}

              <Text style={styles.fieldLabel}>CURRENT STATUS</Text>
              <View style={styles.segmentRow}>
                {(Object.keys(STATUS_META) as CropHealthStatus[]).map((key) => {
                  const meta = STATUS_META[key];
                  const selected = draftStatus === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.segment, selected && { backgroundColor: meta.bg, borderColor: meta.color }]}
                      onPress={() => setDraftStatus(key)}
                    >
                      <Text style={[styles.segmentText, selected && { color: meta.color }]}>{meta.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>NOTE (OPTIONAL)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="e.g. Transplanted after monsoon showers"
                placeholderTextColor={colors.textMuted}
                value={draftNote}
                onChangeText={setDraftNote}
                multiline
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCrop}>
                <Text style={styles.saveBtnText}>SAVE CROP</Text>
              </TouchableOpacity>
              <Text style={styles.sheetHelp}>
                {sheetTarget?.ownerId === user?.id
                  ? 'Only visible to you.'
                  : `${sheetTarget?.ownerLabel} will see this update too.`}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <LanguagePickerModal visible={langOpen} onClose={() => setLangOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  toast: {
    position: 'absolute',
    top: 58,
    alignSelf: 'center',
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: DARK,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },

  overviewCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius.lg,
    padding: spacing.xl,
    backgroundColor: DARK,
    marginBottom: spacing.lg,
  },
  overviewBgGrid: {
    position: 'absolute',
    right: -18,
    top: -12,
    width: 120,
    height: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.22,
  },
  overviewGridSquare: {
    width: 44,
    height: 44,
    margin: 6,
    borderRadius: radius.sm,
    backgroundColor: '#2B3D33',
  },
  overviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  overviewIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: '#27E36C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewTitle: {
    color: '#27E36C',
    fontWeight: '800',
    letterSpacing: 1,
  },
  overviewStatsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  overviewStat: {
    flex: 1,
  },
  overviewDivider: {
    width: 18,
  },
  overviewStatLabel: {
    color: '#90A19A',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  overviewStatValue: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 36,
    lineHeight: 40,
  },
  overviewAreaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  overviewStatUnit: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    opacity: 0.9,
  },

  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabBtnActive: {
    backgroundColor: DARK,
    borderColor: DARK,
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  tabCountBadge: {
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tabCountBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tabCountText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  tabCountTextActive: {
    color: '#FFFFFF',
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  addLandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  addLandBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  syncChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.softBlue,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  syncChipText: {
    color: '#2D6CDF',
    fontWeight: '800',
    fontSize: 10.5,
    letterSpacing: 0.3,
  },

  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    marginTop: spacing.sm,
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyStateBody: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyStateAddBtn: {
    marginTop: spacing.lg,
    width: 'auto',
    paddingHorizontal: spacing.xl,
  },

  plotCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: '#D7E7DA',
    overflow: 'hidden',
  },
  plotImage: {
    width: '100%',
    height: 140,
    backgroundColor: colors.border,
  },
  plotCardBody: {
    padding: spacing.lg,
  },
  plotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  plotHeaderText: {
    flex: 1,
  },
  plotName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  plotLandlord: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  plotLeaseMeta: {
    marginTop: 2,
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  plotHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  areaPill: {
    backgroundColor: '#E9F2FF',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  areaPillText: {
    color: '#2D6CDF',
    fontWeight: '800',
  },
  editLandBtn: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cropPanel: {
    position: 'relative',
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cropIconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropTextCol: {
    flex: 1,
    minWidth: 0,
  },
  cropLabel: {
    color: '#4B6A55',
    fontWeight: '800',
    letterSpacing: 0.5,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  statusCol: {
    alignItems: 'flex-end',
    maxWidth: 108,
    flexShrink: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusText: {
    fontWeight: '900',
  },
  statusNote: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  panelActions: {
    position: 'absolute',
    top: -9,
    right: -9,
    flexDirection: 'row',
    gap: 6,
  },
  panelIconBtn: {
    width: 31,
    height: 31,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyCrop: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C7D6CC',
    backgroundColor: '#FAFCFA',
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyCropText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  emptyCropBold: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  addCropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  addCropBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12.5,
    letterSpacing: 0.5,
  },

  viewDetailsBtn: {
    backgroundColor: DARK,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
  },

  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10, 12, 15, 0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg + 6,
    borderTopRightRadius: radius.lg + 6,
    padding: spacing.xl,
    maxHeight: '85%',
  },
  sheetTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sheetTopTextCol: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  sheetSub: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sheetCloseBtn: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  otherInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  otherInputSpaced: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  inputRowText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
  },
  segmentText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  noteInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 12.5,
    color: colors.textPrimary,
    minHeight: 50,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  saveBtn: {
    backgroundColor: DARK,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  sheetHelp: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
