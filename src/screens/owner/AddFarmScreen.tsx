import React, { useState, useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { OwnerHomeStackParamList } from '../../navigation/OwnerHomeStack';
import { useFarmListings } from '../../context/FarmListingsContext';
import { useAuth } from '../../context/AuthContext';
import locationHierarchy, { type StateItem } from '../../data/locationHierarchy';

type NavigationProp = NativeStackNavigationProp<OwnerHomeStackParamList>;

const SOIL_TYPES = [
  'Black Soil',
  'Alluvial Soil',
  'Red Soil',
  'Clay Soil',
  'Sandy Soil',
  'Laterite Soil',
];

const TENURE_OPTIONS = ['1 year', '2 years', '3 years', '5 years', '10 years', '15 years'];

const LEASE_TYPE_OPTIONS = [
  'Fixed Rent',
  'Share Cropping',
  'Revenue Share',
  'Crop Share',
  'Fixed + Share',
  'Custom Agreement',
];

const CROP_OPTIONS = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Pulses'];

// Sample images for farms
const FARM_IMAGES = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
];

interface MediaItem {
  uri: string;
  type: 'photo' | 'video';
}

export default function AddFarmScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { addListing } = useFarmListings();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [acres, setAcres] = useState(() => {
    const initialAcres = route?.params?.acres;
    return initialAcres ? String(initialAcres) : '';
  });
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [hobli, setHobli] = useState('');
  const [village, setVillage] = useState('');
  const [location, setLocation] = useState('');
  const [soilType, setSoilType] = useState('');
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showTalukPicker, setShowTalukPicker] = useState(false);
  const [showHobliPicker, setShowHobliPicker] = useState(false);
  const [showVillagePicker, setShowVillagePicker] = useState(false);
  const [tenure, setTenure] = useState('');
  const [leaseType, setLeaseType] = useState('');
  const [pricePerYear, setPricePerYear] = useState('');
  const [description, setDescription] = useState('');
  const [showSoilPicker, setShowSoilPicker] = useState(false);
  const [showTenurePicker, setShowTenurePicker] = useState(false);
  const [showLeaseTypePicker, setShowLeaseTypePicker] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [irrigationSchedule, setIrrigationSchedule] = useState('');
  const [pesticideSchedule, setPesticideSchedule] = useState('');
  const [expectedHarvest, setExpectedHarvest] = useState('');
  const [govtSurveyNumber, setGovtSurveyNumber] = useState('');
  const [surveyFetched, setSurveyFetched] = useState(false);
  const [fraudBadge, setFraudBadge] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [blockchainBadge, setBlockchainBadge] = useState<'pending' | 'verified' | 'failed'>('pending');

  const statesData = locationHierarchy.states;

  const districtOptions = useMemo(() => {
    if (!state) return [];
    const s = statesData.find((st) => st.name === state);
    return s ? s.districts.map((d) => d.name) : [];
  }, [state, statesData]);

  const talukOptions = useMemo(() => {
    if (!state || !district) return [];
    const s = statesData.find((st) => st.name === state);
    const d = s?.districts.find((dist) => dist.name === district);
    return d ? d.taluks.map((t) => t.name) : [];
  }, [state, district, statesData]);

  const hobliOptions = useMemo(() => {
    if (!state || !district || !taluk) return [];
    const s = statesData.find((st) => st.name === state);
    const d = s?.districts.find((dist) => dist.name === district);
    const t = d?.taluks.find((tl) => tl.name === taluk);
    return t ? t.hoblis.map((h) => h.name) : [];
  }, [state, district, taluk, statesData]);

  const villageOptions = useMemo(() => {
    if (!state || !district || !taluk || !hobli) return [];
    const s = statesData.find((st) => st.name === state);
    const d = s?.districts.find((dist) => dist.name === district);
    const t = d?.taluks.find((tl) => tl.name === taluk);
    const h = t?.hoblis.find((hb) => hb.name === hobli);
    return h ? h.villages : [];
  }, [state, district, taluk, hobli, statesData]);

  const handleStateSelect = useCallback((value: string) => {
    setState(value);
    setDistrict('');
    setTaluk('');
    setHobli('');
    setVillage('');
    setShowStatePicker(false);
  }, []);

  const handleDistrictSelect = useCallback((value: string) => {
    setDistrict(value);
    setTaluk('');
    setHobli('');
    setVillage('');
    setShowDistrictPicker(false);
  }, []);

  const handleTalukSelect = useCallback((value: string) => {
    setTaluk(value);
    setHobli('');
    setVillage('');
    setShowTalukPicker(false);
  }, []);

  const handleHobliSelect = useCallback((value: string) => {
    setHobli(value);
    setVillage('');
    setShowHobliPicker(false);
  }, []);

  const handleVillageSelect = useCallback((value: string) => {
    setVillage(value);
    setShowVillagePicker(false);
  }, []);

  const handleSubmit = () => {
    const addressParts = [village, hobli, taluk, district, state].filter(Boolean);
    const locationText = addressParts.length > 0 ? addressParts.join(', ') : location;
    if (!title || !acres || !state || !district || !soilType || !tenure || !pricePerYear || !leaseType) {
      Alert.alert('Missing Fields', 'Please select State, District and fill other required fields.');
      return;
    }

    // Add the listing
    const listingData: any = {
      title,
      soilType,
      acres,
      location: locationText,
      district,
      state,
      taluk: taluk || undefined,
      hobli: hobli || undefined,
      village: village || undefined,
      tenure,
      leaseType,
      pricePerYear: `₹${pricePerYear}`,
      description,
      imageUrl: mediaItems.length > 0 ? mediaItems[0].uri : FARM_IMAGES[Math.floor(Math.random() * FARM_IMAGES.length)],
      ownerId: user?.id || 'current-owner',
      ownerName: user?.name || 'Owner',
      status: 'active',
      plotGeoJSON: route?.params?.plotGeoJSON,
      areaAcres: acres ? parseFloat(acres) || undefined : undefined,
    };

    if (selectedCrops.length > 0) {
      listingData.crops = selectedCrops;
      listingData.currentCrop = selectedCrops[0];
    }
    if (irrigationSchedule) {
      listingData.irrigationSchedule = irrigationSchedule;
    }
    if (pesticideSchedule) {
      listingData.pesticideSchedule = pesticideSchedule;
    }
    if (expectedHarvest) {
      listingData.expectedHarvest = expectedHarvest;
    }
    if (mediaItems.length > 0) {
      listingData.media = mediaItems;
    }

    const newLandId = addListing(listingData);

    Alert.alert('Land published ✓', 'Next, add lease offers so farmers can compare and apply.', [
      { text: 'Later', style: 'cancel', onPress: () => navigation.goBack() },
      {
        text: 'Add lease offers',
        onPress: () => navigation.navigate('AddLeaseOffer', { landId: newLandId, landTitle: title }),
      },
    ]);
  };

  const renderDropdown = (
    value: string,
    placeholder: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.dropdown} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.dropdownText, !value && styles.placeholder]}>
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  const renderPickerModal = (
    visible: boolean,
    options: string[],
    onSelect: (value: string) => void,
    onClose: () => void
  ) => {
    if (!visible) return null;
    return (
      <View style={styles.pickerOverlay}>
        <TouchableOpacity style={styles.pickerBackdrop} onPress={onClose} />
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Option</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerOptions}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.pickerOption}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={styles.pickerOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const toggleCrop = useCallback((crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  }, []);

  const handleTakePhoto = useCallback(() => {
    // TODO: Integrate with image picker library (e.g., react-native-image-picker)
    Alert.alert(
      'Take Photo',
      'Image picker integration needed. For now, this is a placeholder.',
      [{ text: 'OK' }]
    );
    // Example implementation:
    // ImagePicker.launchCamera({ mediaType: 'photo' }, (response) => {
    //   if (!response.didCancel && response.assets?.[0]) {
    //     setMediaItems((prev) => [...prev, { uri: response.assets[0].uri, type: 'photo' }]);
    //   }
    // });
  }, []);

  const handleRecordVideo = useCallback(() => {
    // TODO: Integrate with image picker library for video recording
    Alert.alert(
      'Record Video',
      'Video recording integration needed. For now, this is a placeholder.',
      [{ text: 'OK' }]
    );
    // Example implementation:
    // ImagePicker.launchCamera({ mediaType: 'video' }, (response) => {
    //   if (!response.didCancel && response.assets?.[0]) {
    //     setMediaItems((prev) => [...prev, { uri: response.assets[0].uri, type: 'video' }]);
    //   }
    // });
  }, []);

  const removeMedia = useCallback((index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Memoized components for better performance
  const CropButton = React.memo<{ crop: string; isSelected: boolean; onPress: () => void }>(
    ({ crop, isSelected, onPress }) => (
      <TouchableOpacity
        style={[styles.cropButton, isSelected && styles.cropButtonSelected]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {isSelected && (
          <Ionicons name="checkmark" size={16} color={colors.surface} style={styles.cropCheckIcon} />
        )}
        <Text style={[styles.cropButtonText, isSelected && styles.cropButtonTextSelected]}>
          {crop}
        </Text>
      </TouchableOpacity>
    )
  );

  const MediaPreview = React.memo<{ item: MediaItem; index: number; onRemove: () => void }>(
    ({ item, index, onRemove }) => (
      <View style={styles.mediaPreviewContainer}>
        <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
        <TouchableOpacity style={styles.removeMediaButton} onPress={onRemove} activeOpacity={0.8}>
          <Ionicons name="close-circle" size={20} color={colors.danger} />
        </TouchableOpacity>
        {item.type === 'video' && (
          <View style={styles.videoBadge}>
            <Ionicons name="videocam" size={12} color={colors.surface} />
          </View>
        )}
      </View>
    )
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Farm Listing</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >


          {/* Verification badges */}
          <View style={styles.badgesRow}>
            <View style={[styles.badge, fraudBadge === 'verified' && styles.badgeVerified]}>
              <Ionicons name={fraudBadge === 'verified' ? 'shield-checkmark' : 'shield-outline'} size={18} color={fraudBadge === 'verified' ? colors.success : colors.textMuted} />
              <Text style={[styles.badgeText, fraudBadge === 'verified' && styles.badgeTextVerified]}>Fraud check</Text>
            </View>
            <View style={[styles.badge, blockchainBadge === 'verified' && styles.badgeVerified]}>
              <Ionicons name={blockchainBadge === 'verified' ? 'link' : 'link-outline'} size={18} color={blockchainBadge === 'verified' ? colors.success : colors.textMuted} />
              <Text style={[styles.badgeText, blockchainBadge === 'verified' && styles.badgeTextVerified]}>Blockchain</Text>
            </View>
          </View>

          {/* Boundary satellite preview */}
          <TouchableOpacity style={styles.boundaryPreview} onPress={() => navigation.navigate('SatelliteMap')}>
            <Ionicons name="map" size={24} color={colors.primary} />
            <Text style={styles.boundaryPreviewText}>View boundary on satellite map</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Farm Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Fertile Wheat Land"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Acres *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 5"
                placeholderTextColor={colors.textMuted}
                value={acres}
                onChangeText={setAcres}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Soil Type *</Text>
              {renderDropdown(soilType, 'Select Soil Type', () => setShowSoilPicker(true))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>State *</Text>
            {renderDropdown(state, 'Select State', () => setShowStatePicker(true))}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>District *</Text>
            {renderDropdown(district, 'Select District', () => state && setShowDistrictPicker(true))}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Taluk *</Text>
            {renderDropdown(taluk, 'Select Taluk', () => district && setShowTalukPicker(true))}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Hobli *</Text>
            {renderDropdown(hobli, 'Select Hobli', () => taluk && setShowHobliPicker(true))}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Village *</Text>
            {renderDropdown(village, 'Select Village', () => hobli && setShowVillagePicker(true))}
          </View>

          {/* Govt survey fetch */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Govt Survey Number (optional)</Text>
            <View style={styles.surveyRow}>
              <TextInput
                style={[styles.input, styles.surveyInput]}
                placeholder="e.g. Survey 123/45"
                placeholderTextColor={colors.textMuted}
                value={govtSurveyNumber}
                onChangeText={setGovtSurveyNumber}
              />
              <TouchableOpacity
                style={styles.fetchBtn}
                onPress={() => {
                  if (govtSurveyNumber.trim()) {
                    setSurveyFetched(true);
                    setFraudBadge('verified');
                    setBlockchainBadge('verified');
                  }
                }}
              >
                <Text style={styles.fetchBtnText}>Fetch</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location / Landmark (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Near main road, plot no."
              placeholderTextColor={colors.textMuted}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Lease Tenure *</Text>
              {renderDropdown(tenure, 'Select Tenure', () => setShowTenurePicker(true))}
            </View>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Price Per Year (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 12000"
                placeholderTextColor={colors.textMuted}
                value={pricePerYear}
                onChangeText={setPricePerYear}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Lease Type *</Text>
            <Text style={styles.hintText}>Select the type of lease agreement for this land</Text>
            {renderDropdown(leaseType, 'Select Lease Type', () => setShowLeaseTypePicker(true))}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your land, irrigation facilities, nearby amenities..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Crop Care Schedule */}
          {/* <View style={styles.formGroup}>
            <Text style={styles.label}>Irrigation Schedule (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Irrigate every 5 days, next on 15 Feb"
              placeholderTextColor={colors.textMuted}
              value={irrigationSchedule}
              onChangeText={setIrrigationSchedule}
            />
          </View> */}

          {/* <View style={styles.formGroup}>
            <Text style={styles.label}>Pesticide / Fertilizer Schedule (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Spray neem-based pesticide on 20 Feb"
              placeholderTextColor={colors.textMuted}
              value={pesticideSchedule}
              onChangeText={setPesticideSchedule}
            />
          </View> */}

          {/* <View style={styles.formGroup}>
            <Text style={styles.label}>Expected Harvest Window (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Harvest between 10–20 May"
              placeholderTextColor={colors.textMuted}
              value={expectedHarvest}
              onChangeText={setExpectedHarvest}
            />
          </View> */}

          {/* Best Crops to Grow Section */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Best Crops to Grow</Text>
            <View style={styles.cropContainer}>
              {CROP_OPTIONS.map((crop) => (
                <CropButton
                  key={crop}
                  crop={crop}
                  isSelected={selectedCrops.includes(crop)}
                  onPress={() => toggleCrop(crop)}
                />
              ))}
            </View>
          </View>

          {/* Add Photos & Video Section */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Add Photos & Video</Text>

            {/* Media Previews */}
            {mediaItems.length > 0 && (
              <View style={styles.mediaPreviewsContainer}>
                {mediaItems.map((item, index) => (
                  <MediaPreview
                    key={`${item.uri}-${index}`}
                    item={item}
                    index={index}
                    onRemove={() => removeMedia(index)}
                  />
                ))}
              </View>
            )}

            {/* Capture Buttons */}
            <View style={styles.captureButtonsContainer}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
              >
                <View style={[styles.captureIconContainer, styles.photoIconContainer]}>
                  <Ionicons name="camera" size={24} color={colors.primary} />
                </View>
                <Text style={styles.captureButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleRecordVideo}
                activeOpacity={0.8}
              >
                <View style={[styles.captureIconContainer, styles.videoIconContainer]}>
                  <Ionicons name="videocam" size={24} color={colors.info} />
                </View>
                <Text style={styles.captureButtonText}>Record Video</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.mediaHint}>Clear photos help rent your land faster.</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
            <Ionicons name="add-circle" size={22} color={colors.textPrimary} />
            <Text style={styles.submitButtonText}>List My Farm</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Picker Modals */}
      {renderPickerModal(showStatePicker, statesData.map((s) => s.name), handleStateSelect, () => setShowStatePicker(false))}
      {renderPickerModal(showDistrictPicker, districtOptions, handleDistrictSelect, () => setShowDistrictPicker(false))}
      {renderPickerModal(showTalukPicker, talukOptions, handleTalukSelect, () => setShowTalukPicker(false))}
      {renderPickerModal(showHobliPicker, hobliOptions, handleHobliSelect, () => setShowHobliPicker(false))}
      {renderPickerModal(showVillagePicker, villageOptions, handleVillageSelect, () => setShowVillagePicker(false))}
      {renderPickerModal(showSoilPicker, SOIL_TYPES, setSoilType, () => setShowSoilPicker(false))}
      {renderPickerModal(showTenurePicker, TENURE_OPTIONS, setTenure, () => setShowTenurePicker(false))}
      {renderPickerModal(showLeaseTypePicker, LEASE_TYPE_OPTIONS, setLeaseType, () => setShowLeaseTypePicker(false))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    // backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  hintText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  placeholder: {
    color: colors.textMuted,
  },
  photoUpload: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoUploadText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  photoUploadHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: '#4ADE80',
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    ...shadow.card,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  // Picker Modal Styles
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '50%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pickerOptions: {
    padding: spacing.md,
  },
  pickerOption: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  // Crop Selection Styles
  cropContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cropButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cropButtonSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  cropCheckIcon: {
    marginRight: spacing.xs,
  },
  cropButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  cropButtonTextSelected: {
    color: colors.surface,
  },
  // Media Upload Styles
  mediaPreviewsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  mediaPreviewContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 2,
  },
  videoBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  captureButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  captureButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  photoIconContainer: {
    backgroundColor: colors.softGreen,
  },
  videoIconContainer: {
    backgroundColor: colors.softBlue,
  },
  captureButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  mediaHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  surveyRow: { flexDirection: 'row', gap: spacing.sm },
  surveyInput: { flex: 1 },
  fetchBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  fetchBtnText: { fontSize: 14, fontWeight: '700', color: colors.surface },
  badgesRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeVerified: { borderColor: colors.success, backgroundColor: colors.softGreen },
  badgeText: { fontSize: 13, color: colors.textMuted },
  badgeTextVerified: { color: colors.success, fontWeight: '600' },
  boundaryPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softBlue,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  boundaryPreviewText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.textPrimary },
});
