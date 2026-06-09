import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  CropRec,
  FertilizerStep,
  Rating,
  SoilMetric,
  SoilReport as SoilReportData,
  StepTone,
} from '../../utils/soil/soilAdvisor';

const palette = {
  green: { bg: '#E4F4EC', fg: '#1A6B3A', strong: '#0F4A28' },
  amber: { bg: '#FDF5E0', fg: '#B87214', strong: '#8A5200' },
  red: { bg: '#FDECEC', fg: '#C02828', strong: '#6B1212' },
  blue: { bg: '#E7F0FF', fg: '#1A5299', strong: '#0B2D5C' },
  neutral: { bg: '#EEF2F0', fg: '#3A5040', strong: '#1C2E18' },
};

const ratingTone: Record<Rating, keyof typeof palette> = {
  good: 'green',
  medium: 'amber',
  low: 'amber',
  danger: 'red',
};
const healthColor = { green: palette.green, amber: palette.amber, red: palette.red };

// ── metric row ──────────────────────────────────────────────────────────────

const MetricRow = React.memo(({ item, isLast }: { item: SoilMetric; isLast: boolean }) => {
  const c = palette[ratingTone[item.rating]];
  return (
    <View style={[styles.metric, isLast && styles.noBorder]}>
      <View style={[styles.metricIcon, { backgroundColor: c.bg }]}>
        <Ionicons name={item.icon} size={18} color={c.fg} />
      </View>
      <View style={styles.flex1}>
        <View style={styles.metricTop}>
          <Text style={styles.metricLabel}>{item.label}</Text>
          <View style={[styles.chip, { backgroundColor: c.bg }]}>
            <Text style={[styles.chipText, { color: c.fg }]}>{item.ratingLabel}</Text>
          </View>
        </View>
        <Text style={styles.metricValue}>{item.value}</Text>
        <Text style={styles.metricNote}>{item.note}</Text>
      </View>
    </View>
  );
});

// ── crop card ───────────────────────────────────────────────────────────────

const CropCard = React.memo(({ item }: { item: CropRec }) => {
  const best = item.fit === 'best';
  const c = best ? palette.green : palette.amber;
  return (
    <View style={styles.crop}>
      <Text style={styles.cropEmoji}>{item.emoji}</Text>
      <View style={styles.flex1}>
        <View style={styles.cropTop}>
          <Text style={styles.cropName}>{item.name}</Text>
          <View style={[styles.chip, { backgroundColor: c.bg }]}>
            <Text style={[styles.chipText, { color: c.fg }]}>{best ? '★ Best' : 'Good'}</Text>
          </View>
        </View>
        <Text style={styles.cropTip}>{item.tip}</Text>
      </View>
    </View>
  );
});

// ── fertilizer step ─────────────────────────────────────────────────────────

const FertStep = React.memo(({ item, index, isLast }: { item: FertilizerStep; index: number; isLast: boolean }) => {
  const c = palette[item.tone as StepTone];
  return (
    <View style={styles.step}>
      <View style={styles.stepRail}>
        <View style={[styles.stepDot, { backgroundColor: c.fg }]}>
          <Text style={styles.stepNum}>{index + 1}</Text>
        </View>
        {!isLast && <View style={styles.stepLine} />}
      </View>
      <View style={[styles.stepCard, { borderColor: c.bg }]}>
        <View style={styles.stepHead}>
          <Ionicons name={item.icon} size={16} color={c.fg} />
          <Text style={styles.stepTitle}>{item.title}</Text>
        </View>
        <View style={styles.stepProductRow}>
          <Text style={styles.stepProduct}>{item.product}</Text>
          <View style={[styles.chip, { backgroundColor: c.bg }]}>
            <Text style={[styles.chipText, { color: c.fg }]}>{item.dose}</Text>
          </View>
        </View>
        <View style={styles.stepMetaRow}>
          <Ionicons name="time-outline" size={12} color="#6B8074" />
          <Text style={styles.stepTiming}>{item.timing}</Text>
        </View>
        <Text style={styles.stepWhy}>{item.why}</Text>
      </View>
    </View>
  );
});

