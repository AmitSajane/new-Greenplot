import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';
import { postJob } from '../redux';
import { WorkType } from '../types';

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

const CROP_TYPES = [
  'Sugarcane',
  'Cotton',
  'Tomato',
  'Wheat',
  'Onion',
  'Paddy',
  'Grapes',
  'Soybean',
  'Maize',
  'Chili',
  'Groundnut',
  'Turmeric',
];

export default function PostJobScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    workType: '' as WorkType | '',
    cropType: '',
    acres: '',
    hours: '',
    workersNeeded: '',
    wagePerDay: '',
    workDate: '',
    location: 'Sangli Road, Kolhapur',
    notes: '',
  });

  const update = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.workType) e.workType = 'Select work type';
    if (!form.cropType) e.cropType = 'Select crop type';
    const w = parseInt(form.workersNeeded, 10);
    if (!form.workersNeeded || isNaN(w) || w < 1) e.workersNeeded = 'Enter valid workers count';
    const wage = parseInt(form.wagePerDay, 10);
    if (!form.wagePerDay || isNaN(wage) || wage < 1) e.wagePerDay = 'Enter valid wage';
    if (!form.workDate) e.workDate = 'Select work date';
    if (!form.location) e.location = 'Enter location';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await dispatch(
        postJob({
          farmerId: 'F001',
          farmerName: 'Rajesh Kulkarni',
          farmName: 'Green Valley Farm',
          workType: form.workType as WorkType,
          cropType: form.cropType,
          acres: form.acres ? parseFloat(form.acres) : undefined,
          hours: form.hours ? parseInt(form.hours, 10) : undefined,
          workersNeeded: parseInt(form.workersNeeded, 10),
          wagePerDay: parseInt(form.wagePerDay, 10),
          workDate: form.workDate,
          location: {
            latitude: 16.5909,
            longitude: 74.9171,
            address: form.location,
            district: 'Kolhapur',
            state: 'Maharashtra',
          },
          notes: form.notes || undefined,
        }) as any
      ).unwrap();
      Alert.alert('Success', 'Job posted successfully!');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to post job');
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
        <Text style={styles.title}>Post Work</Text>
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

        <Text style={styles.label}>Crop Type *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {CROP_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, form.cropType === t && styles.chipSelected]}
              onPress={() => update('cropType', t)}
            >
              <Text style={[styles.chipText, form.cropType === t && styles.chipTextSelected]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.cropType ? <Text style={styles.error}>{errors.cropType}</Text> : null}

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Acres</Text>
            <TextInput
              style={styles.input}
              value={form.acres}
              onChangeText={(v) => update('acres', v)}
              placeholder="e.g. 5"
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Hours (optional)</Text>
            <TextInput
              style={styles.input}
              value={form.hours}
              onChangeText={(v) => update('hours', v)}
              placeholder="e.g. 8"
              keyboardType="number-pad"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <Text style={styles.label}>Workers Required *</Text>
        <TextInput
          style={[styles.input, errors.workersNeeded && styles.inputError]}
          value={form.workersNeeded}
          onChangeText={(v) => update('workersNeeded', v)}
          placeholder="Number of workers"
          keyboardType="number-pad"
          placeholderTextColor={colors.textMuted}
        />
        {errors.workersNeeded ? <Text style={styles.error}>{errors.workersNeeded}</Text> : null}

        <Text style={styles.label}>Wage per Day (₹) *</Text>
        <TextInput
          style={[styles.input, errors.wagePerDay && styles.inputError]}
          value={form.wagePerDay}
          onChangeText={(v) => update('wagePerDay', v)}
          placeholder="e.g. 500"
          keyboardType="number-pad"
          placeholderTextColor={colors.textMuted}
        />
        {errors.wagePerDay ? <Text style={styles.error}>{errors.wagePerDay}</Text> : null}

        <Text style={styles.label}>Work Date *</Text>
        <TextInput
          style={[styles.input, errors.workDate && styles.inputError]}
          value={form.workDate}
          onChangeText={(v) => update('workDate', v)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />
        {errors.workDate ? <Text style={styles.error}>{errors.workDate}</Text> : null}

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={[styles.input, errors.location && styles.inputError]}
          value={form.location}
          onChangeText={(v) => update('location', v)}
          placeholder="Farm location"
          placeholderTextColor={colors.textMuted}
        />
        {errors.location ? <Text style={styles.error}>{errors.location}</Text> : null}

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.notes}
          onChangeText={(v) => update('notes', v)}
          placeholder="Any additional notes..."
          multiline
          numberOfLines={3}
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Post Job</Text>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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
