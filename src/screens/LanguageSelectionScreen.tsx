import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing, shadow } from '../theme/tokens';
import { AVAILABLE_LANGUAGES, loadLanguage } from '../localization/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_OPTIONS = ['en', 'kn', 'hi', 'mr'] as const;

export default function LanguageSelectionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { i18n: translator } = useTranslation();
  const [selected, setSelected] = useState<string>(translator.language || 'en');
  const fromAuth = route.params?.fromAuth !== false;

  const handleSelect = async (lng: string) => {
    try {
      setSelected(lng);
      await loadLanguage(lng);
      try {
        await AsyncStorage.setItem('selectedLanguage', lng);
      } catch (e) {
        console.warn('Failed to save language preference', e);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const handleContinue = () => {
    if (fromAuth) navigation.replace('Welcome');
    else navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {!fromAuth ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : null}
        <Text style={styles.title}>Select Language</Text>
      </View>
      <View style={styles.list}>
        {LANGUAGE_OPTIONS.map(code => (
          <TouchableOpacity
            key={code}
            style={[styles.item, selected === code && styles.itemSelected]}
            onPress={() => handleSelect(code)}
          >
            <Text
              style={[styles.itemText, selected === code && styles.itemTextSelected]}
            >
              {AVAILABLE_LANGUAGES[code] || code}
            </Text>
            {selected === code && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
      {fromAuth && (
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.9}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      )}
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
  list: { padding: spacing.xl },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.softGreen,
  },
  itemText: { fontSize: 16, color: colors.textPrimary },
  itemTextSelected: { fontWeight: '700', color: colors.primary },
  continueBtn: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    ...shadow.card,
  },
  continueBtnText: { fontSize: 18, fontWeight: '700', color: colors.surface },
});
