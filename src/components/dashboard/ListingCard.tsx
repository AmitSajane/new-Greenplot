import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { DashboardButton } from './DashboardButton';

interface ListingCardProps {
  status: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  onEdit?: () => void;
  onView?: () => void;
}

export function ListingCard({
  status,
  title,
  subtitle,
  imageUrl,
  onEdit,
  onView,
}: ListingCardProps) {
  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.details}>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.actionsRow}>
          <DashboardButton
            label="Edit"
            variant="secondary"
            size="sm"
            onPress={onEdit}
            style={styles.actionButton}
          />
          <DashboardButton
            label="View"
            size="sm"
            onPress={onView}
            style={[styles.actionButton, styles.lastActionButton]}
          />
        </View>
      </View>
      <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  details: {
    flex: 1,
    marginRight: spacing.lg,
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  statusText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    marginRight: spacing.md,
  },
  lastActionButton: {
    marginRight: 0,
  },
  thumbnail: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
  },
});

