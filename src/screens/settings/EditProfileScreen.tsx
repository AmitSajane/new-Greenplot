import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { useAuth } from '../../context/AuthContext';
import { getCurrentCoords } from '../../utils/geo/location';
import { forwardGeocode, reverseGeocodeDetailed } from '../../utils/geo/geocoding';
import type { SettingsStackParamList } from '../../navigation/SettingsStack';
import { editProfileStyles as styles } from './styles/editProfile.styles';
import { colors } from '../../theme/tokens';

type Props = NativeStackScreenProps<SettingsStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [district, setDistrict] = useState<string | undefined>(user?.district);
  const [state, setState] = useState<string | undefined>(user?.state);
  const [hasWhatsapp, setHasWhatsapp] = useState(user?.hasWhatsapp ?? true);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Same "type a place then Detect, or leave blank and Detect for GPS"
  // pattern as ProfileOnboardingScreen's location step — reused as-is so
  // editing here behaves exactly like it does at registration.
  const handleLocationChange = useCallback((value: string) => {
    setLocation(value);
    setDistrict(undefined);
    setState(undefined);
  }, []);

  const detectLocation = useCallback(async () => {
    const typedLocation = location.trim();
    setLocating(true);
    try {
      if (typedLocation) {
        const detail = await forwardGeocode(typedLocation);
        if (!detail) {
          Alert.alert('Location', 'Could not find that place. Please check the spelling or use GPS.');
          return;
        }
        setLocation(detail.label);
        setDistrict(detail.district);
        setState(detail.state);
        return;
      }
      const { lat, lon } = await getCurrentCoords();
      const detail = await reverseGeocodeDetailed(lat, lon);
      setLocation(detail.label);
      setDistrict(detail.district);
      setState(detail.state);
    } catch {
      Alert.alert('Location', 'Could not detect location. Please type it manually.');
    } finally {
      setLocating(false);
    }
  }, [location]);

  const onSave = useCallback(async () => {
    const cleanName = name.trim();
    if (!cleanName) return Alert.alert('Name', 'Please enter your name.');
    setSaving(true);
    // avatarUrl deliberately omitted — updateProfile merges over the
    // existing user, so leaving it out keeps whatever's already saved.
    const res = await updateProfile({ name: cleanName, location, district, state, hasWhatsapp });
    setSaving(false);
    if (!res.success) return Alert.alert('Could not save', res.error || 'Please try again.');
    Alert.alert('Saved ✓', 'Your profile has been updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  }, [name, location, district, state, hasWhatsapp, updateProfile, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Edit profile" onBack={() => navigation.goBack()} titleSize={20} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Rajesh Kumar"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone number</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{user?.phoneNumber || 'N/A'}</Text>
            <Ionicons name="lock-closed" size={15} color={colors.textMuted} />
          </View>
          <Text style={styles.readOnlyHint}>Contact support to change your number</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>I am a…</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{user?.role === 'owner' ? '🏡 Land Owner' : '👨‍🌾 Farmer'}</Text>
            <Ionicons name="lock-closed" size={15} color={colors.textMuted} />
          </View>
          <Text style={styles.readOnlyHint}>Role can't be changed here</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Your location</Text>
          {location ? (
            <View style={styles.locDetected}>
              <Text style={{ fontSize: 20 }}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.locName}>{location}</Text>
                <Text style={styles.locSub}>Tap "Detect" to verify this place</Text>
              </View>
              <TouchableOpacity onPress={detectLocation} disabled={locating}>
                {locating ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.locEdit}>Detect</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.locBtn} activeOpacity={0.8} onPress={detectLocation} disabled={locating}>
              {locating ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="location-outline" size={20} color={colors.primary} />}
              <Text style={styles.locBtnText}>{locating ? 'Detecting…' : 'Use my current location (GPS)'}</Text>
            </TouchableOpacity>
          )}
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="or type Village, District, State"
            placeholderTextColor={colors.textMuted}
            value={location}
            onChangeText={handleLocationChange}
          />
        </View>

        <TouchableOpacity style={styles.toggleRow} activeOpacity={0.7} onPress={() => setHasWhatsapp(v => !v)}>
          <View style={[styles.check, hasWhatsapp && styles.checkOn]}>
            {hasWhatsapp && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={styles.toggleText}>This number is also on <Text style={styles.wa}>WhatsApp</Text> 🟢</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={onSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
