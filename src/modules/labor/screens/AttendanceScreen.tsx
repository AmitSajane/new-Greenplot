import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';
import { AttendanceRow } from '../components';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttendance, markAttendance } from '../redux';
import { LaborRootState } from '../redux/store';
import { AttendanceRecord } from '../types';

export default function AttendanceScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { records, totalPayable } = useSelector((s: LaborRootState) => s.attendance);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAttendance(selectedJobId || undefined) as any);
  }, [dispatch, selectedJobId]);

  const handleToggle = async (record: AttendanceRecord, present: boolean) => {
    const wageAmount = present ? (record.wageAmount || 450) : 0;
    try {
      await dispatch(
        markAttendance({
          recordId: record.id,
          present,
          wageAmount,
        }) as any
      ).unwrap();
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Attendance</Text>
      </View>
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Payable</Text>
        <Text style={styles.totalAmount}>₹{totalPayable}</Text>
      </View>
      <FlatList
        data={records}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AttendanceRow
            record={item}
            onToggle={(present) => handleToggle(item, present)}
            editable={true}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No attendance records</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { padding: spacing.xs, marginRight: spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  totalCard: {
    margin: spacing.xl,
    padding: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.xs,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  list: { padding: spacing.xl, paddingBottom: spacing.xxl },
  empty: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
