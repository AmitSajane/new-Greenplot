import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../theme/tokens';
import { HubStackParamList } from '../navigation/HubStack';
import { WeatherCard } from '../components/hub/WeatherCard';
import { MandiPricesCard } from '../components/hub/MandiPricesCard';
import { SectionHeader } from '../components/hub/SectionHeader';
import { NewsCard } from '../components/hub/NewsCard';
import { TechniqueCard } from '../components/hub/TechniqueCard';
import { QuestionCard } from '../components/hub/QuestionCard';
import {
  communityQuestions,
  latestNews,
  mandiPrices,
  modernFarmingTechniques,
} from '../constants/hubMockData';

type NavigationProp = NativeStackNavigationProp<HubStackParamList>;

export default function HubScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleFilterByCrop = useCallback(
    () => navigation.navigate('FilterByCrop'),
    [navigation],
  );
  const handleNewsSeeAll = useCallback(
    () => navigation.navigate('LatestNews'),
    [navigation],
  );
  const handleNewsPress = useCallback(
    (id: string, title: string) =>
      navigation.navigate('NewsDetail', { id, title }),
    [navigation],
  );
  const handleTechSeeAll = useCallback(
    () => navigation.navigate('ModernFarmingTech'),
    [navigation],
  );
  const handleCommunitySeeAll = useCallback(
    () => navigation.navigate('CommunityQuestions'),
    [navigation],
  );
  const handleQuestionPress = useCallback(
    (id: string) => navigation.navigate('QuestionDetail', { id }),
    [navigation],
  );
  const handleCreatePost = useCallback(
    () => navigation.navigate('CreatePost', { from: 'hub' }),
    [navigation],
  );

  const featuredNews = useMemo(() => latestNews, []);
  const featuredQuestions = useMemo(
    () => communityQuestions.slice(0, 2),
    [],
  );
  const primaryTechnique = useMemo(
    () => modernFarmingTechniques[0],
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>My Farm</Text>
          <Text style={styles.screenSubtitle}>Updates for your farm</Text>
        </View>

        <WeatherCard
          location="Ludhiana, Punjab"
          temperatureC={32}
          condition="Sunny"
          todayLabel="Today"
          cropAdvisory="Good for Wheat"
          onAskExpertPress={handleCreatePost}
        />

        <MandiPricesCard
          mandiName="Azadpur Mandi"
          updatedLabel="Updated · 2h ago"
          prices={mandiPrices}
          onFilterByCropPress={handleFilterByCrop}
        />

        <SectionHeader
          title="Latest News"
          onPressAction={handleNewsSeeAll}
        />
        <FlatList
          data={featuredNews}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NewsCard
              item={item}
              onPress={() => handleNewsPress(item.id, item.title)}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        <SectionHeader
          title="Modern Farming Tech"
          onPressAction={handleTechSeeAll}
        />
        <TechniqueCard
          item={primaryTechnique}
          onPress={handleTechSeeAll}
          containerStyle={styles.techCard}
        />

        <SectionHeader
          title="Community Questions"
          onPressAction={handleCommunitySeeAll}
        />
        {featuredQuestions.map((q) => (
          <View key={q.id} style={styles.questionWrapper}>
            <QuestionCard
              item={q}
              onPress={() => handleQuestionPress(q.id)}
            />
          </View>
        ))}

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.createPostButton}
          onPress={handleCreatePost}
        >
          <Text style={styles.createPostText}>Create Post ▸</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.seeMoreButton}
          activeOpacity={0.8}
          onPress={handleCommunitySeeAll}
        >
          <Text style={styles.seeMoreText}>See more discussions</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    marginBottom: spacing.lg,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  screenSubtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textSecondary,
  },
  horizontalList: {
    paddingBottom: spacing.sm,
  },
  techCard: {
    marginTop: spacing.sm,
  },
  questionWrapper: {
    marginBottom: spacing.lg,
  },
  createPostButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  createPostText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
  seeMoreButton: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});


