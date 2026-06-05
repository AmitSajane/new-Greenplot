import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MyCropsStackParamList } from '../../navigation/MyCropsStack';
import { colors, radius, shadow, spacing } from '../../theme/tokens';

type PlotStatus = 'Healthy' | 'Needs Water';

const DUMMY_PLOTS: Array<{
  id: string;
  cropCycleId: string;
  plotName: string;
  areaAcres: number;
  landlord: string;
  cropName: string;
  status: PlotStatus;
  statusNote: string;
  updatedAt: string;
  cropIcon: 'tractor' | 'sprout' | 'pot';
}> = [
  {
    id: '1',
    cropCycleId: 'CC001',
    plotName: 'Kagal Village Plot A',
    areaAcres: 5.0,
    landlord: 'Mr. Sanjay Patil',
    cropName: 'Sugarcane',
    status: 'Healthy',
    statusNote: 'Updated 2h ago',
    updatedAt: '2h',
    cropIcon: 'tractor',
  },
  {
    id: '2',
    cropCycleId: 'CC002',
    plotName: 'Murgud Road Plot B',
    areaAcres: 3.5,
    landlord: 'Mrs. Sunita Deshmukh',
    cropName: 'Wheat',
    status: 'Needs Water',
    statusNote: 'Critical alert',
    updatedAt: 'now',
    cropIcon: 'pot',
  },
  {
    id: '3',
    cropCycleId: 'CC003',
    plotName: 'Radhanagari Field C',
    areaAcres: 10.0,
    landlord: 'Self Owned',
    cropName: 'Paddy (Rice)',
    status: 'Healthy',
    statusNote: 'Normal growth',
    updatedAt: 'today',
    cropIcon: 'sprout',
  },
];

export default function MyCropsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MyCropsStackParamList, 'MyCrops'>>();

  const overview = useMemo(() => {
    const activePlots = DUMMY_PLOTS.length;
    const totalArea = DUMMY_PLOTS.reduce((sum, p) => sum + p.areaAcres, 0);
    return { activePlots, totalArea };
  }, []);

  const onAddNew = () => {
    // TODO: wire to "Add Plot / Add Crop" flow when available
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => (navigation as any).goBack?.()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Crops & Plots</Text>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Help"
        >
          <Icon name="help-circle-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.overviewCard, shadow.card]}>
          <View style={styles.overviewBgGrid}>
            <View style={styles.overviewGridSquare} />
            <View style={styles.overviewGridSquare} />
            <View style={styles.overviewGridSquare} />
            <View style={styles.overviewGridSquare} />
          </View>

          <View style={styles.overviewTopRow}>
            <View style={styles.overviewIcon}>
              <Icon name="bar-chart" size={16} color="#0B1A0F" />
            </View>
            <Text style={styles.overviewTitle}>FARM OVERVIEW</Text>
          </View>

          <View style={styles.overviewStatsRow}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatLabel}>ACTIVE PLOTS</Text>
              <Text style={styles.overviewStatValue}>
                {String(overview.activePlots).padStart(2, '0')}
              </Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatLabel}>TOTAL AREA</Text>
              <View style={styles.overviewAreaRow}>
                <Text style={styles.overviewStatValue}>
                  {overview.totalArea.toFixed(1)}
                </Text>
                <Text style={styles.overviewStatUnit}> Acres</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Active Land Plots</Text>
            <TouchableOpacity onPress={() => navigation.navigate('WorkList')}>
              <Text style={styles.workListLink}>Work List</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={onAddNew}
            accessibilityRole="button"
            accessibilityLabel="Add new plot"
            style={styles.addNewBtn}
          >
            <Icon name="add-circle" size={18} color={colors.success} />
            <Text style={styles.addNewText}>ADD NEW</Text>
          </TouchableOpacity>
        </View>

        {DUMMY_PLOTS.map((plot) => {
          const isHealthy = plot.status === 'Healthy';
          const cardAccentBg = isHealthy ? colors.softGreen : colors.softOrange;
          const statusColor = isHealthy ? colors.success : colors.warning;

          const cropIconName =
            plot.cropIcon === 'tractor'
              ? 'tractor-outline'
              : plot.cropIcon === 'sprout'
                ? 'leaf-outline'
                : 'flower-outline';

          return (
            <View key={plot.id} style={[styles.plotCard, shadow.card]}>
              <View style={styles.plotHeaderRow}>
                <View style={styles.plotHeaderText}>
                  <Text style={styles.plotName}>{plot.plotName}</Text>
                  <Text style={styles.plotLandlord}>Landlord: {plot.landlord}</Text>
                </View>
                <View style={styles.areaPill}>
                  <Text style={styles.areaPillText}>{plot.areaAcres.toFixed(1)} Acres</Text>
                </View>
              </View>

              <View style={[styles.cropPanel, { backgroundColor: cardAccentBg }]}>
                <View style={styles.cropIconBox}>
                  <Icon name={cropIconName} size={24} color={colors.primary} />
                </View>

                <View style={styles.cropTextCol}>
                  <Text style={styles.cropLabel}>CURRENT CROP</Text>
                  <Text style={styles.cropName}>{plot.cropName}</Text>
                </View>

                <View style={styles.statusCol}>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{plot.status}</Text>
                  </View>
                  <Text style={styles.statusNote}>{plot.statusNote}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewDetailsBtn}
                accessibilityRole="button"
                accessibilityLabel={`View details for ${plot.plotName}`}
                onPress={() =>
                  navigation.navigate('CropDetails', {
                    cropCycleId: plot.cropCycleId,
                  })
                }
              >
                <Text style={styles.viewDetailsText}>VIEW DETAILS</Text>
                <Icon name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },

  overviewCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius.lg,
    padding: spacing.xl,
    backgroundColor: '#0B2416',
    marginBottom: spacing.xl,
  },
  overviewBgGrid: {
    position: 'absolute',
    right: -18,
    top: -12,
    width: 120,
    height: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.22,
  },
  overviewGridSquare: {
    width: 44,
    height: 44,
    margin: 6,
    borderRadius: radius.sm,
    backgroundColor: '#2B3D33',
  },
  overviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  overviewIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: '#27E36C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewTitle: {
    color: '#27E36C',
    fontWeight: '800',
    letterSpacing: 1,
  },
  overviewStatsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  overviewStat: {
    flex: 1,
  },
  overviewDivider: {
    width: 18,
  },
  overviewStatLabel: {
    color: '#90A19A',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  overviewStatValue: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 36,
    lineHeight: 40,
  },
  overviewAreaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  overviewStatUnit: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    opacity: 0.9,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  workListLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addNewText: {
    color: colors.success,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  plotCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: '#D7E7DA',
  },
  plotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  plotHeaderText: {
    flex: 1,
  },
  plotName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  plotLandlord: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  areaPill: {
    backgroundColor: '#E9F2FF',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  areaPillText: {
    color: '#2D6CDF',
    fontWeight: '800',
  },

  cropPanel: {
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  cropIconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropTextCol: {
    flex: 1,
  },
  cropLabel: {
    color: '#4B6A55',
    fontWeight: '800',
    letterSpacing: 0.5,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  statusCol: {
    alignItems: 'flex-end',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusText: {
    fontWeight: '900',
  },
  statusNote: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  viewDetailsBtn: {
    backgroundColor: '#0B2416',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
  },
});
