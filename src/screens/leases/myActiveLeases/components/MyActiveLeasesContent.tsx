import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../../theme/tokens';
import { Chip } from '../../../../components/farmerHome/Chip';
import { SearchBar } from '../../../../components/farmerHome/SearchBar';
import { LeaseCard } from '../../../../components/leases/LeaseCard';
import { MyActiveLeasesViewModel } from '../hooks/useMyActiveLeases';
import { myActiveLeasesStyles as styles } from '../styles/myActiveLeases.styles';

export const MyActiveLeasesContent: React.FC<MyActiveLeasesViewModel> = (vm) => (
  <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.header}>
      {vm.canGoBack ? (
        <TouchableOpacity onPress={vm.onBack} activeOpacity={0.7} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>My Active Leases</Text>
        <Text style={styles.headerSubtitle}>{vm.filtered.length} agreements</Text>
      </View>
      <TouchableOpacity onPress={vm.onOptionsPress} activeOpacity={0.7} style={styles.iconButton}>
        <Ionicons name="options-outline" size={20} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
    <View style={styles.content}>
      <SearchBar value={vm.query} onChangeText={vm.setQuery} />
      <View style={styles.filtersRow}>
        {vm.filterKeys.map((k) => (
          <Chip key={k} label={k} selected={vm.filter === k} onPress={() => vm.setFilter(k)} />
        ))}
      </View>
      <FlatList
        data={vm.filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <LeaseCard item={item} onPress={vm.onLeasePress} />
        )}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
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
    <TouchableOpacity activeOpacity={0.9} style={styles.fab} onPress={vm.onNewLeasePress}>
      <Ionicons name="add" size={20} color={colors.surface} />
      <Text style={styles.fabText}>New Lease</Text>
    </TouchableOpacity>
  </SafeAreaView>
);
