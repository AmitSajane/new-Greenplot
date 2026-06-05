import { StyleSheet } from 'react-native';
import { colors, radius, spacing, shadow } from '../../../theme/tokens';

export const profileSetupStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  roleRow: { flexDirection: 'row', gap: spacing.md },
  roleGroup: { marginBottom: spacing.xl },
  roleLabel: { marginBottom: spacing.sm },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadow.card,
  },
  submitBtnDisabled: { opacity: 0.5 },
});
