import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';
import { workJobApi } from '../services/workJobApi';
import { MOCK_CROP_CYCLES } from '../mockData/cropCycles';
import { WorkType } from '../types';
import { requirePermission } from '../../../middleware/permissions/checkRolePermission';
import { useAuth } from '../../../context/AuthContext';

const WORK_TYPES: WorkType[] = [
  'Harvesting',
  'Weeding',
  'Planting',
  'Plowing',
  'Irrigation',
  'Spraying',
  'Transplanting',
  'Threshing',
  'Other',
];

const TIME_OPTIONS = [
  '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

type CreateWorkRoute = RouteProp<{ CreateWork: { cropCycleId?: string } }, 'CreateWork'>;

export default function CreateWorkScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<CreateWorkRoute>();
  const { user } = useAuth();
  const cropCycleId = route.params?.cropCycleId;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    workType: '' as WorkType | '',
    description: '',
    workersNeeded: '',
    wagePerDay: '',
    workDate: '',
    startTime: '06:00',
    endTime: '14:00',
    cropCycleId: cropCycleId || '',
  });

  const roleMap = { owner: 'Owner' as const, farmer: 'Farmer' as const };
  const userRole = user?.role ? roleMap[user.role] ?? 'Labor' : 'Labor';
  const canCreate = requirePermission('create_jobs')(userRole);

  useEffect(() => {
    if (cropCycleId) setForm((f) => ({ ...f, cropCycleId }));
  }, [cropCycleId]);

  const update = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.workType) e.workType = 'Select work type';
    if (!form.description.trim()) e.description = 'Enter description';
    const w = parseInt(form.workersNeeded, 10);
    if (!form.workersNeeded || isNaN(w) || w < 1) e.workersNeeded = 'Enter valid workers count';
    const wage = parseInt(form.wagePerDay, 10);
    if (!form.wagePerDay || isNaN(wage) || wage < 1) e.wagePerDay = 'Enter valid wage';
    if (!form.workDate) e.workDate = 'Select work date';
    if (!form.cropCycleId) e.cropCycleId = 'Select crop/land';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!canCreate) {
      Alert.alert('Permission Denied', 'Only farmers can create work jobs.');
      return;
    }
    if (!validate()) return;
    setLoading(true);
    try {
      const crop = MOCK_CROP_CYCLES.find((c) => c.cropCycleId === form.cropCycleId);
      if (!crop) {
        Alert.alert('Error', 'Selected crop/land not found.');
        return;
      }
      await workJobApi.createJob({
        cropCycleId: form.cropCycleId,
        landId: crop.landId,
        farmerId: 'F001',
        workType: form.workType as WorkType,
        description: form.description.trim(),
        workersNeeded: parseInt(form.workersNeeded, 10),
        wagePerDay: parseInt(form.wagePerDay, 10),
        workDate: form.workDate,
        startTime: form.startTime,
        endTime: form.endTime,
        status: 'open',
      });
      Alert.alert('Success', 'Job created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to create job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Work</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Work Type *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {WORK_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, form.workType === t && styles.chipSelected]}
              onPress={() => update('workType', t)}
            >
              <Text style={[styles.chipText, form.workType === t && styles.chipTextSelected]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.workType ? <Text style={styles.error}>{errors.workType}</Text> : null}

        <Text style={styles.label}>Select Crop / Land *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {MOCK_CROP_CYCLES.map((c) => (
            <TouchableOpacity
              key={c.cropCycleId}
              style={[styles.chip, form.cropCycleId === c.cropCycleId && styles.chipSelected]}
              onPress={() => update('cropCycleId', c.cropCycleId)}
            >
              <Text
                style={[styles.chipText, form.cropCycleId === c.cropCycleId && styles.chipTextSelected]}
                numberOfLines={1}
              >
                {c.plotName} ({c.cropName})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.cropCycleId ? <Text style={styles.error}>{errors.cropCycleId}</Text> : null}

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.description && styles.inputError]}
          value={form.description}
          onChangeText={(v) => update('description', v)}
          placeholder="Describe the work..."
          multiline
          numberOfLines={3}
          placeholderTextColor={colors.textMuted}
        />
        {errors.description ? <Text style={styles.error}>{errors.description}</Text> : null}

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Workers Needed *</Text>
            <TextInput
              style={[styles.input, errors.workersNeeded && styles.inputError]}
              value={form.workersNeeded}
              onChangeText={(v) => update('workersNeeded', v)}
              placeholder="e.g. 5"
              keyboardType="number-pad"
              placeholderTextColor={colors.textMuted}
            />
            {errors.workersNeeded ? <Text style={styles.error}>{errors.workersNeeded}</Text> : null}
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Wage Per Day (₹) *</Text>
            <TextInput
              style={[styles.input, errors.wagePerDay && styles.inputError]}
              value={form.wagePerDay}
              onChangeText={(v) => update('wagePerDay', v)}
              placeholder="e.g. 500"
              keyboardType="number-pad"
              placeholderTextColor={colors.textMuted}
            />
            {errors.wagePerDay ? <Text style={styles.error}>{errors.wagePerDay}</Text> : null}
          </View>
        </View>

        <Text style={styles.label}>Work Date *</Text>
        <TextInput
          style={[styles.input, errors.workDate && styles.inputError]}
          value={form.workDate}
          onChangeText={(v) => update('workDate', v)}
          placeholder="YYYY-MM-DD (e.g. 2025-02-20)"
          placeholderTextColor={colors.textMuted}
        />
        {errors.workDate ? <Text style={styles.error}>{errors.workDate}</Text> : null}

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Start Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
              {TIME_OPTIONS.slice(0, 12).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChip, form.startTime === t && styles.chipSelected]}
                  onPress={() => update('startTime', t)}
                >
                  <Text style={[styles.timeChipText, form.startTime === t && styles.chipTextSelected]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>End Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
              {TIME_OPTIONS.slice(8, 20).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChip, form.endTime === t && styles.chipSelected]}
                  onPress={() => update('endTime', t)}
                >
                  <Text style={[styles.timeChipText, form.endTime === t && styles.chipTextSelected]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Create Job</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputError: { borderColor: colors.danger },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  error: { fontSize: 12, color: colors.danger, marginTop: spacing.xs },
  chipScroll: { marginBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { fontSize: 13, color: colors.textPrimary },
  chipTextSelected: { color: colors.surface },
  timeScroll: { marginBottom: spacing.sm },
  timeChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  timeChipText: { fontSize: 12, color: colors.textPrimary },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitDisabled: { opacity: 0.7 },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
});
