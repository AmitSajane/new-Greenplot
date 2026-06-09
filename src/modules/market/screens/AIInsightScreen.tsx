import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, MarketHeader } from '../components';
import { market, mRadius } from '../theme/marketTokens';
import { AI_INSIGHT_TEXT, MOCK_AI_ACTIONS } from '../mockData';

export default function AIInsightScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <MarketHeader eyebrow="✦ AI Market Intelligence" title="AI insight" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Hero AI card */}
        <View style={styles.aiCard}>
          <View style={styles.aiHead}>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>✦ AI Market Intelligence</Text>
            </View>
            <View style={styles.aiConf}>
              <Text style={styles.aiConfText}>87% confidence</Text>
            </View>
          </View>
          <Text style={styles.aiText}>"{AI_INSIGHT_TEXT}"</Text>
          <Text style={styles.aiFootnote}>
            Based on: APMC history · Satellite crop maps · Weather · National arrivals
          </Text>
        </View>

        {/* Recommended actions */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recommended actions</Text>
          {MOCK_AI_ACTIONS.map(a => (
            <View key={a.title} style={styles.action}>
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>{a.title}</Text>
                <Text style={styles.actionText}>{a.text}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Model details */}
        <View style={styles.modelWrap}>
          <Card>
            <Text style={styles.modelLabel}>Model details</Text>
            {[
              ['Algorithm', 'Prophet + XGBoost', market.n2],
              ['Accuracy', '84% (backtested)', market.g2],
              ['Refreshed', 'Every 30 min', market.n2],
            ].map(([k, v, c], i) => (
              <View key={k} style={[styles.modelRow, i === 2 && { borderBottomWidth: 0 }]}>
                <Text style={styles.modelKey}>{k}</Text>
                <Text style={[styles.modelVal, { color: c }]}>{v}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: market.n8 },
  aiCard: {
    backgroundColor: market.g1,
    borderRadius: mRadius.md,
    padding: 14,
    margin: 14,
    overflow: 'hidden',
  },
  aiHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  aiBadge: {
    backgroundColor: 'rgba(77,175,122,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(77,175,122,0.4)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  aiBadgeText: { fontSize: 10, fontWeight: '600', color: market.g6 },
  aiConf: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  aiConfText: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  aiText: {
    fontStyle: 'italic',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 21,
    marginBottom: 10,
  },
  aiFootnote: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 7,
  },
  section: { paddingHorizontal: 14 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: market.n4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  action: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: market.g1,
    borderRadius: mRadius.sm,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginBottom: 6,
  },
  actionIcon: { fontSize: 16 },
  actionTitle: { fontSize: 11, fontWeight: '600', color: '#fff', marginBottom: 2 },
  actionText: { fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 16 },
  modelWrap: { paddingHorizontal: 14, paddingTop: 10 },
  modelLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: market.n4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: market.n8,
  },
  modelKey: { fontSize: 11, color: market.n4 },
  modelVal: { fontSize: 11, fontWeight: '500' },
});
