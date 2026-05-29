import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import { LanguageDropdown, Language } from '../components/LanguageDropdown';
import { colors, radius, spacing, shadow } from '../theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration Section */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../assets/images/Lease-Rent-Land.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

   

        {/* Logo Section */}
        <View style={{ paddingHorizontal: spacing.xl, flex: 1 }}>
        <View style={styles.logoContainer}>
          <View style={styles.logoRow}>
            <Text style={styles.logoGreen}>GREEN</Text>
            <View style={styles.logoPlotContainer}>
              <Text style={styles.logoPlot}>PL</Text>
              <View style={styles.logoIcon}>
                <Text style={styles.logoIconText}>🌱</Text>
              </View>
              <Text style={styles.logoPlot}>T</Text>
            </View>
          </View>
          <Text style={styles.tagline}>Lease Green. Grow More</Text>
        </View>

        {/* Language Selection */}
        <View style={styles.languageSection}>
          <Text style={styles.languageLabel}>Select Language</Text>
          <LanguageDropdown
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.9}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={{ height: spacing.md }} />

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.9}
          >
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8F5E9', // Light pale green background
  },
  scrollContent: {
    flexGrow: 1,
    // paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  illustrationContainer: {
    width: '100%',
    height: 280,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    // marginHorizontal: -spacing.xl,
    // paddingHorizontal: spacing.xl,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
  statsIcon: {
    fontSize: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoGreen: {
    fontSize: 42,
    fontWeight: '800',
    color: '#065608ff', // Bright green
    letterSpacing: 1,
  },
  logoPlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPlot: {
    fontSize: 42,
    fontWeight: '800',
    color: '#561e09ff', // Dark brown
    letterSpacing: 1,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#065608ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  logoIconText: {
    fontSize: 20,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32', // Dark green
    marginTop: spacing.sm,
    letterSpacing: 0.5,
  },
  languageSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  languageLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsContainer: {
    width: '100%',
    marginTop: spacing.lg,
  },
  loginButton: {
    width: '100%',
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: '#561e09ff', // Dark brown
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 0.5,
  },
  signUpButton: {
    width: '100%',
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: '#4CAF50', // Bright green
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50', // Bright green
    letterSpacing: 0.5,
  },
});

