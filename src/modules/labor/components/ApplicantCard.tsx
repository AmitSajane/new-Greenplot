import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';
import { Application } from '../types';

export interface ApplicantCardProps {
  application: Application;
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
}

function haversine(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const JOB_LOC = { lat: 16.5909, lng: 74.9171 };

export function ApplicantCard({
  application,
  onAccept,
  onReject,
  disabled = false,
}: ApplicantCardProps) {
  const { labor, job } = application;
  const distance = haversine(
    JOB_LOC.lat, JOB_LOC.lng,
    labor.location.latitude, labor.location.longitude
  );

  if (application.status !== 'pending') {
    return (
      <View style={[styles.card, styles.disabled]}>
        <Text style={styles.name}>{labor.name}</Text>
        <Text style={styles.skills}>{labor.skills.join(', ')}</Text>
        <View style={styles.statusRow}>
          <Text style={[styles.statusText, application.status === 'accepted' ? styles.accepted : styles.rejected]}>
            {application.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{labor.name}</Text>
          <Text style={styles.exp}>{labor.experienceYears} yrs exp</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.rating}>{labor.rating}</Text>
        </View>
      </View>
      <Text style={styles.skills}>{labor.skills.join(', ')}</Text>
      <View style={styles.row}>
        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.distance}>{distance.toFixed(1)} km away</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.wage}>Expects ₹{labor.wageExpected}/day</Text>
      </View>
      {application.message && (
        <Text style={styles.message} numberOfLines={2}>{application.message}</Text>
      )}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.acceptBtn, disabled && styles.btnDisabled]}
          onPress={onAccept}
          disabled={disabled}
        >
          <Text style={styles.acceptBtnText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rejectBtn, disabled && styles.btnDisabled]}
          onPress={onReject}
          disabled={disabled}
        >
          <Text style={styles.rejectBtnText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => Linking.openURL(`tel:${labor.phone.replace(/\s/g, '')}`)}
        >
          <Ionicons name="call-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  disabled: { opacity: 0.7 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  exp: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  rating: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  skills: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  distance: { fontSize: 12, color: colors.textSecondary },
  dot: { color: colors.textMuted, fontSize: 12 },
  wage: { fontSize: 12, fontWeight: '600', color: colors.primary },
  message: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  statusRow: { marginTop: spacing.sm },
  statusText: { fontSize: 14, fontWeight: '600' },
  accepted: { color: colors.success },
  rejected: { color: colors.danger },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  acceptBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  acceptBtnText: { fontSize: 14, fontWeight: '600', color: colors.surface },
  rejectBtn: {
    backgroundColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  rejectBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  callBtn: { padding: spacing.sm },
  btnDisabled: { opacity: 0.5 },
});
