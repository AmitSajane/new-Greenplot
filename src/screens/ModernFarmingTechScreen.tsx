import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing } from '../theme/tokens';
import { modernFarmingTechniques } from '../constants/hubMockData';
import { TechniqueCard } from '../components/hub/TechniqueCard';
import { HubStackParamList } from '../navigation/HubStack';
import { ScreenHeader } from '../components/molecules/ScreenHeader';

type Props = NativeStackScreenProps<HubStackParamList, 'ModernFarmingTech'>;

export default function ModernFarmingTechScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader backVariant="text" onBack={() => navigation.goBack()} />

      <FlatList
        data={modernFarmingTechniques}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <TechniqueCard item={item} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  cardWrapper: {
    marginBottom: spacing.lg,
  },
});


