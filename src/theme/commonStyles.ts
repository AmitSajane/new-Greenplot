import { StyleSheet } from 'react-native';
import { colors, spacing } from './tokens';

/**
 * Shared style shapes pulled out of the ~60 screens that were each
 * redeclaring the same `safeArea`/`scrollContent`/header-button/row objects
 * locally. Meant to be spread into a screen's own StyleSheet, e.g.:
 *
 *   const styles = StyleSheet.create({
 *     safeArea: commonStyles.safeArea,
 *     header: { ...commonStyles.row, paddingHorizontal: spacing.lg },
 *   });
 *
 * or merged inline via a style array when a screen needs to override one
 * property: `style={[commonStyles.safeArea, { backgroundColor: '#fff' }]}`.
 */
export const commonStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
