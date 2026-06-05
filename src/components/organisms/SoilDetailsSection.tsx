import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatItem } from '../molecules/StatItem';
import { SoilChemical } from '../../types/soil';
import { spacing } from '../../theme/tokens';
import { useTranslation } from 'react-i18next';

interface SoilDetailsSectionProps {
  chemical: SoilChemical;
}

export const SoilDetailsSection: React.FC<SoilDetailsSectionProps> = ({ chemical }) => {
  const { t } = useTranslation();

  // Logic for pH
  let phStatus: 'good' | 'warning' | 'danger' | 'neutral' = 'good';
  let phLabel = t('soilTest.neutral');
  if (chemical.ph_h2o < 6.5) {
    phStatus = 'warning';
    phLabel = t('soilTest.acidic');
  } else if (chemical.ph_h2o > 7.5) {
    phStatus = 'danger';
    phLabel = t('soilTest.alkaline');
  }

  // Logic for Nitrogen (Simplified threshold for UI demo)
  let nStatus: 'good' | 'warning' | 'danger' | 'neutral' = 'warning';
  let nLabel = t('soilTest.medium');
  if (chemical.nitrogen_g_kg > 2.0) {
    nStatus = 'good';
    nLabel = t('soilTest.high');
  } else if (chemical.nitrogen_g_kg < 0.5) {
    nStatus = 'danger';
    nLabel = t('soilTest.low');
  }

  // Logic for Organic Matter
  let orgStatus: 'good' | 'warning' | 'danger' | 'neutral' = 'good';
  let orgLabel = t('soilTest.high');
  if (chemical.organic_matter_pct < 1.0) {
    orgStatus = 'danger';
    orgLabel = t('soilTest.low');
  } else if (chemical.organic_matter_pct < 2.0) {
    orgStatus = 'warning';
    orgLabel = t('soilTest.medium');
  }

  return (
    <View style={styles.container}>
      <StatItem
        iconName="flask-outline"
        title={t('soilTest.soilPh')}
        value={chemical.ph_h2o}
        status={phStatus}
        subtitle={phLabel}
      />
      <StatItem
        iconName="beaker-outline"
        title={t('soilTest.nitrogen')}
        value={`${Math.round(chemical.nitrogen_g_kg * 40)}kg/a`} // Mock conversion for UI match
        status={nStatus}
        subtitle={nLabel}
      />
      <StatItem
        iconName="leaf-outline"
        title={t('soilTest.organic')}
        value={`${chemical.organic_matter_pct}%`}
        status={orgStatus}
        subtitle={orgLabel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
});
