import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { useFarmListings } from '../../context/FarmListingsContext';
import { useAuth } from '../../context/AuthContext';
import { managementRequestsApi, ManagementRequestError } from '../../services/managementRequestsApi';
import type { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'ManagementRequestReview'>;
type Route = RouteProp<FarmerHomeStackParamList, 'ManagementRequestReview'>;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ManagementRequestReviewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const { farmId, draft } = route.params;
  const { getListingById } = useFarmListings();
  const { user } = useAuth();
  const farm = getListingById(farmId);

  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!farm || !user?.id || submitting) return;
    setSubmitting(true);
    try {
      const requestId = await managementRequestsApi.submitRequest({
        landId: farm.id,
        farmerId: user.id,
        ownerId: farm.ownerId,
        preferredCrop: draft.preferredCrop || undefined,
        farmingExperience: draft.farmingExperience,
        previousCrops: draft.previousCrops || undefined,
        preferredStartDate: draft.preferredStartDateIso,
        expectedDuration: draft.expectedDuration,
        farmerNotes: draft.farmerNotes || undefined,
      });
      navigation.replace('ManagementRequestSubmitted', { requestId });
    } catch (e) {
      setSubmitting(false);
      if (e instanceof ManagementRequestError && e.code === 'UNAVAILABLE') {
        Alert.alert('Sorry, this farm is no longer available for management.', undefined, [
          { text: 'OK', onPress: () => navigation.popToTop() },
        ]);
        return;
      }
      if (e instanceof ManagementRequestError && e.code === 'DUPLICATE') {
        Alert.alert('You already have an active management request for this farm.', undefined, [
          { text: 'Cancel', style: 'cancel' },
          e.existingRequestId
            ? {
                text: 'View Request',
                onPress: () => navigation.replace('ManagementRequestDetails', { requestId: e.existingRequestId! }),
              }
            : { text: 'OK' },
        ]);
        return;
      }
      const reason = e instanceof Error ? e.message : undefined;
      Alert.alert('Could not submit request', reason || 'Please check your connection and try again.');
    }
  }, [farm, user?.id, submitting, draft, navigation]);

  if (!farm) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Review Request" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Review Request" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Request Farm Management</Text>
        <View style={[styles.card, shadow.card]}>
          <Row label="Farm" value={farm.title} />
          <Row label="Location" value={`${farm.location}, ${farm.district}`} />
          <Row label="Area" value={farm.acresLabel || `${farm.acres} Acres`} />
          <Row label="Preferred Crop" value={draft.preferredCrop || 'Not decided yet'} />
          <Row label="Experience" value={draft.farmingExperience} />
          <Row label="Preferred Start Date" value={draft.preferredStartDateLabel} />
          <Row label="Expected Management Duration" value={draft.expectedDuration} />
          <Row label="Farmer Notes" value={draft.farmerNotes || '—'} />
        </View>

        <Text style={styles.disclaimer}>
          By submitting this request, you are requesting AgriArambh to review your suitability for managing this
          farm. Submission does not guarantee assignment.
        </Text>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setConfirmed(v => !v)} activeOpacity={0.7}>
          <View style={styles.checkbox}>
            {confirmed && <Ionicons name="checkmark" size={18} color={colors.primary} />}
          </View>
          <Text style={styles.checkboxText}>I confirm that the information provided is accurate.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, (!confirmed || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!confirmed || submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit Management Request'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  heading: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 13, color: colors.textSecondary, flexShrink: 0 },
  rowValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, flex: 1, textAlign: 'right' },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.xl,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: { flex: 1, fontSize: 13, color: colors.textPrimary },
  submitBtn: {
    backgroundColor: '#4ADE80',
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    ...shadow.card,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
});
