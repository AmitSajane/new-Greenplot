import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import { colors, spacing } from '../theme/tokens';
import { isValidIndianMobileNumber, sanitizeIndianMobileInput } from '../utils/validation';
import { AuthLayout } from '../components/organisms/AuthLayout';
import { PhoneNumberInput } from '../components/molecules/PhoneNumberInput';

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
  const isValidPhone = isValidIndianMobileNumber(mobileNumber);
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
    <AuthLayout
      headlineTop="JOIN THE"
      headlineMain="COMMUNITY"
      headerMarginTop={20}
      headerMarginBottom={40}
      brandImageHeight={70}
      containerPaddingBottom={40}
    >
      {/* Full Name */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={[styles.input, fullName.length > 0 && !isValidName && styles.inputError]}
        placeholder="e.g. Ramesh Kumar"
        placeholderTextColor={colors.authGreen.muted}
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
      <PhoneNumberInput
        value={mobileNumber}
        onChangeText={(text) => setMobileNumber(sanitizeIndianMobileInput(text))}
        error={mobileNumber.length > 0 && !isValidPhone}
        height={50}
        borderRadius={8}
      />
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
        placeholderTextColor={colors.authGreen.muted}
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
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.authGreen.label,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  optional: {
    color: colors.authGreen.muted,
    fontWeight: '500',
    fontSize: 13,
  },

  input: {
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.authGreen.chipBg,
    paddingHorizontal: 14,
    color: colors.authGreen.inputText,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: colors.authGreen.errorBorder,
    backgroundColor: colors.authGreen.errorBg,
  },

  errorText: {
    color: colors.authGreen.errorBorder,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 4,
    marginLeft: 4,
  },

  // ── Role Cards ───────────────────────────────────────────
  roleRow: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  roleCard: {
    backgroundColor: colors.authGreen.countryPickerBg,
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
    borderColor: colors.authGreen.bright,
    shadowColor: colors.authGreen.bright,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  roleIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.authGreen.chipBg,
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
    color: colors.authGreen.inputText,
    textAlign: 'center',
  },
  roleTitleSelected: {
    color: colors.authGreen.bright,
  },
  roleDesc: {
    fontSize: 11,
    color: colors.authGreen.chevron,
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
    backgroundColor: colors.authGreen.bright,
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
    backgroundColor: colors.authGreen.bright,
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
    backgroundColor: colors.authGreen.chipBg,
  },
  dividerText: {
    marginHorizontal: 12,
    color: colors.authGreen.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Footer Links ─────────────────────────────────────────
  loginLink: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginLinkText: {
    color: colors.authGreen.chevron,
    fontSize: 14,
    fontWeight: '600',
  },
  loginLinkAccent: {
    color: colors.authGreen.bright,
    fontWeight: '800',
  },

  termsText: {
    textAlign: 'center',
    color: colors.authGreen.muted,
    fontSize: 11,
    lineHeight: 17,
    paddingHorizontal: 10,
  },
  termsLink: {
    color: colors.authGreen.label,
    fontWeight: '600',
  },
});
