import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../../theme/tokens';
import { AppHeader } from '../../../../components/molecules/AppHeader';
import { LANGUAGE_SHORT_LABELS } from '../../../../localization/i18n';
import { LanguagePickerModal } from '../../../farmerHome/components/LanguagePickerModal';
import { Chip } from '../../../../components/farmerHome/Chip';
import { SearchBar } from '../../../../components/molecules/SearchBar';
import { LeaseCard } from '../../../../components/leases/LeaseCard';
import { MyActiveLeasesViewModel } from '../hooks/useMyActiveLeases';
import { myActiveLeasesStyles as styles } from '../styles/myActiveLeases.styles';

export const MyActiveLeasesContent: React.FC<MyActiveLeasesViewModel> = (vm) => {
  const [langOpen, setLangOpen] = useState(false);
  const { i18n } = useTranslation();
  const languageShort = LANGUAGE_SHORT_LABELS[i18n.language] || 'EN';

  return (
  <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
    <AppHeader
      data={{
        variant: 'default',
        title: 'My Active Leases',
        subtitle: `${vm.filtered.length} agreements`,
        // showBack: vm.canGoBack,
        languageShort,
        name: vm.userName,
      }}
      handler={{
       // onBackPress: vm.onBack,
        onProfilePress: vm.onProfilePress,
        onLanguagePress: () => setLangOpen(true),
        onNotificationPress: vm.onNotificationPress,
      }}
    />
    <View style={styles.content}>
      <SearchBar
        value={vm.query}
        onChangeText={vm.setQuery}
        trailingAction={{ icon: 'mic' }}
      />
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

    <LanguagePickerModal visible={langOpen} onClose={() => setLangOpen(false)} />
  </SafeAreaView>
  );
};
