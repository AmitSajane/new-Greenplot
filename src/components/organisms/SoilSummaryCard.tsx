import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';
import { StatusDot } from '../atoms/StatusDot';
import { colors, radius, spacing } from '../../theme/tokens';
import { useTranslation } from 'react-i18next';

interface SoilSummaryCardProps {
  soilType: string;
}

export const SoilSummaryCard: React.FC<SoilSummaryCardProps> = ({ soilType }) => {
  const { t } = useTranslation();
  
  // Try to find localized name or fallback
  const localizedSoilType = t(`soilTest.soilTypeMap.${soilType}`, { defaultValue: soilType });

  return (
    <Card style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="layers-outline" size={32} color={colors.primaryDark} />
      </View>
      
      <View style={styles.textContainer}>
        <Text variant="h2" weight="900" style={styles.title}>
          {soilType}
        </Text>
        <Text variant="body" weight="bold" color={colors.textSecondary} style={styles.subtitle}>
          {localizedSoilType}
        </Text>
        <View style={styles.statusRow}>
          <StatusDot status="good" />
          <Text variant="caption" weight="bold" color={colors.textSecondary} style={styles.statusText}>
            Ideal for most crops
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#95D58C', // Light green from the design
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: colors.primaryDark,
  },
  subtitle: {
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusText: {
    marginLeft: spacing.sm,
  },
});
