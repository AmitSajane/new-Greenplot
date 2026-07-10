import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';
import { NewsRow } from './components/sections';
import { FarmerAction, NewsItem } from './constants/farmerDashboardData';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'SchemesNewsList'>;
type ScreenRouteProp = RouteProp<FarmerHomeStackParamList, 'SchemesNewsList'>;

/** Minimal shape we need from the parent tab navigator for cross-tab routing. */
type ParentNav = { navigate: (name: string, params?: object) => void };

/**
 * Full "Schemes & news" list — reached via the "More" link on the farmer home
 * card. Previously this jumped straight to the Hub tab, dropping the user out
 * of context; now it shows every item inline with the same row UI/behaviour
 * as the home-screen preview (live article link or in-app action).
 */
export default function SchemesNewsListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const items: readonly NewsItem[] = route.params?.items ?? [];

  const goTab = useCallback(
    (tab: string, params?: object) => (navigation.getParent() as ParentNav | undefined)?.navigate(tab, params),
    [navigation],
  );

  const onOpenArticle = useCallback(
    (url: string, title?: string) => navigation.navigate('Article', { url, title }),
    [navigation],
  );

  const onAction = useCallback(
    (action: FarmerAction) => {
      switch (action) {
        case 'market':
        case 'marketAlert':
          return goTab('Market');
        case 'hub':
          return goTab('Hub');
        default:
          return undefined;
      }
    },
    [goTab],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#1C2E18" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schemes & News</Text>
        <View style={styles.backButton} />
      </View>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <NewsRow
              item={item}
              isLast
              onAction={onAction}
              onOpenArticle={onOpenArticle}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No schemes or news right now — check back soon.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F8F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0EC',
    backgroundColor: '#fff',
  },
  backButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#0D1509' },
  listContent: { padding: 14, paddingBottom: 32, flexGrow: 1 },
  cardWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8F0EC',
    borderRadius: 14,
    marginBottom: 10,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 13, color: '#6B8074', textAlign: 'center', paddingHorizontal: 32 },
});
