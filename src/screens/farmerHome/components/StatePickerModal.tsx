/**
 * Bottom-sheet state picker for the Schemes & Subsidies "State Schemes"
 * category — mirrors LanguagePickerModal's layout/interaction pattern.
 */
import React, { useCallback } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { STATE_SCHEMES } from '../constants/schemeCatalog';

interface Props {
  visible: boolean;
  selected: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}

export function StatePickerModal({ visible, selected, onSelect, onClose }: Props) {
  const select = useCallback(
    (key: string) => {
      onSelect(key);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.heading}>Choose your state</Text>

        {Object.entries(STATE_SCHEMES).map(([key, group]) => {
          const active = key === selected;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.row, active && styles.rowActive]}
              activeOpacity={0.8}
              onPress={() => select(key)}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{group.label}</Text>
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
    maxHeight: '80%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D7E2DB',
    marginBottom: 14,
  },
  heading: { fontSize: 18, fontWeight: '800', color: '#0D1509', marginBottom: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    marginBottom: 10,
  },
  rowActive: { backgroundColor: '#E4F4EC', borderColor: '#1A6B3A' },
  label: { fontSize: 15, fontWeight: '700', color: '#1C2E18' },
  labelActive: { color: '#0F4A28' },
});
