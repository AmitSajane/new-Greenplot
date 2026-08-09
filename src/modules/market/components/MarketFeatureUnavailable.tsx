import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import MarketHeader from './MarketHeader';
import { market, mRadius, mSpacing, mTypography } from '../theme/marketTokens';

interface Props {
  feature: string;
}

export default function MarketFeatureUnavailable({ feature }: Props) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  return (
    <View style={styles.screen}>
      <MarketHeader title={t(`market.features.${feature}.title`)} eyebrow={t('market.unavailable.eyebrow')} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.icon}><Ionicons name="server-outline" size={36} color={market.g3} /></View>
        <Text style={styles.title}>{t('market.unavailable.title')}</Text>
        <Text style={styles.description}>{t(`market.features.${feature}.description`)}</Text>
        <Text style={styles.note}>{t('market.unavailable.note')}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>{t('market.common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: market.n8 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: mSpacing.xxl },
  icon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: market.g7 },
  title: { fontSize: mTypography.title, color: market.n1, fontWeight: '800', textAlign: 'center', marginTop: mSpacing.lg },
  description: { fontSize: mTypography.body, color: market.n3, lineHeight: 21, textAlign: 'center', marginTop: mSpacing.sm },
  note: { fontSize: mTypography.small, color: market.n4, lineHeight: 19, textAlign: 'center', marginTop: mSpacing.md },
  button: { minHeight: 46, justifyContent: 'center', backgroundColor: market.g3, borderRadius: mRadius.sm, paddingHorizontal: mSpacing.xl, marginTop: mSpacing.xl },
  buttonText: { fontSize: mTypography.body, color: market.white, fontWeight: '700' },
});
