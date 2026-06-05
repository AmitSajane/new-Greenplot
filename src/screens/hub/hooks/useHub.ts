import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HubStackParamList } from '../../../navigation/HubStack';
import {
  communityQuestions,
  latestNews,
  mandiPrices,
  modernFarmingTechniques,
} from '../../../constants/hubMockData';

type NavigationProp = NativeStackNavigationProp<HubStackParamList>;

export function useHub() {
  const navigation = useNavigation<NavigationProp>();

  const featuredNews = useMemo(() => latestNews, []);
  const featuredQuestions = useMemo(() => communityQuestions.slice(0, 2), []);
  const primaryTechnique = useMemo(() => modernFarmingTechniques[0], []);

  return {
    mandiPrices,
    featuredNews,
    featuredQuestions,
    primaryTechnique,
    onFilterByCrop: useCallback(() => navigation.navigate('FilterByCrop'), [navigation]),
    onNewsSeeAll: useCallback(() => navigation.navigate('LatestNews'), [navigation]),
    onNewsPress: useCallback(
      (id: string, title: string) => navigation.navigate('NewsDetail', { id, title }),
      [navigation]
    ),
    onTechSeeAll: useCallback(() => navigation.navigate('ModernFarmingTech'), [navigation]),
    onCommunitySeeAll: useCallback(
      () => navigation.navigate('CommunityQuestions'),
      [navigation]
    ),
    onQuestionPress: useCallback(
      (id: string) => navigation.navigate('QuestionDetail', { id }),
      [navigation]
    ),
    onCreatePost: useCallback(
      () => navigation.navigate('CreatePost', { from: 'hub' }),
      [navigation]
    ),
  };
}

export type HubViewModel = ReturnType<typeof useHub>;
