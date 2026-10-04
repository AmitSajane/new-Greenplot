import React, { useCallback, useState } from 'react';
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
import type { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';
import type { CropPlanDraft } from './cropPlanDraft';
import { formatArea } from '../../utils/geo';

const IRRIGATION_OPTIONS = ['Drip', 'Sprinkler', 'Flood', 'Rain-fed', 'Other'] as const;

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'CropPlanForm'>;
type Route = RouteProp<FarmerHomeStackParamList, 'CropPlanForm'>;

export default function CropPlanFormScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const { farmId, cropId, cropName: initialCropName } = route.params;
  const { getListingById } = useFarmListings();
  const farm = getListingById(farmId);
  const isOtherCrop = !cropId && !initialCropName;

  const [customCropName, setCustomCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [plantingDate, setPlantingDate] = useState(new Date());
  const [showPlantingPicker, setShowPlantingPicker] = useState(false);
  const [harvestDate, setHarvestDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const [showHarvestPicker, setShowHarvestPicker] = useState(false);
  const [area, setArea] = useState('');
  const [irrigation, setIrrigation] = useState<string>('');
  const [irrigationOther, setIrrigationOther] = useState('');
  const [notes, setNotes] = useState('');

  const handleReview = useCallback(() => {
    const missing: string[] = [];
    if (isOtherCrop && !customCropName.trim()) missing.push('Crop Name');
    const areaNum = parseFloat(area);
    if (!area.trim() || Number.isNaN(areaNum) || areaNum <= 0) missing.push('Area to Cultivate');
    if (farm && !Number.isNaN(areaNum) && areaNum > Number(farm.acres)) {
      Alert.alert('Area too large', `This farm is only ${formatArea(farm.acres)}.`);
      return;
    }
    if (!irrigation) missing.push('Irrigation Method');
    if (irrigation === 'Other' && !irrigationOther.trim()) missing.push('Irrigation Method (please specify)');
    if (harvestDate <= plantingDate) missing.push('Expected Harvest Date (must be after planting)');
    if (missing.length > 0) {
      Alert.alert('Missing Fields', `Please fill the following required fields:\n\n${missing.join(', ')}`);
      return;
    }

    const draft: CropPlanDraft = {
      cropId,
      cropName: isOtherCrop ? customCropName.trim() : initialCropName,
      variety: variety.trim(),
      plannedPlantingDateIso: plantingDate.toISOString().slice(0, 10),
      plannedPlantingDateLabel: formatDateLabel(plantingDate),
      expectedHarvestDateIso: harvestDate.toISOString().slice(0, 10),
      expectedHarvestDateLabel: formatDateLabel(harvestDate),
      areaToCultivate: area.trim(),
      irrigationMethod: irrigation === 'Other' ? irrigationOther.trim() : irrigation,
      farmerNotes: notes.trim(),
    };
    navigation.navigate('CropPlanReview', { farmId, draft });
  }, [
    area,
    farm,
    irrigation,
    irrigationOther,
    harvestDate,
    plantingDate,
    cropId,
    isOtherCrop,
    customCropName,
    initialCropName,
    variety,
    notes,
    farmId,
    navigation,
  ]);

  if (!farm) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Crop Plan" onBack={() => navigation.goBack()} />
        <View style={styles.centerFill}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={styles.missingText}>Farm not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Crop Plan" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {isOtherCrop ? (
          <>
            <Text style={styles.fieldLabel}>Crop Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Turmeric"
              placeholderTextColor={colors.textMuted}
              value={customCropName}
              onChangeText={setCustomCropName}
            />
          </>
        ) : (
          <View style={[styles.cropCard, shadow.card]}>
            <Ionicons name="leaf" size={20} color={colors.primary} />
            <Text style={styles.cropName}>{initialCropName}</Text>
          </View>
        )}

        <Text style={styles.fieldLabel}>Crop Variety (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Arka Rakshak"
          placeholderTextColor={colors.textMuted}
          value={variety}
          onChangeText={setVariety}
        />

        <Text style={styles.fieldLabel}>Planned Planting Date *</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => setShowPlantingPicker(true)}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.dateInputText}>{formatDateLabel(plantingDate)}</Text>
        </TouchableOpacity>
        {showPlantingPicker && (
          <DateTimePicker
            value={plantingDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPlantingPicker(false);
              if (event.type !== 'dismissed' && selectedDate) setPlantingDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.fieldLabel}>Expected Harvest Date *</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => setShowHarvestPicker(true)}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.dateInputText}>{formatDateLabel(harvestDate)}</Text>
        </TouchableOpacity>
        {showHarvestPicker && (
          <DateTimePicker
            value={harvestDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowHarvestPicker(false);
              if (event.type !== 'dismissed' && selectedDate) setHarvestDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.fieldLabel}>Area to Cultivate (Acres) *</Text>
        <TextInput
          style={styles.input}
          placeholder={`Up to ${formatArea(farm.acres)}`}
          placeholderTextColor={colors.textMuted}
          value={area}
          onChangeText={setArea}
          keyboardType="numeric"
        />

        <Text style={styles.fieldLabel}>Irrigation Method *</Text>
        <FilterChipRow options={IRRIGATION_OPTIONS} selected={irrigation} onSelect={setIrrigation} />
        {irrigation === 'Other' && (
          <TextInput
            style={styles.input}
            placeholder="Describe irrigation method"
            placeholderTextColor={colors.textMuted}
            value={irrigationOther}
            onChangeText={setIrrigationOther}
          />
        )}

        <Text style={styles.fieldLabel}>Farmer Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Anything else worth noting about this crop plan"
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.reviewBtn} onPress={handleReview} activeOpacity={0.85}>
          <Text style={styles.reviewBtnText}>Review Crop Plan</Text>
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
  cropCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  cropName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
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
