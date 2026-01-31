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
import { spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [mobileNumber, setMobileNumber] = useState('');
  const { getUserRole } = useAuth();

  const handleMobileNumberChange = (text: string) => {
    setMobileNumber(text);
  };

  const isValidNumber = mobileNumber.length >= 10;
  const userRole = getUserRole(mobileNumber);
  const roleHint = userRole === 'farmer' 
    ? '👨‍🌾 Farmer Account' 
    : userRole === 'owner' 
    ? '🏠 Owner Account' 
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.headlineTop}>FIND YOUR DREAM</Text>
          <Text style={styles.headlineMain}>LAND</Text>
          <View style={styles.brandRow}>
            <Image  source={require('../assets/images/green-plot.png')} style={styles.brandImage} />
            {/* <Text style={styles.brandGreen}>GREEN</Text>
            <Text style={styles.brandPlot}>PLOT</Text> */}
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.countryPicker} activeOpacity={0.8}>
              <Text style={styles.flagText}>🇮🇳</Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#7ea18a"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobileNumber}
              onChangeText={handleMobileNumberChange}
            />
          </View>
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
    paddingBottom: 24,
    backgroundColor: '#f2fbf2',
  },
  headerBlock: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 56,
    justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'red',
  },
  brandImage: {
    // width: 100,
    height: 90,
   resizeMode: 'contain',
   marginTop : 10, 
  },
  headlineTop: {
    fontSize: 35,
    fontWeight: '700',
    color: '#A9CDAD',
    letterSpacing: 1,
  },
  headlineMain: {
    fontSize: 50,
    fontWeight: '800',
    color: '#A9CDAD',
    marginTop: 4,
    letterSpacing: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  brandGreen: {
    fontSize: 44,
    fontWeight: '800',
    color: '#7fc67f',
    letterSpacing: 1,
    marginRight: 4,
  },
  brandPlot: {
    fontSize: 44,
    fontWeight: '800',
    color: '#9c948b',
    letterSpacing: 1,
  },
  formCard: {
    flex: 1,
    backgroundColor: '#f2fbf2',
  },
  label: {
    color: '#138115',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },
  countryPicker: {
    width: 70,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#d9e7d9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  flagText: {
    fontSize: 20,
  },
  chevron: {
    fontSize: 18,
    color: '#4c6a55',
  },
  input: {
    flex: 1,
    height: 48,
    marginLeft: 12,
    borderRadius: 6,
    backgroundColor: '#b3c9b3',
    paddingHorizontal: 14,
    color: '#1f3b2a',
    fontSize: 16,
    fontWeight: '600',
  },
  otpButton: {
    height: 54,
    borderRadius: 28,
    backgroundColor: '#0b980b',
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
    color: '#4c6a55',
    fontSize: 14,
    fontWeight: '600',
  },
  roleHint: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: '#d9e7d9',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  roleHintText: {
    color: '#138115',
    fontSize: 12,
    fontWeight: '600',
  },
});
