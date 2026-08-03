import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../theme/tokens';
import { ScreenHeader } from '../components/molecules/ScreenHeader';

const MOCK_APPLICATIONS = [
  { id: '1', propertyTitle: 'Fertile Wheat Land', status: 'pending', date: '2024-02-10', leaseType: 'Fixed Rent' },
  { id: '2', propertyTitle: 'Paddy Land', status: 'approved', date: '2024-01-28', leaseType: 'Share Cropping' },
  { id: '3', propertyTitle: 'Black Soil Land', status: 'rejected', date: '2024-02-01', leaseType: 'Revenue Share' },
];

export default function LeaseStatusScreen() {
  const navigation = useNavigation<any>();

  const getStatusColor = (status: string) => {
    if (status === 'approved') return colors.success;
    if (status === 'rejected') return colors.danger;
    return colors.warning;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Lease Status" onBack={() => navigation.goBack()} titleWeight="700" />
      <FlatList
        data={MOCK_APPLICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle}>{item.propertyTitle}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.leaseType}>{item.leaseType}</Text>
            <Text style={styles.date}>Applied: {item.date}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill },
  statusText: { fontSize: 12, fontWeight: '600' },
  leaseType: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  date: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
});
