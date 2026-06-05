import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { colors, spacing } from '../../../theme/tokens';
import { LaborDashboardCard } from '../components';
import { LaborConnectStackParamList } from '../navigation/LaborConnectStack';
import { fetchJobs, fetchApplications } from '../redux';

type NavigationProp = NativeStackNavigationProp<LaborConnectStackParamList, 'LaborDashboard'>;

export default function LaborDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchJobs('F001') as any);
    dispatch(fetchApplications({ farmerId: 'F001' }) as any);
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Labor Connect</Text>
        <Text style={styles.subtitle}>Connect with farm workers</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsRow}>
          <LaborDashboardCard
            title="Nearby Jobs"
            icon="location-outline"
            tint="green"
            onPress={() => navigation.navigate('JobList')}
          />
          <LaborDashboardCard
            title="Applied Jobs"
            icon="document-text-outline"
            tint="blue"
            onPress={() => navigation.navigate('Applications')}
          />
          <LaborDashboardCard
            title="Earnings"
            icon="cash-outline"
            tint="orange"
            onPress={() => navigation.navigate('PaymentSummary')}
          />
        </View>
        <View style={styles.grid}>
          <LaborDashboardCard
            title="Post Work"
            icon="add-circle-outline"
            tint="green"
            onPress={() => navigation.navigate('PostJob')}
          />
          <LaborDashboardCard
            title="Find Labor"
            icon="people-outline"
            tint="blue"
            onPress={() => navigation.navigate('FindLaborMap')}
          />
          <LaborDashboardCard
            title="My Jobs"
            icon="briefcase-outline"
            tint="orange"
            onPress={() => navigation.navigate('MyJobs')}
          />
          <LaborDashboardCard
            title="Applications"
            icon="document-text-outline"
            tint="purple"
            onPress={() => navigation.navigate('Applications')}
          />
          <LaborDashboardCard
            title="Attendance"
            icon="checkmark-done-outline"
            tint="green"
            onPress={() => navigation.navigate('Attendance')}
          />
          <LaborDashboardCard
            title="Browse Jobs"
            icon="search-outline"
            tint="blue"
            onPress={() => navigation.navigate('JobList')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    columnGap: spacing.sm,
    rowGap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.lg,
    columnGap: spacing.sm,
  },
});
