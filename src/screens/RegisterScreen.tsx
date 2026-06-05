import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import { spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

type Role = 'farmer' | 'owner';

export default function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('farmer');

  // Scale animations for role cards
  const farmerAnim = useRef(new Animated.Value(1)).current;
  const ownerAnim = useRef(new Animated.Value(1)).current;

  const isValidName = fullName.trim().length >= 2;
  const isValidPhone = mobileNumber.length === 10;
  const isValidEmail = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canProceed = isValidName && isValidPhone && isValidEmail;

  const animatePress = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleRoleSelect = (selected: Role) => {
    animatePress(selected === 'farmer' ? farmerAnim : ownerAnim);
    setRole(selected);
  };

  const handleSignUp = () => {
    if (!canProceed) return;
    // Navigate to OTP; after OTP verify → ProfileSetup will use signupData
    navigation.navigate('Otp', {
      phoneNumber: mobileNumber,
      signupData: { name: fullName.trim(), role, email: email.trim() || undefined },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* ── Header ── */}
          <View style={styles.headerBlock}>
            <Text style={styles.headlineTop}>JOIN THE</Text>
            <Text style={styles.headlineMain}>COMMUNITY</Text>
            <Image
              source={require('../assets/images/green-plot.png')}
              style={styles.brandImage}
            />
          </View>

          {/* ── Form Card ── */}
          <View style={styles.formCard}>

            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, fullName.length > 0 && !isValidName && styles.inputError]}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor="#7ea18a"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {fullName.length > 0 && !isValidName && (
              <Text style={styles.errorText}>Name must be at least 2 characters</Text>
            )}

            {/* Mobile Number */}
            <Text style={[styles.label, { marginTop: spacing.lg }]}>Mobile Number</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.countryPicker} activeOpacity={0.8}>
                <Text style={styles.flagText}>🇮🇳</Text>
                <Text style={styles.chevron}>▾</Text>
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.input,
                  styles.inputFlex,
                  mobileNumber.length > 0 && !isValidPhone && styles.inputError,
                ]}
                placeholder="Mobile Number"
                placeholderTextColor="#7ea18a"
                keyboardType="phone-pad"
                maxLength={10}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                returnKeyType="next"
              />
            </View>
            {mobileNumber.length > 0 && !isValidPhone && (
              <Text style={styles.errorText}>Enter a valid 10-digit mobile number</Text>
            )}

            {/* Email (Optional) */}
            <Text style={[styles.label, { marginTop: spacing.lg }]}>
              Email{' '}
              <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={[styles.input, email.length > 0 && !isValidEmail && styles.inputError]}
              placeholder="email@example.com"
              placeholderTextColor="#7ea18a"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />
            {email.length > 0 && !isValidEmail && (
              <Text style={styles.errorText}>Enter a valid email address</Text>
            )}

            {/* Role Selection */}
            <Text style={[styles.label, { marginTop: spacing.xl }]}>I am a</Text>
            <View style={styles.roleRow}>
              {/* Farmer Card */}
              <Animated.View style={[{ flex: 1 }, { transform: [{ scale: farmerAnim }] }]}>
                <TouchableOpacity
                  style={[styles.roleCard, role === 'farmer' && styles.roleCardSelected]}
                  onPress={() => handleRoleSelect('farmer')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleIconWrap, role === 'farmer' && styles.roleIconWrapSelected]}>
                    <Text style={styles.roleEmoji}>👨‍🌾</Text>
                  </View>
                  <Text style={[styles.roleTitle, role === 'farmer' && styles.roleTitleSelected]}>
                    Farmer
                  </Text>
                  <Text style={[styles.roleDesc, role === 'farmer' && styles.roleDescSelected]}>
                    Lease land &{'\n'}grow crops
                  </Text>
                  {role === 'farmer' && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <View style={{ width: spacing.md }} />

              {/* Owner Card */}
              <Animated.View style={[{ flex: 1 }, { transform: [{ scale: ownerAnim }] }]}>
                <TouchableOpacity
                  style={[styles.roleCard, role === 'owner' && styles.roleCardSelected]}
                  onPress={() => handleRoleSelect('owner')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleIconWrap, role === 'owner' && styles.roleIconWrapSelected]}>
                    <Text style={styles.roleEmoji}>🏡</Text>
                  </View>
                  <Text style={[styles.roleTitle, role === 'owner' && styles.roleTitleSelected]}>
                    Land Owner
                  </Text>
                  <Text style={[styles.roleDesc, role === 'owner' && styles.roleDescSelected]}>
                    List land &{'\n'}manage leases
                  </Text>
                  {role === 'owner' && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, !canProceed && styles.signUpButtonDisabled]}
              activeOpacity={0.9}
              disabled={!canProceed}
              onPress={handleSignUp}
            >
              <Text style={styles.signUpButtonText}>Get OTP & Sign Up</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>
                Already have an account?{' '}
                <Text style={styles.loginLinkAccent}>Login</Text>
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              By signing up you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f2fbf2' },

  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
    backgroundColor: '#f2fbf2',
  },

  // ── Header ──────────────────────────────────────────────
  headerBlock: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  headlineTop: {
    fontSize: 32,
    fontWeight: '700',
    color: '#A9CDAD',
    letterSpacing: 1,
  },
  headlineMain: {
    fontSize: 44,
    fontWeight: '800',
    color: '#A9CDAD',
    marginTop: 4,
    letterSpacing: 2,
  },
  brandImage: {
    height: 70,
    resizeMode: 'contain',
    marginTop: 10,
  },

  // ── Form ────────────────────────────────────────────────
  formCard: {
    flex: 1,
  },

  label: {
    color: '#138115',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  optional: {
    color: '#7ea18a',
    fontWeight: '500',
    fontSize: 13,
  },

  input: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#b3c9b3',
    paddingHorizontal: 14,
    color: '#1f3b2a',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  inputFlex: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 0,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: '#e53935',
    backgroundColor: '#fce4e4',
  },

  errorText: {
    color: '#e53935',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 4,
    marginLeft: 4,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  countryPicker: {
    width: 70,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#d9e7d9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  flagText: { fontSize: 20 },
  chevron: { fontSize: 16, color: '#4c6a55' },

  // ── Role Cards ───────────────────────────────────────────
  roleRow: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  roleCard: {
    backgroundColor: '#d9e7d9',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    minHeight: 160,
    justifyContent: 'center',
  },
  roleCardSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#0b980b',
    shadowColor: '#0b980b',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  roleIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#b3c9b3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  roleIconWrapSelected: {
    backgroundColor: '#c8e6c9',
  },
  roleEmoji: {
    fontSize: 26,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f3b2a',
    textAlign: 'center',
  },
  roleTitleSelected: {
    color: '#0b980b',
  },
  roleDesc: {
    fontSize: 11,
    color: '#4c6a55',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  roleDescSelected: {
    color: '#2e7d32',
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0b980b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },

  // ── CTA Button ───────────────────────────────────────────
  signUpButton: {
    height: 54,
    borderRadius: 28,
    backgroundColor: '#0b980b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 4,
  },
  signUpButtonDisabled: {
    opacity: 0.45,
  },
  signUpButtonText: {
    color: '#f7fff7',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // ── Divider ─────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#b3c9b3',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#7ea18a',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Footer Links ─────────────────────────────────────────
  loginLink: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginLinkText: {
    color: '#4c6a55',
    fontSize: 14,
    fontWeight: '600',
  },
  loginLinkAccent: {
    color: '#0b980b',
    fontWeight: '800',
  },

  termsText: {
    textAlign: 'center',
    color: '#7ea18a',
    fontSize: 11,
    lineHeight: 17,
    paddingHorizontal: 10,
  },
  termsLink: {
    color: '#138115',
    fontWeight: '600',
  },
});
