import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../../theme/tokens';

export const hubStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerRow: { marginBottom: spacing.lg },
  screenTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  screenSubtitle: { marginTop: spacing.xs, fontSize: 13, color: colors.textSecondary },
  horizontalList: { paddingBottom: spacing.sm },
  techCard: { marginTop: spacing.sm },
  questionWrapper: { marginBottom: spacing.lg },
  createPostButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  createPostText: { fontSize: 16, fontWeight: '700', color: colors.surface },
  seeMoreButton: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  seeMoreText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
});
