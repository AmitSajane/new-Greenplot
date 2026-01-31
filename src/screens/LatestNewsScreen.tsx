import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../theme/tokens';
import { NewsCard } from '../components/hub/NewsCard';
import { latestNews } from '../constants/hubMockData';
import { HubStackParamList } from '../navigation/HubStack';

type NavigationProp = NativeStackNavigationProp<HubStackParamList>;

export default function LatestNewsScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={latestNews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <NewsCard
              item={item}
              onPress={() =>
                navigation.navigate('NewsDetail', { id: item.id, title: item.title })
              }
            />
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


