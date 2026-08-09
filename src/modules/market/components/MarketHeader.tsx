import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { market, mTypography, mRadius } from '../theme/marketTokens';

interface Props {
  eyebrow?: string;
  title: string;
  badge?: string;
  rightLabel?: string;
  rightValue?: string;
  onBack?: () => void;
  colors?: string[];
  children?: React.ReactNode;
}

/** Dark-green gradient header used across every Market screen. */
export default function MarketHeader({
  eyebrow,
  title,
  badge,
  rightLabel,
  rightValue,
  onBack,
  colors = [market.g1, market.g2, market.g3],
  children,
}: Props) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.inner}>
          <View style={styles.row}>
            <View style={styles.left}>
              {onBack && (
                <TouchableOpacity onPress={onBack} style={styles.back} hitSlop={10}>
                  <Ionicons name="arrow-back" size={25} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              )}
              <View style={styles.titleContent}>
                {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
                <Text style={styles.title}>{title}</Text>
                {!!badge && (
                  <View style={styles.badge}>
                    <Ionicons name="ellipse" size={9} color={market.g6} />
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                )}
              </View>
            </View>
            {!!rightValue && (
              <View style={styles.rightBox}>
                <Text style={styles.rightLabel}>{rightLabel}</Text>
                <Text style={styles.rightValue}>{rightValue}</Text>
              </View>
            )}
          </View>
          {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  inner: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  left: { flexDirection: 'row', flex: 1, alignItems: 'flex-start' },
  titleContent: { flex: 1 },
  back: { marginRight: 8, marginTop: 2 },
  eyebrow: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: mTypography.small,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  title: { fontSize: mTypography.heading, fontWeight: '700', color: '#fff', lineHeight: 26 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: 'rgba(78,175,122,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(78,175,122,0.45)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginTop: 6,
  },
  badgeText: { fontSize: mTypography.small, fontWeight: '600', color: market.g6 },
  rightBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: mRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  rightLabel: {
    fontSize: mTypography.caption,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    marginBottom: 2,
  },
  rightValue: { fontSize: mTypography.body, color: '#fff', fontWeight: '600' },
});
