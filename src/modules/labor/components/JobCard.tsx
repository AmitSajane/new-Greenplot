import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';
import { Job } from '../types';

export interface JobCardProps {
  job: Job;
  distanceKm?: number;
  onApply?: () => void;
  onCall?: () => void;
  onViewLocation?: () => void;
  showApply?: boolean;
}

const statusStyles: Record<string, object> = {
  open: { backgroundColor: colors.softGreen },
  in_progress: { backgroundColor: colors.softOrange },
  completed: { backgroundColor: colors.softBlue },
  cancelled: { backgroundColor: colors.border },
};

function getStatusStyle(status: string) {
  return statusStyles[status] || statusStyles.open;
}

export function JobCard({
  job,
  distanceKm,
  onApply,
  onCall,
  onViewLocation,
  showApply = true,
}: JobCardProps) {
  const handleCall = () => {
    if (onCall) onCall();
    else Linking.openURL(`tel:+919876543210`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.farmName}>{job.farmName}</Text>
        <View style={[styles.statusBadge, getStatusStyle(job.status)]}>
          <Text style={styles.statusText}>{job.status.replace('_', ' ')}</Text>
        </View>
      </View>
      <Text style={styles.workType}>{job.workType} • {job.cropType}</Text>
      <View style={styles.row}>
        <Ionicons name="cash-outline" size={16} color={colors.primary} />
        <Text style={styles.wage}>₹{job.wagePerDay}/day</Text>
        {distanceKm != null && (
          <>
            <Text style={styles.dot}>•</Text>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.distance}>{distanceKm.toFixed(1)} km</Text>
          </>
        )}
      </View>
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.date}>{new Date(job.workDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.workers}>
          {job.workersHired}/{job.workersNeeded} workers
        </Text>
      </View>
      {job.location.address && (
        <Text style={styles.address} numberOfLines={1}>
          {job.location.address}
        </Text>
      )}
      <View style={styles.actions}>
        {showApply && (
          <TouchableOpacity style={styles.applyBtn} onPress={onApply} activeOpacity={0.8}>
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.iconBtn} onPress={handleCall}>
          <Ionicons name="call-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onViewLocation}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  workType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  wage: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  dot: { color: colors.textMuted, fontSize: 12 },
  distance: { fontSize: 12, color: colors.textSecondary },
  date: { fontSize: 12, color: colors.textSecondary },
  workers: { fontSize: 12, color: colors.textSecondary },
  address: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },
  iconBtn: {
    padding: spacing.sm,
  },
});
