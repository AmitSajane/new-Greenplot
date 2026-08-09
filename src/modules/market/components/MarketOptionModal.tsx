import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { market, mRadius, mSpacing, mTypography } from '../theme/marketTokens';

interface Props {
  visible: boolean;
  title: string;
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function MarketOptionModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return options;
    return options.filter(option => option.toLocaleLowerCase().includes(normalizedQuery));
  }, [options, query]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={market.n4} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholder={t('market.modal.search', { title })}
            placeholderTextColor={market.n5}
            autoCorrect={false}
          />
        </View>
        <FlatList
          data={filteredOptions}
          keyExtractor={item => item}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.empty}>{t('market.modal.empty')}</Text>}
          renderItem={({ item }) => {
            const active = item === selected;
            return (
              <TouchableOpacity
                style={[styles.option, active && styles.optionActive]}
                onPress={() => {
                  onSelect(item);
                  close();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{item}</Text>
                {active ? <Ionicons name="checkmark-circle" size={22} color={market.g3} /> : null}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    maxHeight: '72%',
    backgroundColor: market.white,
    borderTopLeftRadius: mRadius.xl,
    borderTopRightRadius: mRadius.xl,
    paddingHorizontal: mSpacing.xl,
    paddingTop: mSpacing.sm,
    paddingBottom: mSpacing.xxl,
  },
  handle: {
    width: 44,
    height: 5,
    alignSelf: 'center',
    borderRadius: 3,
    backgroundColor: market.n6,
    marginBottom: mSpacing.md,
  },
  title: { fontSize: mTypography.titleLarge, fontWeight: '800', color: market.n1 },
  searchBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: mSpacing.sm,
    borderWidth: 1,
    borderColor: market.n7,
    borderRadius: mRadius.md,
    paddingHorizontal: mSpacing.md,
    marginVertical: mSpacing.md,
  },
  searchInput: { flex: 1, fontSize: mTypography.body, color: market.n1 },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: market.n7,
    paddingHorizontal: mSpacing.sm,
  },
  optionActive: { backgroundColor: market.g7 },
  optionText: { flex: 1, fontSize: mTypography.body, color: market.n2 },
  optionTextActive: { color: market.g2, fontWeight: '700' },
  empty: { paddingVertical: mSpacing.xxl, textAlign: 'center', color: market.n4 },
});
