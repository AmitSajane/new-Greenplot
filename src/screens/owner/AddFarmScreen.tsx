import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  ActivityIndicator,
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
import INDIA_LOCATIONS from '../../constants/indiaLocations.json';
import { lookupPincode } from '../../services/pincodeApi';
import { landVerifier, VerificationResult } from '../../services/landVerifier';
import { storageApi } from '../../services/storageApi';

/** Complete all-India State → District → Taluk map (offline, 35 states / 10.8k taluks). */
const INDIA = INDIA_LOCATIONS as Record<string, Record<string, string[]>>;

// Defensive optional require for the image picker (camera / gallery).
let ImagePicker: { launchImageLibrary?: Function; launchCamera?: Function } | null;
try {
  ImagePicker = require('react-native-image-picker');
} catch {
  ImagePicker = null;
}

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

interface MediaItem {
  id: string;
  uri: string; // local preview uri
  type: 'photo' | 'video';
  remoteUrl?: string; // Supabase Storage URL once uploaded
  uploading?: boolean;
  error?: boolean;
  base64?: string; // kept for retrying a failed photo upload
  mime?: string;
}

export default function AddFarmScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { addListing, updateListing, getListingById } = useFarmListings();
  const { user } = useAuth();
  const selfFarmed = !!route?.params?.selfFarmed;

  const [title, setTitle] = useState('');
  const [acres, setAcres] = useState(() => {
    const initialAcres = route?.params?.acres;
    return initialAcres ? String(initialAcres) : '';
  });

 
  const [pincode, setPincode] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
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
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [fraudBadge, setFraudBadge] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [submitting, setSubmitting] = useState(false);
  const [blockchainBadge, setBlockchainBadge] = useState<'pending' | 'verified' | 'failed'>('pending');

  // Auto-fill location from the satellite-map boundary (reverse-geocoded centroid).
  // Runs once: matches state/district against the bundled dropdown data; always
  // fills the free-text location so the farmer sees their detected place.

  useEffect(()=>{
  apicall();
  },[])

  const apicall = async () => {
    console.log("api call")
  }

  useEffect(() => {
    const p = route?.params || {};
    if (p.location) setLocation(p.location);
    if (p.acres) setAcres(String(p.acres));
    if (p.state && INDIA[p.state]) {
      setState(p.state);
      if (p.district && INDIA[p.state][p.district]) setDistrict(p.district);
    }
    // Re-runs whenever we're handed fresh params — in particular, when
    // returning from the satellite map after drawing a boundary.
  }, [route?.params]);

  const editListingId: string | undefined = route?.params?.editListingId;
  const isEditMode = !!editListingId;

  // Edit mode: pre-fill every field from the existing listing.
  useEffect(() => {
    if (!editListingId) return;
    const listing = getListingById(editListingId) as any;
    if (!listing) return;
    setTitle(listing.title || '');
    setAcres(listing.acres || '');
    setSoilType(listing.soilType || '');
    setState(listing.state || '');
    setDistrict(listing.district || '');
    setTaluk(listing.taluk || '');
    setHobli(listing.hobli || '');
    setVillage(listing.village || '');
    setLocation(listing.location || '');
    setTenure(listing.tenure || '');
    setLeaseType(listing.leaseType || '');
    setPricePerYear(String(listing.pricePerYear || '').replace(/[₹,]/g, ''));
    setDescription(listing.description || '');
    setGovtSurveyNumber(listing.surveyNumber || '');
    if (Array.isArray(listing.crops)) setSelectedCrops(listing.crops);
    if (Array.isArray(listing.mediaUrls) && listing.mediaUrls.length > 0) {
      setMediaItems(
        listing.mediaUrls.map((url: string, i: number) => ({
          id: `existing-${i}`,
          uri: url,
          type: 'photo' as const,
          remoteUrl: url,
          uploading: false,
        })),
      );
    }
    if (listing.verified) setFraudBadge('verified');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editListingId]);

  // Hobli/Village (optional) still come from the older curated dataset.
  const statesData = locationHierarchy.states;

  // State → District → Taluk from the complete all-India dataset.
  const stateOptions = useMemo(() => Object.keys(INDIA).sort(), []);

  const districtOptions = useMemo(() => {
    if (!state) return [];
    return Object.keys(INDIA[state] || {}).sort();
  }, [state]);

  const talukOptions = useMemo(() => {
    if (!state || !district) return [];
    return INDIA[state]?.[district] || [];
  }, [state, district]);

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

  // PIN-code auto-fill: type 6 digits → fetch and fill State / District / Taluk.
  const handlePincodeChange = useCallback((text: string) => {
    const pin = text.replace(/\D/g, '').slice(0, 6);
    setPincode(pin);
    setPinError('');
    if (pin.length !== 6) return;

    setPinLoading(true);
    lookupPincode(pin)
      .then((loc) => {
        if (!loc) {
          setPinError('Could not find this PIN code. Pick manually below.');
          return;
        }
        // Only set values that exist in our dropdown data (so the cascade stays valid).
        const matchedState = INDIA[loc.state] ? loc.state : '';
        setState(matchedState);
        const districts = matchedState ? INDIA[matchedState] : {};
        const matchedDistrict = districts[loc.district] ? loc.district : '';
        setDistrict(matchedDistrict);
        const taluks = matchedDistrict ? districts[matchedDistrict] : [];
        setTaluk(taluks.includes(loc.taluk) ? loc.taluk : '');
        setHobli('');
        setVillage('');
        if (!matchedState) setPinError('PIN found, but please confirm State/District manually.');
      })
      .catch(() => setPinError('Network error. Pick location manually below.'))
      .finally(() => setPinLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    const addressParts = [village, hobli, taluk, district, state].filter(Boolean);
    const locationText = addressParts.length > 0 ? addressParts.join(', ') : location;
    const missingCommon = !title || !acres || !state || !district || !soilType;
    const missingLeaseFields = !selfFarmed && (!tenure || !pricePerYear || !leaseType);
    if (missingCommon || missingLeaseFields) {
      Alert.alert('Missing Fields', 'Please select State, District and fill other required fields.');
      return;
    }
    if (mediaItems.some(m => m.uploading)) {
      Alert.alert('Please wait', 'Photos are still uploading. Try again in a moment.');
      return;
    }
    if (mediaItems.some(m => m.error)) {
      Alert.alert(
        'A photo failed to upload',
        'Retry the failed photo, or remove it, before publishing.',
      );
      return;
    }

    // Uploaded media URLs (work across devices); first photo is the cover image.
    const uploadedUrls = mediaItems.map(m => m.remoteUrl).filter((u): u is string => !!u);

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
      tenure: selfFarmed ? '' : tenure,
      leaseType: selfFarmed ? undefined : leaseType,
      pricePerYear: selfFarmed ? '' : `₹${pricePerYear}`,
      description,
      imageUrl: uploadedUrls[0] || '',
      mediaUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      ownerId: user?.id || 'current-owner',
      ownerName: user?.name || 'Owner',
      status: 'active',
      selfFarmed: selfFarmed || undefined,
      plotGeoJSON: route?.params?.plotGeoJSON,
      areaAcres: acres ? parseFloat(acres) || undefined : undefined,
      surveyNumber: govtSurveyNumber.trim() || undefined,
      verified: verifyResult?.status === 'verified' || undefined,
      verifiedOwnerName: verifyResult?.status === 'verified' ? verifyResult.record.ownerName : undefined,
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

    if (isEditMode && editListingId) {
      setSubmitting(true);
      // Never let an edit silently flip a leased land back to active.
      const updates = { ...listingData };
      delete updates.status;
      delete updates.ownerId;
      delete updates.ownerName;
      updateListing(editListingId, updates);
      setSubmitting(false);
      Alert.alert('Changes saved ✓', 'Your listing has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    let newLandId: string;
    setSubmitting(true);
    try {
      newLandId = await addListing(listingData);
    } catch (e) {
      setSubmitting(false);
      Alert.alert('Could not publish', 'Please check your connection and try again.');
      return;
    }
    setSubmitting(false);

    if (selfFarmed) {
      Alert.alert('Land added ✓', 'You can now add a crop for it from My Crops & Plots.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

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

  const newId = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Runs (or re-runs) the actual upload for a media item already in state.
  // The very first attempt right after app start can race the auth session
  // still being restored, which the storage policy correctly rejects — so on
  // a first failure we silently retry once (session is ready by then) before
  // ever showing the user an error.
  const runUpload = useCallback(
    (
      id: string,
      kind: 'photo' | 'video',
      uri: string,
      base64: string | undefined,
      mime: string | undefined,
      isAutoRetry = false,
    ) => {
      const upload =
        kind === 'photo' && base64
          ? storageApi.uploadImage(base64, mime || 'image/jpeg', user?.id || 'anon')
          : storageApi.uploadFromUri(uri, mime || (kind === 'video' ? 'video/mp4' : 'image/jpeg'), user?.id || 'anon');

      const handleResult = (url: string | null) => {
        if (url) {
          setMediaItems(prev =>
            prev.map(m => (m.id === id ? { ...m, uploading: false, error: false, remoteUrl: url } : m)),
          );
          return;
        }
        if (!isAutoRetry) {
          setTimeout(() => runUpload(id, kind, uri, base64, mime, true), 1200);
          return;
        }
        setMediaItems(prev => prev.map(m => (m.id === id ? { ...m, uploading: false, error: true } : m)));
      };

      upload.then(handleResult).catch(() => handleResult(null));
    },
    [user?.id],
  );

  // Add a media item locally, then upload to Supabase Storage and swap in its URL.
  const addAndUpload = useCallback(
    (asset: { uri?: string; base64?: string; type?: string }, kind: 'photo' | 'video') => {
      if (!asset.uri) return;
      const id = newId();
      setMediaItems(prev => [
        ...prev,
        { id, uri: asset.uri!, type: kind, uploading: true, base64: asset.base64, mime: asset.type },
      ]);
      runUpload(id, kind, asset.uri, asset.base64, asset.type);
    },
    [runUpload],
  );

  const retryUpload = useCallback(
    (item: MediaItem) => {
      setMediaItems(prev => prev.map(m => (m.id === item.id ? { ...m, uploading: true, error: false } : m)));
      runUpload(item.id, item.type, item.uri, item.base64, item.mime);
    },
    [runUpload],
  );

  const handleTakePhoto = useCallback(() => {
    if (!ImagePicker?.launchCamera) return Alert.alert('Camera', 'Image picker not available in this build.');
    ImagePicker.launchCamera(
      { mediaType: 'photo', includeBase64: true, maxWidth: 1600, maxHeight: 1600, quality: 0.8 },
      (res: { didCancel?: boolean; assets?: any[] }) => {
        if (res.didCancel) return;
        const a = res.assets?.[0];
        if (a) addAndUpload(a, 'photo');
      },
    );
  }, [addAndUpload]);

  const handlePickGallery = useCallback(() => {
    if (!ImagePicker?.launchImageLibrary) return Alert.alert('Gallery', 'Image picker not available in this build.');
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 0, includeBase64: true, maxWidth: 1600, maxHeight: 1600, quality: 0.8 },
      (res: { didCancel?: boolean; assets?: any[] }) => {
        if (res.didCancel) return;
        (res.assets || []).forEach(a => addAndUpload(a, 'photo'));
      },
    );
  }, [addAndUpload]);

  const handleRecordVideo = useCallback(() => {
    if (!ImagePicker?.launchCamera) return Alert.alert('Video', 'Image picker not available in this build.');
    ImagePicker.launchCamera(
      { mediaType: 'video', videoQuality: 'medium', durationLimit: 60 },
      (res: { didCancel?: boolean; assets?: any[] }) => {
        if (res.didCancel) return;
        const a = res.assets?.[0];
        if (a) addAndUpload(a, 'video');
      },
    );
  }, [addAndUpload]);

  const removeMedia = useCallback((index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Land document verification (upload RoR → AI reads → cross-check → badge) ──
  const runVerification = useCallback(
    async (base64: string, mimeType?: string) => {
      setVerifying(true);
      setVerifyResult(null);
      const result = await landVerifier.verify({
        base64,
        mimeType,
        claimedSurveyNumber: govtSurveyNumber,
        claimedOwnerName: user?.name,
        state,
      });
      setVerifying(false);
      setVerifyResult(result);

      // Light up the existing trust badges when the document checks out.
      if (result.status === 'verified') {
        setSurveyFetched(true);
        setFraudBadge('verified');
        setBlockchainBadge('verified');
      }

      // Auto-fill the form from the extracted record. The uploaded govt record is the
      // authoritative source, so it overwrites rough estimates (e.g. from the satellite
      // boundary draw) rather than only filling blank fields.
      if (result.status === 'verified' || result.status === 'mismatch') {
        const r = result.record;
        if (r.surveyNumber && !govtSurveyNumber.trim()) setGovtSurveyNumber(r.surveyNumber);
        if (r.area) {
          const n = parseFloat(String(r.area).replace(/[^\d.]/g, ''));
          if (n) setAcres(String(n));
        }
        if (r.village) {
          setLocation([r.village, r.district, r.state].filter(Boolean).join(', '));
        }
        if (r.state && INDIA[r.state]) {
          setState(r.state);
          if (r.district && INDIA[r.state][r.district]) setDistrict(r.district);
        }
      }
    },
    [govtSurveyNumber, user?.name, state],
  );

  const pickDocument = useCallback(
    (source: 'camera' | 'gallery') => {
      const launch = source === 'camera' ? ImagePicker?.launchCamera : ImagePicker?.launchImageLibrary;
      if (!launch) {
        Alert.alert('Upload', 'Image picker is not available in this build.');
        return;
      }
      launch(
        { mediaType: 'photo', selectionLimit: 1, includeBase64: true, maxWidth: 1600, maxHeight: 1600, quality: 0.8 },
        (res: { didCancel?: boolean; errorCode?: string; assets?: { base64?: string; type?: string }[] }) => {
          if (res.didCancel) return;
          const a = res.assets?.[0];
          if (a?.base64) runVerification(a.base64, a.type);
          else Alert.alert('Upload', 'Could not read that image. Please try again.');
        },
      );
    },
    [runVerification],
  );

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

  const MediaPreview = React.memo<{ item: MediaItem; index: number; onRemove: () => void; onRetry: () => void }>(
    ({ item, index, onRemove, onRetry }) => (
      <View style={styles.mediaPreviewContainer}>
        <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
        {item.uploading && (
          <View style={styles.mediaUploading}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
        {!item.uploading && item.remoteUrl && (
          <View style={styles.mediaUploaded}>
            <Ionicons name="cloud-done" size={12} color="#fff" />
          </View>
        )}
        {!item.uploading && item.error && (
          <TouchableOpacity style={styles.mediaError} onPress={onRetry} activeOpacity={0.85}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.mediaErrorText}>Upload failed{'\n'}Tap to retry</Text>
          </TouchableOpacity>
        )}
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
        <Text style={styles.headerTitle}>
          {selfFarmed ? 'Add My Land' : isEditMode ? 'Edit Farm Listing' : 'Add New Farm Listing'}
        </Text>
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


          {!isEditMode && (
            <>
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
              <TouchableOpacity
                style={styles.boundaryPreview}
                onPress={() =>
                  (navigation as { navigate: (name: string, params?: object) => void }).navigate('SatelliteMap', {
                    returnTo: selfFarmed ? 'AddLand' : 'AddFarm',
                  })
                }
              >
                <Ionicons name="map" size={24} color={colors.primary} />
                <Text style={styles.boundaryPreviewText}>View boundary on satellite map</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </>
          )}

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

          {/* PIN-code quick fill */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>PIN Code (auto-fill location)</Text>
            <View style={styles.pinRow}>
              <TextInput
                style={[styles.input, styles.pinInput]}
                placeholder="e.g. 590001"
                placeholderTextColor={colors.textMuted}
                value={pincode}
                onChangeText={handlePincodeChange}
                keyboardType="number-pad"
                maxLength={6}
              />
              <View style={styles.pinHint}>
                {pinLoading ? (
                  <Text style={styles.pinHintText}>Looking up…</Text>
                ) : (
                  <Ionicons name="location-outline" size={20} color={colors.textMuted} />
                )}
              </View>
            </View>
            {!!pinError && <Text style={styles.pinError}>{pinError}</Text>}
            {!pinError && !!state && !!pincode && (
              <Text style={styles.pinOk}>✓ Auto-filled from PIN — adjust below if needed</Text>
            )}
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
            <Text style={styles.label}>Taluk</Text>
            {renderDropdown(taluk, 'Select Taluk', () => district && setShowTalukPicker(true))}
          </View>

          {hobliOptions.length > 0 && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Hobli (optional)</Text>
              {renderDropdown(hobli, 'Select Hobli', () => taluk && setShowHobliPicker(true))}
            </View>
          )}

          {villageOptions.length > 0 && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Village (optional)</Text>
              {renderDropdown(village, 'Select Village', () => hobli && setShowVillagePicker(true))}
            </View>
          )}

          {/* Govt survey fetch */}
          {!isEditMode && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Govt Survey Number (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 123/4A"
              placeholderTextColor={colors.textMuted}
              value={govtSurveyNumber}
              onChangeText={setGovtSurveyNumber}
            />

            {/* ── Verify ownership (free, AI reads the uploaded land record) ── */}
            <Text style={[styles.label, { marginTop: spacing.md }]}>
              Verify ownership{'  '}
              <Text style={styles.labelHint}>· builds trust with farmers</Text>
            </Text>

            {verifying ? (
              <View style={vrf.analyzing}>
                <View style={vrf.docThumb}><Text style={{ fontSize: 22 }}>📄</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={vrf.analyzingTitle}>🔎 Reading your document…</Text>
                  <Text style={vrf.analyzingSub}>AI is extracting owner name, survey number & area</Text>
                </View>
                <ActivityIndicator color="#4B2EA8" />
              </View>
            ) : verifyResult && (verifyResult.status === 'verified' || verifyResult.status === 'mismatch') ? (
              <View>
                {verifyResult.status === 'mismatch' && (
                  <View style={vrf.warn}>
                    <Text style={{ fontSize: 22 }}>⚠️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={vrf.warnTitle}>Survey number doesn't match</Text>
                      <Text style={vrf.warnSub}>{verifyResult.message}</Text>
                    </View>
                  </View>
                )}
                <View style={[vrf.card, verifyResult.status === 'verified' && vrf.cardOk]}>
                  <View style={vrf.cardHead}>
                    {verifyResult.status === 'verified' ? (
                      <View style={vrf.badge}>
                        <Ionicons name="shield-checkmark" size={14} color="#fff" />
                        <Text style={vrf.badgeText}>Document Verified</Text>
                      </View>
                    ) : (
                      <Text style={vrf.cardTitle}>Document details</Text>
                    )}
                    <Text style={{ fontSize: 20, marginLeft: 'auto' }}>📄</Text>
                  </View>
                  <VRow label="Owner name" value={verifyResult.record.ownerName} match={verifyResult.ownerMatches} />
                  <VRow label="Survey no." value={verifyResult.record.surveyNumber} match={verifyResult.surveyMatches} />
                  <VRow label="Area" value={verifyResult.record.area} />
                  <VRow label="Village" value={verifyResult.record.village} />
                  <Text style={vrf.foot}>🔁 Auto-filled into the form · tap any field to edit</Text>
                </View>
                <TouchableOpacity onPress={() => pickDocument('gallery')}>
                  <Text style={vrf.reupload}>Re-upload document</Text>
                </TouchableOpacity>
              </View>
            ) : verifyResult && (verifyResult.status === 'unreadable' || verifyResult.status === 'unconfigured') ? (
              <View>
                <View style={vrf.warn}>
                  <Text style={{ fontSize: 22 }}>📷</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={vrf.warnTitle}>Couldn't read the document</Text>
                    <Text style={vrf.warnSub}>{verifyResult.message}</Text>
                  </View>
                </View>
                <View style={vrf.upBtns}>
                  <TouchableOpacity style={vrf.upBtn} onPress={() => pickDocument('camera')}><Text style={vrf.upBtnText}>📷 Camera</Text></TouchableOpacity>
                  <TouchableOpacity style={vrf.upBtn} onPress={() => pickDocument('gallery')}><Text style={vrf.upBtnText}>🖼️ Gallery</Text></TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={vrf.upload}>
                <Text style={{ fontSize: 30 }}>📄</Text>
                <Text style={vrf.uploadTitle}>Upload your land record</Text>
                <Text style={vrf.uploadDesc}>RoR / Pahani / 7-12 — download free from your state portal, then upload. AI reads & verifies it.</Text>
                <View style={vrf.upBtns}>
                  <TouchableOpacity style={vrf.upBtn} onPress={() => pickDocument('camera')}><Text style={vrf.upBtnText}>📷 Camera</Text></TouchableOpacity>
                  <TouchableOpacity style={vrf.upBtn} onPress={() => pickDocument('gallery')}><Text style={vrf.upBtnText}>🖼️ Gallery</Text></TouchableOpacity>
                </View>
                <Text style={vrf.privacy}>🔒 We only read survey number, owner name & area to verify.</Text>
              </View>
            )}
          </View>
          )}

          {!isEditMode && (
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
          )}

          {!selfFarmed && (
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
          )}

          {!selfFarmed && !isEditMode && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Lease Type *</Text>
              <Text style={styles.hintText}>Select the type of lease agreement for this land</Text>
              {renderDropdown(leaseType, 'Select Lease Type', () => setShowLeaseTypePicker(true))}
            </View>
          )}

          {!isEditMode && (
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
          )}

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
          {!isEditMode && (
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
          )}

          {/* Add Photos & Video Section */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Add Photos & Video</Text>

            {/* Media Previews */}
            {mediaItems.length > 0 && (
              <View style={styles.mediaPreviewsContainer}>
                {mediaItems.map((item, index) => (
                  <MediaPreview
                    key={item.id}
                    item={item}
                    index={index}
                    onRemove={() => removeMedia(index)}
                    onRetry={() => retryUpload(item)}
                  />
                ))}
              </View>
            )}

            {/* Capture Buttons */}
            <View style={styles.captureButtonsContainer}>
              <TouchableOpacity style={styles.captureButton} onPress={handlePickGallery} activeOpacity={0.8}>
                <View style={[styles.captureIconContainer, styles.photoIconContainer]}>
                  <Ionicons name="images" size={24} color={colors.primary} />
                </View>
                <Text style={styles.captureButtonText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto} activeOpacity={0.8}>
                <View style={[styles.captureIconContainer, styles.photoIconContainer]}>
                  <Ionicons name="camera" size={24} color={colors.primary} />
                </View>
                <Text style={styles.captureButtonText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.captureButton} onPress={handleRecordVideo} activeOpacity={0.8}>
                <View style={[styles.captureIconContainer, styles.videoIconContainer]}>
                  <Ionicons name="videocam" size={24} color={colors.info} />
                </View>
                <Text style={styles.captureButtonText}>Video</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.mediaHint}>Add multiple photos — clear photos rent your land faster.</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <>
                <Ionicons name={isEditMode ? 'checkmark-circle' : 'add-circle'} size={22} color={colors.textPrimary} />
                <Text style={styles.submitButtonText}>{isEditMode ? 'Save Changes' : 'Submit'}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Picker Modals */}
      {renderPickerModal(showStatePicker, stateOptions, handleStateSelect, () => setShowStatePicker(false))}
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

/** A label/value row in the verification card, with an optional ✓ match tag. */
function VRow({ label, value, match }: { label: string; value?: string; match?: boolean }) {
  if (!value) return null;
  return (
    <View style={vrf.row}>
      <Text style={vrf.rowKey}>{label}</Text>
      <View style={vrf.rowValWrap}>
        <Text style={vrf.rowVal} numberOfLines={1}>{value}</Text>
        {match === true && <Text style={vrf.matchTag}>✓ matches</Text>}
        {match === false && <Text style={vrf.mismatchTag}>✕</Text>}
      </View>
    </View>
  );
}

const vrf = StyleSheet.create({
  upload: { borderWidth: 1.5, borderColor: '#1A6B3A', borderStyle: 'dashed', borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: '#fff' },
  uploadTitle: { fontSize: 15, fontWeight: '800', color: '#0F4A28', marginTop: 6 },
  uploadDesc: { fontSize: 12.5, color: '#6B8074', marginTop: 4, textAlign: 'center', lineHeight: 17 },
  upBtns: { flexDirection: 'row', gap: 10, marginTop: 12, alignSelf: 'stretch' },
  upBtn: { flex: 1, backgroundColor: '#E4F4EC', borderWidth: 1, borderColor: '#CDE9D8', borderRadius: 11, paddingVertical: 11, alignItems: 'center' },
  upBtnText: { fontSize: 13.5, fontWeight: '800', color: '#0F4A28' },
  privacy: { fontSize: 11.5, color: '#6B8074', marginTop: 10, textAlign: 'center' },

  analyzing: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#EDE8FD', borderWidth: 1.5, borderColor: '#DCD2F5', borderRadius: 14, padding: 14 },
  docThumb: { width: 44, height: 54, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  analyzingTitle: { fontSize: 14, fontWeight: '800', color: '#4B2EA8' },
  analyzingSub: { fontSize: 12, color: '#6a5aa8', marginTop: 2 },

  card: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E6EFE9', borderRadius: 14, padding: 14, marginTop: 4 },
  cardOk: { borderColor: '#A8D8B8', backgroundColor: '#FBFFFC' },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#1C2E18' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1A6B3A', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 6 },
  badgeText: { color: '#fff', fontSize: 12.5, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F1F6F3' },
  rowKey: { fontSize: 13.5, color: '#6B8074' },
  rowValWrap: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 },
  rowVal: { fontSize: 14, fontWeight: '800', color: '#0D1509', flexShrink: 1 },
  matchTag: { fontSize: 11.5, fontWeight: '800', color: '#1A6B3A' },
  mismatchTag: { fontSize: 12, fontWeight: '800', color: '#C02828' },
  foot: { fontSize: 12, color: '#6B8074', marginTop: 10 },
  reupload: { fontSize: 13, fontWeight: '800', color: '#1A6B3A', marginTop: 10 },

  warn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FDF5E0', borderWidth: 1.5, borderColor: '#F0D9A8', borderRadius: 14, padding: 13, marginBottom: 10 },
  warnTitle: { fontSize: 13.5, fontWeight: '800', color: '#B87214' },
  warnSub: { fontSize: 12, color: '#8a6a1a', marginTop: 2 },
});

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
  labelHint: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
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
  pinRow: { flexDirection: 'row', alignItems: 'center' },
  pinInput: { flex: 1 },
  pinHint: { marginLeft: spacing.md, minWidth: 70, alignItems: 'center' },
  pinHintText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  pinError: { fontSize: 13, color: '#C02828', marginTop: 6 },
  pinOk: { fontSize: 13, color: '#1A6B3A', fontWeight: '600', marginTop: 6 },
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
  submitButtonDisabled: {
    opacity: 0.7,
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
  mediaUploading: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaUploaded: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#1A6B3A',
    borderRadius: 10,
    padding: 3,
  },
  mediaError: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.md,
    backgroundColor: 'rgba(180,40,40,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  mediaErrorText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
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
