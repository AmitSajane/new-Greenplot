import React, { memo } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing, statusTones } from '../../theme/tokens';

export type LeaseStatus = 'Active' | 'Pending' | 'Expired' | 'Rejected';

export type LeaseListItem = {
  id: string;
  title: string;
  ownerName: string;
  locationLabel: string;
  acresLabel: string;
  rentLabel: string;
  status: LeaseStatus;
  expiresInLabel?: string;
  image?: ImageSourcePropType;
};

type Props = {
  item: LeaseListItem;
  onPress?: (item: LeaseListItem) => void;
};

const statusStyle = (status: LeaseStatus) => {
  switch (status) {
    case 'Active':
      return { bg: colors.softGreen, fg: colors.primaryDark };
    case 'Pending':
      return { bg: colors.softOrange, fg: colors.warning };
    case 'Expired':
      return { bg: colors.border, fg: colors.textSecondary };
    case 'Rejected':
      return { bg: statusTones.danger.bg, fg: statusTones.danger.fg };
  }
};

function LeaseCardImpl({ item, onPress }: Props) {
  const st = statusStyle(item.status);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(item)}
      style={styles.container}
    >
      <View style={styles.row}>
        <View style={styles.thumb}>
          {item.image ? (
            <Image source={item.image} style={styles.thumbImg} />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Ionicons name="image-outline" size={18} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.main}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={[styles.badge, { backgroundColor: st.bg }]}>
              <Text style={[styles.badgeText, { color: st.fg }]}>{item.status}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              Owner: {item.ownerName}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.locationLabel}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.pill}>
              <Ionicons name="resize-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.pillText}>{item.acresLabel}</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.pillText}>{item.rentLabel}</Text>
            </View>
            {item.expiresInLabel ? (
              <View style={styles.pill}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.pillText}>{item.expiresInLabel}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const LeaseCard = memo(LeaseCardImpl);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  badge: {
    height: 22,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    flex: 1,
    minWidth: 0,
  },
  bottomRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    height: 26,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textSecondary,
  },
});

