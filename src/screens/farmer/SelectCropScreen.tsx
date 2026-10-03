import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { EmptyState } from '../../components/molecules/EmptyState';
import { cropsApi, type Crop } from '../../services/cropsApi';
import type { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'SelectCrop'>;
type Route = RouteProp<FarmerHomeStackParamList, 'SelectCrop'>;

export default function SelectCropScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const { farmId } = route.params;
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    cropsApi.fetchActiveCrops().then((data) => {
      if (active) {
        setCrops(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Select Crop" onBack={() => navigation.goBack()} />
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const goToOther = () => navigation.navigate('CropPlanForm', { farmId, cropId: '', cropName: '' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Select Crop" onBack={() => navigation.goBack()} />
      {crops.length === 0 ? (
        <View style={styles.listContent}>
          <EmptyState icon="leaf-outline" title="No crops available" subtitle="You can still add your own crop below." />
          <OtherCropCard onPress={goToOther} />
        </View>
      ) : (
        <FlatList
          data={crops}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={<OtherCropCard onPress={goToOther} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, shadow.card]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CropPlanForm', { farmId, cropId: item.id, cropName: item.name })}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="leaf" size={22} color={colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cropName}>{item.name}</Text>
                <View style={styles.metaRow}>
                  {!!item.typicalDurationDays && (
                    <Text style={styles.metaText}>~{item.typicalDurationDays} days</Text>
                  )}
                  {!!item.waterRequirement && (
                    <Text style={styles.metaText}>· {item.waterRequirement} water</Text>
                  )}
                </View>
                {!!item.suitableSoils?.length && (
                  <Text style={styles.soilText}>Suitable soil: {item.suitableSoils.join(', ')}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function OtherCropCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.card, styles.otherCard, shadow.card]} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.cardIcon, styles.otherCardIcon]}>
        <Ionicons name="add-circle-outline" size={22} color={colors.textSecondary} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cropName}>Other</Text>
        <Text style={styles.metaText}>Not listed? Add your own crop and plan.</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cropName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  metaRow: { flexDirection: 'row', gap: 4, marginTop: 2 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  soilText: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  otherCard: { borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  otherCardIcon: { backgroundColor: colors.background },
});
