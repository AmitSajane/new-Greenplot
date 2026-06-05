import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { MandiPrice } from '../../constants/hubMockData';

type Props = {
  mandiName: string;
  updatedLabel: string;
  prices: MandiPrice[];
  onFilterByCropPress?: () => void;
};

function MandiPricesCardComponent({
  mandiName,
  updatedLabel,
  prices,
  onFilterByCropPress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mandi Prices</Text>
        <Text style={styles.viewAll}>View All ▸</Text>
      </View>

      <View style={styles.mandiHeader}>
        <Text style={styles.mandiName}>{mandiName}</Text>
        <Text style={styles.updatedLabel}>{updatedLabel}</Text>
      </View>

      <FlatList
        data={prices}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isPositive = item.changePercent >= 0;
          return (
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.cropName}>{item.crop}</Text>
                <Text style={styles.cropVariety}>{item.variety}</Text>
              </View>
              <View style={styles.priceRight}>
                <Text style={styles.priceText}>
                  {item.currencySymbol}
                  {item.pricePerQuintal.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.priceChange, isPositive ? styles.up : styles.down]}>
                  {isPositive ? '▲' : '▼'} {Math.abs(item.changePercent)}%
                </Text>
              </View>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <TouchableOpacity
        style={styles.filterButton}
        activeOpacity={0.85}
        onPress={onFilterByCropPress}
      >
        <Text style={styles.filterButtonText}>Filter by Crop</Text>
      </TouchableOpacity>
    </View>
  );
}

export const MandiPricesCard = React.memo(MandiPricesCardComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  viewAll: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  mandiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  mandiName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  updatedLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cropName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cropVariety: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceRight: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  priceChange: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  up: {
    color: colors.success,
  },
  down: {
    color: '#EF4444',
  },
  separator: {
    height: 1,
    backgroundColor: colors.background,
  },
  filterButton: {
    marginTop: spacing.lg,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.softGreen,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});


