import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { colors, radius, spacing } from '../../theme/tokens';

interface SoilTestCardProps {
  onPress: () => void;
}

export const SoilTestCard: React.FC<SoilTestCardProps> = ({ onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="flask" size={28} color={colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text variant="h2" weight="bold" color={colors.primaryDark}>
              Soil Health Check
            </Text>
            <Text variant="caption" weight="600" color={colors.textSecondary} style={styles.subtitle}>
              ಮಣ್ಣಿನ ಆರೋಗ್ಯ ತಪಾಸಣೆ
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    backgroundColor: '#F4FAEB', // Light greenish-yellow background
    borderColor: '#D3EDA8',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
