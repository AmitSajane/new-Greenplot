import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { market, mTypography, mRadius } from '../theme/marketTokens';
import { AlertType } from '../types';

interface Props {
  type: AlertType;
  title: string;
  subtitle: string;
}

const meta: Record<AlertType, { bg: string; border: string; icon: string; iconColor: string; titleColor: string; subColor: string }> = {
  crash: { bg: market.r5, border: market.r4, icon: 'trending-down', iconColor: market.r2, titleColor: market.r1, subColor: market.r2 },
  oversupply: { bg: market.a7, border: market.a6, icon: 'warning', iconColor: market.a2, titleColor: market.a1, subColor: market.a2 },
  rising: { bg: market.g7, border: market.g6, icon: 'trending-up', iconColor: market.g2, titleColor: market.g1, subColor: market.g3 },
  govt: { bg: market.b5, border: market.b4, icon: 'business', iconColor: market.b2, titleColor: market.b1, subColor: market.b2 },
  buyer: { bg: market.g7, border: market.g6, icon: 'people', iconColor: market.g2, titleColor: market.g1, subColor: market.g3 },
};

/** Compact horizontal alert chip used in the home alert strip. */
export default function AlertCard({ type, title, subtitle }: Props) {
  const m = meta[type];
  return (
    <View style={[styles.card, { backgroundColor: m.bg, borderColor: m.border }]}>
      <Ionicons name={m.icon} size={16} color={m.iconColor} />
      <View style={{ flexShrink: 1 }}>
        <Text style={[styles.title, { color: m.titleColor }]}>{title}</Text>
        <Text style={[styles.sub, { color: m.subColor }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: mRadius.sm,
    paddingHorizontal: 11,
    paddingVertical: 8,
    minWidth: 170,
  },
  title: { fontSize: mTypography.body, fontWeight: '600', lineHeight: 15 },
  sub: { fontSize: mTypography.small, lineHeight: 14, marginTop: 1 },
});
