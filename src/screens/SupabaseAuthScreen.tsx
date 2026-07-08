import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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
import { isValidIndianMobileNumber, sanitizeIndianMobileInput } from '../utils/validation';

const G = { g1: '#092E18', g2: '#0F4A28', g3: '#1A6B3A', g7: '#E4F4EC', a7: '#FDF5E0', a2: '#8A5200', r2: '#C02828', n2: '#1C2E18', n4: '#6B8074', n7: '#E8F0EC', n8: '#F4F8F5' };

export default function SupabaseAuthScreen() {
  const { signInWithPhone, signUpWithPhone } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    setError(null);
    if (!isValidIndianMobileNumber(phone)) {
      setError('Enter a valid Indian mobile number.');
      return;
    }
    if (!password) {
      setError('Enter your mobile number and password.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Enter your name.');
      return;
    }
    setBusy(true);
    const res =
      mode === 'login'
        ? await signInWithPhone(phone, password)
        : await signUpWithPhone(phone, password, name, role);
    setBusy(false);
    if (!res.success) setError(res.error || 'Something went wrong.');
    // On success, the auth listener sets the user → navigator swaps to the app.
  }, [mode, phone, password, name, role, signInWithPhone, signUpWithPhone]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[G.g1, G.g2, G.g3]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <Text style={styles.logo}>🌱</Text>
            <Text style={styles.brand}>GreenPlot</Text>
            <Text style={styles.tagline}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {mode === 'signup' && (
            <>
              <Text style={styles.label}>Your name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Rajesh Kumar" placeholderTextColor="#9EB8A8" />
              <Text style={styles.label}>I am a</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity style={[styles.roleBtn, role === 'farmer' && styles.roleOn]} onPress={() => setRole('farmer')}>
                  <Text style={styles.roleEmoji}>🧑‍🌾</Text>
                  <Text style={[styles.roleText, role === 'farmer' && styles.roleTextOn]}>Farmer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.roleBtn, role === 'owner' && styles.roleOn]} onPress={() => setRole('owner')}>
                  <Text style={styles.roleEmoji}>🏠</Text>
                  <Text style={[styles.roleText, role === 'owner' && styles.roleTextOn]}>Owner</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={styles.label}>Mobile number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.cc}><Text style={styles.ccText}>+91</Text></View>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={t => setPhone(sanitizeIndianMobileInput(t))}
              placeholder="98765 43210"
              placeholderTextColor="#9EB8A8"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#9EB8A8" secureTextEntry />

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={G.r2} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.submit} onPress={submit} activeOpacity={0.85} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{mode === 'login' ? 'Log in' : 'Create account'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switch} onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}>
            <Text style={styles.switchText}>
              {mode === 'login' ? "New here? " : 'Already have an account? '}
              <Text style={styles.switchLink}>{mode === 'login' ? 'Create an account' : 'Log in'}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: G.n8 },
  flex: { flex: 1 },
  header: { paddingBottom: 28 },
  headerInner: { alignItems: 'center', paddingTop: 30 },
  logo: { fontSize: 44 },
  brand: { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 6 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  scroll: { padding: 20, paddingTop: 24 },
  label: { fontSize: 12, fontWeight: '700', color: G.n2, marginBottom: 7, marginTop: 14 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: G.n2 },
  phoneRow: { flexDirection: 'row', gap: 8 },
  cc: { backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center' },
  ccText: { fontSize: 14, fontWeight: '700', color: G.n2 },
  phoneInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: G.n2, letterSpacing: 1 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#fff', borderWidth: 1.5, borderColor: G.n7, borderRadius: 12, paddingVertical: 14 },
  roleOn: { borderColor: G.g3, backgroundColor: G.g7 },
  roleEmoji: { fontSize: 18 },
  roleText: { fontSize: 14, fontWeight: '700', color: G.n4 },
  roleTextOn: { color: G.g1 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#FDECEC', borderRadius: 10, padding: 11, marginTop: 16 },
  errorText: { flex: 1, fontSize: 12, color: G.r2 },
  submit: { backgroundColor: G.g2, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 22 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  switch: { alignItems: 'center', paddingVertical: 18 },
  switchText: { fontSize: 13, color: G.n4 },
  switchLink: { color: G.g3, fontWeight: '800' },
});
