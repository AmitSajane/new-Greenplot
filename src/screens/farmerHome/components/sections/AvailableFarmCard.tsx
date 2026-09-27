import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../../theme/tokens';
import type { FarmListing } from '../../../../context/FarmListingsContext';

interface Props {
  farm: FarmListing;
  onPress: (id: string) => void;
  /** Narrow card for a horizontal dashboard row; omit for a full-width list row. */
  compact?: boolean;
}

function Row({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={12} color={colors.textSecondary} />
      <Text style={styles.rowText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

/** A "Farm Available for Management" card — every farm this renders is
 *  already guaranteed verified+available by the DB-scoped view it came
 *  from (see landsApi.fetchAvailableForManagement), so the "✓ Verified" /
 *  "Available for Management" line is static, not a conditional check. */
export const AvailableFarmCard = React.memo(({ farm, onPress, compact }: Props) => {
  const handlePress = useCallback(() => onPress(farm.id), [onPress, farm.id]);
  const imageUri = farm.mediaUrls?.[0] || farm.imageUrl;

  return (
    <TouchableOpacity
      style={[styles.card, compact ? styles.cardCompact : styles.cardFull]}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={22} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{farm.title}</Text>
        <Row icon="location" text={`${farm.location}, ${farm.district}`} />
        <Row icon="resize-outline" text={farm.acresLabel || `${farm.acres} Acres`} />
        <Row icon="leaf-outline" text={farm.soilType} />
        {!!farm.waterSource && <Row icon="water-outline" text={farm.waterSource} />}
        {!!farm.currentCrop && <Row icon="flower-outline" text={farm.currentCrop} />}
        <View style={styles.verifiedRow}>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
          <Text style={styles.availableText} numberOfLines={1}>Available for Management</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardCompact: { width: 190 },
  cardFull: { width: '100%', marginBottom: spacing.md },
  image: { height: 110, backgroundColor: colors.softGreen },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.md, gap: 3 },
  title: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rowText: { fontSize: 11, color: colors.textSecondary, flex: 1 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.success,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verifiedText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  availableText: { fontSize: 10, fontWeight: '600', color: colors.primary, flexShrink: 1 },
});
