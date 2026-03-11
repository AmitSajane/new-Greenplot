import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../../theme/tokens';
import { ApplicantCard } from '../components';
import { LaborConnectStackParamList } from '../navigation/LaborConnectStack';
import { fetchApplications, respondToApplication } from '../redux';
import { updateJobWorkers } from '../redux';
import { LaborRootState } from '../redux/store';
import { Application } from '../types';

type NavigationProp = NativeStackNavigationProp<LaborConnectStackParamList, 'Applications'>;

export default function ApplicationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { myJobApplications } = useSelector((s: LaborRootState) => s.application);

  useEffect(() => {
    dispatch(fetchApplications({ farmerId: 'F001' }) as any);
  }, [dispatch]);

  const pending = myJobApplications.filter((a) => a.status === 'pending');
  const others = myJobApplications.filter((a) => a.status !== 'pending');

  const handleAccept = async (app: Application) => {
    try {
      await dispatch(
        respondToApplication({
          applicationId: app.applicationId,
          status: 'accepted',
          jobId: app.jobId,
          incrementWorkers: true,
        }) as any
      ).unwrap();
      await dispatch(
        updateJobWorkers({
          jobId: app.jobId,
          workersHired: app.job.workersHired + 1,
        }) as any
      ).unwrap();
    } catch {}
  };

  const handleReject = async (app: Application) => {
    try {
      await dispatch(
        respondToApplication({
          applicationId: app.applicationId,
          status: 'rejected',
          jobId: app.jobId,
        }) as any
      ).unwrap();
    } catch {}
  };

  const allApps = [...pending, ...others];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Applications</Text>
        <Text style={styles.subtitle}>
          {pending.length} pending
        </Text>
      </View>
      <FlatList
        data={allApps}
        keyExtractor={(i) => i.applicationId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ApplicantCard
            application={item}
            onAccept={() => handleAccept(item)}
            onReject={() => handleReject(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No applications yet</Text>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    marginRight: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  subtitle: {
    marginLeft: 'auto',
    fontSize: 13,
    color: colors.textSecondary,
  },
  list: { padding: 16, paddingBottom: 32 },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
