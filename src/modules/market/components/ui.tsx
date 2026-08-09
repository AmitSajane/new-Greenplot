import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { market, mTypography, mRadius } from '../theme/marketTokens';
import { useTranslation } from 'react-i18next';

/** White rounded card with subtle border — the base surface across screens. */
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Uppercase muted section label, with optional right-aligned action text. */
export function SectionLabel({ label, action }: { label: string; action?: string }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {!!action && <Text style={styles.action}>{action}</Text>}
    </View>
  );
}

/** Chart container with a title + sub-line. */
export function ChartCard({
  title,
  sub,
  children,
  ai,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  ai?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <View style={styles.chartTitleRow}>
        <Text style={styles.chartTitle}>{title}</Text>
        {ai && (
          <View style={styles.aiPill}>
            <Text style={styles.aiPillText}>{t('market.common.ai')}</Text>
          </View>
        )}
      </View>
      {!!sub && <Text style={styles.chartSub}>{sub}</Text>}
      {children}
    </Card>
  );
}

/** Chart legend item. */
export function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legItem}>
      <View style={[styles.legLine, { backgroundColor: color }]} />
      <Text style={styles.legText}>{label}</Text>
    </View>
  );
}

/** 2-up stat tile used in quick-stats grids. */
export function StatTile({
  label,
  value,
  sub,
  valueColor,
  subColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  subColor?: string;
}) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
      {!!sub && <Text style={[styles.statSub, subColor ? { color: subColor } : null]}>{sub}</Text>}
    </View>
  );
}

/** Horizontal progress bar with header label + value (demand drivers etc.). */
export function ProgressRow({
  label,
  value,
  pct,
  color,
  last,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.progressRow, last && { marginBottom: 0 }]}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={[styles.progressValue, { color }]}>{value}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: market.white,
    borderWidth: 1,
    borderColor: market.n7,
    borderRadius: mRadius.md,
    padding: 13,
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: {
    fontSize: mTypography.small,
    fontWeight: '600',
    color: market.n4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  action: { fontSize: mTypography.small, fontWeight: '500', color: market.g3 },
  chartTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { fontSize: mTypography.caption, fontWeight: '600', color: market.n2, marginBottom: 2 },
  chartSub: { fontSize: mTypography.small, color: market.n4, marginBottom: 10 },
  aiPill: {
    backgroundColor: market.aiPurpleBg,
    borderWidth: 1,
    borderColor: market.aiPurpleBorder,
    borderRadius: mRadius.xs,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  aiPillText: { fontSize: mTypography.caption, fontWeight: '600', color: market.aiPurpleText },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 12 },
  legLine: { width: 16, height: 2, borderRadius: 1 },
  legText: { fontSize: mTypography.small, color: market.n4 },
  statTile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: market.white,
    borderWidth: 1,
    borderColor: market.n7,
    borderRadius: mRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  statLabel: { fontSize: mTypography.small, color: market.n4, fontWeight: '500', marginBottom: 3 },
  statValue: { fontSize: mTypography.title, fontWeight: '700', color: market.n1 },
  statSub: { fontSize: mTypography.small, marginTop: 2, color: market.n4 },
  progressRow: { marginBottom: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { fontSize: mTypography.body, fontWeight: '500', color: market.n2 },
  progressValue: { fontSize: mTypography.body, fontWeight: '700' },
  progressTrack: { height: 5, backgroundColor: market.n7, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },
});
