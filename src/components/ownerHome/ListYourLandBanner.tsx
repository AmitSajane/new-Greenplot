import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ListYourLandBannerProps {
  onPress?: () => void;
}

export function ListYourLandBanner({ onPress }: ListYourLandBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>List Your Land</Text>
        <Text style={styles.subtitle}>
          Rent out your farm easily to{'\n'}verified buyers.
        </Text>
        <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
          <Ionicons name="add-circle" size={20} color={colors.textPrimary} />
          <Text style={styles.buttonText}>Add New Land Listing</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.iconContainer}>
        <View style={styles.tractorIcon}>
          <Ionicons name="car-sport" size={28} color={colors.surface} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A3D2E',
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.surface,
    // fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ADE80',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  iconContainer: {
    justifyContent: 'flex-start',
    marginLeft: spacing.md,
  },
  tractorIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: '#2F8F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
