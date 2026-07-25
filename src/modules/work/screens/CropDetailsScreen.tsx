import React, { useState, useEffect } from 'react';
import {
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';
import { useCropCycles } from '../../../context/CropCycleContext';
import { useAuth } from '../../../context/AuthContext';
import { workJobApi } from '../services/workJobApi';
import { useCropActivities } from '../hooks/useCropActivities';
import { CropActivity, CropActivityType } from '../types';

type CropDetailsRoute = RouteProp<{ CropDetails: { cropCycleId: string } }, 'CropDetails'>;

const ACTIVITY_TYPES: CropActivityType[] = ['sowing', 'irrigation', 'fertilizer', 'weeding', 'pest', 'harvest', 'other'];

const ACTIVITY_META: Record<CropActivityType, { label: string; icon: string }> = {
  sowing: { label: 'Sowing', icon: 'leaf-outline' },
  irrigation: { label: 'Irrigation', icon: 'water-outline' },
  fertilizer: { label: 'Fertilizer', icon: 'flask-outline' },
  weeding: { label: 'Weeding', icon: 'cut-outline' },
  pest: { label: 'Pest Control', icon: 'bug-outline' },
  harvest: { label: 'Harvest', icon: 'basket-outline' },
  other: { label: 'Other', icon: 'document-text-outline' },
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const formatIsoDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const activityLabel = (a: Pick<CropActivity, 'type' | 'title'>) =>
  a.type === 'other' && a.title ? a.title : ACTIVITY_META[a.type].label;

export default function CropDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<CropDetailsRoute>();
  const { cropCycleId } = route.params;
  const { user } = useAuth();
  const [jobCount, setJobCount] = useState(0);
  const { getCropCycleById } = useCropCycles();

  const crop = getCropCycleById(cropCycleId);
  const { activities, addActivity } = useCropActivities(cropCycleId, crop?.farmerId, crop?.ownerId);

  useEffect(() => {
    workJobApi.getJobsByCropCycle(cropCycleId).then((jobs) => setJobCount(jobs.length));
  }, [cropCycleId]);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CropActivityType | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const openSheet = () => {
    setSelectedType(null);
    setTitle('');
    setDate(todayIso());
    setNote('');
    setFormError('');
    setSheetOpen(true);
  };
  const closeSheet = () => setSheetOpen(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  const handleSave = async () => {
    if (!selectedType) {
      setFormError('Pick what you did first.');
      return;
    }
    if (selectedType === 'other' && !title.trim()) {
      setFormError('Give this activity a short title.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFormError('Enter the date as YYYY-MM-DD.');
      return;
    }
    await addActivity({
      type: selectedType,
      title: selectedType === 'other' ? title.trim() : undefined,
      note: note.trim() || undefined,
      date,
    });
    closeSheet();
    showToast(`${selectedType === 'other' ? title.trim() : ACTIVITY_META[selectedType].label} logged`);
  };

  if (!crop) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Crop not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // For self-farmed land, ownerId is set to the farmer's own id (see MyCropsScreen); only
  // treat it as leased when a *different* person owns it.
  const leased = !!crop.ownerId && crop.ownerId !== crop.farmerId;
  const isOwner = leased && !!user && user.id === crop.ownerId;
  const canLog = !!user && user.id === crop.farmerId;

  const hasLoggedSowing = activities.some((a) => a.type === 'sowing');
  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));
  const timelineEntries: Array<Pick<CropActivity, 'type' | 'title' | 'note'> & { key: string; dateLabel: string }> = [
    ...(!hasLoggedSowing && crop.sownDate
      ? [{ key: '__sown__', type: 'sowing' as CropActivityType, title: undefined, note: undefined, dateLabel: crop.sownDate }]
      : []),
    ...sorted.map((a) => ({ key: a.activityId, type: a.type, title: a.title, note: a.note, dateLabel: formatIsoDate(a.date) })),
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Crop Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.plotName}>{crop.plotName}</Text>
          <Text style={styles.cropName}>{crop.cropName}</Text>
          <View style={styles.row}>
            <Ionicons name="resize-outline" size={18} color={colors.primary} />
            <Text style={styles.rowText}>{crop.areaAcres} Acres</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="person-outline" size={18} color={colors.primary} />
            <Text style={styles.rowText}>Landlord: {crop.landlord}</Text>
          </View>
          {leased && (
            <View style={styles.row}>
              <Ionicons name="eye-outline" size={16} color={colors.warning} />
              <Text style={styles.visibilityText}>
                {isOwner ? 'View only — the tenant farmer logs activities here.' : `Also visible to ${crop.landlord} (land owner)`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity log</Text>
          {timelineEntries.length === 0 ? (
            <Text style={styles.emptyText}>No activities logged yet.</Text>
          ) : (
            timelineEntries.map((entry, i) => (
              <View key={entry.key} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={styles.timelineDot}>
                    <Ionicons name={ACTIVITY_META[entry.type].icon as any} size={14} color="#fff" />
                  </View>
                  {i < timelineEntries.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineCard}>
                  <View style={styles.timelineTop}>
                    <Text style={styles.timelineName}>{activityLabel(entry)}</Text>
                    <Text style={styles.timelineDate}>{entry.dateLabel}</Text>
                  </View>
                  {!!entry.note && <Text style={styles.timelineNote}>{entry.note}</Text>}
                </View>
              </View>
            ))
          )}

          {canLog ? (
            <TouchableOpacity style={styles.logBtn} onPress={openSheet}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.logBtnText}>Log Activity</Text>
            </TouchableOpacity>
          ) : (
            leased && (
              <View style={styles.viewOnlyRow}>
                <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
                <Text style={styles.viewOnlyText}>View only</Text>
              </View>
            )
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>NDVI health</Text>
          <Text style={styles.comingSoon}>Coming soon</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Yield prediction</Text>
          <Text style={styles.comingSoon}>Coming soon</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Jobs</Text>
          <Text style={styles.sectionSubtitle}>{jobCount} job(s) for this crop</Text>
        </View>

        {canLog && (
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('CreateWork', { cropCycleId })}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.createBtnText}>Create Work</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={closeSheet}>
        <View style={sheetStyles.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeSheet} />
          <View style={sheetStyles.sheet}>
            <View style={sheetStyles.head}>
              <Text style={sheetStyles.headTitle}>Log Activity</Text>
              <TouchableOpacity onPress={closeSheet} style={sheetStyles.closeBtn}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={sheetStyles.label}>What did you do?</Text>
            <View style={sheetStyles.typeGrid}>
              {ACTIVITY_TYPES.map((type) => {
                const active = selectedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[sheetStyles.chip, active && sheetStyles.chipActive]}
                    onPress={() => {
                      setSelectedType(type);
                      setFormError('');
                    }}
                  >
                    <Ionicons name={ACTIVITY_META[type].icon as any} size={15} color={active ? colors.primaryDark : colors.textSecondary} />
                    <Text style={[sheetStyles.chipText, active && sheetStyles.chipTextActive]}>{ACTIVITY_META[type].label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedType === 'other' && (
              <View style={sheetStyles.field}>
                <Text style={sheetStyles.label}>Give it a title</Text>
                <TextInput
                  style={sheetStyles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Soil testing"
                  placeholderTextColor={colors.textMuted}
                  maxLength={40}
                />
              </View>
            )}

            <View style={sheetStyles.field}>
              <Text style={sheetStyles.label}>Date</Text>
              <TextInput
                style={sheetStyles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={sheetStyles.field}>
              <Text style={sheetStyles.label}>Notes (optional)</Text>
              <TextInput
                style={[sheetStyles.input, sheetStyles.textarea]}
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Sprayed neem oil after morning scouting"
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            {!!formError && <Text style={sheetStyles.error}>{formError}</Text>}

            <TouchableOpacity style={sheetStyles.saveBtn} onPress={handleSave}>
              <Text style={sheetStyles.saveBtnText}>Save Activity</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!!toastMsg && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { padding: spacing.xs, marginRight: spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  errorText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxl },
  backBtnText: { fontSize: 16, fontWeight: '600', color: colors.primary, marginTop: spacing.lg },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  plotName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  cropName: { fontSize: 16, color: colors.primary, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  rowText: { fontSize: 14, color: colors.textSecondary },
  visibilityText: { fontSize: 12, fontWeight: '600', color: colors.warning, flexShrink: 1 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  sectionSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  emptyText: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm },
  comingSoon: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },

  timelineRow: { flexDirection: 'row', marginTop: spacing.md },
  timelineRail: { width: 28, alignItems: 'center' },
  timelineDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2, minHeight: 18 },
  timelineCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginLeft: spacing.sm, marginBottom: spacing.xs },
  timelineTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  timelineName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  timelineDate: { fontSize: 11, color: colors.textMuted },
  timelineNote: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },

  logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed' },
  logBtnText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  viewOnlyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: spacing.lg },
  viewOnlyText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },

  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
  },
  createBtnText: { fontSize: 16, fontWeight: '700', color: colors.surface },

  toast: {
    position: 'absolute', bottom: spacing.xl, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.textPrimary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.pill,
  },
  toastText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});

const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,20,15,0.42)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.xl, maxHeight: '88%' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  headTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase', color: colors.textMuted, marginBottom: spacing.sm },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background, borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 12 },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.softGreen },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  chipTextActive: { color: colors.primaryDark },
  field: { marginBottom: spacing.lg },
  input: { borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background, borderRadius: radius.md, padding: 12, fontSize: 14, color: colors.textPrimary },
  textarea: { minHeight: 64, textAlignVertical: 'top' },
  error: { fontSize: 12, color: colors.danger, marginBottom: spacing.md, marginTop: -spacing.sm },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
