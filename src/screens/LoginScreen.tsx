import React, { useState } from 'react';
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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme/tokens';
import { isValidIndianMobileNumber, sanitizeIndianMobileInput } from '../utils/validation';
import { AuthLayout } from '../components/organisms/AuthLayout';
import { PhoneNumberInput } from '../components/molecules/PhoneNumberInput';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [mobileNumber, setMobileNumber] = useState('');
  const { getUserRole } = useAuth();

  const handleMobileNumberChange = (text: string) => {
    setMobileNumber(sanitizeIndianMobileInput(text));
  };

  const isValidNumber = isValidIndianMobileNumber(mobileNumber);
  const userRole = getUserRole(mobileNumber);
  const roleHint = userRole === 'farmer'
    ? '👨‍🌾 Farmer Account'
    : userRole === 'owner'
    ? '🏠 Owner Account'
    : null;

  return (
    <AuthLayout headlineTop="FIND YOUR DREAM" headlineMain="LAND">
      <Text style={styles.label}>Mobile Number</Text>
      <PhoneNumberInput
        value={mobileNumber}
        onChangeText={handleMobileNumberChange}
        style={styles.inputRow}
      />
      {roleHint && (
        <View style={styles.roleHint}>
          <Text style={styles.roleHintText}>{roleHint}</Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.otpButton, !isValidNumber && styles.otpButtonDisabled]}
        activeOpacity={0.9}
        disabled={!isValidNumber}
        onPress={() => navigation.navigate('Otp', { phoneNumber: mobileNumber })}
      >
        <Text style={styles.otpText}>OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryLink}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.secondaryLinkText}>Need an account? Register</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.authGreen.label,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputRow: {
    marginBottom: 26,
  },
  otpButton: {
    height: 54,
    borderRadius: 28,
    backgroundColor: colors.authGreen.bright,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 3,
  },
  otpButtonDisabled: {
    opacity: 0.5,
  },
  otpText: {
    color: '#f7fff7',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  secondaryLinkText: {
    color: colors.authGreen.chevron,
    fontSize: 14,
    fontWeight: '600',
  },
  roleHint: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.authGreen.countryPickerBg,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  roleHintText: {
    color: colors.authGreen.label,
    fontSize: 12,
    fontWeight: '600',
  },
});
