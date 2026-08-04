import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../theme/tokens';
import { MandiPrice, mandiPrices } from '../constants/hubMockData';
import { ScreenHeader } from '../components/molecules/ScreenHeader';

const CROPS = ['All', 'Wheat', 'Onion', 'Tomato', 'Maize', 'Cotton'] as const;
type CropFilter = (typeof CROPS)[number];

type Props = NativeStackScreenProps<any, 'FilterByCrop'>;

export default function FilterByCropScreen({ navigation }: Props) {
  const [activeCrop, setActiveCrop] = useState<CropFilter>('All');

  const filteredPrices = useMemo(() => {
    if (activeCrop === 'All') {
      return mandiPrices;
    }
    return mandiPrices.filter((item) => item.crop === activeCrop);
  }, [activeCrop]);

  const renderItem = ({ item }: { item: MandiPrice }) => {
    const isPositive = item.changePercent >= 0;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cropName}>{item.crop}</Text>
          <Text style={styles.variety}>{item.variety}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>
            {item.currencySymbol}
            {item.pricePerQuintal.toLocaleString('en-IN')} /qtl
          </Text>
          <Text style={[styles.change, isPositive ? styles.up : styles.down]}>
            {isPositive ? '▲' : '▼'} {Math.abs(item.changePercent)}%
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Mandi Prices" onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        <View style={styles.filterRow}>
          {CROPS.map((crop) => {
            const isActive = crop === activeCrop;
            return (
              <TouchableOpacity
                key={crop}
                activeOpacity={0.85}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveCrop(crop)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {crop}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FlatList
          data={filteredPrices}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.surface,
  },
  listContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cropName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  variety: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  change: {
    fontSize: 13,
    fontWeight: '600',
  },
  up: {
    color: colors.success,
  },
  down: {
    color: '#EF4444',
  },
});


