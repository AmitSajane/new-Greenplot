import React, { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { formatDateLabel } from '../../utils';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { FilterChipRow } from '../../components/molecules/FilterChipRow';
import { useFarmListings } from '../../context/FarmListingsContext';
import { useAuth } from '../../context/AuthContext';
import type { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';
import type { ManagementRequestDraft } from './managementRequestDraft';
import { formatArea } from '../../utils/geo';

const CROP_OPTIONS = ['Not decided yet', 'Wheat', 'Paddy', 'Cotton', 'Sugarcane', 'Soybean', 'Other'] as const;
const EXPERIENCE_OPTIONS = ['Beginner', 'Some Experience', 'Experienced'] as const;
const DURATION_OPTIONS = ['One Crop Cycle', '1 Year', '2 Years', 'Other'] as const;

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'ManagementRequestForm'>;
type Route = RouteProp<FarmerHomeStackParamList, 'ManagementRequestForm'>;

export default function ManagementRequestFormScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const { farmId } = route.params;
  const { getListingById } = useFarmListings();
  const { user } = useAuth();
  const farm = getListingById(farmId);

  const missingProfileFields = useMemo(
    () => [!user?.name && 'Name', !user?.phoneNumber && 'Phone', !user?.location && 'Location'].filter(
      (v): v is string => !!v,
    ),
    [user?.name, user?.phoneNumber, user?.location],
  );

  const [preferredCrop, setPreferredCrop] = useState<string>('');
  const [preferredCropOther, setPreferredCropOther] = useState('');
  const [experience, setExperience] = useState<string>('');
  const [previousCrops, setPreviousCrops] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState<string>('');
  const [durationOther, setDurationOther] = useState('');
  const [notes, setNotes] = useState('');

  const handleReview = useCallback(() => {
    const missing: string[] = [];
    if (!experience) missing.push('Farming Experience');
    if (!duration) missing.push('Expected Management Duration');
    if (duration === 'Other' && !durationOther.trim()) missing.push('Duration (please specify)');
    if (preferredCrop === 'Other' && !preferredCropOther.trim()) missing.push('Preferred Crop (please specify)');
    if (missing.length > 0) {
      Alert.alert('Missing Fields', `Please fill the following required fields:\n\n${missing.join(', ')}`);
      return;
    }

    const draft: ManagementRequestDraft = {
      preferredCrop: preferredCrop === 'Other' ? preferredCropOther.trim() : preferredCrop,
      farmingExperience: experience,
      previousCrops: previousCrops.trim(),
      preferredStartDateIso: startDate.toISOString().slice(0, 10),
      preferredStartDateLabel: formatDateLabel(startDate),
      expectedDuration: duration === 'Other' ? durationOther.trim() : duration,
      farmerNotes: notes.trim(),
    };
    navigation.navigate('ManagementRequestReview', { farmId, draft });
  }, [preferredCrop, preferredCropOther, experience, previousCrops, startDate, duration, durationOther, notes, farmId, navigation]);

  if (!farm) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Request Farm Management" onBack={() => navigation.goBack()} />
        <View style={styles.centerFill}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={styles.missingText}>Farm not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (missingProfileFields.length > 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Request Farm Management" onBack={() => navigation.goBack()} />
        <View style={styles.centerFill}>
          <Ionicons name="person-circle-outline" size={48} color={colors.warning} />
          <Text style={styles.missingText}>
            Complete your farmer profile before submitting a management request.
          </Text>
          <TouchableOpacity
            style={styles.completeProfileBtn}
            onPress={() => (navigation as any).navigate('Settings', { screen: 'EditProfile' })}
            activeOpacity={0.85}
          >
            <Text style={styles.completeProfileBtnText}>Complete Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Request Farm Management" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.farmCard, shadow.card]}>
          <Text style={styles.farmName}>{farm.title}</Text>
          <Text style={styles.farmMeta}>{farm.location}, {farm.district}</Text>
          <View style={styles.farmDetailRow}>
            <Text style={styles.farmDetailChip}>{formatArea(farm.acres)}</Text>
            <Text style={styles.farmDetailChip}>{farm.soilType}</Text>
            {!!farm.waterSource && <Text style={styles.farmDetailChip}>{farm.waterSource}</Text>}
          </View>
          {!!farm.currentCrop && <Text style={styles.farmCrop}>Recommended crop: {farm.currentCrop}</Text>}
        </View>

        <Text style={styles.fieldLabel}>Preferred Crop</Text>
        <FilterChipRow options={CROP_OPTIONS} selected={preferredCrop} onSelect={setPreferredCrop} />
        {preferredCrop === 'Other' && (
          <TextInput
            style={styles.input}
            placeholder="e.g. Turmeric"
            placeholderTextColor={colors.textMuted}
            value={preferredCropOther}
            onChangeText={setPreferredCropOther}
          />
        )}

        <Text style={styles.fieldLabel}>Farming Experience *</Text>
        <FilterChipRow options={EXPERIENCE_OPTIONS} selected={experience} onSelect={setExperience} />

        <Text style={styles.fieldLabel}>Previous Crops Grown (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Paddy, Cotton"
          placeholderTextColor={colors.textMuted}
          value={previousCrops}
          onChangeText={setPreviousCrops}
        />

        <Text style={styles.fieldLabel}>Preferred Management Start Date *</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
          accessibilityRole="button"
          accessibilityLabel="Choose preferred start date"
        >
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.dateInputText}>{formatDateLabel(startDate)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (event.type !== 'dismissed' && selectedDate) setStartDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.fieldLabel}>Expected Management Duration *</Text>
        <FilterChipRow options={DURATION_OPTIONS} selected={duration} onSelect={setDuration} />
        {duration === 'Other' && (
          <TextInput
            style={styles.input}
            placeholder="e.g. 6 months"
            placeholderTextColor={colors.textMuted}
            value={durationOther}
            onChangeText={setDurationOther}
          />
        )}

        <Text style={styles.fieldLabel}>Farmer Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Anything else AgriArambh should know"
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.reviewBtn} onPress={handleReview} activeOpacity={0.85}>
          <Text style={styles.reviewBtnText}>Review Request</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  missingText: { fontSize: 15, color: colors.textPrimary, textAlign: 'center' },
  completeProfileBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  completeProfileBtnText: { color: colors.surface, fontWeight: '700', fontSize: 15 },
  farmCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  farmName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  farmMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  farmDetailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  farmDetailChip: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    backgroundColor: colors.softGreen,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  farmCrop: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.md },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  textArea: { minHeight: 90 },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dateInputText: { fontSize: 14, color: colors.textPrimary },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#4ADE80',
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    marginTop: spacing.xxl,
    ...shadow.card,
  },
  reviewBtnText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
});
