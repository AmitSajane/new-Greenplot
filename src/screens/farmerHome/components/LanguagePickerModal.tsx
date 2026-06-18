/**
 * Bottom-sheet language picker. Switching language updates i18n (persisted to
 * AsyncStorage by the language detector) and, because the news/video hooks read
 * the current i18n language, immediately re-fetches news & videos in that language.
 */
import React, { useCallback } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AVAILABLE_LANGUAGES, loadLanguage } from '../../../localization/i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function LanguagePickerModal({ visible, onClose }: Props) {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const select = useCallback(
    (code: string) => {
      if (code !== current) loadLanguage(code);
      onClose();
    },
    [current, onClose],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.heading}>Choose language</Text>
        <Text style={styles.sub}>भाषा चुनें · ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ</Text>

        {Object.entries(AVAILABLE_LANGUAGES).map(([code, label]) => {
          const active = code === current;
          return (
            <TouchableOpacity
              key={code}
              style={[styles.row, active && styles.rowActive]}
              activeOpacity={0.8}
              onPress={() => select(code)}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
              {active && <Ionicons name="checkmark-circle" size={22} color="#1A6B3A" />}
            </TouchableOpacity>
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D7E2DB',
    marginBottom: 14,
  },
  heading: { fontSize: 20, fontWeight: '800', color: '#0D1509' },
  sub: { fontSize: 14, color: '#6B8074', marginTop: 2, marginBottom: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    marginBottom: 10,
  },
  rowActive: { backgroundColor: '#E4F4EC', borderColor: '#1A6B3A' },
  label: { fontSize: 17, fontWeight: '700', color: '#1C2E18' },
  labelActive: { color: '#0F4A28' },
});
