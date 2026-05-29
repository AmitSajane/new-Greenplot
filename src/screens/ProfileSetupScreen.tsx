import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing, shadow } from '../theme/tokens';
import { AuthStackParamList } from '../navigation/AuthStack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileSetup'>;

export default function ProfileSetupScreen({ navigation, route }: Props) {
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { user, completeProfile } = useAuth();
  const phoneNumber = route.params?.phoneNumber ?? user?.phoneNumber ?? '';
  const preselectedRole = route.params?.role as UserRole | undefined;
  const prefilledName = route.params?.name ?? '';
  const prefilledEmail = route.params?.email ?? '';

  const [name, setName] = useState(user?.name ?? prefilledName);
  const [email, setEmail] = useState(user?.email ?? prefilledEmail);
  const [role, setRole] = useState<UserRole>(preselectedRole ?? user?.role ?? 'farmer');

  const handleComplete = () => {
    completeProfile(phoneNumber, name.trim(), role, email.trim() || undefined);
    rootNavigation?.replace('Main');
  };

  const isValid = name.trim().length >= 2;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Setup</Text>
        <Text style={styles.subtitle}>Complete your profile</Text>
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
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>I am a</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'farmer' && styles.roleBtnSelected]}
                onPress={() => setRole('farmer')}
              >
                <Ionicons name="leaf" size={22} color={role === 'farmer' ? colors.surface : colors.primary} />
                <Text style={[styles.roleBtnText, role === 'farmer' && styles.roleBtnTextSelected]}>Farmer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'owner' && styles.roleBtnSelected]}
                onPress={() => setRole('owner')}
              >
                <Ionicons name="home" size={22} color={role === 'owner' ? colors.surface : colors.primary} />
                <Text style={[styles.roleBtnText, role === 'owner' && styles.roleBtnTextSelected]}>Owner</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
            onPress={handleComplete}
            disabled={!isValid}
            activeOpacity={0.9}
          >
            <Text style={styles.submitBtnText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  formGroup: { marginBottom: spacing.xl },
  label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleRow: { flexDirection: 'row', gap: spacing.md },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  roleBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleBtnText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  roleBtnTextSelected: { color: colors.surface },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadow.card,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 18, fontWeight: '700', color: colors.surface },
});
