import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';
import { Chip } from '../../components/farmerHome/Chip';
import { SearchBar } from '../../components/farmerHome/SearchBar';
import { LeaseCard, LeaseListItem, LeaseStatus } from '../../components/leases/LeaseCard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';
import { MyLeasesStackParamList } from '../../navigation/MyLeasesStack';

type Props = NativeStackScreenProps<
  FarmerHomeStackParamList | MyLeasesStackParamList,
  'MyActiveLeases'
>;

const LEASES: LeaseListItem[] = [
  {
    id: 'la1',
    title: 'Lease with Suresh',
    ownerName: 'Suresh Kumar',
    locationLabel: 'Kasba, Purnea',
    acresLabel: '5 Acres',
    rentLabel: '₹12k / year',
    status: 'Active',
    expiresInLabel: '20 days left',
    image: require('../../assets/images/farm1.png'),
  },
  {
    id: 'la2',
    title: 'Ramgarh Plot A',
    ownerName: 'Rajesh Singh',
    locationLabel: 'Ramgarh, Purnea',
    acresLabel: '2.5 Acres',
    rentLabel: '₹9k / year',
    status: 'Active',
    expiresInLabel: '3 months left',
    image: require('../../assets/images/cultivated-field.jpg'),
  },
  {
    id: 'la3',
    title: 'Sitapur Farm (Draft)',
    ownerName: 'Amit Kumar',
    locationLabel: 'Sitapur',
    acresLabel: '5 Acres',
    rentLabel: '₹30k / year',
    status: 'Pending',
    image: require('../../assets/images/farm2.png'),
  },
];

type FilterKey = 'All' | LeaseStatus;

export default function MyActiveLeasesScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<FilterKey>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LEASES.filter((l) => {
      if (filter !== 'All' && l.status !== filter) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.ownerName.toLowerCase().includes(q) ||
        l.locationLabel.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Active Leases</Text>
          <Text style={styles.headerSubtitle}>{filtered.length} agreements</Text>
        </View>
        <TouchableOpacity
          onPress={() => {}}
          activeOpacity={0.7}
          style={styles.iconButton}
        >
          <Ionicons name="options-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <SearchBar value={query} onChangeText={setQuery} />

        <View style={styles.filtersRow}>
          {(['All', 'Active', 'Pending', 'Expired'] as FilterKey[]).map((k) => (
            <Chip
              key={k}
              label={k}
              selected={filter === k}
              onPress={() => setFilter(k)}
            />
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <LeaseCard
              item={item}
              onPress={() => navigation.navigate('AgreementDetails')}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={44} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No leases found</Text>
              <Text style={styles.emptySubtitle}>Try changing filters or search terms.</Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity activeOpacity={0.9} style={styles.fab} onPress={() => {}}>
        <Ionicons name="add" size={20} color={colors.surface} />
        <Text style={styles.fabText}>New Lease</Text>
      </TouchableOpacity>
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerCenter: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xxl + 80,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 10,
  },
  fabText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.surface,
  },
});

