/**
 * One-screen onboarding (replaces login/OTP). Collects name, role, phone (+
 * WhatsApp flag) and location, creates the account/profile via AuthContext.onboard,
 * then the navigator routes to the Farmer or Owner dashboard by role.
 */
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { getCurrentCoords } from '../utils/geo/location';
import { reverseGeocodeDetailed } from '../utils/geo/geocoding';
import { AVAILABLE_LANGUAGES, loadLanguage } from '../localization/i18n';
import { useTranslation } from 'react-i18next';

export default function ProfileOnboardingScreen() {
  const { onboard, loginWithPhone, isLoading } = useAuth();
  const { i18n } = useTranslation();

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [phone, setPhone] = useState('');
  const [hasWhatsapp, setHasWhatsapp] = useState(true);
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState<string | undefined>();
  const [state, setState] = useState<string | undefined>();
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const detectLocation = useCallback(async () => {
    setLocating(true);
    try {
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
  }, []);

  const onContinue = useCallback(async () => {
    if (phone.replace(/\D/g, '').length < 10) return Alert.alert('Phone', 'Enter a valid 10-digit mobile number.');

    // Returning user → phone-only login.
    if (mode === 'login') {
      setSubmitting(true);
      const res = await loginWithPhone(phone);
      setSubmitting(false);
      if (!res.success) {
        Alert.alert(
          'Account not found',
          res.error || 'No account for this number.',
          res.isNewUser ? [{ text: 'Create account', onPress: () => setMode('signup') }, { text: 'Cancel', style: 'cancel' }] : undefined,
        );
      }
      return;
    }

    // New user → full sign-up.
    if (!name.trim()) return Alert.alert('Name', 'Please enter your name.');
    if (!role) return Alert.alert('Role', 'Please choose Farmer or Land Owner.');
    setSubmitting(true);
    const res = await onboard({ name, role, phone, location, district, state, hasWhatsapp });
    setSubmitting(false);
    if (!res.success) Alert.alert('Could not continue', res.error || 'Please try again.');
    // On success the navigator switches to the dashboard automatically.
  }, [mode, name, role, phone, location, district, state, hasWhatsapp, onboard, loginWithPhone]);

  const busy = submitting || isLoading;
  const isLogin = mode === 'login';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <LinearGradient colors={['#092E18', '#0F4A28', '#1A6B3A']} style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.logo}><Text style={{ fontSize: 30 }}>🌱</Text></View>
          <Text style={styles.heroTitle}>{isLogin ? 'Welcome back 👋' : 'Welcome to GreenPlot'}</Text>
          <Text style={styles.heroSub}>
            {isLogin ? 'Enter your phone number to log in' : "Let's set up your profile — takes 30 seconds"}
          </Text>
        </SafeAreaView>
      </LinearGradient>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Hero */}


          <View style={styles.body}>
            {!isLogin && (
              <>
                {/* Name */}
                <Text style={styles.label}>Your name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rajesh Kumar"
                  placeholderTextColor="#9EB8A8"
                  value={name}
                  onChangeText={setName}
                />

                {/* Role */}
                <Text style={styles.label}>I am a…</Text>
                <View style={styles.types}>
                  <RoleCard
                    emoji="👨‍🌾"
                    title="Farmer"
                    desc="I want to lease land & grow crops"
                    selected={role === 'farmer'}
                    onPress={() => setRole('farmer')}
                  />
                  <RoleCard
                    emoji="🏡"
                    title="Land Owner"
                    desc="I have land to give on lease"
                    selected={role === 'owner'}
                    onPress={() => setRole('owner')}
                  />
                </View>
              </>
            )}

            {/* Phone */}
            <Text style={styles.label}>Phone number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.cc}><Text style={styles.ccText}>🇮🇳 +91</Text></View>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="98765 43210"
                placeholderTextColor="#9EB8A8"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={t => setPhone(t.replace(/\D/g, ''))}
              />
            </View>
            {!isLogin && (
              <TouchableOpacity style={styles.toggleRow} activeOpacity={0.7} onPress={() => setHasWhatsapp(v => !v)}>
                <View style={[styles.check, hasWhatsapp && styles.checkOn]}>
                  {hasWhatsapp && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.toggleText}>This number is also on <Text style={styles.wa}>WhatsApp</Text> 🟢</Text>
              </TouchableOpacity>
            )}

            {!isLogin && (
              <>
                {/* Location */}
                <Text style={styles.label}>Your location</Text>
                {location ? (
                  <View style={styles.locDetected}>
                    <Text style={{ fontSize: 20 }}>📍</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locName}>{location}</Text>
                      <Text style={styles.locSub}>Tap "Detect" to update</Text>
                    </View>
                    <TouchableOpacity onPress={detectLocation}><Text style={styles.locEdit}>Detect</Text></TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.locBtn} activeOpacity={0.8} onPress={detectLocation} disabled={locating}>
                    {locating ? <ActivityIndicator color="#0F4A28" /> : <Ionicons name="location-outline" size={20} color="#0F4A28" />}
                    <Text style={styles.locBtnText}>{locating ? 'Detecting…' : 'Use my current location (GPS)'}</Text>
                  </TouchableOpacity>
                )}
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder="or type Village, District, State"
                  placeholderTextColor="#9EB8A8"
                  value={location}
                  onChangeText={setLocation}
                />

                {/* Language */}
                <Text style={styles.label}>Language <Text style={styles.opt}>· optional</Text></Text>
                <View style={styles.pills}>
                  {Object.entries(AVAILABLE_LANGUAGES).map(([code, lbl]) => {
                    const active = i18n.language === code;
                    return (
                      <TouchableOpacity
                        key={code}
                        style={[styles.pill, active && styles.pillActive]}
                        onPress={() => loadLanguage(code)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.pillText, active && styles.pillTextActive]}>{lbl}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* CTA */}
            <TouchableOpacity style={[styles.cta, busy && { opacity: 0.7 }]} onPress={onContinue} disabled={busy} activeOpacity={0.9}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>{isLogin ? 'Log in →' : 'Continue →'}</Text>}
            </TouchableOpacity>
            <Text style={styles.ctaHint}>No password needed. Your number keeps your account.</Text>

            {/* Switch between sign-up and login */}
            <TouchableOpacity style={styles.switchMode} onPress={() => setMode(isLogin ? 'signup' : 'login')} activeOpacity={0.7}>
              <Text style={styles.switchText}>
                {isLogin ? 'New to GreenPlot? ' : 'Already have an account? '}
                <Text style={styles.switchLink}>{isLogin ? 'Create account' : 'Log in'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RoleCard({ emoji, title, desc, selected, onPress }: { emoji: string; title: string; desc: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.type, selected && styles.typeSel]} onPress={onPress} activeOpacity={0.85}>
      {selected && <View style={styles.tick}><Ionicons name="checkmark" size={14} color="#fff" /></View>}
      <Text style={{ fontSize: 38 }}>{emoji}</Text>
      <Text style={styles.typeTitle}>{title}</Text>
      <Text style={styles.typeDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, },
  scroll: { paddingBottom: 36 },
  hero: { alignItems: 'center', justifyContent: 'center', paddingBottom: 18, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  logo: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginTop: 4, marginBottom: 10, textAlign: 'center' },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 16, color: 'rgba(255,255,255,0.82)', marginTop: 4, marginBottom: 18, textAlign: 'center', lineHeight: 20 },

  body: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 18 },
  label: { fontSize: 15, fontWeight: '800', color: '#0D1509', marginTop: 16, marginBottom: 8 },
  opt: { fontWeight: '600', color: '#6B8074', fontSize: 13 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E6EFE9', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: '#0D1509' },

  types: { flexDirection: 'row', gap: 12 },
  type: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderColor: '#E6EFE9', borderRadius: 18, padding: 16, alignItems: 'center' },
  typeSel: { borderColor: '#1A6B3A', backgroundColor: '#E4F4EC' },
  tick: { position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: '#1A6B3A', alignItems: 'center', justifyContent: 'center' },
  typeTitle: { fontSize: 17, fontWeight: '800', color: '#0D1509', marginTop: 8 },
  typeDesc: { fontSize: 12.5, color: '#6B8074', marginTop: 4, textAlign: 'center', lineHeight: 17 },

  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cc: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E6EFE9', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 14 },
  ccText: { fontSize: 16, fontWeight: '800', color: '#3A5040' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 11 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: '#1A6B3A', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: '#1A6B3A' },
  toggleText: { fontSize: 14, color: '#3A5040', fontWeight: '600' },
  wa: { color: '#1A6B3A', fontWeight: '800' },

  locBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#1A6B3A', borderStyle: 'dashed', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14 },
  locBtnText: { color: '#0F4A28', fontWeight: '800', fontSize: 15 },
  locDetected: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#E4F4EC', borderWidth: 1.5, borderColor: '#CDE9D8', borderRadius: 14, padding: 14 },
  locName: { fontSize: 15, fontWeight: '800', color: '#0D1509' },
  locSub: { fontSize: 13, color: '#6B8074', marginTop: 1 },
  locEdit: { color: '#1A6B3A', fontWeight: '800', fontSize: 13 },

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E6EFE9' },
  pillActive: { backgroundColor: '#1A6B3A', borderColor: '#1A6B3A' },
  pillText: { fontSize: 14, fontWeight: '700', color: '#3A5040' },
  pillTextActive: { color: '#fff' },

  cta: { marginTop: 24, backgroundColor: '#1A6B3A', borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  ctaHint: { textAlign: 'center', fontSize: 12.5, color: '#6B8074', marginTop: 10 },
  switchMode: { marginTop: 16, alignItems: 'center', paddingVertical: 6 },
  switchText: { fontSize: 14.5, color: '#3A5040' },
  switchLink: { color: '#1A6B3A', fontWeight: '800' },
});
