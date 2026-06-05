import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';
import { HomeFeaturedListing } from '../../constants/farmerHomeMockData';

type Props = {
  item: HomeFeaturedListing;
  onPress?: () => void;
};

export function FeaturedListingCard({ item, onPress }: Props) {
  const [liked, setLiked] = useState(false);
  const heartName = useMemo(
    () => (liked ? 'heart' : 'heart-outline'),
    [liked],
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
    >
      <Image source={item.image} style={styles.image} />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setLiked((v) => !v)}
        style={styles.heart}
      >
        <Ionicons name={heartName} size={18} color={liked ? '#EF4444' : colors.surface} />
      </TouchableOpacity>

      <View style={styles.metaRow}>
        <View style={styles.acresPill}>
          <Text style={styles.acresText}>{item.acresLabel}</Text>
        </View>
        {item.leaseType && (
          <View style={styles.leaseTypeBadge}>
            <Ionicons name="document-text-outline" size={12} color={colors.surface} />
            <Text style={styles.leaseTypeText}>{item.leaseType}</Text>
          </View>
        )}
      </View>

      <View style={styles.bottom}>
        <View style={styles.left}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.location} numberOfLines={1}>
              {item.locationLabel}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.price}>{item.pricePerYear}</Text>
          <Text style={styles.perYear}>per year</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 130,
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 34,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    position: 'absolute',
    left: 10,
    top: 10,
    flexDirection: 'column',
    gap: spacing.xs,
  },
  acresPill: {
    height: 22,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acresText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.surface,
  },
  leaseTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(74, 222, 128, 0.9)',
    alignSelf: 'flex-start',
  },
  leaseTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.surface,
  },
  bottom: {
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'center',
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  locationRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    flex: 1,
    minWidth: 0,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  perYear: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
  },
});

