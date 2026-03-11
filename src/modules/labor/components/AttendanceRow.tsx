import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../../theme/tokens';
import { AttendanceRecord } from '../types';

export interface AttendanceRowProps {
  record: AttendanceRecord;
  onToggle: (present: boolean) => void;
  editable?: boolean;
}

export function AttendanceRow({
  record,
  onToggle,
  editable = true,
}: AttendanceRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{record.laborName}</Text>
        <Text style={styles.date}>
          {new Date(record.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.wage, !record.present && styles.wageZero]}>
          ₹{record.wageAmount}
        </Text>
        {editable ? (
          <Switch
            value={record.present}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.softGreen }}
            thumbColor={record.present ? colors.primary : colors.textMuted}
          />
        ) : (
          <Text style={[styles.status, record.present ? styles.present : styles.absent]}>
            {record.present ? 'Present' : 'Absent'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  info: {},
  name: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  date: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  wage: { fontSize: 15, fontWeight: '700', color: colors.primary },
  wageZero: { color: colors.textMuted },
  status: { fontSize: 12, fontWeight: '600' },
  present: { color: colors.success },
  absent: { color: colors.danger },
});
