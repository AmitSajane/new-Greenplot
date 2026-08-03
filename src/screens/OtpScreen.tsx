import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../navigation/AuthStack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/tokens';
import { AuthLayout } from '../components/organisms/AuthLayout';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

export default function OTPScreen({ navigation, route }: Props) {
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);
  const rootNavigation =
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();
  const phoneNumber = route.params.phoneNumber;
  const signupData = route.params.signupData;

  const isValidOtp = code.length === OTP_LENGTH;

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setCode(sanitized);
  };

  const handleResend = () => {
    if (seconds > 0) {
      return;
    }
    setSeconds(RESEND_SECONDS);
    setCode('');
    inputRef.current?.focus();
  };

  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH) {
      inputRef.current?.focus();
      return;
    }

    const result = await login(phoneNumber, code);
    if (result.success) {
      rootNavigation?.replace('Main');
    } else if (result.isNewUser) {
      navigation.replace('ProfileSetup', {
        phoneNumber,
        role: signupData?.role,
        name: signupData?.name,
        email: signupData?.email,
      });
    } else {
      setCode('');
      inputRef.current?.focus();
    }
  };

  return (
    <AuthLayout headlineTop="GROW YOUR" headlineMain="DREAM" headerMarginTop={40} headerMarginBottom={48}>
      <Text style={styles.instructions}>
        Please enter the 4 digit your registered mobile no.
      </Text>

      <TouchableOpacity
        style={styles.codeRow}
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
      >
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.codeBox,
              code.length === index ? styles.codeBoxActive : null,
            ]}
          >
            <Text style={styles.codeDigit}>{code[index] ?? ''}</Text>
          </View>
        ))}
      </TouchableOpacity>

      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChange}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        autoFocus
      />

      <View style={styles.timerRow}>
        <Text style={styles.timerText}>
          {`0:${seconds.toString().padStart(2, '0')}`}
        </Text>
        <TouchableOpacity
          style={styles.resendRow}
          onPress={handleResend}
          disabled={seconds > 0}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.resendText,
              seconds > 0 ? styles.resendDisabled : null,
            ]}
          >
            Resend code
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, !isValidOtp && styles.verifyButtonDisabled]}
        activeOpacity={0.9}
        disabled={!isValidOtp}
        onPress={handleVerify}
      >
        <Text style={styles.verifyText}>Verify</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  instructions: {
    color: colors.authGreen.label,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.authGreen.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxActive: {
    borderWidth: 2,
    borderColor: colors.authGreen.bright,
  },
  codeDigit: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.authGreen.inputText,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.authGreen.inputText,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.authGreen.bright,
  },
  resendDisabled: {
    color: colors.authGreen.muted,
  },
  verifyButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.authGreen.bright,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 3,
    marginTop: 50,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyText: {
    color: '#f7fff7',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