// ── section title ───────────────────────────────────────────────────────────

const SectionTitle = React.memo(({ icon, title, sub }: { icon: string; title: string; sub?: string }) => (
  <View style={styles.sectionTitleWrap}>
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={18} color="#1A6B3A" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {!!sub && <Text style={styles.sectionSub}>{sub}</Text>}
  </View>
));

// ── main report ─────────────────────────────────────────────────────────────

function SoilReportViewBase({ report }: { report: SoilReportData }) {
  const hc = healthColor[report.healthTone];
  return (
    <View>
      {/* Soil health score hero */}
      <View style={[styles.hero, { backgroundColor: hc.bg, borderColor: hc.fg }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>SOIL HEALTH SCORE</Text>
            <Text style={[styles.heroScore, { color: hc.strong }]}>
              {report.healthScore}
              <Text style={styles.heroScoreMax}>/100</Text>
            </Text>
            <View style={[styles.chip, styles.heroChip, { backgroundColor: hc.fg }]}>
              <Text style={styles.heroChipText}>{report.healthLabel}</Text>
            </View>
          </View>
          <View style={[styles.heroBadge, { borderColor: hc.fg }]}>
            <Ionicons name="leaf" size={30} color={hc.fg} />
          </View>
        </View>
        <View style={styles.heroBarTrack}>
          <View style={[styles.heroBarFill, { width: `${report.healthScore}%`, backgroundColor: hc.fg }]} />
        </View>
      </View>

      {/* AI summary */}
      <View style={styles.aiCard}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>✦ AI SOIL ADVISOR</Text>
        </View>
        <Text style={styles.aiText}>{report.aiSummary}</Text>
      </View>

      {/* Soil type */}
      <SectionTitle icon="layers" title="Your soil type" />
      <View style={styles.card}>
        <View style={styles.typeRow}>
          <View style={styles.typeIcon}>
            <Ionicons name="globe" size={26} color="#0F4A28" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.typeName}>{report.textureClass}</Text>
            <Text style={styles.typeFao}>FAO group: {report.faoClass}</Text>
          </View>
        </View>
        <Text style={styles.typeSummary}>{report.textureSummary}</Text>
        <View style={styles.traitRow}>
          {report.textureTraits.map(tr => (
            <View key={tr} style={styles.traitChip}>
              <Text style={styles.traitText}>{tr}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Metrics */}
      <SectionTitle icon="analytics" title="Your soil report" sub="What each number means for your farm" />
      <View style={styles.card}>
        {report.metrics.map((m, i) => (
          <MetricRow key={m.key} item={m} isLast={i === report.metrics.length - 1} />
        ))}
      </View>

      {/* Best crops */}
      <SectionTitle icon="nutrition" title="Best crops for your soil" sub="Matched to your soil type & pH" />
      <View style={styles.card}>
        {report.crops.map(c => (
          <CropCard key={c.name} item={c} />
        ))}
      </View>

      {/* Fertilizer guide */}
      <SectionTitle icon="flask" title="AI Fertilizer Guide" sub="What to apply, how much & when" />
      <View style={styles.steps}>
        {report.fertilizer.map((step, i) => (
          <FertStep key={step.title} item={step} index={i} isLast={i === report.fertilizer.length - 1} />
        ))}
      </View>

      {/* Amendments / tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Extra tips for better soil</Text>
        {report.amendments.map(a => (
          <View key={a} style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={15} color="#1A6B3A" />
            <Text style={styles.tipText}>{a}</Text>
          </View>
        ))}
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="information-circle" size={14} color="#6B8074" />
        <Text style={styles.disclaimerText}>{report.disclaimer}</Text>
      </View>
    </View>
  );
}

export const SoilReportView = React.memo(SoilReportViewBase);

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  noBorder: { borderBottomWidth: 0 },
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  chipText: { fontSize: 10, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8F0EC', borderRadius: 14, marginBottom: 14 },

  // Hero
  hero: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel: { fontSize: 10, fontWeight: '800', color: '#3A5040', letterSpacing: 0.5 },
  heroScore: { fontSize: 40, fontWeight: '900', lineHeight: 44 },
  heroScoreMax: { fontSize: 16, fontWeight: '700', color: '#6B8074' },
  heroChip: { alignSelf: 'flex-start', marginTop: 4, paddingVertical: 3 },
  heroChipText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  heroBadge: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  heroBarTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 4, marginTop: 14, overflow: 'hidden' },
  heroBarFill: { height: 8, borderRadius: 4 },

  // AI card
  aiCard: { backgroundColor: '#092E18', borderRadius: 14, padding: 14, marginBottom: 14 },
  aiBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(77,175,122,0.2)', borderWidth: 1, borderColor: 'rgba(77,175,122,0.4)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2, marginBottom: 8 },
  aiBadgeText: { fontSize: 9, fontWeight: '800', color: '#A8D8B8', letterSpacing: 0.3 },
  aiText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20, fontStyle: 'italic' },

  // Section title
  sectionTitleWrap: { marginBottom: 9 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1C2E18' },
  sectionSub: { fontSize: 11, color: '#6B8074', marginTop: 2, marginLeft: 24 },

  // Soil type
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderBottomWidth: 1, borderBottomColor: '#F4F8F5' },
  typeIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#E4F4EC', alignItems: 'center', justifyContent: 'center' },
  typeName: { fontSize: 16, fontWeight: '800', color: '#0F4A28' },
  typeFao: { fontSize: 11, color: '#6B8074', marginTop: 1 },
  typeSummary: { fontSize: 12, color: '#3A5040', lineHeight: 18, paddingHorizontal: 13, paddingTop: 11 },
  traitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 13, paddingTop: 9 },
  traitChip: { backgroundColor: '#F4F8F5', borderWidth: 1, borderColor: '#E8F0EC', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  traitText: { fontSize: 10, fontWeight: '600', color: '#3A5040' },

  // Metric
  metric: { flexDirection: 'row', gap: 11, padding: 13, borderBottomWidth: 1, borderBottomColor: '#F4F8F5' },
  metricIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  metricTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricLabel: { fontSize: 12, fontWeight: '700', color: '#1C2E18' },
  metricValue: { fontSize: 18, fontWeight: '800', color: '#0D1509', marginTop: 2 },
  metricNote: { fontSize: 11, color: '#6B8074', marginTop: 3, lineHeight: 16 },

  // Crop
  crop: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 13, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F4F8F5' },
  cropEmoji: { fontSize: 26 },
  cropTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cropName: { fontSize: 13, fontWeight: '700', color: '#1C2E18' },
  cropTip: { fontSize: 11, color: '#6B8074', marginTop: 2 },

  // Fertilizer steps
  steps: { marginBottom: 14 },
  step: { flexDirection: 'row', gap: 10 },
  stepRail: { alignItems: 'center', width: 26 },
  stepDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepNum: { color: '#fff', fontSize: 12, fontWeight: '800' },
  stepLine: { flex: 1, width: 2, backgroundColor: '#E8F0EC', marginVertical: 2 },
  stepCard: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  stepTitle: { fontSize: 12, fontWeight: '800', color: '#3A5040', textTransform: 'uppercase', letterSpacing: 0.3 },
  stepProductRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  stepProduct: { fontSize: 15, fontWeight: '800', color: '#0D1509', flexShrink: 1 },
  stepMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  stepTiming: { fontSize: 11, color: '#6B8074', fontWeight: '600' },
  stepWhy: { fontSize: 11, color: '#3A5040', lineHeight: 16, marginTop: 6 },

  // Tips
  tipsCard: { backgroundColor: '#E4F4EC', borderWidth: 1, borderColor: '#A8D8B8', borderRadius: 14, padding: 14, marginBottom: 12 },
  tipsTitle: { fontSize: 13, fontWeight: '800', color: '#0F4A28', marginBottom: 8 },
  tipRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 7 },
  tipText: { flex: 1, fontSize: 11, color: '#0F4A28', lineHeight: 16 },

  // Disclaimer
  disclaimer: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', paddingHorizontal: 4 },
  disclaimerText: { flex: 1, fontSize: 10, color: '#6B8074', lineHeight: 15 },
});
