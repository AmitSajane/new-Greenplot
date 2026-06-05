import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../../theme/tokens';

export const farmerHomeStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroTitleSpacer: { height: spacing.md },
  sectionGap: { height: spacing.lg },
});
