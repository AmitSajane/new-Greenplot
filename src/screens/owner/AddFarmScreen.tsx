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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { OwnerHomeStackParamList } from '../../navigation/OwnerHomeStack';
import { useFarmListings } from '../../context/FarmListingsContext';
import { useAuth } from '../../context/AuthContext';

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
  const { addListing } = useFarmListings();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [acres, setAcres] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [soilType, setSoilType] = useState('');
  const [tenure, setTenure] = useState('');
  const [leaseType, setLeaseType] = useState('');
  const [pricePerYear, setPricePerYear] = useState('');
  const [description, setDescription] = useState('');
  const [showSoilPicker, setShowSoilPicker] = useState(false);
  const [showTenurePicker, setShowTenurePicker] = useState(false);
  const [showLeaseTypePicker, setShowLeaseTypePicker] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const handleSubmit = () => {
    if (!title || !acres || !location || !district || !state || !soilType || !tenure || !pricePerYear || !leaseType) {
      Alert.alert('Missing Fields', 'Please fill in all required fields including lease type.');
      return;
    }

    // Add the listing
    const listingData: any = {
      title,
      soilType,
      acres,
      location,
      district,
      state,
      tenure,
      leaseType,
      pricePerYear: `₹${pricePerYear}`,
      description,
      imageUrl: mediaItems.length > 0 ? mediaItems[0].uri : FARM_IMAGES[Math.floor(Math.random() * FARM_IMAGES.length)],
      ownerId: user?.id || 'current-owner',
      ownerName: user?.name || 'Owner',
      status: 'active',
    };
    
    if (selectedCrops.length > 0) {
      listingData.crops = selectedCrops;
    }
    if (mediaItems.length > 0) {
      listingData.media = mediaItems;
    }
    
    addListing(listingData);

    Alert.alert('Success', 'Your farm land has been listed successfully!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
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
            <Text style={styles.label}>Village/Town *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Paramanandawadi"
              placeholderTextColor={colors.textMuted}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>District *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Belgaum"
                placeholderTextColor={colors.textMuted}
                value={district}
                onChangeText={setDistrict}
              />
            </View>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Karnataka"
                placeholderTextColor={colors.textMuted}
                value={state}
                onChangeText={setState}
              />
            </View>
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
});
