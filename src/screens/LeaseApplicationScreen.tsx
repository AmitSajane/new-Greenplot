import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../theme/tokens';

export default function LeaseApplicationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = route.params || {};
  const { propertyId, leaseTypeId, leaseTypeTitle } = params;

  const handleProceed = () => {
    if (leaseTypeId && leaseTypeTitle) {
      navigation.navigate('LeaseDetailView', { leaseTypeId, leaseTypeTitle, propertyId });
    } else {
      navigation.navigate('LeaseTypeDetails', { propertyId: propertyId || '', selectedLeaseType: undefined });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Lease Application</Text>
      </View>
      <View style={styles.content}>
        <Ionicons name="document-text-outline" size={64} color={colors.primary} style={styles.icon} />
        <Text style={styles.heading}>Apply for lease</Text>
        <Text style={styles.subtext}>
          You will be taken to lease type details to choose terms and submit your application.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleProceed} activeOpacity={0.9}>
          <Text style={styles.primaryBtnText}>Continue to application</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { marginRight: spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  content: { flex: 1, padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  icon: { marginBottom: spacing.xl },
  heading: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  subtext: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.surface },
});
