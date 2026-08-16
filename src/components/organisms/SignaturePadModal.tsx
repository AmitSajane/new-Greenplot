import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { colors, radius, spacing } from '../../theme/tokens';

interface Props {
  visible: boolean;
  /** e.g. "Accept & Sign — Lease with Ramesh K." */
  title?: string;
  saving?: boolean;
  onCancel: () => void;
  /** Fires with a full "data:image/png;base64,…" PNG once the farmer taps Save. */
  onSave: (dataUri: string) => void;
}

// Hide the library's own confirm/clear/undo footer (HTML rendered inside its
// internal WebView) — we drive it entirely via our own RN buttons + the ref's
// imperative API instead, so it matches the rest of the app's UI.
const HIDE_DEFAULT_FOOTER = `.m-signature-pad--footer { display: none; margin: 0; }
  body,html { background-color: #fff; }`;

/** Full-screen "draw your signature" pad used when a farmer accepts a lease
 * agreement. Wraps react-native-signature-canvas (WebView-based — no native
 * module, no rebuild needed) with the app's own header/footer chrome. */
export function SignaturePadModal({ visible, title, saving, onCancel, onSave }: Props) {
  const padRef = useRef<SignatureViewRef>(null);
  const [empty, setEmpty] = useState(true);

  const handleClear = () => {
    padRef.current?.clearSignature();
    setEmpty(true);
  };

  // readSignature() asks the pad to emit its current content via onOK/onEmpty.
  const handleSavePress = () => padRef.current?.readSignature();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} hitSlop={8} disabled={saving}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title || 'Sign to accept'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.hint}>Sign in the box below with your finger</Text>

        <View style={styles.padBox}>
          <SignatureScreen
            ref={padRef}
            webStyle={HIDE_DEFAULT_FOOTER}
            penColor={colors.textPrimary}
            backgroundColor="#fff"
            onOK={onSave}
            onEmpty={() => setEmpty(true)}
            onBegin={() => setEmpty(false)}
            autoClear={false}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear} disabled={saving}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, (empty || saving) && styles.saveBtnDisabled]}
            onPress={handleSavePress}
            disabled={empty || saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Use this signature</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginHorizontal: spacing.sm },
  hint: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: spacing.md },
  padBox: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  clearBtn: {
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
