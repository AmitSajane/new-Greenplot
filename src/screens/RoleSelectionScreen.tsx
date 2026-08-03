import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing, shadow } from '../theme/tokens';
import { AuthStackParamList } from '../navigation/AuthStack';
import { ScreenHeader } from '../components/molecules/ScreenHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelection'>;

export default function RoleSelectionScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title="I am a" onBack={() => navigation.goBack()} titleSize={20} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Choose your role to continue</Text>

        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => navigation.navigate('Login', { preselectedRole: 'farmer' })}
          activeOpacity={0.8}
        >
          <View style={styles.roleIconWrap}>
            <Ionicons name="leaf" size={40} color={colors.primary} />
          </View>
          <Text style={styles.roleTitle}>Farmer</Text>
          <Text style={styles.roleDesc}>Lease land, grow crops, hire labor</Text>
          <Ionicons name="chevron-forward" size={24} color={colors.textMuted} style={styles.roleArrow} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => navigation.navigate('Login', { preselectedRole: 'owner' })}
          activeOpacity={0.8}
        >
          <View style={[styles.roleIconWrap, styles.ownerIconWrap]}>
            <Ionicons name="home" size={40} color={colors.primary} />
          </View>
          <Text style={styles.roleTitle}>Land Owner</Text>
          <Text style={styles.roleDesc}>List land, manage leases, track revenue</Text>
          <Ionicons name="chevron-forward" size={24} color={colors.textMuted} style={styles.roleArrow} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    ...shadow.card,
  },
  roleIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  ownerIconWrap: { backgroundColor: colors.softBlue },
  roleTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  roleDesc: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  roleArrow: { position: 'absolute', right: spacing.lg, top: spacing.xl },
});
